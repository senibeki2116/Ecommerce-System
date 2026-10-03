
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
import requests

load_dotenv()

app = FastAPI(title="ShopEase AI Service")

# ============================================================
# CORS
# ============================================================

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
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ShopEase AI",
    }


# ============================================================
# GET PRODUCTS FROM SHOP EASE BACKEND
# ============================================================

def get_products():
    try:
        response = requests.get(
            PRODUCTS_API_URL,
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        # Support:
        # [...]
        #
        # or:
        # {"data": [...]}

        if isinstance(data, dict):
            products = data.get("data", [])
        else:
            products = data

        if not isinstance(products, list):
            return []

        return products

    except Exception as error:
        print("Product API error:", error)
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
# SHOPPING KEYWORDS / SYNONYMS
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
# FIND SEARCH TERMS
# ============================================================

def extract_search_terms(message: str):
    text = message.lower()

    matched_groups = []

    for group, keywords in SEARCH_GROUPS.items():
        for keyword in keywords:
            if keyword in text:
                matched_groups.append(group)
                break

    return matched_groups


# ============================================================
# PRODUCT MATCHING
# ============================================================

def product_matches(product, search_groups):
    if not search_groups:
        return True

    name = str(product.get("name", "")).lower()
    description = str(product.get("description", "")).lower()

    category = product.get("category", "")

    # NestJS may return category as:
    # {"id": 1, "name": "Electronics"}

    if isinstance(category, dict):
        category = category.get("name", "")

    category = str(category).lower()

    searchable_text = (
        f"{name} {description} {category}"
    )

    for group in search_groups:
        keywords = SEARCH_GROUPS.get(group, [])

        for keyword in keywords:
            if keyword.lower() in searchable_text:
                return True

    return False


# ============================================================
# SCORE PRODUCTS
# ============================================================

def score_product(product, message, search_groups):
    text = message.lower()

    name = str(product.get("name", "")).lower()
    description = str(
        product.get("description", "")
    ).lower()

    category = product.get("category", "")

    # Handle nested category object
    if isinstance(category, dict):
        category = category.get("name", "")

    category = str(category).lower()

    searchable_text = (
        f"{name} {description} {category}"
    )

    score = 0

    # Exact product name match
    if name and name in text:
        score += 100

    # Category match
    if category and category in text:
        score += 50

    # Search-group match
    for group in search_groups:
        for keyword in SEARCH_GROUPS.get(group, []):
            if keyword.lower() in searchable_text:
                score += 20

    # Individual word matches
    words = re.findall(
        r"[a-zA-Z]+",
        text,
    )

    for word in words:
        if len(word) < 3:
            continue

        if word in searchable_text:
            score += 5

    # Prefer products that are in stock
    stock = product.get("stock", 0)

    try:
        if int(stock) > 0:
            score += 3
    except Exception:
        pass

    return score


# ============================================================
# SMART PRODUCT SEARCH
# ============================================================

def find_relevant_products(
    products,
    message,
    budget=None,
):
    search_groups = extract_search_terms(message)

    candidates = []

    for product in products:

        try:
            price = float(
                product.get("price", 0)
            )
        except Exception:
            continue

        # Budget filter
        if budget is not None and price > budget:
            continue

        # Require product to match requested category
        if search_groups:

            if not product_matches(
                product,
                search_groups,
            ):
                continue

        score = score_product(
            product,
            message,
            search_groups,
        )

        candidates.append(
            {
                "product": product,
                "score": score,
            }
        )

    # Sort by:
    # 1. relevance
    # 2. in-stock products
    # 3. lower price

    candidates.sort(
        key=lambda item: (
            item["score"],
            int(
                item["product"].get(
                    "stock",
                    0,
                )
            ) > 0,
            -float(
                item["product"].get(
                    "price",
                    0,
                )
            ),
        ),
        reverse=True,
    )

    return [
        item["product"]
        for item in candidates[:10]
    ]


# ============================================================
# PRODUCT FORMAT
# ============================================================

def create_product_cards(products):
    cards = []

    for product in products:

        try:
            category = product.get("category")

            # NestJS returns category as an object:
            #
            # {
            #     "id": 1,
            #     "name": "Electronics",
            #     ...
            # }

            if isinstance(category, dict):
                category_name = category.get("name")
            else:
                category_name = category

            cards.append(
                ProductCard(
                    id=int(
                        product.get("id")
                    ),

                    name=str(
                        product.get(
                            "name",
                            "Unnamed product",
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
                    ),

                    stock=int(
                        product.get(
                            "stock",
                            0,
                        )
                    ),

                    image=product.get(
                        "image"
                    ),

                    category=category_name,
                )
            )

        except Exception as error:

            print(
                "Product formatting error:",
                repr(error),
            )

            print(
                "Problem product:",
                product,
            )

    return cards


# ============================================================
# PRODUCT CONTEXT FOR AI
# ============================================================

def build_product_context(products):

    if not products:
        return "No matching products were found."

    lines = []

    for product in products:

        category = product.get(
            "category",
            "",
        )

        if isinstance(category, dict):
            category = category.get(
                "name",
                "",
            )

        lines.append(
            f"""
Product ID: {product.get("id")}
Name: {product.get("name")}
Category: {category}
Description: {product.get("description")}
Price: ${product.get("price")}
Stock: {product.get("stock")}
"""
        )

    return "\n".join(lines)


# ============================================================
# CHAT
# ============================================================

@app.post(
    "/chat",
    response_model=ChatResponse,
)
def chat(request: ChatRequest):

    user_message = request.message.strip()

    # --------------------------------------------------------
    # Empty message
    # --------------------------------------------------------

    if not user_message:

        return ChatResponse(
            reply=(
                "Please tell me what product "
                "you're looking for."
            ),
            products=[],
        )

    # --------------------------------------------------------
    # Get products
    # --------------------------------------------------------

    products = get_products()

    if not products:

        return ChatResponse(
            reply=(
                "I couldn't access the ShopEase "
                "product catalog right now. "
                "Please make sure the ecommerce "
                "backend is running."
            ),
            products=[],
        )

    # --------------------------------------------------------
    # Extract budget
    # --------------------------------------------------------

    budget = extract_budget(
        user_message
    )

    # --------------------------------------------------------
    # Find relevant products
    # --------------------------------------------------------

    relevant_products = find_relevant_products(
        products,
        user_message,
        budget,
    )

    # --------------------------------------------------------
    # If nothing matches, try broader budget search
    # --------------------------------------------------------

    if (
        not relevant_products
        and budget is not None
    ):

        relevant_products = [
            product
            for product in products
            if float(
                product.get("price", 0)
            ) <= budget
        ][:10]

    # --------------------------------------------------------
    # If still nothing matches, use catalog sample
    # --------------------------------------------------------

    if not relevant_products:
        relevant_products = products[:10]

    # --------------------------------------------------------
    # Build AI context
    # --------------------------------------------------------

    product_context = build_product_context(
        relevant_products
    )

    budget_instruction = ""

    if budget is not None:

        budget_instruction = f"""
The customer specified a maximum budget
of ${budget:.2f}.

Only recommend products at or below
this budget.
"""

    # --------------------------------------------------------
    # AI system prompt
    # --------------------------------------------------------

    system_prompt = f"""
You are ShopEase AI, the intelligent shopping
assistant for an ecommerce website.

Your job is to help customers discover products
from the REAL ShopEase product catalog.

IMPORTANT RULES:

1. Only recommend products that appear in the
   provided catalog.

2. Never invent products.

3. Never invent prices.

4. Never invent stock quantities.

5. Use the product information provided below.

6. If stock is 0, clearly tell the customer that
   the product is currently out of stock.

7. Keep responses friendly and concise.

8. When several products match, mention the most
   relevant ones.

9. If the customer asks for recommendations,
   explain briefly why the products match.

10. If the customer asks about a specific product,
    use its actual catalog information.

11. If there are no good matches, honestly say so.

12. Do not claim that an item has features that
    are not present in its catalog description.

13. Use simple ASCII characters in your response.

14. Use "-" instead of "—", "–", or other
    special dash characters.

15. Do not use corrupted or unusual characters.

{budget_instruction}

AVAILABLE SHOPPING CATALOG:

{product_context}
"""

    # --------------------------------------------------------
    # Generate AI response
    # --------------------------------------------------------

    try:

        response = client.responses.create(
            model="gpt-6-luna",
            instructions=system_prompt,
            input=user_message,
        )

        reply = response.output_text.strip()

        # Fix possible encoding/mojibake
        reply = (
            reply
            .replace("—", "-")
            .replace("–", "-")
            .replace("â€”", "-")
            .replace("â€“", "-")
        )

        if not reply:

            reply = (
                "I found some products, but "
                "I couldn't generate a detailed "
                "response right now."
            )

    except Exception as error:

        print(
            "OpenAI error:",
            error,
        )

        # ----------------------------------------------------
        # Fallback if AI generation fails
        # ----------------------------------------------------

        if relevant_products:

            first = relevant_products[0]

            reply = (
                f"I found "
                f"{len(relevant_products)} "
                f"product"
                f"{'s' if len(relevant_products) != 1 else ''} "
                f"that may match your request. "

                f"One option is "
                f"{first.get('name')} "
                f"for "
                f"${float(first.get('price', 0)):.2f}."
            )

        else:

            reply = (
                "I couldn't find a matching product."
            )

    # --------------------------------------------------------
    # Create product cards
    # --------------------------------------------------------

    product_cards = create_product_cards(
        relevant_products
    )

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return ChatResponse(
        reply=reply,
        products=product_cards,
    )

