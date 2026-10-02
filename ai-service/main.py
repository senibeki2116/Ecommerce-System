import os
import re

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel


load_dotenv()

app = FastAPI(
    title="Ecommerce AI Service",
    version="1.0.0",
)

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


api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("OPENAI_API_KEY is not configured")

client = OpenAI(api_key=api_key)

PRODUCTS_API_URL = "http://localhost:3001/products"


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@app.get("/")
def root():
    return {"message": "Ecommerce AI Service is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


def get_products():
    try:
        response = httpx.get(
            PRODUCTS_API_URL,
            timeout=10.0,
        )

        response.raise_for_status()

        return response.json()

    except Exception as error:
        print(f"Product API error: {error}")
        return []


def extract_budget(message: str):
    patterns = [
        r"under\s*\$?\s*(\d+(?:\.\d+)?)",
        r"below\s*\$?\s*(\d+(?:\.\d+)?)",
        r"less\s+than\s*\$?\s*(\d+(?:\.\d+)?)",
        r"up\s+to\s*\$?\s*(\d+(?:\.\d+)?)",
        r"\$\s*(\d+(?:\.\d+)?)\s*or\s*less",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            message.lower(),
        )

        if match:
            return float(match.group(1))

    return None


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        products = get_products()

        budget = extract_budget(request.message)

        if budget is not None:

            matching_products = [
                product
                for product in products
                if float(product.get("price", 0)) <= budget
            ]

            product_context = "\n".join(
                [
                    (
                        f"Name: {product.get('name')}, "
                        f"Price: ${product.get('price')}, "
                        f"Stock: {product.get('stock')}, "
                        f"Category: "
                        f"{product.get('category', {}).get('name', 'Unknown')}"
                    )
                    for product in matching_products
                ]
            )

            instructions = f"""
You are a helpful ecommerce shopping assistant.

The customer asked:

"{request.message}"

The application has already filtered the store catalog
to products within the customer's requested budget.

CUSTOMER BUDGET:

${budget:.2f}

MATCHING PRODUCTS:

{product_context if product_context else "No matching products found."}

Rules:

1. Only recommend products listed in MATCHING PRODUCTS.
2. Do not invent products or prices.
3. Include product names and prices.
4. Clearly identify products that are out of stock.
5. Do not ask the customer for their budget again.
6. If there are no matching products, clearly say no products were found.
7. Keep the answer concise and friendly.
"""

        else:

            product_context = "\n".join(
                [
                    (
                        f"ID: {product.get('id')}, "
                        f"Name: {product.get('name')}, "
                        f"Description: {product.get('description')}, "
                        f"Price: ${product.get('price')}, "
                        f"Stock: {product.get('stock')}, "
                        f"Category: "
                        f"{product.get('category', {}).get('name', 'Unknown')}"
                    )
                    for product in products
                ]
            )

            instructions = f"""
You are a helpful AI shopping assistant for our ecommerce store.

Use the following current product catalog as the source of truth:

PRODUCT CATALOG:

{product_context}

Rules:

1. Use the catalog when answering product questions.
2. Never invent products, prices, stock quantities, or categories.
3. Use the exact current price and stock from the catalog.
4. If a product has stock 0, say it is out of stock.
5. Be friendly and concise.
"""

        response = client.responses.create(
            model="gpt-6-luna",
            instructions=instructions,
            input=request.message,
        )

        return {
            "reply": response.output_text
        }

    except Exception as error:
        print(f"OpenAI error: {error}")

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )