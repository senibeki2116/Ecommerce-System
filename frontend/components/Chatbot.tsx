"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCart } from "../app/Context/CartContext";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

const AI_API_URL =
  process.env.NEXT_PUBLIC_AI_API_URL?.trim() || "http://127.0.0.1:8000";

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
  comparison?: boolean;
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
  "Show laptops",
  "Products under $100",
  "What is the cheapest product?",
  "What do you recommend?",
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

  if (Array.isArray(product.images) && product.images.length > 0) {
    if (product.images[0]?.trim()) {
      return product.images[0];
    }
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

  return (
    text.includes("compare") ||
    text.includes("comparison") ||
    text.includes("difference") ||
    text.includes("versus") ||
    text.includes(" vs ")
  );
}

function isRecommendationMessage(message: string): boolean {
  const text = normalizeText(message);

  return (
    text.includes("recommend") ||
    text.includes("suggest") ||
    text.includes("best") ||
    text.includes("what should i buy") ||
    text.includes("which one should")
  );
}

function isProductQuestion(message: string): boolean {
  const text = normalizeText(message);

  const words = [
    "product",
    "products",
    "phone",
    "phones",
    "iphone",
    "samsung",
    "mobile",
    "smartphone",
    "laptop",
    "laptops",
    "computer",
    "tablet",
    "headphone",
    "headphones",
    "earbuds",
    "watch",
    "smartwatch",
    "camera",
    "keyboard",
    "mouse",
    "gaming",
    "speaker",
    "audio",
    "electronics",
    "accessories",
    "price",
    "cost",
    "cheap",
    "cheapest",
    "expensive",
    "stock",
    "available",
    "buy",
    "purchase",
  ];

  return words.some((word) => text.includes(word));
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
        "Hi! 👋 I'm your ShopEase assistant. I can help you find products, compare prices, check stock, and choose the right product for you.",
    },
  ]);

  const [addedProducts, setAddedProducts] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /*
   * OPEN CHATBOT FROM OTHER COMPONENTS
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
        }, 250);
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

    setAddedProducts((current) =>
      current.includes(product.id) ? current : [...current, product.id],
    );

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
        "Voice input is not supported in this browser. Please use Chrome or Edge.",
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

      if (transcript.trim()) {
        setMessage(transcript.trim());
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
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const response = await fetch(`${BACKEND_URL}/products`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Products API returned ${response.status}`);
      }

      const data = await response.json();

      return extractProducts(data);
    } finally {
      clearTimeout(timeout);
    }
  }

  /*
   * FIND PRODUCTS
   */
  async function findProducts(query: string): Promise<Product[]> {
    const products = await fetchProducts();

    if (!products.length) {
      return [];
    }

    const text = normalizeText(query);

    /*
     * PRICE UNDER
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
     * PRICE ABOVE
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
      return products
        .filter((product) => product.stock > 0)
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    /*
     * MOST EXPENSIVE
     */
    if (
      text.includes("most expensive") ||
      text.includes("highest price") ||
      text.includes("most costly")
    ) {
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
    if (
      text.includes("in stock") ||
      text.includes("available") ||
      text.includes("what can i buy")
    ) {
      return products.filter((product) => product.stock > 0).slice(0, 6);
    }

    /*
     * CATEGORY KEYWORDS
     */
    const categoryGroups = [
      {
        words: ["phone", "phones", "iphone", "samsung", "mobile", "smartphone"],
        matches: ["phone", "iphone", "samsung", "mobile", "smartphone"],
      },
      {
        words: ["laptop", "laptops", "computer", "computers", "notebook"],
        matches: ["laptop", "computer", "notebook"],
      },
      {
        words: ["headphone", "headphones", "earbuds", "earphone", "earphones"],
        matches: ["headphone", "earbud", "earphone"],
      },
      {
        words: ["watch", "watches", "smartwatch"],
        matches: ["watch", "smartwatch"],
      },
      {
        words: ["tablet", "tablets", "ipad"],
        matches: ["tablet", "ipad"],
      },
      {
        words: ["camera", "cameras"],
        matches: ["camera"],
      },
      {
        words: ["keyboard", "keyboards"],
        matches: ["keyboard"],
      },
      {
        words: ["mouse", "mice"],
        matches: ["mouse"],
      },
      {
        words: ["speaker", "speakers", "audio"],
        matches: ["speaker", "audio"],
      },
      {
        words: ["gaming", "gamer"],
        matches: ["gaming"],
      },
      {
        words: ["electronics", "electronic"],
        matches: ["electronic"],
      },
      {
        words: ["accessory", "accessories"],
        matches: ["accessory", "accessories"],
      },
    ];

    for (const group of categoryGroups) {
      if (!group.words.some((word) => text.includes(word))) {
        continue;
      }

      const matches = products.filter((product) => {
        const productText = normalizeText(
          [
            product.name,
            product.description ?? "",
            getCategoryName(product),
          ].join(" "),
        );

        return group.matches.some((keyword) => productText.includes(keyword));
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
      "some",
      "product",
      "products",
      "please",
      "want",
      "recommend",
      "recommendation",
      "what",
      "would",
      "you",
      "suggest",
      "best",
      "good",
      "great",
      "the",
      "for",
      "can",
      "could",
      "help",
      "with",
      "tell",
      "about",
      "me",
      "have",
      "do",
      "does",
      "there",
      "is",
      "are",
      "any",
      "price",
      "cost",
      "much",
      "i",
      "need",
      "looking",
      "look",
      "buy",
      "purchase",
    ]);

    const words = text
      .split(" ")
      .filter((word) => word.length >= 3 && !ignoredWords.has(word));

    if (words.length) {
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
    }

    /*
     * RECOMMENDATIONS
     */
    if (isRecommendationMessage(query)) {
      return products
        .filter((product) => product.stock > 0)
        .sort((a, b) => Number(b.stock) - Number(a.stock))
        .slice(0, 6);
    }

    return [];
  }

  /*
   * LOCAL RESPONSES
   */
  function getLocalResponse(input: string): string | null {
    const text = normalizeText(input);

    if (/^(hi|hello|hey|hi there|hello there|hey there)$/.test(text)) {
      return "Hello! 👋 Welcome to ShopEase! What are you shopping for today?";
    }

    if (text.includes("thank") || text.includes("thanks")) {
      return "You're very welcome! 😊 I'm happy to help.";
    }

    if (text === "bye" || text.includes("goodbye")) {
      return "Goodbye! 👋 Thanks for shopping with ShopEase.";
    }

    if (text === "ok" || text === "okay" || text === "great") {
      return "Great! 😊 What would you like to find next?";
    }

    return null;
  }

  /*
   * CREATE PRODUCT RESPONSE
   */
  function createProductResponse(
    userMessage: string,
    products: Product[],
  ): string {
    const text = normalizeText(userMessage);

    if (isComparisonMessage(userMessage)) {
      if (products.length >= 2) {
        return `I found ${products.length} products for comparison. 👇`;
      }

      return "I found one matching product. Try saying something like “compare iPhone 17 and Samsung Galaxy S25”.";
    }

    if (isRecommendationMessage(userMessage)) {
      return "Here are my recommendations based on the products currently available. 👇";
    }

    if (
      text.includes("under") ||
      text.includes("below") ||
      text.includes("less than") ||
      text.includes("cheaper than")
    ) {
      return "Absolutely! 🎯 Here are products that fit your budget:";
    }

    if (
      text.includes("cheapest") ||
      text.includes("lowest price") ||
      text.includes("most affordable")
    ) {
      return "Here are the most affordable products currently in stock:";
    }

    if (text.includes("most expensive") || text.includes("highest price")) {
      return "Here are the highest-priced products in our store:";
    }

    if (
      text.includes("out of stock") ||
      text.includes("sold out") ||
      text.includes("unavailable")
    ) {
      return "Here are the products that are currently unavailable:";
    }

    if (text.includes("available") || text.includes("in stock")) {
      return "Here are the products currently in stock:";
    }

    return `I found ${products.length} product${
      products.length === 1 ? "" : "s"
    } that match your request:`;
  }

  /*
   * ASK AI
   */
  async function askAI(
    userMessage: string,
    products: Product[],
  ): Promise<string> {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 12000);

    try {
      const productContext = products
        .slice(0, 8)
        .map(
          (product) =>
            `${product.name} | $${Number(product.price).toFixed(2)} | ${
              product.stock > 0 ? `${product.stock} in stock` : "out of stock"
            } | Category: ${getCategoryName(product)}`,
        )
        .join("\n");

      const response = await fetch(`${AI_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          products: productContext,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("AI service error:", response.status, errorText);

        throw new Error(`AI service returned ${response.status}`);
      }

      const data = await response.json();

      const reply =
        typeof data.reply === "string"
          ? data.reply
          : typeof data.response === "string"
            ? data.response
            : typeof data.message === "string"
              ? data.message
              : "";

      if (!reply.trim()) {
        throw new Error("AI returned an empty response");
      }

      return cleanMarkdown(reply);
    } finally {
      clearTimeout(timeout);
    }
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
       * 1. LOCAL RESPONSE
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
       * 2. PRODUCT SEARCH
       */
      let products: Product[] = [];

      try {
        products = await findProducts(userMessage);
      } catch (error) {
        console.error("Product search failed:", error);
      }

      /*
       * 3. PRODUCT RESPONSE
       */
      if (products.length > 0) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: createProductResponse(userMessage, products),
            products,
            comparison: isComparisonMessage(userMessage),
          },
        ]);

        return;
      }

      /*
       * 4. AI RESPONSE
       */
      try {
        const aiReply = await askAI(userMessage, products);

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
        console.error("AI request failed:", error);
      }

      /*
       * 5. PRODUCT FALLBACK
       */
      if (isProductQuestion(userMessage)) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              "I couldn't find a matching product right now. 😔\n\nTry:\n• Show me phones\n• Show laptops\n• Products under $100\n• What is the cheapest product?\n• Compare iPhone 17 and Samsung Galaxy S25",
          },
        ]);

        return;
      }

      /*
       * 6. FINAL FALLBACK
       */
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to my AI assistant right now. 😔 Please try again in a moment.",
        },
      ]);
    } catch (error) {
      console.error("CHATBOT ERROR:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Sorry 😔 Something went wrong. Please try again.",
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
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative h-32 bg-slate-100">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
            }}
          />

          <div className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold text-slate-700 shadow-sm">
            {getCategoryName(product)}
          </div>

          <div
            className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[9px] font-bold shadow-sm ${
              product.stock > 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {product.stock > 0 ? `${product.stock} left` : "Sold out"}
          </div>
        </div>

        <div className="p-3.5">
          <h3 className="line-clamp-1 text-sm font-extrabold text-slate-900">
            {product.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
            {product.description || "No description available."}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-base font-black text-blue-600">
              ${Number(product.price).toFixed(2)}
            </span>

            <span
              className={`text-[9px] font-bold ${
                product.stock > 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {product.stock > 0 ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.id}`}
              className="flex h-9 items-center justify-center rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 transition hover:bg-slate-50"
            >
              View
            </Link>

            <button
              type="button"
              onClick={() => handleAddToCart(product)}
              disabled={product.stock <= 0 || added}
              className={`h-9 rounded-xl text-[10px] font-bold text-white transition ${
                product.stock <= 0
                  ? "bg-slate-300"
                  : added
                    ? "bg-emerald-500"
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
      <div className="mt-3 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
              ⚖️
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900">
                Product comparison
              </h3>

              <p className="text-[10px] text-slate-500">
                Price and availability
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((product) => (
            <div key={product.id} className="p-3.5">
              <div className="flex gap-3">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-14 w-14 rounded-xl object-cover"
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                  }}
                />

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-slate-900">
                    {product.name}
                  </h4>

                  <p className="mt-1 text-base font-black text-blue-600">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  <p
                    className={`text-[9px] font-bold ${
                      product.stock > 0 ? "text-emerald-600" : "text-red-500"
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
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50"
                >
                  View
                </Link>

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="rounded-lg bg-blue-600 text-[10px] font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
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
      {/* FLOATING BUTTON */}
      {!isOpen && (
        <button
          type="button"
          data-chatbot-trigger
          onClick={() => setIsOpen(true)}
          aria-label="Open ShopEase assistant"
          className="fixed bottom-5 right-5 z-[100] group"
        >
          <span className="absolute -inset-1 rounded-full bg-blue-500/20 blur-md transition group-hover:bg-blue-500/40" />

          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-2xl text-white shadow-[0_12px_35px_rgba(37,99,235,0.4)] transition duration-300 group-hover:scale-110">
            <span>🤖</span>
          </span>

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[9px] text-white">
            ✓
          </span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 z-[100] flex h-[min(760px,calc(100dvh-24px))] w-[min(460px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:bottom-6 sm:right-6">
          {/* HEADER */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-5 py-5 text-white">
            <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -bottom-20 left-20 h-40 w-40 rounded-full bg-purple-500/20 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl shadow-inner ring-1 ring-white/10">
                  🤖
                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black">ShopEase Assistant</h2>

                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-blue-100">
                      AI
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] text-blue-100">
                    Find products • Compare • Shop smarter
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={loading}
                  aria-label="Clear chat"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-sm transition hover:bg-white/10 disabled:opacity-40"
                >
                  ↻
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
                  }}
                  aria-label="Close chatbot"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-xl transition hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs">✨</span>
              <span className="text-[10px] font-medium text-blue-100">
                Ask me about products, prices, stock or recommendations.
              </span>
            </div>
          </div>

          {/* QUICK QUESTIONS */}
          <div className="border-b border-slate-100 bg-white px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    if (!loading) {
                      setMessage(question);
                    }
                  }}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-4 py-5">
            {messages.map((item, index) => {
              return (
                <div
                  key={`${item.role}-${index}`}
                  className={`flex gap-2.5 ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm text-white shadow-sm">
                      🤖
                    </div>
                  )}

                  <div
                    className={`flex max-w-[88%] flex-col ${
                      item.role === "user" ? "items-end" : ""
                    }`}
                  >
                    <div
                      className={`whitespace-pre-line rounded-2xl px-4 py-3 text-[12px] leading-5 shadow-sm ${
                        item.role === "user"
                          ? "rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {item.content}
                    </div>

                    {item.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => speakMessage(item.content, index)}
                        className="mt-1.5 px-2 text-[9px] font-semibold text-slate-400 transition hover:text-blue-600"
                      >
                        {speakingIndex === index ? "🔇 Stop" : "🔊 Listen"}
                      </button>
                    )}

                    {item.products && item.products.length > 0 && (
                      <div className="mt-3 w-full">
                        {item.comparison ? (
                          renderComparison(item.products)
                        ) : (
                          <div className="space-y-3">
                            {item.products.map((product) =>
                              renderProductCard(product),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* TYPING */}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm text-white">
                  🤖
                </div>

                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms]" />
                    <span className="ml-2 text-[9px] font-medium text-slate-400">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t border-slate-100 bg-white p-4">
            <form
              data-chatbot-form
              onSubmit={sendMessage}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10"
            >
              <div className="flex items-center gap-1.5">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={loading}
                  placeholder={
                    isListening ? "Listening..." : "Ask me anything..."
                  }
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />

                {/* VOICE */}
                <button
                  type="button"
                  onClick={startVoiceInput}
                  disabled={loading}
                  aria-label={
                    isListening ? "Stop voice input" : "Start voice input"
                  }
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isListening
                      ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                      : "bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {isListening ? (
                    "■"
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
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

                {/* SEND */}
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <svg
                      className="h-4 w-4 animate-spin"
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
                      width="18"
                      height="18"
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
              </div>
            </form>

            <div className="mt-2 flex items-center justify-center gap-1 text-[8px] font-medium text-slate-400">
              <span>✨</span>
              <span>ShopEase Assistant</span>
              <span>•</span>
              <span>Smart shopping help</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
