from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
import requests


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# APP
# ============================================================

app = FastAPI(title="ShopEase AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# OPENAI
# ============================================================

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


# ============================================================
# SHOP PRODUCTS API
# ============================================================

PRODUCTS_API_URL = "http://localhost:3001/products"


# ============================================================
# MODELS
# ============================================================

class ChatRequest(BaseModel):
    message: str


class ProductCard(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float
    stock: int
    image: str | None = None
    category: str | None = None


class ChatResponse(BaseModel):
    reply: str
    products: list[ProductCard] = []


# ============================================================
# PRODUCT HELPERS
# ============================================================

def get_category_name(product):
    category = product.get("category")

    if isinstance(category, dict):
        return str(category.get("name", ""))

    if category is None:
        return ""

    return str(category)


def get_products():
    try:
        response = requests.get(
            PRODUCTS_API_URL,
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        if isinstance(data, list):
            return data

        if isinstance(data, dict):
            if isinstance(data.get("products"), list):
                return data["products"]

            if isinstance(data.get("data"), list):
                return data["data"]

        return []

    except requests.RequestException as error:
        print("Products API error:", error)
        return []

    except Exception as error:
        print("Unexpected products error:", error)
        return []


# ============================================================
# BUDGET EXTRACTION
# ============================================================

def extract_budget(message: str):
    text = message.lower()

    patterns = [
        r"(?:under|below|less than|up to|maximum|max|within)\s*\$?\s*(\d+(?:\.\d+)?)",
        r"\$\s*(\d+(?:\.\d+)?)\s*(?:or less|maximum|max)?",
        r"(\d+(?:\.\d+)?)\s*(?:dollars|usd)\s*(?:or less|maximum|max)?",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)

        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass

    return None


# ============================================================
# SEARCH GROUPS
# ============================================================

SEARCH_GROUPS = {
    "phone": [
        "phone",
        "phones",
        "smartphone",
        "smartphones",
        "mobile",
        "mobile phone",
        "iphone",
        "android",
    ],

    "gaming": [
        "gaming",
        "gamer",
        "game",
        "games",
        "gaming setup",
        "gaming accessories",
    ],

    "audio": [
        "audio",
        "speaker",
        "speakers",
        "headphone",
        "headphones",
        "earphone",
        "earphones",
        "music",
        "sound",
    ],

    "electronics": [
        "electronics",
        "electronic",
        "device",
        "devices",
        "tech",
        "technology",
        "gadget",
        "gadgets",
    ],

    "accessories": [
        "accessory",
        "accessories",
        "case",
        "cases",
        "cover",
        "covers",
    ],

    "keyboard": [
        "keyboard",
        "keyboards",
        "typing",
        "mechanical keyboard",
    ],

    "mouse": [
        "mouse",
        "mice",
        "gaming mouse",
    ],

    "watch": [
        "watch",
        "watches",
        "smartwatch",
        "smart watch",
        "fitness watch",
    ],

    "wireless": [
        "wireless",
        "bluetooth",
    ],
}


# ============================================================
# SEARCH TERM EXTRACTION
# ============================================================

def extract_search_terms(message: str):
    text = message.lower()
    terms = []

    for group_name, keywords in SEARCH_GROUPS.items():
        for keyword in keywords:
            if keyword in text:
                terms.append(group_name)
                break

    return list(dict.fromkeys(terms))


# ============================================================
# PRODUCT MATCHING
# ============================================================

def product_matches(product, message: str):
    text = message.lower()

    name = str(
        product.get("name", "")
    ).lower()

    description = str(
        product.get("description", "") or ""
    ).lower()

    category = get_category_name(product).lower()

    searchable_text = f"{name} {description} {category}"

    search_terms = extract_search_terms(message)

    if not search_terms:
        return True

    for term in search_terms:
        keywords = SEARCH_GROUPS.get(term, [])

        for keyword in keywords:
            if keyword in searchable_text:
                return True

    return False


# ============================================================
# PRODUCT SCORING
# ============================================================

def score_product(product, message: str):
    text = message.lower()

    name = str(
        product.get("name", "")
    ).lower()

    description = str(
        product.get("description", "") or ""
    ).lower()

    category = get_category_name(product).lower()

    searchable_text = f"{name} {description} {category}"

    score = 0

    search_terms = extract_search_terms(message)

    for term in search_terms:
        keywords = SEARCH_GROUPS.get(term, [])

        for keyword in keywords:
            if keyword in name:
                score += 10

            elif keyword in category:
                score += 8

            elif keyword in description:
                score += 5

    words = [
        word.strip(".,!?")
        for word in text.split()
        if len(word.strip(".,!?")) >= 4
    ]

    for word in words:
        if word in searchable_text:
            score += 2

    stock = int(
        product.get("stock", 0) or 0
    )

    if stock > 0:
        score += 2

    return score


# ============================================================
# SMART PRODUCT SEARCH
# ============================================================

def find_relevant_products(
    products,
    message: str,
    budget=None,
):
    candidates = []

    for product in products:
        try:
            price = float(
                product.get("price", 0) or 0
            )
        except (TypeError, ValueError):
            continue

        if budget is not None and price > budget:
            continue

        if product_matches(product, message):
            score = score_product(
                product,
                message,
            )

            candidates.append(
                (score, product)
            )

    candidates.sort(
        key=lambda item: (
            item[0],
            int(
                item[1].get("stock", 0) or 0
            ),
        ),
        reverse=True,
    )

    return [
        product
        for score, product in candidates[:5]
    ]


# ============================================================
# COMPARISON DETECTION
# ============================================================

def is_comparison_request(message: str):
    text = message.lower()

    comparison_words = [
        "compare",
        "comparison",
        "difference between",
        "which is better",
        "which one is better",
        "which is cheaper",
        "which costs less",
        "vs",
        "versus",
    ]

    return any(
        word in text
        for word in comparison_words
    )


# ============================================================
# FIND PRODUCTS FOR COMPARISON
# ============================================================

def find_comparison_products(
    products,
    message: str,
):
    text = message.lower()

    matches = []

    for product in products:
        name = str(
            product.get("name", "")
        ).lower()

        if not name:
            continue

        if name in text:
            matches.append(product)
            continue

        words = name.split()

        important_words = [
            word
            for word in words
            if len(word) >= 3
        ]

        if (
            important_words
            and all(
                word in text
                for word in important_words
            )
        ):
            matches.append(product)

    unique_products = []

    seen_ids = set()

    for product in matches:
        product_id = product.get("id")

        if product_id not in seen_ids:
            seen_ids.add(product_id)
            unique_products.append(product)

    return unique_products[:3]


# ============================================================
# RECOMMENDATION DETECTION
# ============================================================

def is_recommendation_request(message: str):
    text = message.lower()

    recommendation_words = [
        "recommend",
        "recommendation",
        "suggest",
        "suggestion",
        "what should i buy",
        "what should i get",
        "what do you recommend",
        "which should i buy",
        "which one should i buy",
        "help me choose",
        "good choice",
        "best for me",
        "best product for",
        "suitable for",
        "good for",
    ]

    return any(
        word in text
        for word in recommendation_words
    )


# ============================================================
# SMART RECOMMENDATION SEARCH
# ============================================================

def find_recommendation_products(
    products: list[dict],
    message: str,
    budget: float | None = None,
) -> list[dict]:

    text = message.lower()

    recommendation_groups = {
        "gaming": [
            "gaming",
            "gamer",
            "game",
            "games",
        ],

        "phone": [
            "phone",
            "smartphone",
            "mobile",
            "iphone",
            "android",
        ],

        "laptop": [
            "laptop",
            "notebook",
            "computer",
        ],

        "keyboard": [
            "keyboard",
            "typing",
            "mechanical keyboard",
        ],

        "mouse": [
            "mouse",
            "mice",
            "gaming mouse",
        ],

        "audio": [
            "audio",
            "speaker",
            "speakers",
            "headphone",
            "headphones",
            "earphone",
            "earphones",
            "music",
            "sound",
        ],

        "watch": [
            "watch",
            "watches",
            "smartwatch",
            "smart watch",
            "fitness watch",
        ],

        "camera": [
            "camera",
            "photography",
            "photo",
        ],

        "accessories": [
            "accessory",
            "accessories",
            "case",
            "cases",
            "cover",
            "covers",
        ],
    }

    requested_groups = []

    for group, keywords in recommendation_groups.items():
        if any(
            keyword in text
            for keyword in keywords
        ):
            requested_groups.append(group)

    candidates = []

    for product in products:
        try:
            price = float(
                product.get("price", 0) or 0
            )
        except (TypeError, ValueError):
            continue

        if budget is not None and price > budget:
            continue

        candidates.append(product)

    if not candidates:
        return []

    scored_products = []

    message_words = re.findall(
        r"[a-z0-9]+",
        text,
    )

    for product in candidates:

        name = str(
            product.get("name", "")
        ).lower()

        description = str(
            product.get("description", "") or ""
        ).lower()

        category = get_category_name(
            product
        ).lower()

        searchable_text = (
            f"{name} {description} {category}"
        )

        score = 0

        for group in requested_groups:

            keywords = recommendation_groups[group]

            if any(
                keyword in name
                for keyword in keywords
            ):
                score += 10

            if any(
                keyword in category
                for keyword in keywords
            ):
                score += 8

            if any(
                keyword in description
                for keyword in keywords
            ):
                score += 5

        for word in message_words:
            if (
                len(word) >= 4
                and word in searchable_text
            ):
                score += 2

        stock = int(
            product.get("stock", 0) or 0
        )

        if stock > 0:
            score += 3
        else:
            score -= 5

        if requested_groups and score <= 3:
            continue

        scored_products.append(
            (
                score,
                product,
            )
        )

    scored_products.sort(
        key=lambda item: (
            item[0],
            int(
                item[1].get(
                    "stock",
                    0,
                )
                or 0
            ),
        ),
        reverse=True,
    )

    return [
        product
        for score, product in scored_products[:3]
    ]


# ============================================================
# PRODUCT CARDS
# ============================================================

def create_product_cards(products):

    cards = []

    for product in products:

        category = product.get("category")

        if isinstance(category, dict):
            category_name = category.get("name")
        else:
            category_name = category

        cards.append(
            ProductCard(
                id=int(
                    product.get(
                        "id",
                        0,
                    )
                ),

                name=str(
                    product.get(
                        "name",
                        "Unknown product",
                    )
                ),

                description=product.get(
                    "description"
                ),

                price=float(
                    product.get(
                        "price",
                        0,
                    )
                    or 0
                ),

                stock=int(
                    product.get(
                        "stock",
                        0,
                    )
                    or 0
                ),

                image=product.get(
                    "image"
                ),

                category=category_name,
            )
        )

    return cards


# ============================================================
# PRODUCT CONTEXT
# ============================================================

def build_product_context(products):

    if not products:
        return "No matching products were found."

    context_lines = []

    for product in products:

        category = get_category_name(
            product
        )

        context_lines.append(
            f"""
Product ID: {product.get("id")}
Name: {product.get("name")}
Description: {product.get("description") or "No description available"}
Price: ${float(product.get("price", 0) or 0):.2f}
Stock: {int(product.get("stock", 0) or 0)}
Category: {category or "Uncategorized"}
Image: {product.get("image") or "No image"}
""".strip()
        )

    return "\n\n".join(
        context_lines
    )


# ============================================================
# TEXT CLEANUP
# ============================================================

def clean_ai_reply(reply: str) -> str:

    if not reply:
        return ""

    try:
        reply = reply.encode(
            "latin1"
        ).decode(
            "utf-8"
        )
    except (
        UnicodeEncodeError,
        UnicodeDecodeError,
    ):
        pass

    replacements = {
        "â€™": "'",
        "â€˜": "'",
        "â€œ": '"',
        "â€\x9d": '"',
        "â€“": "-",
        "â€”": "-",
        "â€¦": "...",
        "Â": "",
        "â\x80\x99": "'",
        "â\x80\x98": "'",
        "â\x80\x9c": '"',
        "â\x80\x9d": '"',
        "â\x80\x93": "-",
        "â\x80\x94": "-",
        "â\x80\xa6": "...",
        "Itâs": "It's",
        "itâs": "it's",
        "Whatâs": "What's",
        "whatâs": "what's",
        "Thatâs": "That's",
        "thatâs": "that's",
        "Thereâs": "There's",
        "thereâs": "there's",
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
        "âs": "'s",
    }

    for old, new in replacements.items():
        reply = reply.replace(
            old,
            new,
        )

    return reply.strip()


# ============================================================
# GENERAL MESSAGE DETECTION
# ============================================================

def is_general_message(message: str):

    text = message.lower().strip()

    general_messages = [
        "hi",
        "hello",
        "hey",
        "hey there",
        "hi there",
        "good morning",
        "good afternoon",
        "good evening",
        "thanks",
        "thank you",
        "thankyou",
        "ok",
        "okay",
        "bye",
        "goodbye",
        "who are you",
        "what can you do",
    ]

    if text in general_messages:
        return True

    return False


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "ShopEase AI",
    }


# ============================================================
# CHAT
# ============================================================

@app.post(
    "/chat",
    response_model=ChatResponse,
)
def chat(request: ChatRequest):

    user_message = request.message.strip()

    if not user_message:

        return ChatResponse(
            reply="Please enter a message.",
            products=[],
        )

    # --------------------------------------------------------
    # GENERAL CHAT
    # --------------------------------------------------------

    if is_general_message(
        user_message
    ):

        try:

            response = client.responses.create(
                model="gpt-6-luna",

                instructions="""
You are ShopEase Assistant.

You are a friendly ecommerce shopping assistant.

For greetings and general conversation:

- Be friendly.
- Keep the response short.
- Do not list products.
- Do not create product cards.
- Do not use Markdown product links.
- Do not invent product information.

Example:

User: hi

Assistant:
Hi! How can I help you today?
""",

                input=user_message,

                max_output_tokens=150,
            )

            reply = response.output_text or (
                "Hi! How can I help you today?"
            )

            return ChatResponse(
                reply=clean_ai_reply(reply),
                products=[],
            )

        except Exception as error:

            print(
                "OpenAI general chat error:",
                repr(error),
            )

            return ChatResponse(
                reply="Hi! How can I help you today?",
                products=[],
            )

    # --------------------------------------------------------
    # GET PRODUCTS
    # --------------------------------------------------------

    products = get_products()

    if not products:

        return ChatResponse(
            reply=(
                "I couldn't load the product catalog "
                "right now. Please make sure the ShopEase "
                "backend is running on port 3001."
            ),
            products=[],
        )

    # --------------------------------------------------------
    # BUDGET
    # --------------------------------------------------------

    budget = extract_budget(
        user_message
    )

    # --------------------------------------------------------
    # REQUEST TYPE
    # --------------------------------------------------------

    if is_comparison_request(
        user_message
    ):

        relevant_products = (
            find_comparison_products(
                products,
                user_message,
            )
        )

        if not relevant_products:

            relevant_products = (
                find_relevant_products(
                    products,
                    user_message,
                    budget,
                )
            )

        request_type = "comparison"

    elif is_recommendation_request(
        user_message
    ):

        relevant_products = (
            find_recommendation_products(
                products,
                user_message,
                budget,
            )
        )

        request_type = "recommendation"

    else:

        relevant_products = (
            find_relevant_products(
                products,
                user_message,
                budget,
            )
        )

        request_type = "search"

    # --------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------

    if not relevant_products:

        if budget is not None:

            budget_products = []

            for product in products:

                try:
                    price = float(
                        product.get(
                            "price",
                            0,
                        )
                        or 0
                    )

                except (
                    TypeError,
                    ValueError,
                ):
                    continue

                if price <= budget:
                    budget_products.append(
                        product
                    )

            budget_products.sort(
                key=lambda product: (
                    int(
                        product.get(
                            "stock",
                            0,
                        )
                        or 0
                    ),
                    float(
                        product.get(
                            "price",
                            0,
                        )
                        or 0
                    ),
                ),
                reverse=True,
            )

            relevant_products = (
                budget_products[:5]
            )

        else:

            relevant_products = []

    # --------------------------------------------------------
    # LIMIT RESULTS
    # --------------------------------------------------------

    if request_type == "comparison":

        relevant_products = (
            relevant_products[:3]
        )

    elif request_type == "recommendation":

        relevant_products = (
            relevant_products[:3]
        )

    else:

        relevant_products = (
            relevant_products[:5]
        )

    # --------------------------------------------------------
    # PRODUCT CONTEXT
    # --------------------------------------------------------

    product_context = (
        build_product_context(
            relevant_products
        )
    )

    # --------------------------------------------------------
    # SYSTEM PROMPT
    # --------------------------------------------------------

    system_prompt = f"""
You are ShopEase Assistant, a helpful shopping assistant
for an ecommerce website.

The customer is asking:

{user_message}

Request type:

{request_type}

Product catalog context:

{product_context}

IMPORTANT:

Only discuss products that are present in the catalog context.

Never invent:

- products
- prices
- stock
- specifications
- categories
- features

Use the exact catalog price and stock.

Keep the answer concise.

Do NOT create product cards in your answer.

Do NOT output Markdown links.

Do NOT output product images.

Do NOT output:

[Product Name](image-url)

### Product Name

[View Product](...)

The website frontend will automatically create the product
cards from the structured product data.

Your response should contain only a short natural-language
explanation or recommendation.

For example:

"Here are some phones that match your request."

or:

"I found 3 products that fit your budget."

COMPARISON:

Compare only the supplied products.

Use actual prices, stock, categories and descriptions.

RECOMMENDATION:

Recommend only supplied products.

Respect the customer's budget.

Prefer products that are in stock.

Do not recommend products outside the budget.

Keep the response short because the frontend will display
the actual products separately as product cards.
"""

    # --------------------------------------------------------
    # OPENAI
    # --------------------------------------------------------

    try:

        response = client.responses.create(
            model="gpt-6-luna",

            instructions=system_prompt,

            input=user_message,

            max_output_tokens=250,
        )

        reply = response.output_text

        if not reply:
            reply = "Here are the products I found."

        reply = clean_ai_reply(
            reply
        )

    except Exception as error:

        print(
            "OpenAI error:",
            repr(error),
        )

        return ChatResponse(
            reply=(
                "I found the matching products."
            ),
            products=create_product_cards(
                relevant_products
            ),
        )

    # --------------------------------------------------------
    # RETURN STRUCTURED RESPONSE
    # --------------------------------------------------------

    return ChatResponse(
        reply=reply,
        products=create_product_cards(
            relevant_products
        ),
    )