"use client";

import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import Link from "next/link";
import { useCart } from "../app/Context/CartContext";

const AI_API_URL =
  process.env.NEXT_PUBLIC_AI_API_URL || "http://127.0.0.1:8000";

const BACKEND_URL = "http://localhost:3001";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  category?: string | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
};

type SpeechRecognitionEventLike = Event & {
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
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const quickQuestions = [
  "Show me phones",
  "What do you recommend?",
  "Show products under $100",
  "Compare laptops",
];

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function isComparisonMessage(message: string): boolean {
  const text = message.toLowerCase();

  return (
    text.includes("compare") ||
    text.includes("comparison") ||
    text.includes("difference between") ||
    text.includes("versus") ||
    text.includes(" vs ")
  );
}

function getProductImage(product: Product): string {
  if (product.image) {
    if (product.image.startsWith("http")) {
      return product.image;
    }

    return `${BACKEND_URL}${product.image.startsWith("/") ? "" : "/"}${
      product.image
    }`;
  }

  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
}

export default function Chatbot() {
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm your ShopEase AI assistant. I can help you find products, compare items, check prices, and choose something that fits your needs.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanMarkdown(text);

    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startVoiceInput = () => {
    if (typeof window === "undefined") {
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

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0]?.[0]?.transcript;

      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    setIsListening(true);
    recognition.start();
  };

  const handleAddToCart = (product: Product) => {
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        stock: product.stock,
      } as never);
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const fetchFallbackProducts = async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${BACKEND_URL}/products`);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.products)) {
        return data.products;
      }

      return [];
    } catch (error) {
      console.error("Fallback product fetch failed:", error);
      return [];
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();

    if (!text || isLoading) {
      return;
    }

    setInput("");

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${AI_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const data = await response.json();

      let products: Product[] = Array.isArray(data?.products)
        ? data.products
        : [];

      // If AI returns no products for a product-related question,
      // try the backend as a fallback.
      if (
        products.length === 0 &&
        (text.toLowerCase().includes("product") ||
          text.toLowerCase().includes("phone") ||
          text.toLowerCase().includes("laptop") ||
          text.toLowerCase().includes("camera") ||
          text.toLowerCase().includes("headphone") ||
          text.toLowerCase().includes("show me") ||
          text.toLowerCase().includes("recommend") ||
          text.toLowerCase().includes("compare"))
      ) {
        const fallbackProducts = await fetchFallbackProducts();

        if (fallbackProducts.length > 0) {
          products = fallbackProducts.slice(0, 6);
        }
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: cleanMarkdown(
          data?.reply ||
            "I'm sorry, I couldn't find an answer. Please try asking in another way.",
        ),
        products,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to the AI assistant right now. Please make sure the AI service is running on port 8000.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    stopSpeaking();

    setMessages([
      {
        role: "assistant",
        content:
          "Chat cleared! 👋 What are you looking for today? I can help you find products, compare items, or recommend something.",
      },
    ]);

    setInput("");
  };

  const renderComparison = (products: Product[]) => {
    if (products.length < 2) {
      return null;
    }

    const comparisonProducts = products.slice(0, 4);

    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <h3 className="font-semibold text-slate-800">Product Comparison</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Product
                </th>

                {comparisonProducts.map((product) => (
                  <th
                    key={product.id}
                    className="min-w-[150px] px-4 py-3 font-semibold text-slate-800"
                  >
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-500">Price</td>

                {comparisonProducts.map((product) => (
                  <td
                    key={product.id}
                    className="px-4 py-3 font-bold text-indigo-600"
                  >
                    ${Number(product.price).toFixed(2)}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-500">Stock</td>

                {comparisonProducts.map((product) => (
                  <td key={product.id} className="px-4 py-3">
                    {product.stock > 0 ? (
                      <span className="font-medium text-emerald-600">
                        {product.stock} available
                      </span>
                    ) : (
                      <span className="font-medium text-red-500">
                        Out of stock
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-4 py-3 font-medium text-slate-500">
                  Category
                </td>

                {comparisonProducts.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-slate-700">
                    {product.category || "General"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProducts = (products: Product[], comparison = false) => {
    if (!products || products.length === 0) {
      return null;
    }

    if (comparison) {
      return renderComparison(products);
    }

    return (
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {products.slice(0, 6).map((product) => (
          <div
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
          >
            <div className="relative h-40 overflow-hidden bg-slate-100">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
                }}
              />

              {product.stock > 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                  In Stock
                </span>
              )}

              {product.stock <= 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="line-clamp-2 text-sm font-bold text-slate-800">
                  {product.name}
                </h4>

                {product.category && (
                  <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-600">
                    {product.category}
                  </span>
                )}
              </div>

              <p className="mb-3 line-clamp-2 min-h-[32px] text-xs leading-5 text-slate-500">
                {product.description ||
                  "Quality product available in our store."}
              </p>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-extrabold text-indigo-600">
                  ${Number(product.price).toFixed(2)}
                </span>

                <span className="text-xs text-slate-400">
                  {product.stock > 0 ? `${product.stock} left` : "Unavailable"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/products/${product.id}`}
                  className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  View
                </Link>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => handleAddToCart(product)}
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {product.stock > 0 ? "Add to Cart" : "Unavailable"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Floating chatbot button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI shopping assistant"
          className="group fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-indigo-500/40"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500 opacity-20" />

          <div className="relative flex flex-col items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[9999] flex h-[min(760px,calc(100vh-32px))] w-[min(440px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 px-5 py-4 text-white">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 left-20 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-inner backdrop-blur">
                  🤖
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-indigo-700 bg-emerald-400" />
                </div>

                <div>
                  <h2 className="text-base font-bold">ShopEase AI</h2>

                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/80">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                    <span>Online • Ready to help</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  title="Clear conversation"
                  className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  🗑️
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="rounded-xl p-2 text-lg text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="border-b border-slate-100 bg-white px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Try asking
              </p>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-4 py-4">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const comparison =
                  message.role === "assistant" &&
                  message.products &&
                  message.products.length >= 2 &&
                  isComparisonMessage(
                    messages[index - 1]?.content || message.content,
                  );

                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[92%] ${
                        message.role === "user" ? "" : "w-full"
                      }`}
                    >
                      <div
                        className={`flex items-end gap-2 ${
                          message.role === "user"
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${
                            message.role === "user"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                          }`}
                        >
                          {message.role === "user" ? "👤" : "🤖"}
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                            message.role === "user"
                              ? "rounded-br-md bg-indigo-600 text-white shadow-md"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>

                      {/* Assistant actions */}
                      {message.role === "assistant" && (
                        <div className="ml-10 mt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => speakText(message.content)}
                            className="rounded-lg px-2 py-1 text-[11px] text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
                          >
                            🔊 Listen
                          </button>

                          {isSpeaking && (
                            <button
                              type="button"
                              onClick={stopSpeaking}
                              className="rounded-lg px-2 py-1 text-[11px] text-red-500 transition hover:bg-red-50"
                            >
                              ⏹ Stop
                            </button>
                          )}
                        </div>
                      )}

                      {message.role === "assistant" &&
                        message.products &&
                        message.products.length > 0 && (
                          <>
                            {comparison
                              ? renderComparison(message.products)
                              : renderProducts(message.products)}
                          </>
                        )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm text-white">
                    🤖
                  </div>

                  <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-pink-400"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span className="ml-1 text-xs text-slate-400">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom area */}
          <div className="border-t border-slate-200 bg-white p-3">
            {/* Active status */}
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                AI shopping assistant active
              </div>

              {isListening && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  Listening...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about products..."
                disabled={isLoading}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={startVoiceInput}
                disabled={isLoading}
                title={isListening ? "Stop listening" : "Voice input"}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                  isListening
                    ? "animate-pulse bg-red-500 text-white"
                    : "bg-white text-slate-500 shadow-sm hover:bg-indigo-50 hover:text-indigo-600"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                🎙️
              </button>

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                title="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transition hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                ➤
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-slate-400">
              Press Enter to send • 🎙️ Voice enabled
            </p>
          </div>
        </div>
      )}
    </>
  );
}
