"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "../app/Context/CartContext";
import { getApiUrl, getServiceUrl } from "../lib/api";

const BACKEND_URL = getApiUrl();

const AI_API_URL = getServiceUrl(
  process.env.NEXT_PUBLIC_AI_API_URL,
  "http://127.0.0.1:8000",
);

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
  "What is the cheapest product?",
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
    .trim();
}

function getProductImage(product: Product): string {
  if (product.image?.trim()) {
    return product.image;
  }

  if (
    Array.isArray(product.images) &&
    product.images.length > 0 &&
    product.images[0]
  ) {
    return product.images[0];
  }

  if (product.imageUrl?.trim()) {
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

function extractProducts(data: unknown): Product[] {
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

function isComparisonMessage(message: string): boolean {
  const text = normalizeText(message);

  return ["compare", "comparison", "difference", "versus", " vs "].some(
    (word) => text.includes(word),
  );
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
        "Hi! 👋 I'm your ShopEase shopping assistant. Ask me about products, prices, categories, stock, recommendations, or comparisons.",
    },
  ]);

  const [addedProducts, setAddedProducts] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /*
   * OPEN CHATBOT FROM HOMEPAGE
   */
  useEffect(() => {
    const handleOpenChatbot = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message?: string;
        autoSend?: boolean;
      }>;

      setIsOpen(true);

      const incomingMessage = customEvent.detail?.message?.trim();

      if (!incomingMessage) {
        return;
      }

      setMessage(incomingMessage);

      if (customEvent.detail?.autoSend) {
        setTimeout(() => {
          const form = document.querySelector(
            "[data-chatbot-form]",
          ) as HTMLFormElement | null;

          form?.requestSubmit();
        }, 150);
      }
    };

    window.addEventListener("open-ai-chatbot", handleOpenChatbot);

    return () => {
      window.removeEventListener("open-ai-chatbot", handleOpenChatbot);
    };
  }, []);

  /*
   * AUTO SCROLL
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /*
   * CLEANUP
   */
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
   * ADD TO CART
   */
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

    setTimeout(() => {
      setAddedProducts((current) => current.filter((id) => id !== product.id));
    }, 1800);
  }

  /*
   * VOICE INPUT
   */
  function startVoiceInput() {
    if (loading || typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported. Please use Google Chrome or Microsoft Edge.",
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

      if (transcript) {
        setMessage(transcript);
      }
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
    } catch {
      setIsListening(false);
    }
  }

  /*
   * TEXT TO SPEECH
   */
  function speakMessage(text: string, index: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    speech.onstart = () => {
      setSpeakingIndex(index);
    };

    speech.onend = () => {
      setSpeakingIndex(null);
    };

    speech.onerror = () => {
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(speech);
  }

  /*
   * FETCH PRODUCTS
   */
  async function fetchProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/products`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Products API returned ${response.status}`);
      }

      const data = await response.json();

      return extractProducts(data);
    } catch (error) {
      console.error("Product fetch error:", error);

      return [];
    }
  }

  /*
   * FIND PRODUCTS
   *
   * This is the important part.
   * Product questions are answered directly
   * from your NestJS backend.
   */
  async function findProducts(query: string): Promise<Product[]> {
    const products = await fetchProducts();

    if (!products.length) {
      return [];
    }

    const text = normalizeText(query);

    /*
     * UNDER PRICE
     */
    const underMatch = text.match(
      /(?:under|below|less than|cheaper than)\s*\$?\s*(\d+(?:\.\d+)?)/,
    );

    if (underMatch) {
      const maxPrice = Number(underMatch[1]);

      return products
        .filter((product) => Number(product.price) <= maxPrice)
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    /*
     * ABOVE PRICE
     */
    const aboveMatch = text.match(
      /(?:above|over|more than|greater than)\s*\$?\s*(\d+(?:\.\d+)?)/,
    );

    if (aboveMatch) {
      const minPrice = Number(aboveMatch[1]);

      return products
        .filter((product) => Number(product.price) >= minPrice)
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    /*
     * CHEAPEST
     */
    if (
      text.includes("cheapest") ||
      text.includes("lowest price") ||
      text.includes("most affordable")
    ) {
      return [...products]
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    /*
     * MOST EXPENSIVE
     */
    if (text.includes("most expensive") || text.includes("highest price")) {
      return [...products]
        .sort((a, b) => Number(b.price) - Number(a.price))
        .slice(0, 6);
    }

    /*
     * OUT OF STOCK
     */
    if (
      text.includes("out of stock") ||
      text.includes("sold out") ||
      text.includes("unavailable")
    ) {
      return products.filter((product) => product.stock <= 0).slice(0, 6);
    }

    /*
     * AVAILABLE
     */
    if (text.includes("available") || text.includes("in stock")) {
      return products.filter((product) => product.stock > 0).slice(0, 6);
    }

    /*
     * CATEGORY KEYWORDS
     */
    const keywords = [
      "phone",
      "iphone",
      "mobile",
      "laptop",
      "computer",
      "tablet",
      "headphone",
      "earbuds",
      "earphone",
      "watch",
      "smartwatch",
      "camera",
      "keyboard",
      "mouse",
      "gaming",
      "electronics",
      "accessories",
      "fashion",
      "shoes",
      "beauty",
      "sports",
    ];

    const keyword = keywords.find((word) => text.includes(word));

    if (keyword) {
      const matches = products.filter((product) => {
        const productText = normalizeText(
          [
            product.name,
            product.description ?? "",
            getCategoryName(product),
          ].join(" "),
        );

        if (
          keyword === "phone" ||
          keyword === "iphone" ||
          keyword === "mobile"
        ) {
          return (
            productText.includes("phone") ||
            productText.includes("iphone") ||
            productText.includes("mobile")
          );
        }

        if (
          keyword === "headphone" ||
          keyword === "earbuds" ||
          keyword === "earphone"
        ) {
          return (
            productText.includes("headphone") ||
            productText.includes("earbud") ||
            productText.includes("earphone")
          );
        }

        return productText.includes(keyword);
      });

      if (matches.length) {
        return matches.slice(0, 6);
      }
    }

    /*
     * GENERAL PRODUCT SEARCH
     */
    const ignoredWords = new Set([
      "show",
      "find",
      "give",
      "me",
      "some",
      "product",
      "products",
      "please",
      "want",
      "recommend",
      "recommendation",
      "recommendations",
      "what",
      "would",
      "you",
      "suggest",
      "best",
      "good",
      "the",
      "for",
    ]);

    const words = text
      .split(" ")
      .filter((word) => word.length >= 3 && !ignoredWords.has(word));

    const matches = products.filter((product) => {
      const productText = normalizeText(
        [
          product.name,
          product.description ?? "",
          getCategoryName(product),
        ].join(" "),
      );

      return words.some((word) => productText.includes(word));
    });

    if (matches.length) {
      return matches.slice(0, 6);
    }

    /*
     * RECOMMENDATIONS
     */
    if (
      text.includes("recommend") ||
      text.includes("suggest") ||
      text.includes("best") ||
      text.includes("what should i buy")
    ) {
      return products
        .filter((product) => product.stock > 0)
        .sort((a, b) => Number(b.stock) - Number(a.stock))
        .slice(0, 6);
    }

    return [];
  }

  /*
   * AI SERVICE
   */
  async function askAI(userMessage: string): Promise<string> {
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

    if (typeof data.reply === "string" && data.reply.trim()) {
      return cleanMarkdown(data.reply);
    }

    /*
     * Some FastAPI responses may use "response"
     * instead of "reply".
     */
    if (typeof data.response === "string" && data.response.trim()) {
      return cleanMarkdown(data.response);
    }

    if (typeof data.message === "string" && data.message.trim()) {
      return cleanMarkdown(data.message);
    }

    return "";
  }

  /*
   * LOCAL ANSWERS
   */
  function getLocalResponse(input: string): string | null {
    const text = normalizeText(input);

    if (/^(hi|hello|hey)$/.test(text)) {
      return "Hello! 👋 Welcome to ShopEase. What are you looking for today?";
    }

    if (text.includes("thank")) {
      return "You're very welcome! 😊 I'm happy to help.";
    }

    if (text === "bye" || text.includes("goodbye")) {
      return "Goodbye! 👋 Come back anytime.";
    }

    if (text === "ok" || text === "okay" || text === "great") {
      return "Great! 😊 What would you like to find next?";
    }

    return null;
  }

  /*
   * SEND MESSAGE
   */
  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userMessage = message.trim();

    if (!userMessage || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      /*
       * 1. SIMPLE LOCAL ANSWER
       */
      const localResponse = getLocalResponse(userMessage);

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
       * 2. ALWAYS CHECK BACKEND PRODUCTS
       *
       * This makes product questions work even
       * if the AI service is unavailable.
       */
      const products = await findProducts(userMessage);

      const text = normalizeText(userMessage);

      /*
       * 3. PRODUCT RESPONSE
       */
      if (products.length > 0) {
        let reply = "I found these products for you:";

        if (
          text.includes("recommend") ||
          text.includes("suggest") ||
          text.includes("best")
        ) {
          reply = "Here are some products I'd recommend for you:";
        }

        if (
          text.includes("under") ||
          text.includes("below") ||
          text.includes("less than")
        ) {
          reply = "Great! Here are products within your budget:";
        }

        if (text.includes("cheapest") || text.includes("lowest price")) {
          reply = "Here are the most affordable products:";
        }

        if (text.includes("out of stock") || text.includes("sold out")) {
          reply = "Here are the products that are currently unavailable:";
        }

        if (text.includes("available") || text.includes("in stock")) {
          reply = "Here are the products currently in stock:";
        }

        if (isComparisonMessage(userMessage)) {
          reply = "Here are the products I found for comparison:";
        }

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: reply,
            products,
          },
        ]);

        return;
      }

      /*
       * 4. NO PRODUCT FOUND → ASK AI
       */
      try {
        const aiReply = await askAI(userMessage);

        if (aiReply) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: aiReply,
            },
          ]);

          return;
        }
      } catch (error) {
        console.error("AI service failed:", error);
      }

      /*
       * 5. FINAL FALLBACK
       */
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm ready to help! 😊 Try asking something like:\n\n• Show me phones\n• Show products under $100\n• What do you recommend?\n• What is the cheapest product?\n• Show available products",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry 😔 I couldn't process that request. Please make sure your backend is running on port 3001.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * CLEAR CHAT
   */
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

  /*
   * PRODUCT CARD
   */
  function renderProductCard(product: Product) {
    const added = addedProducts.includes(product.id);

    return (
      <div
        key={product.id}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="relative h-36 bg-gray-100">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
            }}
          />

          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-blue-600">
            {getCategoryName(product)}
          </span>

          <span
            className={`absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-bold ${
              product.stock > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
          </span>
        </div>

        <div className="p-3.5">
          <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
            {product.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-gray-500">
            {product.description || "No description available."}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-extrabold text-blue-600">
              ${Number(product.price).toFixed(2)}
            </span>

            <span
              className={`text-[10px] font-bold ${
                product.stock > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {product.stock > 0 ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.id}`}
              className="flex h-9 items-center justify-center rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              View Product
            </Link>

            <button
              type="button"
              onClick={() => handleAddToCart(product)}
              disabled={product.stock <= 0 || added}
              className={`h-9 rounded-xl text-[11px] font-semibold text-white ${
                product.stock <= 0
                  ? "bg-gray-300"
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

  /*
   * COMPARISON
   */
  function renderComparison(products: Product[]) {
    const items = products.slice(0, 3);

    if (items.length < 2) {
      return null;
    }

    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-blue-100 bg-white">
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4">
          <h3 className="text-sm font-extrabold text-gray-900">
            ⚖️ Product Comparison
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            Compare price and availability
          </p>
        </div>

        <div className="divide-y">
          {items.map((product) => (
            <div key={product.id} className="p-3">
              <div className="flex gap-3">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-gray-900">
                    {product.name}
                  </h4>

                  <p className="mt-1 text-base font-extrabold text-blue-600">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  <p
                    className={`text-[10px] font-bold ${
                      product.stock > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Out of stock"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href={`/products/${product.id}`}
                  className="flex h-8 items-center justify-center rounded-lg border border-gray-200 text-[10px] font-bold"
                >
                  View
                </Link>

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="rounded-lg bg-blue-600 text-[10px] font-bold text-white disabled:bg-gray-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          data-chatbot-trigger
          onClick={() => setIsOpen(true)}
          aria-label="Open ShopEase assistant"
          className="fixed bottom-5 right-5 z-100 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-3xl text-white shadow-2xl transition hover:scale-105 sm:bottom-6 sm:right-6"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-20" />
          <span className="relative">🛍️</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-100 flex h-[min(720px,calc(100dvh-32px))] w-[min(440px,calc(100vw-32px))] flex-col overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.25)] sm:bottom-6 sm:right-6">
          {/* HEADER */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                  🤖
                </div>

                <div>
                  <h2 className="font-bold">ShopEase AI</h2>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-300" />

                    <span className="text-xs text-blue-100">
                      Online · Ready to help
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/10 disabled:opacity-40"
                >
                  🗑️
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    recognitionRef.current?.stop();
                    window.speechSynthesis?.cancel();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-xl hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* QUICK QUESTIONS */}
          <div className="border-b bg-white px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    if (loading) return;

                    setMessage(question);
                  }}
                  className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-4 py-5">
            {messages.map((item, index) => {
              const previous = index > 0 ? messages[index - 1] : null;

              const comparison =
                item.role === "assistant" &&
                previous?.role === "user" &&
                isComparisonMessage(previous.content) &&
                Boolean(item.products && item.products.length >= 2);

              return (
                <div
                  key={`${item.role}-${index}`}
                  className={`flex gap-2 ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      🤖
                    </div>
                  )}

                  <div
                    className={`flex max-w-[88%] flex-col ${
                      item.role === "user" ? "items-end" : ""
                    }`}
                  >
                    <div
                      className={`whitespace-pre-line rounded-2xl px-4 py-3 text-[13px] leading-6 ${
                        item.role === "user"
                          ? "rounded-br-md bg-linear-to-br from-blue-600 to-indigo-600 text-white"
                          : "rounded-bl-md border bg-white text-gray-800 shadow-sm"
                      }`}
                    >
                      {item.content}
                    </div>

                    {item.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => speakMessage(item.content, index)}
                        className="mt-1 px-2 text-[10px] text-gray-400 hover:text-blue-600"
                      >
                        {speakingIndex === index ? "🔇 Stop" : "🔊 Listen"}
                      </button>
                    )}

                    {comparison &&
                      item.products &&
                      renderComparison(item.products)}

                    {!comparison &&
                      item.products &&
                      item.products.length > 0 && (
                        <div className="mt-3 w-full space-y-3">
                          {item.products.map((product) =>
                            renderProductCard(product),
                          )}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100">
                  🤖
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms]" />
                    <span className="ml-2 text-xs text-gray-500">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t bg-white p-4">
            <form
              data-chatbot-form
              onSubmit={sendMessage}
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"
            >
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={loading}
                placeholder={
                  isListening ? "Listening..." : "Ask me anything..."
                }
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
              />

              <button
                type="button"
                onClick={startVoiceInput}
                disabled={loading}
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {isListening ? (
                  "■"
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
                className="flex h-10 w-11 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40"
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
              ShopEase AI · Products · Prices · Recommendations
            </p>
          </div>
        </div>
      )}
    </>
  );
}
