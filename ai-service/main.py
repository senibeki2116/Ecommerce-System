import os
import re
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-6-luna")

PRODUCTS_API_URL = "http://localhost:3001/products"

if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY is not configured.")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="ShopEase AI Assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODELS
# ============================================================

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


class ProductCard(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float
    stock: int
    image: str | None = None
    category: str | None = None
    averageRating: float = 0
    totalReviews: int = 0


class ChatResponse(BaseModel):
    reply: str
    products: list[ProductCard] = Field(default_factory=list)


# ============================================================
# TEXT HELPERS
# ============================================================

def normalize_text(text: str) -> str:
    return re.sub(
        r"\s+",
        " ",
        str(text or "").strip().lower(),
    )


def contains_keyword(
    text: str,
    keywords: list[str],
) -> bool:

    normalized = normalize_text(text)

    for keyword in keywords:
        keyword_normalized = normalize_text(keyword)

        if not keyword_normalized:
            continue

        pattern = rf"(?<!\w){re.escape(keyword_normalized)}(?!\w)"

        if re.search(pattern, normalized):
            return True

    return False


# ============================================================
# ENCODING CLEANUP
# ============================================================

def mojibake_score(text: str) -> int:
    """
    Detect common broken UTF-8 sequences.

    Important:
    Do NOT treat normal emoji such as 👋 or 😊 as broken text.
    """

    markers = [
        "â€",
        "â€™",
        "â€œ",
        "â€",
        "â€“",
        "â€”",
        "â€¦",
        "Â",
        "ðŸ",
    ]

    return sum(text.count(marker) for marker in markers)


def repair_mojibake(text: str) -> str:

    if not text:
        return ""

    result = str(text)

    for _ in range(3):

        candidates = [result]

        for encoding in ("latin1", "cp1252"):

            try:
                repaired = (
                    result
                    .encode(encoding)
                    .decode("utf-8")
                )

                candidates.append(repaired)

            except (
                UnicodeEncodeError,
                UnicodeDecodeError,
            ):
                pass

        best = min(
            candidates,
            key=mojibake_score,
        )

        if mojibake_score(best) < mojibake_score(result):
            result = best
        else:
            break

    return result


def clean_ai_reply(reply: str) -> str:

    if not reply:
        return ""

    reply = str(reply).strip()

    reply = repair_mojibake(reply)

    replacements = {
        "â€™": "'",
        "â€˜": "'",
        "â€œ": '"',
        "â€": '"',
        "â€“": "-",
        "â€”": "-",
        "â€¦": "...",
        "Â": "",
    }

    for bad, good in replacements.items():
        reply = reply.replace(bad, good)

    word_replacements = {
        "Itâs": "It's",
        "itâs": "it's",
        "Thereâs": "There's",
        "thereâs": "there's",
        "Thatâs": "That's",
        "thatâs": "that's",
        "Whatâs": "What's",
        "whatâs": "what's",
        "Hereâs": "Here's",
        "hereâs": "here's",
        "Youâre": "You're",
        "youâre": "you're",
        "Donât": "Don't",
        "donât": "don't",
        "Canât": "Can't",
        "canât": "can't",
        "Wonât": "Won't",
        "wonât": "won't",
        "Isnât": "Isn't",
        "isnât": "isn't",
        "Arenât": "Aren't",
        "arenât": "aren't",
        "Wasnât": "Wasn't",
        "wasnât": "wasn't",
        "Werenât": "Weren't",
        "werenât": "weren't",
    }

    for bad, good in word_replacements.items():
        reply = reply.replace(bad, good)

    return reply.strip()


# ============================================================
# HISTORY
# ============================================================

def get_valid_history(
    history: list[ChatMessage],
) -> list[dict[str, str]]:

    valid_history: list[dict[str, str]] = []

    for item in history:

        role = str(
            item.role or ""
        ).strip().lower()

        content = str(
            item.content or ""
        ).strip()

        if role not in {
            "user",
            "assistant",
            "system",
        }:
            continue

        if not content:
            continue

        valid_history.append(
            {
                "role": role,
                "content": content,
            }
        )

    return valid_history[-12:]


def build_conversation_context(
    history: list[ChatMessage],
) -> str:

    valid_history = get_valid_history(history)

    if not valid_history:
        return ""

    lines: list[str] = []

    for item in valid_history:

        role = item["role"].capitalize()
        content = item["content"]

        lines.append(
            f"{role}: {content}"
        )

    return "\n".join(lines)


def build_ai_input(
    message: str,
    history: list[ChatMessage],
) -> str:

    context = build_conversation_context(
        history
    )

    if not context:
        return message

    return (
        "Conversation history:\n"
        f"{context}\n\n"
        "Current user message:\n"
        f"{message}"
    )


# ============================================================
# PRODUCT HELPERS
# ============================================================

def get_category_name(
    product: dict[str, Any],
) -> str:

    category = product.get("category")

    if isinstance(category, dict):

        return str(
            category.get("name") or ""
        )

    if category:
        return str(category)

    return ""


def get_product_rating(
    product: dict[str, Any],
) -> tuple[float, int]:

    average = product.get(
        "averageRating",
        0,
    )

    total = product.get(
        "totalReviews",
        0,
    )

    try:
        average = float(
            average or 0
        )
    except (
        TypeError,
        ValueError,
    ):
        average = 0.0

    try:
        total = int(
            total or 0
        )
    except (
        TypeError,
        ValueError,
    ):
        total = 0

    return average, total


def get_products() -> list[dict[str, Any]]:

    try:

        response = requests.get(
            PRODUCTS_API_URL,
            timeout=8,
        )

        response.raise_for_status()

        data = response.json()

        if isinstance(data, list):
            return data

        return []

    except requests.RequestException as error:

        print(
            f"Could not fetch products: {error}"
        )

        return []

    except ValueError as error:

        print(
            f"Invalid products response: {error}"
        )

        return []


# ============================================================
# BUDGET EXTRACTION
# ============================================================

def extract_budgets(
    text: str,
) -> list[float]:

    normalized = normalize_text(text)

    patterns = [
        r"(?:under|below|less than|cheaper than|up to|maximum|max|within)\s*\$?\s*(\d+(?:\.\d+)?)",
        r"(?:around|about|approximately|roughly)\s*\$?\s*(\d+(?:\.\d+)?)",
        r"\$\s*(\d+(?:\.\d+)?)",
    ]

    budgets: list[float] = []

    for pattern in patterns:

        matches = re.findall(
            pattern,
            normalized,
        )

        for match in matches:

            try:
                budgets.append(
                    float(match)
                )
            except ValueError:
                pass

    return budgets


def has_around_budget(
    text: str,
) -> bool:

    return contains_keyword(
        text,
        [
            "around",
            "about",
            "approximately",
            "roughly",
        ],
    )


def get_conversation_budget(
    message: str,
    history: list[ChatMessage],
) -> float | None:

    budgets = extract_budgets(
        message
    )

    if budgets:
        return budgets[-1]

    for item in reversed(
        get_valid_history(history)
    ):

        if item["role"] == "user":

            budgets = extract_budgets(
                item["content"]
            )

            if budgets:
                return budgets[-1]

    return None


# ============================================================
# PRODUCT SEARCH GROUPS
# ============================================================

SEARCH_GROUPS: dict[str, list[str]] = {

    "phone": [
        "phone",
        "phones",
        "smartphone",
        "smartphones",
        "mobile",
        "mobiles",
        "iphone",
        "android",
        "galaxy",
        "samsung",
    ],

    "laptop": [
        "laptop",
        "laptops",
        "notebook",
        "notebooks",
        "computer",
        "computers",
        "macbook",
        "pc",
    ],

    "headphones": [
        "headphone",
        "headphones",
        "earphone",
        "earphones",
        "earbuds",
        "headset",
        "headsets",
    ],

    "speaker": [
        "speaker",
        "speakers",
        "soundbar",
        "audio speaker",
    ],

    "keyboard": [
        "keyboard",
        "keyboards",
        "gaming keyboard",
    ],

    "mouse": [
        "mouse",
        "mice",
        "gaming mouse",
    ],

    "camera": [
        "camera",
        "cameras",
        "dslr",
        "mirrorless",
    ],

    "watch": [
        "watch",
        "watches",
        "smartwatch",
        "smartwatches",
        "smart watch",
    ],

    "gaming": [
        "gaming",
        "gamer",
        "gamers",
        "game",
        "games",
    ],

    "electronics": [
        "electronics",
        "electronic",
        "tech",
        "technology",
        "device",
        "devices",
    ],

    "accessories": [
        "accessory",
        "accessories",
        "cover",
        "covers",
        "case",
        "cases",
        "charger",
        "chargers",
        "cable",
        "cables",
    ],
}


PHONE_PRODUCT_TERMS = [
    "phone",
    "phones",
    "smartphone",
    "smartphones",
    "mobile",
    "mobiles",
    "iphone",
    "android",
]


PHONE_ACCESSORY_TERMS = [
    "phone cover",
    "phone covers",
    "phone case",
    "phone cases",
    "mobile cover",
    "mobile covers",
    "mobile case",
    "mobile cases",
]


USE_CASE_GROUPS: dict[str, list[str]] = {

    "gaming": [
        "gaming",
        "gamer",
        "gaming setup",
        "games",
        "playing games",
    ],

    "work": [
        "work",
        "office",
        "working",
        "productivity",
        "business",
    ],

    "study": [
        "study",
        "student",
        "school",
        "university",
        "college",
        "learning",
    ],

    "music": [
        "music",
        "listening",
        "songs",
        "audio",
    ],

    "photography": [
        "photography",
        "photo",
        "photos",
        "photographer",
        "photograph",
    ],
}


# ============================================================
# SEARCH TERM EXTRACTION
# ============================================================

def extract_search_terms(
    text: str,
) -> list[str]:

    terms: list[str] = []

    normalized = normalize_text(text)

    for group_name, keywords in SEARCH_GROUPS.items():

        if contains_keyword(
            normalized,
            keywords,
        ):
            terms.append(group_name)

    product_name_patterns = [
        "iphone",
        "samsung",
        "galaxy",
        "dell",
        "premium laptop",
        "smartphone pro",
        "gaming mouse",
        "gaming keyboard",
        "wireless headphones",
        "wireless speaker",
        "smart watch",
        "modern camera",
        "phone cover",
    ]

    for product_name in product_name_patterns:

        if product_name in normalized:

            if product_name not in terms:
                terms.append(product_name)

    return list(
        dict.fromkeys(terms)
    )


def extract_use_cases(
    text: str,
) -> list[str]:

    result: list[str] = []

    for name, keywords in USE_CASE_GROUPS.items():

        if contains_keyword(
            text,
            keywords,
        ):
            result.append(name)

    return result


# ============================================================
# PHONE DETECTION
# ============================================================

def is_phone_accessory_request(
    text: str,
) -> bool:

    normalized = normalize_text(text)

    return any(
        phrase in normalized
        for phrase in PHONE_ACCESSORY_TERMS
    )


def is_phone_product(
    product: dict[str, Any],
) -> bool:

    name = normalize_text(
        str(
            product.get("name") or ""
        )
    )

    description = normalize_text(
        str(
            product.get("description") or ""
        )
    )

    category = normalize_text(
        get_category_name(product)
    )

    combined = (
        f"{name} "
        f"{description} "
        f"{category}"
    )

    if is_phone_accessory_request(
        combined
    ):
        return False

    if any(
        term in name
        for term in [
            "phone",
            "smartphone",
            "iphone",
            "galaxy",
            "mobile",
        ]
    ):
        return True

    if any(
        term in combined
        for term in [
            "smartphone",
            "mobile phone",
            "android phone",
            "iphone",
        ]
    ):
        return True

    return False


def is_phone_accessory_product(
    product: dict[str, Any],
) -> bool:

    name = normalize_text(
        str(
            product.get("name") or ""
        )
    )

    description = normalize_text(
        str(
            product.get("description") or ""
        )
    )

    category = normalize_text(
        get_category_name(product)
    )

    combined = (
        f"{name} "
        f"{description} "
        f"{category}"
    )

    return any(
        phrase in combined
        for phrase in PHONE_ACCESSORY_TERMS
    )


# ============================================================
# PRODUCT MATCHING
# ============================================================

def product_matches(
    product: dict[str, Any],
    search_terms: list[str],
    use_cases: list[str],
) -> bool:

    name = normalize_text(
        str(
            product.get("name") or ""
        )
    )

    description = normalize_text(
        str(
            product.get("description") or ""
        )
    )

    category = normalize_text(
        get_category_name(product)
    )

    combined = (
        f"{name} "
        f"{description} "
        f"{category}"
    )

    # --------------------------------------------------------
    # PHONE
    # --------------------------------------------------------

    if "phone" in search_terms:

        phone_accessory_terms = any(
            term in search_terms
            for term in [
                "phone cover",
                "phone case",
            ]
        )

        if phone_accessory_terms:

            if not is_phone_accessory_product(
                product
            ):
                return False

        else:

            if not is_phone_product(
                product
            ):
                return False

    # --------------------------------------------------------
    # LAPTOP
    # --------------------------------------------------------

    if "laptop" in search_terms:

        laptop_match = any(
            word in combined
            for word in [
                "laptop",
                "notebook",
                "macbook",
                "computer",
            ]
        )

        if not laptop_match:
            return False

    # --------------------------------------------------------
    # HEADPHONES
    # --------------------------------------------------------

    if "headphones" in search_terms:

        headphone_match = any(
            word in combined
            for word in [
                "headphone",
                "earphone",
                "earbuds",
                "headset",
            ]
        )

        if not headphone_match:
            return False

    # --------------------------------------------------------
    # SPEAKER
    # --------------------------------------------------------

    if "speaker" in search_terms:

        speaker_match = any(
            word in combined
            for word in [
                "speaker",
                "soundbar",
            ]
        )

        if not speaker_match:
            return False

    # --------------------------------------------------------
    # KEYBOARD
    # --------------------------------------------------------

    if "keyboard" in search_terms:

        if "keyboard" not in combined:
            return False

    # --------------------------------------------------------
    # MOUSE
    # --------------------------------------------------------

    if "mouse" in search_terms:

        if "mouse" not in combined:
            return False

    # --------------------------------------------------------
    # CAMERA
    # --------------------------------------------------------

    if "camera" in search_terms:

        camera_match = any(
            word in combined
            for word in [
                "camera",
                "dslr",
                "mirrorless",
            ]
        )

        if not camera_match:
            return False

    # --------------------------------------------------------
    # WATCH
    # --------------------------------------------------------

    if "watch" in search_terms:

        watch_match = any(
            word in combined
            for word in [
                "watch",
                "smartwatch",
            ]
        )

        if not watch_match:
            return False

    # --------------------------------------------------------
    # GAMING
    # --------------------------------------------------------

    if (
        "gaming" in search_terms
        or "gaming" in use_cases
    ):

        gaming_match = any(
            word in combined
            for word in [
                "gaming",
                "gamer",
                "game",
            ]
        )

        if not gaming_match:
            return False

    # --------------------------------------------------------
    # ELECTRONICS
    # --------------------------------------------------------

    if "electronics" in search_terms:

        electronics_match = any(
            word in combined
            for word in [
                "phone",
                "smartphone",
                "laptop",
                "computer",
                "camera",
                "watch",
                "keyboard",
                "mouse",
                "speaker",
                "headphone",
                "electronic",
            ]
        )

        if not electronics_match:
            return False

    # --------------------------------------------------------
    # ACCESSORIES
    # --------------------------------------------------------

    if "accessories" in search_terms:

        accessory_match = any(
            word in combined
            for word in [
                "accessory",
                "cover",
                "case",
                "charger",
                "cable",
                "headphone",
            ]
        )

        if not accessory_match:
            return False

    return True


# ============================================================
# PRODUCT SCORING
# ============================================================

def product_score(
    product: dict[str, Any],
    message: str,
    search_terms: list[str],
    use_cases: list[str],
) -> int:

    name = normalize_text(
        str(
            product.get("name") or ""
        )
    )

    description = normalize_text(
        str(
            product.get("description") or ""
        )
    )

    category = normalize_text(
        get_category_name(product)
    )

    combined = (
        f"{name} "
        f"{description} "
        f"{category}"
    )

    score = 0

    for term in search_terms:

        if term in name:
            score += 10

        if term in description:
            score += 5

        if term in category:
            score += 4

    for use_case in use_cases:

        if use_case in combined:
            score += 8

    message_words = set(
        re.findall(
            r"\b[a-z0-9]+\b",
            normalize_text(message),
        )
    )

    name_words = set(
        re.findall(
            r"\b[a-z0-9]+\b",
            name,
        )
    )

    score += (
        len(
            message_words.intersection(
                name_words
            )
        )
        * 3
    )

    try:
        stock = int(
            product.get("stock") or 0
        )
    except (
        TypeError,
        ValueError,
    ):
        stock = 0

    if stock > 0:
        score += 2

    return score


# ============================================================
# SEARCH PRODUCTS
# ============================================================

def find_relevant_products(
    products: list[dict[str, Any]],
    message: str,
    budget: float | None = None,
) -> list[dict[str, Any]]:

    search_terms = extract_search_terms(
        message
    )

    use_cases = extract_use_cases(
        message
    )

    candidates: list[
        dict[str, Any]
    ] = []

    # --------------------------------------------------------
    # SEARCH TERMS
    # --------------------------------------------------------

    if search_terms or use_cases:

        for product in products:

            if product_matches(
                product,
                search_terms,
                use_cases,
            ):
                candidates.append(product)

    # --------------------------------------------------------
    # BUDGET ONLY
    # --------------------------------------------------------

    elif budget is not None:

        for product in products:

            try:
                price = float(
                    product.get("price") or 0
                )
            except (
                TypeError,
                ValueError,
            ):
                continue

            if price <= budget:
                candidates.append(product)

    # --------------------------------------------------------
    # APPLY BUDGET
    # --------------------------------------------------------

    if budget is not None:

        filtered: list[
            dict[str, Any]
        ] = []

        for product in candidates:

            try:
                price = float(
                    product.get("price") or 0
                )
            except (
                TypeError,
                ValueError,
            ):
                continue

            if price <= budget:
                filtered.append(product)

        candidates = filtered

    # --------------------------------------------------------
    # SORT
    # --------------------------------------------------------

    candidates.sort(
        key=lambda product: (
            -product_score(
                product,
                message,
                search_terms,
                use_cases,
            ),
            float(
                product.get("price") or 0
            ),
        )
    )

    return candidates[:8]


# ============================================================
# RECOMMENDATIONS
# ============================================================

def is_recommendation_request(
    message: str,
) -> bool:

    return contains_keyword(
        message,
        [
            "recommend",
            "recommendation",
            "suggest",
            "suggestion",
            "best product",
            "what should i buy",
            "what do you recommend",
            "which should i buy",
            "help me choose",
        ],
    )


def find_recommendations(
    products: list[dict[str, Any]],
    message: str,
    budget: float | None = None,
) -> list[dict[str, Any]]:

    search_terms = extract_search_terms(
        message
    )

    use_cases = extract_use_cases(
        message
    )

    candidates = find_relevant_products(
        products,
        message,
        budget,
    )

    if not candidates:

        candidates = products.copy()

        if budget is not None:

            filtered_candidates = []

            for product in candidates:

                try:
                    price = float(
                        product.get("price") or 0
                    )
                except (
                    TypeError,
                    ValueError,
                ):
                    continue

                if price <= budget:
                    filtered_candidates.append(
                        product
                    )

            candidates = filtered_candidates

    def recommendation_score(
        product: dict[str, Any],
    ) -> float:

        score = float(
            product_score(
                product,
                message,
                search_terms,
                use_cases,
            )
        )

        rating, reviews = get_product_rating(
            product
        )

        score += rating * 5

        if reviews > 0:
            score += min(
                reviews,
                5,
            )

        try:
            stock = int(
                product.get("stock") or 0
            )
        except (
            TypeError,
            ValueError,
        ):
            stock = 0

        if stock > 0:
            score += 5

        return score

    candidates.sort(
        key=recommendation_score,
        reverse=True,
    )

    return candidates[:5]


# ============================================================
# RATING REQUESTS
# ============================================================

def is_rating_request(
    message: str,
) -> bool:

    return contains_keyword(
        message,
        [
            "rating",
            "ratings",
            "rated",
            "review",
            "reviews",
            "best rated",
            "highest rated",
            "best rating",
            "highest rating",
            "lowest rating",
            "worst rated",
        ],
    )


def find_best_rated_products(
    products: list[dict[str, Any]],
    message: str,
    budget: float | None = None,
) -> list[dict[str, Any]]:

    candidates = find_relevant_products(
        products,
        message,
        budget,
    )

    # If the rating question is general,
    # consider all reviewed products.
    if not candidates:

        candidates = products.copy()

        if budget is not None:

            candidates = [
                product
                for product in candidates
                if float(
                    product.get("price") or 0
                ) <= budget
            ]

    reviewed = [
        product
        for product in candidates
        if get_product_rating(product)[1] > 0
    ]

    if reviewed:
        candidates = reviewed

    candidates.sort(
        key=lambda product: (
            -get_product_rating(product)[0],
            -get_product_rating(product)[1],
            float(
                product.get("price") or 0
            ),
        )
    )

    return candidates[:5]


# ============================================================
# COMPARISON
# ============================================================

def is_comparison_request(
    message: str,
) -> bool:

    return contains_keyword(
        message,
        [
            "compare",
            "comparison",
            "versus",
            "vs",
            "difference",
            "which is better",
            "better",
        ],
    )


def find_comparison_products(
    products: list[dict[str, Any]],
    message: str,
    budget: float | None = None,
) -> list[dict[str, Any]]:

    candidates = find_relevant_products(
        products,
        message,
        budget,
    )

    return candidates[:4]


# ============================================================
# FOLLOW-UP DETECTION
# ============================================================

FOLLOW_UP_PHRASES = [
    "which one",
    "which ones",
    "which is better",
    "which one is better",
    "best rating",
    "best rated",
    "highest rating",
    "highest rated",
    "lowest rating",
    "lowest rated",
    "what about it",
    "what about that",
    "does it",
    "does that",
    "how about it",
    "how about that",
    "tell me more",
    "more about",
]


def is_follow_up_message(
    message: str,
) -> bool:

    normalized = normalize_text(
        message
    )

    return any(
        phrase in normalized
        for phrase in FOLLOW_UP_PHRASES
    )


def get_previous_user_message(
    history: list[ChatMessage],
) -> str:

    for item in reversed(
        get_valid_history(history)
    ):

        if item["role"] == "user":
            return item["content"]

    return ""


# ============================================================
# PRODUCT CONTEXT
# ============================================================

def product_to_card(
    product: dict[str, Any],
) -> ProductCard:

    rating, reviews = get_product_rating(
        product
    )

    category = get_category_name(
        product
    )

    try:
        product_id = int(
            product.get("id")
        )
    except (
        TypeError,
        ValueError,
    ):
        product_id = 0

    try:
        price = float(
            product.get("price") or 0
        )
    except (
        TypeError,
        ValueError,
    ):
        price = 0.0

    try:
        stock = int(
            product.get("stock") or 0
        )
    except (
        TypeError,
        ValueError,
    ):
        stock = 0

    return ProductCard(
        id=product_id,
        name=str(
            product.get("name")
            or "Product"
        ),
        description=product.get(
            "description"
        ),
        price=price,
        stock=stock,
        image=product.get("image"),
        category=category or None,
        averageRating=rating,
        totalReviews=reviews,
    )


def build_product_context(
    products: list[dict[str, Any]],
) -> str:

    if not products:
        return "No matching products were found."

    lines: list[str] = []

    for index, product in enumerate(
        products,
        start=1,
    ):

        rating, reviews = get_product_rating(
            product
        )

        category = get_category_name(
            product
        )

        try:
            price = float(
                product.get("price") or 0
            )
        except (
            TypeError,
            ValueError,
        ):
            price = 0.0

        try:
            stock = int(
                product.get("stock") or 0
            )
        except (
            TypeError,
            ValueError,
        ):
            stock = 0

        lines.append(
            f"{index}. "
            f"{product.get('name')} | "
            f"Price: ${price:.2f} | "
            f"Stock: {stock} | "
            f"Category: {category or 'Unknown'} | "
            f"Rating: {rating:.1f}/5 | "
            f"Reviews: {reviews} | "
            f"Description: "
            f"{product.get('description') or 'No description'}"
        )

    return "\n".join(lines)


# ============================================================
# GENERAL CHAT DETECTION
# ============================================================

def is_general_chat(
    message: str,
) -> bool:

    normalized = normalize_text(
        message
    )

    phrases = [
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "thanks",
        "thank you",
        "thank u",
        "thx",
        "okay",
        "ok",
        "great",
        "nice",
        "perfect",
        "cool",
        "bye",
        "goodbye",
    ]

    return any(
        normalized == phrase
        or normalized.startswith(
            phrase + " "
        )
        for phrase in phrases
    )


# ============================================================
# LOCAL REPLIES
# ============================================================

def local_general_reply(
    message: str,
) -> str | None:

    normalized = normalize_text(
        message
    )

    if normalized in {
        "hi",
        "hello",
        "hey",
    }:
        return (
            "Hi! 👋 I'm your ShopEase assistant. "
            "I can help you find products, compare items, "
            "check ratings, and choose something within your budget."
        )

    if normalized in {
        "good morning",
        "good afternoon",
        "good evening",
    }:
        return (
            "Hello! 👋 How can I help you with your shopping today?"
        )

    if normalized in {
        "thanks",
        "thank you",
        "thank u",
        "thx",
    }:
        return (
            "You're welcome! 😊 Let me know if you need anything else."
        )

    if normalized in {
        "okay",
        "ok",
        "great",
        "nice",
        "perfect",
        "cool",
    }:
        return (
            "Great! 😊 I'm here whenever you need help finding something."
        )

    if normalized in {
        "bye",
        "goodbye",
    }:
        return (
            "Goodbye! 👋 Happy shopping!"
        )

    return None


# ============================================================
# OPENAI RESPONSE
# ============================================================

def generate_ai_reply(
    message: str,
    products: list[dict[str, Any]],
    selected_products: list[dict[str, Any]] | None = None,
    history: list[dict[str, str]] | None = None,
    intent: str = "product_search",
) -> str:
    """
    Generate a natural-language response using the OpenAI API.

    The function keeps product selection separate from AI generation:
    - products: all products available to the request
    - selected_products: products specifically selected by the search logic
    - intent: product_search, rating, comparison, recommendation, etc.
    """

    if client is None:
        return "AI service is not configured. Please check OPENAI_API_KEY."

    try:
        # --------------------------------------------------------
        # USE SELECTED PRODUCTS WHEN AVAILABLE
        # --------------------------------------------------------
        context_products = selected_products or products

        # Remove duplicates while preserving order.
        unique_products = []
        seen_ids = set()

        for product in context_products:
            product_id = product.get("id")

            if product_id is not None:
                if product_id in seen_ids:
                    continue

                seen_ids.add(product_id)

            unique_products.append(product)

        # Keep the prompt reasonably small.
        unique_products = unique_products[:12]

        # --------------------------------------------------------
        # BUILD PRODUCT CONTEXT
        # --------------------------------------------------------
        if unique_products:
            product_lines = []

            for product in unique_products:
                product_lines.append(
                    f"- ID: {product.get('id')}\n"
                    f"  Name: {product.get('name', 'Unknown product')}\n"
                    f"  Description: {product.get('description', 'No description available')}\n"
                    f"  Price: ${product.get('price', 0)}\n"
                    f"  Stock: {product.get('stock', 0)}\n"
                    f"  Rating: {product.get('averageRating', 0)}/5\n"
                    f"  Reviews: {product.get('totalReviews', 0)}\n"
                    f"  Category: {product.get('category', {}).get('name', 'Unknown') if isinstance(product.get('category'), dict) else product.get('category', 'Unknown')}"
                )

            product_text = "\n".join(product_lines)
        else:
            product_text = "No matching products were found."

        # --------------------------------------------------------
        # SYSTEM PROMPT
        # --------------------------------------------------------
        system_prompt = """
You are ShopEase AI, a helpful shopping assistant for an e-commerce website.

Your responsibilities:
- Help customers find products.
- Explain products using the provided product information.
- Recommend products when requested.
- Compare products when requested.
- Discuss ratings and reviews when relevant.
- Mention prices and stock when useful.
- Be concise, friendly, and practical.
- Never invent products, prices, ratings, stock values, or specifications.
- Only use products included in the provided product context.
- If a requested product is unavailable, say so clearly.
- If a product is out of stock, clearly mention that.
- Do not claim that a product is available when its stock is 0.
- For comparisons, clearly explain the important differences.
- For recommendations, explain briefly why the recommended product is suitable.
"""

        # --------------------------------------------------------
        # INTENT INSTRUCTIONS
        # --------------------------------------------------------
        intent_instruction = {
            "product_search": """
Help the customer find the products that best match their request.
""",
            "rating": """
Focus on ratings and review counts. Identify the highest-rated
relevant products using only the supplied data.
""",
            "comparison": """
Compare the requested products clearly. Mention price, stock,
rating, and useful differences when available.
""",
            "recommendation": """
Recommend the most suitable product or products from the supplied
list and briefly explain why.
""",
        }.get(
            intent,
            "Answer the customer's question using the supplied product information.",
        )

        # --------------------------------------------------------
        # USER PROMPT
        # --------------------------------------------------------
        user_prompt = f"""
Customer message:
{message}

Detected intent:
{intent}

Instruction for this intent:
{intent_instruction}

Products relevant to this request:
{product_text}

Answer the customer's question directly.
Do not mention internal systems, APIs, prompts, or product-selection logic.
"""

        # --------------------------------------------------------
        # BUILD MESSAGE HISTORY
        # --------------------------------------------------------
        messages = [
            {
                "role": "system",
                "content": system_prompt,
            }
        ]

        if history:
            for item in history[-6:]:
                if not isinstance(item, dict):
                    continue

                role = item.get("role")
                content = item.get("content")

                if role in ("user", "assistant") and isinstance(content, str):
                    content = content.strip()

                    if content:
                        messages.append(
                            {
                                "role": role,
                                "content": content,
                            }
                        )

        messages.append(
            {
                "role": "user",
                "content": user_prompt,
            }
        )

        # --------------------------------------------------------
        # DEBUG INFORMATION
        # --------------------------------------------------------
        print("========================================")
        print("OPENAI REQUEST")
        print("MODEL:", MODEL_NAME)
        print("INTENT:", intent)
        print("ALL PRODUCT COUNT:", len(products))
        print("SELECTED PRODUCT COUNT:", len(selected_products or []))
        print("CONTEXT PRODUCT COUNT:", len(unique_products))
        print("========================================")

        # --------------------------------------------------------
        # OPENAI REQUEST
        # --------------------------------------------------------
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            max_completion_tokens=500,
        )

        # --------------------------------------------------------
        # EXTRACT RESPONSE SAFELY
        # --------------------------------------------------------
        if not response or not response.choices:
            print("OPENAI ERROR: No choices returned")
            return "I couldn't generate a response. Please try again."

        message_object = response.choices[0].message

        if message_object is None:
            print("OPENAI ERROR: Message object is None")
            return "I couldn't generate a response. Please try again."

        reply = message_object.content

        print("OPENAI RESPONSE:", repr(reply))
        print("========================================")

        if not reply or not isinstance(reply, str):
            return "I couldn't generate a response. Please try again."

        reply = reply.strip()

        if not reply:
            return "I couldn't generate a response. Please try again."

        return reply

    except Exception as error:
        print("========================================")
        print("OPENAI ERROR")
        print("TYPE:", type(error).__name__)
        print("MESSAGE:", str(error))
        print("DETAIL:", repr(error))
        print("========================================")

        # Return a useful fallback instead of hiding the complete
        # failure from the customer.
        if selected_products:
            first_product = selected_products[0]

            name = first_product.get("name", "this product")
            price = first_product.get("price", 0)
            stock = first_product.get("stock", 0)
            rating = first_product.get("averageRating", 0)
            reviews = first_product.get("totalReviews", 0)

            return (
                f"{name} is ${price}. "
                f"It currently has {stock} in stock and a "
                f"{rating}/5 rating from {reviews} review(s)."
            )

        return (
            "I found the relevant products, but I'm having trouble "
            "generating the full AI response right now. Please try again."
        )

# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "ShopEase AI",
        "model": MODEL_NAME,
    }


# ============================================================
# CHAT
# ============================================================

@app.post(
    "/chat",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
):

    message = str(
        request.message or ""
    ).strip()

    history = request.history

    # --------------------------------------------------------
    # EMPTY MESSAGE
    # --------------------------------------------------------

    if not message:

        return ChatResponse(
            reply=(
                "Please tell me what product "
                "you're looking for."
            ),
            products=[],
        )

    # --------------------------------------------------------
    # LOCAL GENERAL CHAT
    # --------------------------------------------------------

    if is_general_chat(message):

        local_reply = local_general_reply(
            message
        )

        if local_reply:

            return ChatResponse(
                reply=clean_ai_reply(
                    local_reply
                ),
                products=[],
            )

    # --------------------------------------------------------
    # GET PRODUCTS
    # --------------------------------------------------------

    all_products = get_products()

    if not all_products:

        return ChatResponse(
            reply=(
                "I couldn't load the store products right now. "
                "Please make sure the backend is running on port 3001."
            ),
            products=[],
        )

    # --------------------------------------------------------
    # CURRENT CONTEXT
    # --------------------------------------------------------

    search_terms = extract_search_terms(
        message
    )

    use_cases = extract_use_cases(
        message
    )

    budget = get_conversation_budget(
        message,
        history,
    )

    # --------------------------------------------------------
    # FOLLOW-UP CONTEXT
    # --------------------------------------------------------

    is_follow_up = is_follow_up_message(
        message
    )

    previous_user_message = ""

    if is_follow_up and history:

        previous_user_message = (
            get_previous_user_message(
                history
            )
        )

        if previous_user_message:

            previous_search_terms = (
                extract_search_terms(
                    previous_user_message
                )
            )

            previous_use_cases = (
                extract_use_cases(
                    previous_user_message
                )
            )

            if not search_terms:

                search_terms = (
                    previous_search_terms
                )

            if not use_cases:

                use_cases = (
                    previous_use_cases
                )

    # --------------------------------------------------------
    # BUILD SEARCH MESSAGE
    # --------------------------------------------------------

    search_message = message

    if (
        is_follow_up
        and previous_user_message
    ):

        search_message = (
            f"{previous_user_message} {message}"
        )

    # --------------------------------------------------------
    # INTENT
    # --------------------------------------------------------

    rating_request = is_rating_request(
        message
    )

    comparison_request = (
        is_comparison_request(
            message
        )
    )

    recommendation_request = (
        is_recommendation_request(
            message
        )
    )

    # --------------------------------------------------------
    # SELECT PRODUCTS
    # --------------------------------------------------------

    selected_products: list[
        dict[str, Any]
    ] = []

    intent = "product_search"

    # --------------------------------------------------------
    # RATING
    # --------------------------------------------------------

    if rating_request:

        intent = "rating"

        selected_products = (
            find_best_rated_products(
                all_products,
                search_message,
                budget,
            )
        )

        if (
            not selected_products
            and previous_user_message
        ):

            selected_products = (
                find_best_rated_products(
                    all_products,
                    previous_user_message,
                    budget,
                )
            )

    # --------------------------------------------------------
    # COMPARISON
    # --------------------------------------------------------

    elif comparison_request:

        intent = "comparison"

        selected_products = (
            find_comparison_products(
                all_products,
                search_message,
                budget,
            )
        )

    # --------------------------------------------------------
    # RECOMMENDATION
    # --------------------------------------------------------

    elif recommendation_request:

        intent = "recommendation"

        selected_products = (
            find_recommendations(
                all_products,
                search_message,
                budget,
            )
        )

    # --------------------------------------------------------
    # NORMAL SEARCH
    # --------------------------------------------------------

    else:

        intent = "product_search"

        selected_products = (
            find_relevant_products(
                all_products,
                search_message,
                budget,
            )
        )

    # --------------------------------------------------------
    # FINAL PHONE FILTER
    # --------------------------------------------------------

    if "phone" in search_terms:

        if not is_phone_accessory_request(
            search_message
        ):

            selected_products = [
                product
                for product in selected_products
                if is_phone_product(product)
            ]

    # --------------------------------------------------------
    # GENERATE AI REPLY
    # --------------------------------------------------------

    reply = generate_ai_reply(
        message=message,
        history=history,
        products=all_products,
        selected_products=selected_products,
        intent=intent,
    )

    # --------------------------------------------------------
    # PRODUCT CARDS
    # --------------------------------------------------------

    cards = [
        product_to_card(product)
        for product in selected_products
    ]

    return ChatResponse(
        reply=clean_ai_reply(reply),
        products=cards,
    )