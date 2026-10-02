"use client";

import { FormEvent, useState } from "react";

const AI_API_URL = "http://127.0.0.1:8000";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm your ShopEase assistant. I can help you find products, check prices, and check stock.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

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
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the shopping assistant. Please make sure the AI service is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-black px-4 py-4 text-white">
            <div>
              <h2 className="font-semibold">ShopEase Assistant</h2>
              <p className="text-xs text-gray-300">Online shopping assistant</p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full px-2 py-1 text-xl hover:bg-white/10"
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                    item.role === "user"
                      ? "rounded-br-md bg-black text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="flex gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about products..."
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 outline-none focus:border-black"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl text-white shadow-lg transition hover:scale-105 hover:bg-gray-800"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </>
  );
}
