"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "../app/Context/CartContext";

const AI_API_URL = "http://127.0.0.1:8000";

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

export default function Chatbot() {
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [addedProducts, setAddedProducts] = useState<number[]>([]);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 Welcome to ShopEase. I'm your shopping assistant. I can help you discover products, compare prices, and check availability.",
    },
  ]);

  /*
   * Stop speech when component is removed.
   */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
   * Voice input
   */
  function startVoiceInput() {
    if (loading) return;

    if (typeof window === "undefined") return;

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
      const transcript = event.results[0][0].transcript;

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

  /*
   * Text-to-speech
   */
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

  /*
   * Add product to cart
   */
  function handleAddToCart(product: Product) {
    if (product.stock <= 0) return;

    addToCart({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stock: product.stock,
      image: product.image ?? "",
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
   * Send message to AI service
   */
  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) return;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${AI_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("AI service request failed");
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply || "Sorry, I couldn't generate a response.",
          products: Array.isArray(data.products) ? data.products : [],
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the shopping assistant. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="
            fixed bottom-24 right-4 z-[100]
            flex h-[min(680px,calc(100dvh-120px))]
            w-[min(430px,calc(100vw-32px))]
            flex-col overflow-hidden
            rounded-[24px]
            border border-gray-200
            bg-white
            shadow-[0_20px_60px_rgba(15,23,42,0.20)]
            sm:bottom-24 sm:right-6
          "
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-5 py-5 text-white">
            <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 right-20 h-24 w-24 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl shadow-sm">
                  🛍️
                </div>

                <div>
                  <h2 className="text-base font-bold tracking-wide">
                    ShopEase Assistant
                  </h2>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-300" />

                    <p className="text-xs font-medium text-blue-100">
                      Online · Ready to help
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);

                  if (recognitionRef.current) {
                    recognitionRef.current.stop();
                  }

                  if (typeof window !== "undefined") {
                    window.speechSynthesis?.cancel();
                  }

                  setIsListening(false);
                  setSpeakingIndex(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-white transition hover:bg-white/15"
                aria-label="Close chatbot"
              >
                ×
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-4 py-5">
            <div className="text-center">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Your shopping companion
              </span>
            </div>

            {messages.map((item, index) => (
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
                      ? "w-[calc(100%-40px)] max-w-[92%]"
                      : "max-w-[82%]"
                  } flex-col gap-1`}
                >
                  {/* Message */}
                  <div
                    className={`
                      whitespace-pre-wrap break-words
                      rounded-2xl px-4 py-3
                      text-[13px] leading-6
                      ${
                        item.role === "user"
                          ? "rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/15"
                          : "rounded-bl-md border border-gray-100 bg-white text-gray-800 shadow-sm"
                      }
                    `}
                  >
                    {item.content}
                  </div>

                  {/* Speaker button */}
                  {item.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => speakMessage(item.content, index)}
                      className="flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                      aria-label={
                        speakingIndex === index
                          ? "Stop speaking"
                          : "Read response aloud"
                      }
                    >
                      {speakingIndex === index ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>

                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>

                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Product Cards */}
                  {item.role === "assistant" &&
                    item.products &&
                    item.products.length > 0 && (
                      <div className="mt-2 space-y-3">
                        {item.products.map((product) => (
                          <div
                            key={product.id}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          >
                            {/* Product Image */}
                            <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-5xl">
                                  🛍️
                                </div>
                              )}

                              {/* Category */}
                              {product.category && (
                                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-blue-700 shadow-sm backdrop-blur-sm">
                                  {product.category}
                                </span>
                              )}

                              {/* Stock Badge */}
                              <span
                                className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur-sm ${
                                  product.stock > 0
                                    ? "bg-green-100/95 text-green-700"
                                    : "bg-red-100/95 text-red-700"
                                }`}
                              >
                                {product.stock > 0
                                  ? `${product.stock} in stock`
                                  : "Sold out"}
                              </span>
                            </div>

                            {/* Product Information */}
                            <div className="p-3.5">
                              <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
                                {product.name}
                              </h3>

                              <p className="mt-1 line-clamp-2 min-h-[36px] text-[11px] leading-4 text-gray-500">
                                {product.description ||
                                  "No description available."}
                              </p>

                              <div className="mt-3 flex items-center justify-between gap-2">
                                <span className="text-lg font-extrabold text-blue-600">
                                  ${product.price.toFixed(2)}
                                </span>

                                {product.stock > 0 ? (
                                  <span className="text-[10px] font-medium text-green-600">
                                    Available now
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-red-500">
                                    Currently unavailable
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
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
                                  disabled={product.stock <= 0}
                                  className={`h-9 rounded-xl text-[11px] font-semibold text-white transition ${
                                    product.stock <= 0
                                      ? "cursor-not-allowed bg-gray-300"
                                      : addedProducts.includes(product.id)
                                        ? "bg-green-500"
                                        : "bg-blue-600 hover:bg-blue-700"
                                  }`}
                                >
                                  {product.stock <= 0
                                    ? "Sold Out"
                                    : addedProducts.includes(product.id)
                                      ? "✓ Added"
                                      : "Add to Cart"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Loading */}
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
          </div>

          {/* Input Area */}
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
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none disabled:opacity-50"
              />

              {/* Microphone */}
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={loading}
                className={`
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl transition
                  ${
                    isListening
                      ? "animate-pulse bg-red-500 text-white shadow-md shadow-red-500/30"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                `}
                aria-label={
                  isListening ? "Stop voice input" : "Start voice input"
                }
                title={isListening ? "Stop listening" : "Speak your message"}
              >
                {isListening ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="7" y="7" width="10" height="10" rx="1" />
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
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                    <line x1="8" x2="16" y1="22" y2="22" />
                  </svg>
                )}
              </button>

              {/* Send */}
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="
                  flex h-10 w-11 shrink-0 items-center justify-center
                  rounded-xl bg-blue-600 text-white
                  shadow-md shadow-blue-600/20
                  transition hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Send message"
              >
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
              </button>
            </form>

            <p className="mt-3 text-center text-[10px] text-gray-400">
              Powered by ShopEase AI
            </p>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            fixed bottom-6 right-6 z-[100]
            flex h-16 w-16 items-center justify-center
            rounded-full
            bg-gradient-to-br from-blue-600 to-indigo-600
            text-2xl text-white
            shadow-[0_8px_30px_rgba(37,99,235,0.35)]
            transition duration-300
            hover:scale-110 hover:shadow-[0_12px_35px_rgba(37,99,235,0.45)]
            active:scale-95
          "
          aria-label="Open ShopEase Assistant"
        >
          <span>💬</span>

          <span className="absolute right-0 top-0 h-4 w-4 rounded-full border-2 border-white bg-green-400" />
        </button>
      )}
    </>
  );
}
