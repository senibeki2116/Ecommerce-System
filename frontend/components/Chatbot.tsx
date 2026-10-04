"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "../app/Context/CartContext";

const AI_API_URL =
  process.env.NEXT_PUBLIC_AI_API_URL || "http://127.0.0.1:8000";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ProductCategory = {
  id?: number;
  name?: string;
};

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  images?: string[] | null;
  imageUrl?: string | null;
  category?: string | ProductCategory | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
};

type SpeechRecognitionEvent = Event & {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const QUICK_QUESTIONS = [
  "Show me phones",
  "What do you recommend?",
  "Show products under $100",
  "Compare products",
];

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s$.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanMarkdown(value: string): string {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\r\n/g, "\n")
    .trim();
}

function isComparisonMessage(message: string): boolean {
  const text = normalizeText(message);

  const comparisonWords = [
    "compare",
    "comparison",
    "difference",
    "which is better",
    "which one is better",
    "which is cheaper",
    "which costs less",
    "vs",
    "versus",
  ];

  return comparisonWords.some((word) => text.includes(word));
}

function getProductImage(product: Product): string {
  if (product.image && product.image.trim()) {
    return product.image;
  }

  if (
    Array.isArray(product.images) &&
    product.images.length > 0 &&
    product.images[0]
  ) {
    return product.images[0];
  }

  if (product.imageUrl && product.imageUrl.trim()) {
    return product.imageUrl;
  }

  return DEFAULT_PRODUCT_IMAGE;
}

function getCategoryName(product: Product): string {
  if (typeof product.category === "string" && product.category.trim()) {
    return product.category;
  }

  if (
    product.category &&
    typeof product.category === "object" &&
    product.category.name
  ) {
    return product.category.name;
  }

  return "Product";
}

function extractProductList(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data as Product[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const value = data as Record<string, unknown>;

  if (Array.isArray(value.products)) {
    return value.products as Product[];
  }

  if (Array.isArray(value.data)) {
    return value.data as Product[];
  }

  if (
    value.data &&
    typeof value.data === "object" &&
    Array.isArray((value.data as Record<string, unknown>).products)
  ) {
    return (value.data as Record<string, unknown>).products as Product[];
  }

  return [];
}

function productMatchesQuery(product: Product, query: string): boolean {
  const productText = normalizeText(
    [product.name, product.description || "", getCategoryName(product)].join(
      " ",
    ),
  );

  return productText.includes(normalizeText(query));
}

export default function Chatbot() {
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 Welcome to ShopEase. I'm your shopping assistant. I can help you find products, compare prices, check availability, and add products to your cart.",
    },
  ]);

  const [addedProducts, setAddedProducts] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handleAddToCart(product: Product) {
    if (product.stock <= 0) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: Number(product.price),
      stock: product.stock,
      image: getProductImage(product),
    });

    setAddedProducts((current) => {
      if (current.includes(product.id)) {
        return current;
      }

      return [...current, product.id];
    });

    window.setTimeout(() => {
      setAddedProducts((current) => current.filter((id) => id !== product.id));
    }, 1800);
  }

  function startVoiceInput() {
    if (loading || typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript || "";

      if (!transcript) {
        return;
      }

      setMessage((current) => {
        const existing = current.trim();

        if (!existing) {
          return transcript;
        }

        return `${existing} ${transcript}`;
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error("Voice recognition error:", error);
      setIsListening(false);
    }
  }

  function speakMessage(text: string, index: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeakingIndex(index);
    };

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  }

  async function fetchProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/products`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Product API returned ${response.status}`);
      }

      const data = await response.json();

      return extractProductList(data);
    } catch (error) {
      console.error("Product request failed:", error);
      return [];
    }
  }

  async function findProducts(query: string): Promise<Product[]> {
    const products = await fetchProducts();

    if (!products.length) {
      return [];
    }

    const normalized = normalizeText(query);

    /*
     * PRICE FILTERS
     *
     * Examples:
     * under $100
     * below $100
     * less than $100
     * cheaper than $100
     * under 100
     */

    const underPriceMatch = normalized.match(
      /(?:under|below|less than|cheaper than)\s*\$?\s*(\d+(?:\.\d+)?)/,
    );

    if (underPriceMatch) {
      const maximum = Number(underPriceMatch[1]);

      return products
        .filter((product) => Number(product.price) <= maximum)
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    /*
     * ABOVE PRICE FILTER
     */

    const abovePriceMatch = normalized.match(
      /(?:above|over|more than|greater than)\s*\$?\s*(\d+(?:\.\d+)?)/,
    );

    if (abovePriceMatch) {
      const minimum = Number(abovePriceMatch[1]);

      return products
        .filter((product) => Number(product.price) >= minimum)
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    /*
     * CHEAPEST PRODUCTS
     */

    if (
      normalized.includes("cheapest") ||
      normalized.includes("cheap products") ||
      normalized.includes("cheapest products") ||
      normalized.includes("lowest price")
    ) {
      return [...products]
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    /*
     * MOST EXPENSIVE PRODUCTS
     */

    if (
      normalized.includes("most expensive") ||
      normalized.includes("highest price") ||
      normalized.includes("expensive products")
    ) {
      return [...products]
        .sort((a, b) => Number(b.price) - Number(a.price))
        .slice(0, 6);
    }

    /*
     * OUT OF STOCK
     */

    if (
      normalized.includes("out of stock") ||
      normalized.includes("sold out") ||
      normalized.includes("unavailable")
    ) {
      return products.filter((product) => product.stock <= 0).slice(0, 6);
    }

    /*
     * AVAILABLE PRODUCTS
     */

    if (normalized.includes("available") || normalized.includes("in stock")) {
      return products.filter((product) => product.stock > 0).slice(0, 6);
    }

    /*
     * CATEGORY / PRODUCT KEYWORDS
     */

    const categoryKeywords = [
      "phone",
      "phones",
      "iphone",
      "mobile",
      "mobiles",
      "laptop",
      "laptops",
      "computer",
      "computers",
      "tablet",
      "tablets",
      "headphone",
      "headphones",
      "earbuds",
      "earphone",
      "watch",
      "watches",
      "smartwatch",
      "camera",
      "cameras",
      "keyboard",
      "keyboards",
      "mouse",
      "mice",
      "gaming",
      "electronics",
      "accessories",
    ];

    const keyword = categoryKeywords.find((word) => normalized.includes(word));

    if (keyword) {
      const keywordProducts = products.filter((product) => {
        const productText = normalizeText(
          [
            product.name,
            product.description || "",
            getCategoryName(product),
          ].join(" "),
        );

        if (keyword === "phones" || keyword === "phone") {
          return (
            productText.includes("phone") ||
            productText.includes("iphone") ||
            productText.includes("mobile")
          );
        }

        if (keyword === "headphones" || keyword === "headphone") {
          return (
            productText.includes("headphone") ||
            productText.includes("earphone") ||
            productText.includes("earbud")
          );
        }

        if (keyword === "watches" || keyword === "watch") {
          return (
            productText.includes("watch") || productText.includes("smartwatch")
          );
        }

        if (keyword === "mice" || keyword === "mouse") {
          return productText.includes("mouse") || productText.includes("mice");
        }

        return productText.includes(keyword);
      });

      if (keywordProducts.length) {
        return keywordProducts.slice(0, 6);
      }
    }

    /*
     * SEARCH BY INDIVIDUAL WORDS
     */

    const ignoredWords = [
      "show",
      "find",
      "give",
      "me",
      "product",
      "products",
      "please",
      "want",
      "some",
      "recommend",
      "recommendation",
      "recommendations",
      "what",
      "would",
      "you",
      "suggest",
      "suggestion",
      "best",
      "good",
      "for",
      "the",
      "under",
      "below",
      "above",
      "than",
      "less",
      "more",
      "cheap",
      "cheapest",
    ];

    const words = normalized
      .split(" ")
      .filter((word) => word.length >= 3)
      .filter((word) => !ignoredWords.includes(word));

    if (words.length) {
      const matches = products.filter((product) =>
        words.some((word) => productMatchesQuery(product, word)),
      );

      if (matches.length) {
        return matches.slice(0, 6);
      }
    }

    /*
     * GENERAL RECOMMENDATION
     *
     * If the user asks "What do you recommend?"
     * return available products sorted by popularity
     * proxy: stock + price balance.
     */

    if (
      normalized.includes("recommend") ||
      normalized.includes("suggest") ||
      normalized.includes("best product") ||
      normalized.includes("what should i buy") ||
      normalized.includes("what should i get")
    ) {
      return products
        .filter((product) => product.stock > 0)
        .sort((a, b) => {
          const aScore = Number(a.stock) * 2 - Number(a.price) * 0.01;

          const bScore = Number(b.stock) * 2 - Number(b.price) * 0.01;

          return bScore - aScore;
        })
        .slice(0, 6);
    }

    return [];
  }

  async function getProductsForMessage(
    userMessage: string,
    aiProducts: Product[],
  ): Promise<Product[]> {
    if (aiProducts.length > 0) {
      return aiProducts.slice(0, 6);
    }

    return findProducts(userMessage);
  }

  async function askAI(userMessage: string): Promise<{
    reply: string;
    products: Product[];
  }> {
    const response = await fetch(`${AI_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    const data = await response.json();

    const reply =
      typeof data.reply === "string" ? cleanMarkdown(data.reply) : "";

    const products = Array.isArray(data.products)
      ? (data.products as Product[])
      : [];

    return {
      reply,
      products,
    };
  }

  function getLocalResponse(userMessage: string): string | null {
    const text = normalizeText(userMessage);

    if (
      /^(hi|hello|hey|good morning|good afternoon|good evening)$/.test(text)
    ) {
      return "Hello! 👋 Welcome to ShopEase. What would you like to shop for today?";
    }

    if (text.includes("thank you") || text.includes("thanks")) {
      return "You're very welcome! 😊 I'm always happy to help you shop.";
    }

    if (text === "bye" || text.includes("goodbye")) {
      return "Goodbye! 👋 Thanks for shopping with ShopEase. Come back anytime!";
    }

    if (text === "ok" || text === "okay" || text === "great") {
      return "Great! 😊 Let me know if you'd like help finding another product.";
    }

    return null;
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((current) => [...current, userMessage]);

    setMessage("");
    setLoading(true);

    try {
      /*
       * Handle normal conversation locally.
       */

      const localResponse = getLocalResponse(trimmedMessage);

      if (localResponse) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: localResponse,
          },
        ]);

        return;
      }

      /*
       * IMPORTANT:
       *
       * Search the backend FIRST for product-related
       * questions. This makes "under $100",
       * "phones", "recommend", etc. reliable even
       * when the AI service has an error.
       */

      const normalized = normalizeText(trimmedMessage);

      const isProductRequest =
        normalized.includes("product") ||
        normalized.includes("products") ||
        normalized.includes("recommend") ||
        normalized.includes("suggest") ||
        normalized.includes("phone") ||
        normalized.includes("iphone") ||
        normalized.includes("laptop") ||
        normalized.includes("computer") ||
        normalized.includes("tablet") ||
        normalized.includes("headphone") ||
        normalized.includes("earbud") ||
        normalized.includes("watch") ||
        normalized.includes("camera") ||
        normalized.includes("keyboard") ||
        normalized.includes("mouse") ||
        normalized.includes("gaming") ||
        normalized.includes("under") ||
        normalized.includes("below") ||
        normalized.includes("above") ||
        normalized.includes("cheapest") ||
        normalized.includes("available") ||
        normalized.includes("stock") ||
        normalized.includes("sold out") ||
        normalized.includes("compare");

      let backendProducts: Product[] = [];

      if (isProductRequest) {
        backendProducts = await findProducts(trimmedMessage);
      }

      /*
       * For direct product searches, use backend
       * results immediately.
       */

      if (backendProducts.length > 0) {
        let directReply = "I found these products for you:";

        if (
          normalized.includes("recommend") ||
          normalized.includes("suggest")
        ) {
          directReply = "Here are some products I'd recommend:";
        }

        if (
          normalized.includes("under") ||
          normalized.includes("below") ||
          normalized.includes("less than")
        ) {
          directReply = "Here are some products within your budget:";
        }

        if (
          normalized.includes("cheapest") ||
          normalized.includes("lowest price")
        ) {
          directReply = "Here are the most affordable products:";
        }

        if (
          normalized.includes("out of stock") ||
          normalized.includes("sold out")
        ) {
          directReply = "Here are the products that are currently unavailable:";
        }

        if (
          normalized.includes("available") ||
          normalized.includes("in stock")
        ) {
          directReply = "Here are the products currently in stock:";
        }

        if (isComparisonMessage(trimmedMessage)) {
          directReply = "Here are the products I found for comparison:";
        }

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: directReply,
            products: backendProducts,
          },
        ]);

        /*
         * We already have the correct backend
         * products, so no need to wait for AI.
         */

        return;
      }

      /*
       * If the backend did not find products,
       * ask the AI service.
       */

      try {
        const aiResult = await askAI(trimmedMessage);

        const products = await getProductsForMessage(
          trimmedMessage,
          aiResult.products,
        );

        let reply = aiResult.reply;

        if (!reply && products.length > 0) {
          reply = "I found these products for you:";
        }

        if (!reply && isComparisonMessage(trimmedMessage)) {
          reply =
            "I can compare products for you. Please tell me which products you'd like to compare.";
        }

        if (!reply) {
          reply =
            "I'm ready to help! Ask me about products, prices, availability, or recommendations.";
        }

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: reply,
            products: products.length > 0 ? products : undefined,
          },
        ]);
      } catch (aiError) {
        console.error("AI service error:", aiError);

        /*
         * Final fallback.
         */

        const fallbackProducts = await findProducts(trimmedMessage);

        if (fallbackProducts.length > 0) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: "I found these products for you:",
              products: fallbackProducts,
            },
          ]);

          return;
        }

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              "I'm having trouble generating a response right now. Please try asking me about a product, price, category, or availability.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chatbot request error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry 😔 I couldn't connect to the shopping assistant right now. Please make sure the backend is running on port 3001.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    if (loading) {
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setMessages([
      {
        role: "assistant",
        content:
          "Hi! 👋 Welcome back to ShopEase. What can I help you find today?",
      },
    ]);

    setMessage("");
    setSpeakingIndex(null);
  }

  function renderProductCard(product: Product) {
    const image = getProductImage(product);
    const added = addedProducts.includes(product.id);

    return (
      <div
        key={product.id}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative h-36 overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
            }}
          />

          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-blue-700 shadow-sm backdrop-blur">
            {getCategoryName(product)}
          </span>

          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${
              product.stock > 0
                ? "bg-green-100/95 text-green-700"
                : "bg-red-100/95 text-red-700"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
          </span>
        </div>

        <div className="p-3.5">
          <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
            {product.name}
          </h3>

          <p className="mt-1 line-clamp-2 min-h-9 text-[11px] leading-4 text-gray-500">
            {product.description || "No description available."}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-lg font-extrabold text-blue-600">
              ${Number(product.price).toFixed(2)}
            </span>

            {product.stock > 0 ? (
              <span className="text-[10px] font-medium text-green-600">
                Available
              </span>
            ) : (
              <span className="text-[10px] font-medium text-red-500">
                Unavailable
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.id}`}
              className="flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[11px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              View Product
            </Link>

            <button
              type="button"
              onClick={() => handleAddToCart(product)}
              disabled={product.stock <= 0 || added}
              className={`h-9 rounded-xl text-[11px] font-semibold text-white transition ${
                product.stock <= 0
                  ? "cursor-not-allowed bg-gray-300"
                  : added
                    ? "bg-green-500"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {product.stock <= 0
                ? "Sold Out"
                : added
                  ? "✓ Added"
                  : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderComparison(products: Product[]) {
    const comparisonProducts = products.slice(0, 3);

    if (comparisonProducts.length < 2) {
      return null;
    }

    const prices = comparisonProducts.map((product) => Number(product.price));

    const cheapest = Math.min(...prices);
    const expensive = Math.max(...prices);
    const difference = expensive - cheapest;

    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              ⚖️
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-gray-900">
                Product Comparison
              </h3>

              <p className="text-[10px] text-gray-500">
                Compare products side by side
              </p>
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-155 text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Feature
                </th>

                {comparisonProducts.map((product) => (
                  <th key={product.id} className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />

                      <span className="max-w-37.5 text-xs font-bold text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-3 py-3 text-[10px] font-bold uppercase text-gray-400">
                  Price
                </td>

                {comparisonProducts.map((product) => (
                  <td
                    key={product.id}
                    className="px-3 py-3 text-sm font-extrabold text-blue-600"
                  >
                    ${Number(product.price).toFixed(2)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-100">
                <td className="px-3 py-3 text-[10px] font-bold uppercase text-gray-400">
                  Stock
                </td>

                {comparisonProducts.map((product) => (
                  <td
                    key={product.id}
                    className="px-3 py-3 text-xs font-semibold"
                  >
                    {product.stock > 0 ? (
                      <span className="text-green-600">
                        {product.stock} available
                      </span>
                    ) : (
                      <span className="text-red-500">Out of stock</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-3 py-3 text-[10px] font-bold uppercase text-gray-400">
                  Category
                </td>

                {comparisonProducts.map((product) => (
                  <td
                    key={product.id}
                    className="px-3 py-3 text-xs font-medium text-gray-700"
                  >
                    {getCategoryName(product)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-3 md:hidden">
          {comparisonProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-gray-200 p-3"
            >
              <div className="flex gap-3">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    {product.name}
                  </h4>

                  <p className="mt-1 text-lg font-extrabold text-blue-600">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold uppercase text-gray-400">
                    Category
                  </span>

                  <span className="text-xs font-semibold text-gray-700">
                    {getCategoryName(product)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold uppercase text-gray-400">
                    Availability
                  </span>

                  <span
                    className={`text-xs font-bold ${
                      product.stock > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href={`/products/${product.id}`}
                  className="flex h-9 items-center justify-center rounded-xl border border-gray-200 text-[10px] font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  View Product
                </Link>

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={
                    product.stock <= 0 || addedProducts.includes(product.id)
                  }
                  className="h-9 rounded-xl bg-blue-600 text-[10px] font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {addedProducts.includes(product.id)
                    ? "✓ Added"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-blue-100 bg-blue-50/60 px-4 py-3">
          <p className="text-center text-[11px] font-semibold text-blue-800">
            {difference === 0
              ? "These products have the same price."
              : `The price difference is $${difference.toFixed(2)}.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open ShopEase assistant"
          className="fixed bottom-5 right-5 z-100 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-3xl text-white shadow-[0_12px_35px_rgba(37,99,235,0.35)] transition duration-300 hover:scale-105 hover:shadow-[0_16px_40px_rgba(37,99,235,0.45)] sm:bottom-6 sm:right-6"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-20" />
          <span className="relative">🛍️</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-100 flex h-[min(720px,calc(100dvh-32px))] w-[min(440px,calc(100vw-32px))] flex-col overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.25)] sm:bottom-6 sm:right-6">
          <div className="relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-600 to-indigo-600 px-5 py-5 text-white">
            <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 right-20 h-24 w-24 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl">
                  🛍️
                </div>

                <div>
                  <h2 className="text-base font-bold">ShopEase Assistant</h2>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-300" />

                    <p className="text-xs font-medium text-blue-100">
                      Online · Ready to help
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={loading}
                  title="Clear chat"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-sm text-white transition hover:bg-white/15 disabled:opacity-40"
                >
                  🗑️
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    recognitionRef.current?.stop();

                    if (
                      typeof window !== "undefined" &&
                      "speechSynthesis" in window
                    ) {
                      window.speechSynthesis.cancel();
                    }

                    setIsListening(false);
                    setSpeakingIndex(null);
                  }}
                  aria-label="Close chatbot"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-white transition hover:bg-white/15"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100 bg-white px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    if (loading) {
                      return;
                    }

                    setMessage(question);
                  }}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-4 py-5">
            <div className="text-center">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Your shopping companion
              </span>
            </div>

            {messages.map((item, index) => {
              const previousUserMessage =
                index > 0 && messages[index - 1]?.role === "user"
                  ? messages[index - 1].content
                  : "";

              const comparison =
                item.role === "assistant" &&
                isComparisonMessage(previousUserMessage) &&
                Boolean(item.products && item.products.length >= 2);

              return (
                <div
                  key={`${item.role}-${index}`}
                  className={`flex items-end gap-2 ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm">
                      🛍️
                    </div>
                  )}

                  <div
                    className={`flex ${
                      item.role === "assistant"
                        ? "w-[calc(100%-40px)]"
                        : "max-w-[82%]"
                    } flex-col gap-1`}
                  >
                    <div
                      className={`wrap-break-word rounded-2xl px-4 py-3 text-[13px] leading-6 ${
                        item.role === "user"
                          ? "rounded-br-md bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md"
                          : "rounded-bl-md border border-gray-100 bg-white text-gray-800 shadow-sm"
                      }`}
                    >
                      {item.content}
                    </div>

                    {item.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => speakMessage(item.content, index)}
                        className="flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        {speakingIndex === index ? (
                          <>🔇 Stop</>
                        ) : (
                          <>🔊 Listen</>
                        )}
                      </button>
                    )}

                    {comparison &&
                      item.products &&
                      renderComparison(item.products)}

                    {!comparison &&
                      item.role === "assistant" &&
                      item.products &&
                      item.products.length > 0 && (
                        <div className="mt-2 space-y-3">
                          {item.products
                            .slice(0, 6)
                            .map((product) => renderProductCard(product))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-sm">
                  🛍️
                </div>

                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />

                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />

                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms]" />

                  <span className="ml-1 text-xs text-gray-500">
                    Finding products...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50"
            >
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  isListening ? "Listening..." : "Ask me anything..."
                }
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-50"
              />

              <button
                type="button"
                onClick={startVoiceInput}
                disabled={loading}
                title={isListening ? "Stop listening" : "Speak your message"}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                  isListening
                    ? "animate-pulse bg-red-500 text-white"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {isListening ? (
                  <span className="text-lg">■</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                    <line x1="8" x2="16" y1="22" y2="22" />
                  </svg>
                )}
              </button>

              <button
                type="submit"
                disabled={loading || !message.trim()}
                title="Send message"
                className="flex h-10 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-30"
                    />

                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                )}
              </button>
            </form>

            <p className="mt-2 text-center text-[9px] text-gray-400">
              ShopEase AI Assistant · Ask about products, prices, and
              recommendations
            </p>
          </div>
        </div>
      )}
    </>
  );
}
