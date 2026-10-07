"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../app/Context/CartContext";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

const AI_API_URL =
  process.env.NEXT_PUBLIC_AI_API_URL?.trim() || "http://127.0.0.1:8000";

type ProductCategory =
  | string
  | {
      id?: number;
      name?: string;
      title?: string;
    }
  | null
  | undefined;

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  category?: ProductCategory;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
};

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence?: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;

  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;

  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

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
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! 👋 I'm your ShopEase assistant. I can help you find products, compare prices, check stock, and choose the right product for you.",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\w\s$.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getProductImage(product: Product) {
  if (product.image && product.image.trim()) {
    return product.image;
  }

  return DEFAULT_PRODUCT_IMAGE;
}

function getCategoryName(category: ProductCategory) {
  if (!category) return "";

  if (typeof category === "string") {
    return category;
  }

  return category.name || category.title || "";
}

function extractProducts(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data.filter(Boolean) as Product[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const object = data as Record<string, unknown>;

  const possibleArrays = [
    object.products,
    object.data,
    object.items,
    object.results,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value.filter(Boolean) as Product[];
    }

    if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;

      if (Array.isArray(nested.products)) {
        return nested.products.filter(Boolean) as Product[];
      }

      if (Array.isArray(nested.items)) {
        return nested.items.filter(Boolean) as Product[];
      }
    }
  }

  return [];
}

function isComparisonMessage(text: string) {
  const normalized = normalizeText(text);

  return (
    normalized.includes("compare") ||
    normalized.includes("comparison") ||
    normalized.includes("difference between") ||
    normalized.includes("versus") ||
    normalized.includes(" vs ")
  );
}

function isRecommendationMessage(text: string) {
  const normalized = normalizeText(text);

  return (
    normalized.includes("recommend") ||
    normalized.includes("suggest") ||
    normalized.includes("best product") ||
    normalized.includes("what should i buy") ||
    normalized.includes("which one should i buy")
  );
}

function isProductQuestion(text: string) {
  const normalized = normalizeText(text);

  const keywords = [
    "product",
    "products",
    "phone",
    "phones",
    "laptop",
    "laptops",
    "computer",
    "computers",
    "headphone",
    "headphones",
    "watch",
    "watches",
    "tablet",
    "tablets",
    "camera",
    "cameras",
    "keyboard",
    "keyboards",
    "mouse",
    "speaker",
    "speakers",
    "gaming",
    "electronics",
    "accessories",
    "price",
    "cheap",
    "cheapest",
    "stock",
    "available",
    "buy",
  ];

  return keywords.some((keyword) => normalized.includes(keyword));
}

export default function Chatbot() {
  const { addToCart } = useCart();

  /*
   * This makes the chatbot render directly under <body>.
   *
   * That prevents parent components with:
   * - overflow-hidden
   * - hover states
   * - transforms
   * - stacking contexts
   * - z-index problems
   *
   * from affecting the chatbot UI.
   */
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voicesAvailable, setVoicesAvailable] = useState(false);

  const [voiceError, setVoiceError] = useState("");
  const [speechError, setSpeechError] = useState("");

  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);

  const [addedProducts, setAddedProducts] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const speakingIndexRef = useRef<number | null>(null);

  const speechRunIdRef = useRef(0);

  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const voiceErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const speechErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /*
   * ------------------------------------------------------------
   * SPEECH SYNTHESIS
   * ------------------------------------------------------------
   */

  const selectBestVoice = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();

    if (!voices.length) {
      return null;
    }

    const preferredNames = [
      "Microsoft Aria",
      "Microsoft Jenny",
      "Google US English",
      "Samantha",
      "Karen",
      "Daniel",
      "Alex",
    ];

    for (const preferredName of preferredNames) {
      const voice = voices.find((item) =>
        item.name.toLowerCase().includes(preferredName.toLowerCase()),
      );

      if (voice) {
        return voice;
      }
    }

    const englishUS = voices.find(
      (voice) => voice.lang.toLowerCase() === "en-us",
    );

    if (englishUS) {
      return englishUS;
    }

    const english = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("en"),
    );

    return english || voices[0];
  }, []);

  const loadVoices = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setVoicesAvailable(false);
      return;
    }

    const voices = window.speechSynthesis.getVoices();

    setVoicesAvailable(voices.length > 0);

    const selectedVoice = selectBestVoice();

    if (selectedVoice) {
      selectedVoiceRef.current = selectedVoice;
    }
  }, [selectBestVoice]);

  const stopSpeaking = useCallback(() => {
    speechRunIdRef.current += 1;

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      window.speechSynthesis
    ) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore browser errors.
      }
    }

    speakingIndexRef.current = null;
    setSpeakingIndex(null);
  }, []);

  const showSpeechError = useCallback((text: string) => {
    setSpeechError(text);

    if (speechErrorTimeoutRef.current) {
      clearTimeout(speechErrorTimeoutRef.current);
    }

    speechErrorTimeoutRef.current = setTimeout(() => {
      setSpeechError("");
    }, 4500);
  }, []);

  const splitSpeechText = useCallback((text: string) => {
    const cleaned = cleanMarkdown(text).replace(/\s+/g, " ").trim();

    if (!cleaned) {
      return [];
    }

    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];

    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      if (!trimmed) continue;

      if (!current) {
        current = trimmed;
        continue;
      }

      if ((current + " " + trimmed).length <= 180) {
        current += " " + trimmed;
      } else {
        chunks.push(current);
        current = trimmed;
      }
    }

    if (current) {
      chunks.push(current);
    }

    return chunks;
  }, []);

  const speakMessage = useCallback(
    (text: string, index: number) => {
      if (!soundEnabled) {
        return;
      }

      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        !window.speechSynthesis
      ) {
        showSpeechError(
          "Your browser does not support text-to-speech. Please use Chrome or Edge.",
        );
        return;
      }

      if (speakingIndexRef.current === index) {
        stopSpeaking();
        return;
      }

      stopSpeaking();

      setSpeechError("");

      loadVoices();

      const chunks = splitSpeechText(text);

      if (!chunks.length) {
        return;
      }

      const runId = speechRunIdRef.current;

      speakingIndexRef.current = index;
      setSpeakingIndex(index);

      speechTimeoutRef.current = setTimeout(() => {
        if (speechRunIdRef.current !== runId) {
          return;
        }

        let chunkIndex = 0;

        const speakNextChunk = () => {
          if (speechRunIdRef.current !== runId) {
            return;
          }

          if (chunkIndex >= chunks.length) {
            speakingIndexRef.current = null;
            setSpeakingIndex(null);
            speechTimeoutRef.current = null;
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);

          const voice = selectedVoiceRef.current || selectBestVoice();

          if (voice) {
            utterance.voice = voice;
          }

          utterance.lang = voice?.lang || "en-US";
          utterance.rate = 0.95;
          utterance.pitch = 1;
          utterance.volume = 1;

          utterance.onend = () => {
            if (speechRunIdRef.current !== runId) {
              return;
            }

            chunkIndex += 1;

            speechTimeoutRef.current = setTimeout(() => {
              speakNextChunk();
            }, 60);
          };

          utterance.onerror = (event) => {
            if (speechRunIdRef.current !== runId) {
              return;
            }

            const errorType = event.error || "";

            if (errorType === "canceled" || errorType === "interrupted") {
              speakingIndexRef.current = null;
              setSpeakingIndex(null);
              return;
            }

            speakingIndexRef.current = null;
            setSpeakingIndex(null);

            showSpeechError(
              "I couldn't play the voice response. Please try Listen again.",
            );
          };

          try {
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
          } catch {
            speakingIndexRef.current = null;
            setSpeakingIndex(null);

            showSpeechError(
              "Voice playback could not start. Please try again.",
            );
          }
        };

        speakNextChunk();
      }, 80);
    },
    [
      loadVoices,
      selectBestVoice,
      soundEnabled,
      splitSpeechText,
      stopSpeaking,
      showSpeechError,
    ],
  );

  /*
   * ------------------------------------------------------------
   * SPEECH RECOGNITION
   * ------------------------------------------------------------
   */

  const getSpeechRecognitionConstructor =
    useCallback((): SpeechRecognitionConstructor | null => {
      if (typeof window === "undefined") {
        return null;
      }

      return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    }, []);

  const showVoiceError = useCallback((text: string) => {
    setVoiceError(text);

    if (voiceErrorTimeoutRef.current) {
      clearTimeout(voiceErrorTimeoutRef.current);
    }

    voiceErrorTimeoutRef.current = setTimeout(() => {
      setVoiceError("");
    }, 5000);
  }, []);

  const stopVoiceInput = useCallback(() => {
    const recognition = recognitionRef.current;

    if (recognition) {
      try {
        recognition.abort();
      } catch {
        try {
          recognition.stop();
        } catch {
          // Ignore cleanup errors.
        }
      }
    }

    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startVoiceInput = useCallback(() => {
    if (loading) {
      return;
    }

    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      showVoiceError(
        "Voice input is not supported in this browser. Please use Chrome or Edge.",
      );
      return;
    }

    if (isListening) {
      stopVoiceInput();
      return;
    }

    stopSpeaking();

    setVoiceError("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore.
      }

      recognitionRef.current = null;
    }

    const recognition = new Recognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (recognitionRef.current === recognition) {
        setIsListening(true);
      }
    };

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      const result = event.results[event.resultIndex];

      if (!result) {
        return;
      }

      const transcript = result[0]?.transcript?.trim();

      if (transcript) {
        setMessage(transcript);
        setVoiceError("");
      }
    };

    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      const error = event.error;

      if (error === "no-speech") {
        showVoiceError(
          "I didn't hear anything. Tap the microphone and try speaking again.",
        );
      } else if (error === "not-allowed" || error === "service-not-allowed") {
        showVoiceError(
          "Microphone permission was blocked. Allow microphone access in your browser and try again.",
        );
      } else if (error === "audio-capture") {
        showVoiceError(
          "I couldn't access your microphone. Check that your microphone is connected and not being used by another app.",
        );
      } else if (error === "network") {
        showVoiceError(
          "Voice recognition could not connect to the browser's speech service. Check your internet connection and try again.",
        );
      } else if (error === "aborted") {
        setVoiceError("");
      } else {
        showVoiceError("Voice input stopped unexpectedly. Please try again.");
      }

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);

      showVoiceError("I couldn't start the microphone. Please try again.");
    }
  }, [
    getSpeechRecognitionConstructor,
    isListening,
    loading,
    showVoiceError,
    stopSpeaking,
    stopVoiceInput,
  ]);

  /*
   * ------------------------------------------------------------
   * BROWSER SUPPORT
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const recognitionConstructor = getSpeechRecognitionConstructor();

    setRecognitionSupported(Boolean(recognitionConstructor));

    setSpeechSupported(
      "speechSynthesis" in window && Boolean(window.speechSynthesis),
    );

    if ("speechSynthesis" in window && window.speechSynthesis) {
      loadVoices();

      const handleVoicesChanged = () => {
        loadVoices();
      };

      window.speechSynthesis.addEventListener(
        "voiceschanged",
        handleVoicesChanged,
      );

      return () => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged,
        );
      };
    }
  }, [getSpeechRecognitionConstructor, loadVoices]);

  /*
   * ------------------------------------------------------------
   * EXTERNAL OPEN EVENT
   * ------------------------------------------------------------
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
   * ------------------------------------------------------------
   * AUTO SCROLL
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading, isOpen]);

  /*
   * ------------------------------------------------------------
   * CART
   * ------------------------------------------------------------
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
   * ------------------------------------------------------------
   * PRODUCTS
   * ------------------------------------------------------------
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
        throw new Error(
          `Product request failed with status ${response.status}`,
        );
      }

      const data = await response.json();

      return extractProducts(data);
    } finally {
      clearTimeout(timeout);
    }
  }

  async function findProducts(query: string): Promise<Product[]> {
    const products = await fetchProducts();

    if (!products.length) {
      return [];
    }

    const normalized = normalizeText(query);

    const underMatch = normalized.match(
      /(?:under|below|less than|cheaper than)\s*\$?\s*(\d+(?:\.\d+)?)/i,
    );

    if (underMatch) {
      const amount = Number(underMatch[1]);

      return products
        .filter((product) => Number(product.price) <= amount)
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    if (
      normalized.includes("cheapest") ||
      normalized.includes("lowest price") ||
      normalized.includes("least expensive")
    ) {
      return [...products]
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 6);
    }

    if (
      normalized.includes("most expensive") ||
      normalized.includes("highest price")
    ) {
      return [...products]
        .sort((a, b) => Number(b.price) - Number(a.price))
        .slice(0, 6);
    }

    if (
      normalized.includes("out of stock") ||
      normalized.includes("sold out")
    ) {
      return products
        .filter((product) => Number(product.stock) <= 0)
        .slice(0, 6);
    }

    if (normalized.includes("available") || normalized.includes("in stock")) {
      return products
        .filter((product) => Number(product.stock) > 0)
        .slice(0, 6);
    }

    const categoryKeywords: Record<string, string[]> = {
      phone: ["phone", "phones", "smartphone", "smartphones", "mobile"],
      laptop: ["laptop", "laptops", "notebook", "notebooks", "computer"],
      headphones: [
        "headphone",
        "headphones",
        "earphone",
        "earphones",
        "earbuds",
      ],
      watch: ["watch", "watches", "smartwatch", "smartwatches"],
      tablet: ["tablet", "tablets", "ipad"],
      camera: ["camera", "cameras"],
      keyboard: ["keyboard", "keyboards"],
      mouse: ["mouse", "mice"],
      speaker: ["speaker", "speakers"],
      gaming: ["gaming", "game", "console", "xbox", "playstation"],
      electronics: ["electronics", "electronic"],
      accessories: ["accessory", "accessories"],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => normalized.includes(keyword))) {
        const categoryProducts = products.filter((product) => {
          const productCategory = normalizeText(
            getCategoryName(product.category),
          );

          const productText = normalizeText(
            `${product.name} ${product.description ?? ""} ${productCategory}`,
          );

          return (
            productText.includes(category) ||
            keywords.some((keyword) => productText.includes(keyword))
          );
        });

        if (categoryProducts.length) {
          return categoryProducts.slice(0, 6);
        }
      }
    }

    const searchWords = normalized
      .split(" ")
      .filter((word) => word.length >= 3);

    const matchingProducts = products
      .map((product) => {
        const productText = normalizeText(
          `${product.name} ${product.description ?? ""} ${getCategoryName(
            product.category,
          )}`,
        );

        const score = searchWords.reduce(
          (total, word) => total + (productText.includes(word) ? 1 : 0),
          0,
        );

        return {
          product,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (matchingProducts.length) {
      return matchingProducts.map((item) => item.product).slice(0, 6);
    }

    if (isRecommendationMessage(query)) {
      return products
        .filter((product) => Number(product.stock) > 0)
        .sort((a, b) => Number(b.stock) - Number(a.stock))
        .slice(0, 6);
    }

    return [];
  }

  /*
   * ------------------------------------------------------------
   * LOCAL RESPONSE
   * ------------------------------------------------------------
   */

  function getLocalResponse(text: string): string | null {
    const normalized = normalizeText(text);

    if (
      normalized === "hi" ||
      normalized === "hello" ||
      normalized === "hey" ||
      normalized.startsWith("hi ") ||
      normalized.startsWith("hello ")
    ) {
      return "Hello! 👋 How can I help you today? I can find products, compare prices, check stock, or recommend something for you.";
    }

    if (
      normalized.includes("thank you") ||
      normalized === "thanks" ||
      normalized.includes("thanks")
    ) {
      return "You're very welcome! 😊 Let me know if you need anything else.";
    }

    if (
      normalized === "bye" ||
      normalized === "goodbye" ||
      normalized.includes("see you")
    ) {
      return "Goodbye! 👋 Have a great day and happy shopping!";
    }

    if (
      normalized === "ok" ||
      normalized === "okay" ||
      normalized === "great"
    ) {
      return "Great! 😊 I'm here whenever you need help.";
    }

    return null;
  }

  function createProductResponse(userMessage: string, products: Product[]) {
    if (!products.length) {
      return "I couldn't find matching products right now. Try another category, price range, or product name.";
    }

    const normalized = normalizeText(userMessage);

    if (isComparisonMessage(userMessage)) {
      const names = products
        .slice(0, 3)
        .map((product) => product.name)
        .join(", ");

      return `I found these products that you can compare: ${names}. I've displayed them below so you can check their prices and availability.`;
    }

    if (isRecommendationMessage(userMessage)) {
      return "Here are some products I'd recommend based on what's currently available. I've selected products with available stock for you.";
    }

    if (
      normalized.includes("under") ||
      normalized.includes("below") ||
      normalized.includes("less than")
    ) {
      return `I found ${products.length} product${
        products.length === 1 ? "" : "s"
      } within your requested price range.`;
    }

    if (
      normalized.includes("cheapest") ||
      normalized.includes("lowest price")
    ) {
      const cheapest = products[0];

      return `The cheapest product I found is ${cheapest.name} at $${Number(
        cheapest.price,
      ).toFixed(2)}. I've displayed it below.`;
    }

    if (
      normalized.includes("most expensive") ||
      normalized.includes("highest price")
    ) {
      const expensive = products[0];

      return `The most expensive product I found is ${expensive.name} at $${Number(
        expensive.price,
      ).toFixed(2)}.`;
    }

    if (
      normalized.includes("out of stock") ||
      normalized.includes("sold out")
    ) {
      return `I found ${products.length} product${
        products.length === 1 ? "" : "s"
      } that are currently out of stock.`;
    }

    if (normalized.includes("available") || normalized.includes("in stock")) {
      return `I found ${products.length} product${
        products.length === 1 ? "" : "s"
      } that are currently available.`;
    }

    return `I found ${products.length} matching product${
      products.length === 1 ? "" : "s"
    }. Take a look below.`;
  }

  /*
   * ------------------------------------------------------------
   * AI API
   * ------------------------------------------------------------
   */

  async function askAI(
    userMessage: string,
    products: Product[],
  ): Promise<string | null> {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 12000);

    try {
      const productContext = products.slice(0, 12).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock: Number(product.stock),
        category: getCategoryName(product.category),
      }));

      const response = await fetch(`${AI_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          products: productContext,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`AI request failed with status ${response.status}`);
      }

      const data = await response.json();

      const reply = data?.reply ?? data?.response ?? data?.message ?? null;

      if (typeof reply !== "string" || !reply.trim()) {
        return null;
      }

      return cleanMarkdown(reply);
    } catch (error) {
      console.error("AI chatbot error:", error);

      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /*
   * ------------------------------------------------------------
   * SEND MESSAGE
   * ------------------------------------------------------------
   */

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();

    const userMessage = message.trim();

    if (!userMessage || loading) {
      return;
    }

    stopSpeaking();
    stopVoiceInput();

    setVoiceError("");
    setSpeechError("");

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

      let products: Product[] = [];

      try {
        products = await findProducts(userMessage);
      } catch (error) {
        console.error("Product search error:", error);
      }

      if (products.length) {
        const response = createProductResponse(userMessage, products);

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: response,
            products,
          },
        ]);

        return;
      }

      const aiResponse = await askAI(userMessage, products);

      if (aiResponse) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: aiResponse,
          },
        ]);

        return;
      }

      if (isProductQuestion(userMessage)) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              "I couldn't find a matching product right now. Please try a different product name, category, or price range.",
          },
        ]);

        return;
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't process that request right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ------------------------------------------------------------
   * CHAT CONTROLS
   * ------------------------------------------------------------
   */

  function toggleSound() {
    if (soundEnabled) {
      stopSpeaking();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      setSpeechError("");
      loadVoices();
    }
  }

  /*
   * NEW REFRESH BUTTON
   *
   * This resets the chatbot conversation completely.
   * It does NOT close the chatbot.
   */
  function refreshChat() {
    stopSpeaking();
    stopVoiceInput();

    setVoiceError("");
    setSpeechError("");
    setMessage("");
    setLoading(false);
    setAddedProducts([]);

    setMessages([
      {
        ...INITIAL_MESSAGE,
      },
    ]);
  }

  function closeChat() {
    stopSpeaking();
    stopVoiceInput();

    setVoiceError("");
    setSpeechError("");

    setIsOpen(false);
  }

  function openChat() {
    setIsOpen(true);
  }

  /*
   * ------------------------------------------------------------
   * PRODUCT CARD
   * ------------------------------------------------------------
   */

  function ProductCard({
    product,
    comparison = false,
  }: {
    product: Product;
    comparison?: boolean;
  }) {
    const isAdded = addedProducts.includes(product.id);

    const outOfStock = Number(product.stock) <= 0;

    return (
      <div
        className={`group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
          comparison ? "min-w-47.5" : ""
        }`}
      >
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
            }}
          />

          <div className="absolute left-2.5 top-2.5">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur ${
                outOfStock
                  ? "bg-red-500/90 text-white"
                  : "bg-emerald-500/90 text-white"
              }`}
            >
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </span>
          </div>
        </div>

        <div className="p-3.5">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
            {getCategoryName(product.category) || "Product"}
          </div>

          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900">
            {product.name}
          </h3>

          {!comparison && product.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-4 text-slate-500">
              {product.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-base font-extrabold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </span>

            <Link
              href={`/products/${product.id}`}
              className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              View
            </Link>
          </div>

          <button
            type="button"
            disabled={outOfStock || isAdded}
            onClick={() => handleAddToCart(product)}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
              outOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : isAdded
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-900 text-white hover:bg-indigo-600 active:scale-[0.98]"
            }`}
          >
            {isAdded ? (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
                Added
              </>
            ) : outOfStock ? (
              "Out of stock"
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                  <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6" />
                </svg>
                Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * ASSISTANT MESSAGE
   * ------------------------------------------------------------
   */

  function AssistantMessage({ item, index }: { item: Message; index: number }) {
    const hasProducts = Boolean(item.products && item.products.length);

    const comparison = hasProducts && isComparisonMessage(item.content);

    return (
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-sm text-white shadow-md">
          ✦
        </div>

        <div className="min-w-0 max-w-[88%]">
          <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
            <p className="whitespace-pre-wrap text-[13px] leading-5 text-slate-700">
              {item.content}
            </p>

            {soundEnabled && speechSupported && (
              <button
                type="button"
                onClick={() => speakMessage(item.content, index)}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                {speakingIndex === index ? (
                  <>
                    <span className="flex items-end gap-0.5">
                      <span className="h-2 w-0.5 animate-pulse rounded-full bg-indigo-500" />
                      <span className="h-3 w-0.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:120ms]" />
                      <span className="h-2 w-0.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:240ms]" />
                    </span>
                    Stop
                  </>
                ) : (
                  <>
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                    </svg>
                    Listen
                  </>
                )}
              </button>
            )}
          </div>

          {hasProducts && (
            <div
              className={`mt-2.5 grid gap-2.5 ${
                comparison
                  ? "grid-cols-1 overflow-x-auto sm:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {item.products!.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  comparison={comparison}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * DO NOT RENDER UNTIL CLIENT MOUNTED
   * ------------------------------------------------------------
   */

  if (!mounted) {
    return null;
  }

  /*
   * ------------------------------------------------------------
   * CHATBOT UI
   *
   * IMPORTANT:
   * This is rendered directly into document.body.
   *
   * There is NO:
   * onMouseLeave
   * onMouseOut
   * onMouseEnter that controls visibility
   *
   * Therefore moving the cursor outside the chatbot does
   * NOT close it.
   * ------------------------------------------------------------
   */

  const chatbotUI = (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open ShopEase AI assistant"
          className="fixed bottom-5 right-5 z-999999 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-2xl shadow-indigo-500/30 transition duration-300 hover:scale-105 hover:shadow-indigo-500/50 active:scale-95 sm:bottom-6 sm:right-6"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500 opacity-20" />

          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.7-.8L4 20l1.3-3.7A7.2 7.2 0 0 1 4.5 12c0-4.1 3.4-7.5 7.5-7.5S20 7.4 20 11.5Z" />
              <path d="M9 12h.01M12 12h.01M15 12h.01" />
            </svg>
          </span>

          <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
        </button>
      )}

      {isOpen && (
        <section
          aria-label="ShopEase AI assistant"
          className="fixed inset-0 z-999999 flex flex-col overflow-hidden bg-slate-50 shadow-2xl sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(760px,calc(100dvh-40px))] sm:w-[min(470px,calc(100vw-40px))] sm:rounded-[30px]"
        >
          {/* HEADER */}
          <header className="relative shrink-0 overflow-hidden bg-linear-to-br from-slate-950 via-indigo-950 to-violet-900 px-4 pb-4 pt-4 text-white">
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 shadow-inner ring-1 ring-white/15 backdrop-blur-md">
                  <span className="text-xl">✦</span>

                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-indigo-950 bg-emerald-400" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-extrabold tracking-wide">
                    ShopEase Assistant
                  </h2>

                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-indigo-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online • Ready to help
                  </div>
                </div>
              </div>

              {/* HEADER BUTTONS */}
              <div className="flex shrink-0 items-center gap-1">
                {/* SOUND */}
                <button
                  type="button"
                  onClick={toggleSound}
                  title={soundEnabled ? "Turn voice off" : "Turn voice on"}
                  aria-label={soundEnabled ? "Turn voice off" : "Turn voice on"}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    soundEnabled
                      ? "bg-white/15 text-white hover:bg-white/20"
                      : "bg-white/5 text-indigo-200 hover:bg-white/15"
                  }`}
                >
                  {soundEnabled ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m3 3 18 18" />
                      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                    </svg>
                  )}
                </button>

                {/* REFRESH */}
                <button
                  type="button"
                  onClick={refreshChat}
                  title="Refresh conversation"
                  aria-label="Refresh conversation"
                  className="group flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-indigo-100 transition hover:bg-white/20 hover:text-white"
                >
                  <svg
                    className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                    <path d="M4 4v5h5" />
                    <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                    <path d="M20 20v-5h-5" />
                  </svg>
                </button>

                {/* CLOSE */}
                <button
                  type="button"
                  onClick={closeChat}
                  title="Close assistant"
                  aria-label="Close assistant"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-indigo-100 transition hover:bg-red-500/80 hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 text-sm">💡</div>

                <p className="text-[11px] leading-4 text-indigo-100">
                  Ask me about products, prices, stock, recommendations, or
                  comparisons.
                </p>
              </div>
            </div>
          </header>

          {/* QUICK QUESTIONS */}
          <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2.5">
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setMessage(question);

                    setTimeout(() => {
                      const form = document.querySelector(
                        "[data-chatbot-form]",
                      ) as HTMLFormElement | null;

                      form?.requestSubmit();
                    }, 50);
                  }}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* MESSAGES */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-slate-50 to-white px-3.5 py-4">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Today
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-4">
              {messages.map((item, index) => {
                if (item.role === "assistant") {
                  return (
                    <AssistantMessage
                      key={`${index}-${item.content.slice(0, 15)}`}
                      item={item}
                      index={index}
                    />
                  );
                }

                return (
                  <div
                    key={`${index}-${item.content.slice(0, 15)}`}
                    className="flex justify-end"
                  >
                    <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-linear-to-br from-indigo-600 to-violet-600 px-3.5 py-3 text-[13px] leading-5 text-white shadow-md shadow-indigo-500/10">
                      <p className="whitespace-pre-wrap">{item.content}</p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-sm text-white shadow-md">
                    ✦
                  </div>

                  <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:120ms]" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:240ms]" />

                      <span className="ml-1 text-[10px] font-medium text-slate-400">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ERRORS */}
          {(voiceError || speechError) && (
            <div className="shrink-0 border-t border-amber-100 bg-amber-50 px-3.5 py-2.5">
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.3 3.5 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3l-7.8-13.5a2 2 0 0 0-3.4 0Z" />
                </svg>

                <p className="text-[10px] leading-4 text-amber-800">
                  {voiceError || speechError}
                </p>
              </div>
            </div>
          )}

          {/* INPUT */}
          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            <form
              data-chatbot-form
              onSubmit={sendMessage}
              className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5"
            >
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  isListening ? "Listening..." : "Ask me anything..."
                }
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {/* MICROPHONE */}
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={loading || !recognitionSupported}
                title={
                  !recognitionSupported
                    ? "Voice input is not supported"
                    : isListening
                      ? "Stop listening"
                      : "Speak"
                }
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                  isListening
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                    : recognitionSupported
                      ? "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                      : "cursor-not-allowed bg-slate-100 text-slate-300"
                }`}
              >
                {isListening && (
                  <span className="absolute inset-0 animate-ping rounded-xl bg-red-400 opacity-20" />
                )}

                {isListening ? (
                  <svg
                    className="relative h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="8" y="8" width="8" height="8" rx="1" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="2" width="6" height="13" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
                  </svg>
                )}
              </button>

              {/* SEND */}
              <button
                type="submit"
                disabled={!message.trim() || loading}
                title="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" className="opacity-25" />

                    <path d="M21 12a9 9 0 0 0-9-9" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m4 4 16 8-16 8 3-8-3-8Z" />
                    <path d="M7 12h13" />
                  </svg>
                )}
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    recognitionSupported ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />

                <span className="text-[9px] font-medium text-slate-400">
                  {recognitionSupported
                    ? isListening
                      ? "Listening for your voice..."
                      : "Voice input ready"
                    : "Voice input unavailable"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                <span
                  className={
                    soundEnabled && speechSupported ? "text-indigo-500" : ""
                  }
                >
                  {soundEnabled && speechSupported
                    ? "Voice replies on"
                    : "Voice replies off"}
                </span>

                {voicesAvailable && soundEnabled && (
                  <span className="h-1 w-1 rounded-full bg-indigo-300" />
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );

  return createPortal(chatbotUI, document.body);
}
