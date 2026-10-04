"use client";

import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import Link from "next/link";
import { useCart } from "../app/Context/CartContext";

const AI_API_URL =
  process.env.NEXT_PUBLIC_AI_API_URL || "http://127.0.0.1:8000";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  image?: string | null;
  images?: string[];
  imageUrl?: string | null;
  category?: string | { id?: number; name?: string } | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult: ((event: unknown) => void) | null;
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
  "Compare laptops",
];

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! 👋 I'm your ShopEase AI assistant. I can help you find products, compare items, check prices, manage your cart, and choose something that fits your needs.",
};

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

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\w\s$.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isComparisonMessage(text: string): boolean {
  const normalized = text.toLowerCase();

  return (
    /\bcompare\b/.test(normalized) ||
    /\bcomparison\b/.test(normalized) ||
    /\bdifference\b/.test(normalized) ||
    /\bversus\b/.test(normalized) ||
    /\bvs\b/.test(normalized) ||
    /\bwhich one is better\b/.test(normalized) ||
    /\bwhich is better\b/.test(normalized)
  );
}

function getCategoryName(
  category?: string | { id?: number; name?: string } | null,
): string {
  if (!category) return "Product";

  if (typeof category === "string") {
    return category;
  }

  return category.name || "Product";
}

function getProductImage(product: {
  image?: string | null;
  images?: string[];
  imageUrl?: string | null;
}): string {
  const image =
    product.image ||
    product.imageUrl ||
    (product.images && product.images.length > 0 ? product.images[0] : null);

  if (!image) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

export default function Chatbot() {
  const {
    cart,
    cartCount,
    cartTotal,
    loading: cartLoading,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [clearCartPending, setClearCartPending] = useState(false);

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /*
   * ---------------------------------------------------------
   * AUTO SCROLL
   * ---------------------------------------------------------
   */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  /*
   * ---------------------------------------------------------
   * FOCUS INPUT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * TEXT TO SPEECH
   * ---------------------------------------------------------
   */

  const speakText = (text: string) => {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const cleaned = cleanMarkdown(text);

    const utterance = new SpeechSynthesisUtterance(cleaned);

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
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  /*
   * ---------------------------------------------------------
   * VOICE INPUT
   * ---------------------------------------------------------
   */

  const startVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Voice input is not supported by your browser. Please use Chrome or Edge.",
        },
      ]);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: unknown) => {
      const speechEvent = event as {
        results: {
          [key: number]: {
            [key: number]: {
              transcript: string;
            };
          };
        };
      };

      const transcript = speechEvent.results?.[0]?.[0]?.transcript || "";

      if (transcript) {
        setInput(transcript);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * ADD PRODUCT TO CART
   * ---------------------------------------------------------
   */

  const handleAddToCart = async (product: Product) => {
    if ((product.stock ?? 0) <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, ${product.name} is currently out of stock.`,
        },
      ]);

      return;
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: Number(product.price),
        stock: product.stock ?? 0,
        image: product.image || null,
        images: product.images,
        imageUrl: product.imageUrl || null,
        category: product.category || null,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🛒 ${product.name} has been added to your cart.`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I couldn't add ${product.name} to your cart. Please try again.`,
        },
      ]);
    }
  };

  /*
   * ---------------------------------------------------------
   * FETCH PRODUCTS
   * ---------------------------------------------------------
   */

  const fetchProducts = async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${BACKEND_URL}/products`);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data.products)) {
        return data.products;
      }

      return [];
    } catch {
      return [];
    }
  };

  /*
   * ---------------------------------------------------------
   * FIND CART PRODUCT
   * ---------------------------------------------------------
   */

  const findCartProduct = (text: string) => {
    const normalized = normalizeText(text);

    return cart.find((item: any) => {
      const productName = normalizeText(item.name || "");

      if (!productName) return false;

      if (normalized.includes(productName)) {
        return true;
      }

      const words = productName
        .split(" ")
        .filter((word: string) => word.length > 2);

      return words.some((word: string) => normalized.includes(word));
    });
  };

  /*
   * ---------------------------------------------------------
   * FIND LAST PRODUCTS SHOWN BY ASSISTANT
   *
   * This is the memory that allows:
   *
   * "Show me phones"
   * "Add the first one"
   *
   * ---------------------------------------------------------
   */

  const getLatestShownProducts = (): Product[] => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];

      if (
        message.role === "assistant" &&
        message.products &&
        message.products.length > 0
      ) {
        return message.products;
      }
    }

    return [];
  };

  /*
   * ---------------------------------------------------------
   * FIND REFERENCED PRODUCT
   * ---------------------------------------------------------
   */

  const findReferencedProduct = (text: string): Product | null => {
    const normalized = normalizeText(text);

    const products = getLatestShownProducts();

    if (!products.length) {
      return null;
    }

    const positions: Array<[RegExp, number]> = [
      [/\b(first|1st|one)\b/, 0],
      [/\b(second|2nd|two)\b/, 1],
      [/\b(third|3rd|three)\b/, 2],
      [/\b(fourth|4th|four)\b/, 3],
      [/\b(fifth|5th|five)\b/, 4],
      [/\b(sixth|6th|six)\b/, 5],
    ];

    for (const [pattern, index] of positions) {
      if (pattern.test(normalized)) {
        return products[index] || null;
      }
    }

    const genericReference =
      /\b(that one|this one|that product|this product|that phone|this phone|that laptop|this laptop|it)\b/.test(
        normalized,
      );

    if (genericReference) {
      return products[0] || null;
    }

    const namedProduct = products.find((product) =>
      normalized.includes(normalizeText(product.name)),
    );

    return namedProduct || null;
  };

  /*
   * ---------------------------------------------------------
   * PRODUCT REFERENCE ACTIONS
   *
   * Examples:
   *
   * Add the first one
   * Buy the second one
   * Remove that phone
   * Increase the first one
   * Decrease the second one
   * ---------------------------------------------------------
   */

  const handleProductReferenceAction = async (
    text: string,
  ): Promise<boolean> => {
    const normalized = normalizeText(text);

    const referencePattern =
      /\b(first|1st|one|second|2nd|two|third|3rd|three|fourth|4th|fourth|four|fifth|5th|five|sixth|6th|six|that one|this one|that product|this product|that phone|this phone|that laptop|this laptop|it)\b/;

    const latestProducts = getLatestShownProducts();

    const namedReference =
      latestProducts.length > 0 &&
      latestProducts.some((product) =>
        normalized.includes(normalizeText(product.name)),
      );

    const hasReference = referencePattern.test(normalized) || namedReference;

    if (!hasReference) {
      return false;
    }

    const product = findReferencedProduct(text);

    if (!product) {
      return false;
    }

    const wantsAdd = /\b(add|buy|purchase|get|put|place)\b/.test(normalized);

    const wantsRemove = /\b(remove|delete|take out)\b/.test(normalized);

    const wantsIncrease = /\b(increase|raise|more|add another)\b/.test(
      normalized,
    );

    const wantsDecrease = /\b(decrease|reduce|less|lower)\b/.test(normalized);

    /*
     * ADD
     */

    if (wantsAdd) {
      await handleAddToCart(product);
      return true;
    }

    /*
     * REMOVE
     */

    if (wantsRemove) {
      const cartItem = cart.find(
        (item: any) => Number(item.id) === Number(product.id),
      );

      if (!cartItem) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `${product.name} is not currently in your cart.`,
          },
        ]);

        return true;
      }

      try {
        await removeFromCart(cartItem.id);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `🗑️ ${product.name} has been removed from your cart.`,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I couldn't remove ${product.name} from your cart.`,
          },
        ]);
      }

      return true;
    }

    /*
     * INCREASE
     */

    if (wantsIncrease) {
      const cartItem = cart.find(
        (item: any) => Number(item.id) === Number(product.id),
      );

      if (!cartItem) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `${product.name} is not currently in your cart.`,
          },
        ]);

        return true;
      }

      try {
        await increaseQuantity(cartItem.id);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `➕ Increased the quantity of ${product.name}.`,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I couldn't increase the quantity of ${product.name}.`,
          },
        ]);
      }

      return true;
    }

    /*
     * DECREASE
     */

    if (wantsDecrease) {
      const cartItem = cart.find(
        (item: any) => Number(item.id) === Number(product.id),
      );

      if (!cartItem) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `${product.name} is not currently in your cart.`,
          },
        ]);

        return true;
      }

      try {
        await decreaseQuantity(cartItem.id);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `➖ Decreased the quantity of ${product.name}.`,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I couldn't decrease the quantity of ${product.name}.`,
          },
        ]);
      }

      return true;
    }

    return false;
  };

  /*
   * ---------------------------------------------------------
   * CART COMMANDS
   * ---------------------------------------------------------
   */

  const handleCartQuestion = async (text: string): Promise<boolean> => {
    const normalized = normalizeText(text);

    /*
     * IMPORTANT:
     *
     * Check pending confirmation BEFORE checking whether
     * the message contains "cart".
     *
     * This fixes:
     *
     * "Clear my cart"
     * "Are you sure?"
     * "Yes"
     */

    if (clearCartPending) {
      const confirmed =
        /^(yes|yes clear it|confirm|do it|clear it|okay clear it)$/i.test(
          normalized,
        );

      const cancelled = /^(no|cancel|don't|do not|keep it|never mind)$/i.test(
        normalized,
      );

      if (confirmed) {
        try {
          await clearCart();

          setClearCartPending(false);

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "🧹 Your cart has been cleared.",
            },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I couldn't clear your cart. Please try again.",
            },
          ]);
        }

        return true;
      }

      if (cancelled) {
        setClearCartPending(false);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "No problem 👍 I kept everything in your cart.",
          },
        ]);

        return true;
      }
    }

    const isCartQuestion =
      /\bcart\b/.test(normalized) || /\bbasket\b/.test(normalized);

    if (!isCartQuestion) {
      return false;
    }

    /*
     * SHOW CART
     */

    if (
      normalized.includes("what") ||
      normalized.includes("show") ||
      normalized.includes("items") ||
      normalized.includes("contents")
    ) {
      if (!cart.length) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "🛒 Your cart is currently empty.",
          },
        ]);
      } else {
        const itemText = cart
          .map((item: any) => `• ${item.name} × ${item.quantity || 1}`)
          .join("\n");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `🛒 Here's what's in your cart:\n\n${itemText}\n\nTotal: $${Number(
              cartTotal,
            ).toFixed(2)}`,
          },
        ]);
      }

      return true;
    }

    /*
     * TOTAL
     */

    if (normalized.includes("total") || normalized.includes("how much")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🧾 Your cart total is $${Number(cartTotal).toFixed(2)}.`,
        },
      ]);

      return true;
    }

    /*
     * CLEAR CART
     */

    if (normalized.includes("clear") || normalized.includes("empty")) {
      if (!cart.length) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Your cart is already empty.",
          },
        ]);

        return true;
      }

      setClearCartPending(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Are you sure you want to clear your entire cart? Reply “yes” to confirm or “no” to cancel.",
        },
      ]);

      return true;
    }

    /*
     * REMOVE PRODUCT BY NAME
     */

    if (
      normalized.includes("remove") ||
      normalized.includes("delete") ||
      normalized.includes("take out")
    ) {
      const cartItem = findCartProduct(text);

      if (!cartItem) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I couldn't identify which cart item you want to remove. Try saying something like: “Remove the iPhone 17 from my cart.”",
          },
        ]);

        return true;
      }

      try {
        await removeFromCart(cartItem.id);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `🗑️ ${cartItem.name} has been removed from your cart.`,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I couldn't remove that item from your cart.",
          },
        ]);
      }

      return true;
    }

    /*
     * INCREASE PRODUCT BY NAME
     */

    if (
      normalized.includes("increase") ||
      normalized.includes("add another") ||
      normalized.includes("one more")
    ) {
      const cartItem = findCartProduct(text);

      if (!cartItem) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I couldn't identify the product whose quantity you want to increase.",
          },
        ]);

        return true;
      }

      try {
        await increaseQuantity(cartItem.id);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `➕ Increased the quantity of ${cartItem.name}.`,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I couldn't increase that product's quantity.",
          },
        ]);
      }

      return true;
    }

    /*
     * DECREASE PRODUCT BY NAME
     */

    if (
      normalized.includes("decrease") ||
      normalized.includes("reduce") ||
      normalized.includes("one less")
    ) {
      const cartItem = findCartProduct(text);

      if (!cartItem) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I couldn't identify the product whose quantity you want to decrease.",
          },
        ]);

        return true;
      }

      try {
        await decreaseQuantity(cartItem.id);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `➖ Decreased the quantity of ${cartItem.name}.`,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I couldn't decrease that product's quantity.",
          },
        ]);
      }

      return true;
    }

    /*
     * GENERIC CART MESSAGE
     */

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `🛒 You currently have ${cartCount} ${
          cartCount === 1 ? "item" : "items"
        } in your cart, with a total of $${Number(cartTotal).toFixed(2)}.

You can ask me:
• “What's in my cart?”
• “How much is my cart?”
• “Remove the iPhone 17”
• “Increase the headphones quantity”`,
      },
    ]);

    return true;
  };

  /*
   * ---------------------------------------------------------
   * NORMAL CONVERSATION DETECTION
   *
   * This is VERY IMPORTANT.
   *
   * "thanks", "thank you", "okay", etc. should not receive
   * product cards.
   * ---------------------------------------------------------
   */

  const getLocalConversationReply = (text: string): string | null => {
    const normalized = normalizeText(text);

    /*
     * THANK YOU
     */

    if (
      /^(thanks|thank you|thank's|thx|thanks a lot|thank you so much|many thanks)$/.test(
        normalized,
      )
    ) {
      return "You're welcome! 😊 Let me know if you need anything else.";
    }

    /*
     * GOODBYE
     */

    if (/^(bye|goodbye|see you|see ya|talk to you later)$/.test(normalized)) {
      return "Goodbye! 👋 Have a great day and come back anytime.";
    }

    /*
     * GREETING
     */

    if (
      /^(hi|hello|hey|hey there|good morning|good afternoon|good evening)$/.test(
        normalized,
      )
    ) {
      return "Hi! 👋 What can I help you find today?";
    }

    /*
     * SIMPLE ACKNOWLEDGEMENT
     */

    if (
      /^(okay|ok|alright|great|perfect|cool|nice|got it|understood)$/.test(
        normalized,
      )
    ) {
      return "Great! 😊 I'm here whenever you need help.";
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * DETECT WHETHER USER ACTUALLY WANTS PRODUCTS
   *
   * We do NOT simply trust data.products from the AI.
   *
   * This prevents old product recommendations from appearing
   * after "thanks", "okay", etc.
   * ---------------------------------------------------------
   */

  const isProductRequest = (
    text: string,
    previousMessages: Message[],
  ): boolean => {
    const normalized = normalizeText(text);

    /*
     * Explicit product searches
     */

    const explicitProductWords =
      /\b(product|products|phone|phones|smartphone|smartphones|laptop|laptops|computer|computers|keyboard|keyboards|headphone|headphones|tablet|tablets|camera|cameras|monitor|monitors|watch|watches|electronics|accessories)\b/;

    if (explicitProductWords.test(normalized)) {
      return true;
    }

    /*
     * Price/product requests
     */

    if (
      /\b(under|below|less than|cheaper|cheap|price|cost|expensive|affordable|budget)\b/.test(
        normalized,
      )
    ) {
      return true;
    }

    /*
     * Recommendations
     */

    if (
      /\b(recommend|recommendation|suggest|suggestion|best|better)\b/.test(
        normalized,
      )
    ) {
      return true;
    }

    /*
     * Comparison
     */

    if (isComparisonMessage(text)) {
      return true;
    }

    /*
     * Product actions
     */

    if (
      /\b(add|buy|purchase|remove|delete|increase|decrease)\b/.test(normalized)
    ) {
      return true;
    }

    /*
     * Follow-up references such as:
     *
     * "Which one is better?"
     * "What about the second one?"
     *
     * But only when products were actually shown before.
     */

    const hasPreviousProducts = previousMessages.some(
      (message) =>
        message.role === "assistant" &&
        message.products &&
        message.products.length > 0,
    );

    if (
      hasPreviousProducts &&
      /\b(one|first|second|third|fourth|fifth|sixth|that|this|it)\b/.test(
        normalized,
      )
    ) {
      return true;
    }

    return false;
  };

  /*
   * ---------------------------------------------------------
   * SEND MESSAGE
   * ---------------------------------------------------------
   */

  const sendMessage = async (customText?: string) => {
    const text = (customText ?? input).trim();

    if (!text || isLoading || cartLoading) {
      return;
    }

    /*
     * Save history BEFORE adding the current user message.
     */

    const history = messages.slice(-10).map((message) => ({
      role: message.role,
      content: message.content,
    }));

    /*
     * Determine intent BEFORE modifying messages.
     */

    const productRequest = isProductRequest(text, messages);

    const localReply = getLocalConversationReply(text);

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    /*
     * -------------------------------------------------------
     * LOCAL NORMAL CONVERSATION
     *
     * "thanks" will stop here.
     *
     * No AI product response.
     * No product cards.
     * -------------------------------------------------------
     */

    if (localReply) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: localReply,
        },
      ]);

      return;
    }

    setIsLoading(true);

    try {
      /*
       * -----------------------------------------------------
       * PRODUCT REFERENCE ACTION
       *
       * Example:
       * "add the first one"
       * -----------------------------------------------------
       */

      const handledReference = await handleProductReferenceAction(text);

      if (handledReference) {
        return;
      }

      /*
       * -----------------------------------------------------
       * CART COMMAND
       * -----------------------------------------------------
       */

      const handledCart = await handleCartQuestion(text);

      if (handledCart) {
        return;
      }

      /*
       * -----------------------------------------------------
       * AI REQUEST
       *
       * Conversation history is now included.
       * -----------------------------------------------------
       */

      const response = await fetch(`${AI_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const data = await response.json();

      let reply =
        data.reply ||
        data.message ||
        "I'm sorry, I couldn't generate a response.";

      reply = cleanMarkdown(String(reply));

      /*
       * -----------------------------------------------------
       * IMPORTANT PRODUCT FIX
       *
       * We only accept products from the AI when the CURRENT
       * user message actually asks about products.
       *
       * This prevents:
       *
       * "thanks"
       *
       * from displaying old product cards.
       * -----------------------------------------------------
       */

      let products: Product[] = [];

      if (productRequest && Array.isArray(data.products)) {
        products = data.products;
      }

      /*
       * -----------------------------------------------------
       * FALLBACK PRODUCT SEARCH
       *
       * Only run this if the user actually asked for products.
       * Never run this for normal conversation.
       * -----------------------------------------------------
       */

      if (
        productRequest &&
        products.length === 0 &&
        !isComparisonMessage(text)
      ) {
        const allProducts = await fetchProducts();

        if (allProducts.length > 0) {
          const normalized = normalizeText(text);

          const keywords = normalized
            .split(" ")
            .filter((word) => word.length > 2);

          const filtered = allProducts.filter((product) => {
            const productText = normalizeText(
              `${product.name} ${
                product.description || ""
              } ${getCategoryName(product.category)}`,
            );

            return keywords.some((keyword) => productText.includes(keyword));
          });

          products =
            filtered.length > 0
              ? filtered.slice(0, 6)
              : allProducts.slice(0, 6);
        }
      }

      /*
       * -----------------------------------------------------
       * AI RESPONSE
       *
       * If productRequest is FALSE, products is ALWAYS [].
       * -----------------------------------------------------
       */

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          products: products.length > 0 ? products : undefined,
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry 😕 I couldn't connect to the AI assistant right now. Please make sure the AI service is running on port 8000.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * ENTER KEY
   * ---------------------------------------------------------
   */

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  /*
   * ---------------------------------------------------------
   * CLEAR CHAT
   * ---------------------------------------------------------
   */

  const clearChat = () => {
    stopSpeaking();
    setClearCartPending(false);

    setMessages([INITIAL_MESSAGE]);
  };

  /*
   * ---------------------------------------------------------
   * PRODUCT COMPARISON
   * ---------------------------------------------------------
   */

  const renderComparison = (products: Product[]) => {
    const comparisonProducts = products.slice(0, 4);

    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Category
                </th>
              </tr>
            </thead>

            <tbody>
              {comparisonProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product.name}
                  </td>

                  <td className="px-4 py-3 font-semibold text-green-600">
                    ${Number(product.price).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    {(product.stock ?? 0) > 0
                      ? `${product.stock} left`
                      : "Out of stock"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {getCategoryName(product.category)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * PRODUCT CARDS
   * ---------------------------------------------------------
   */

  const renderProducts = (products: Product[], comparison = false) => {
    if (!products.length) return null;

    if (comparison) {
      return renderComparison(products);
    }

    return (
      <div className="mt-4 grid grid-cols-1 gap-3">
        {products.slice(0, 6).map((product) => {
          const inStock = (product.stock ?? 0) > 0;

          return (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex gap-3 p-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop";
                    }}
                  />

                  <span
                    className={`absolute left-1.5 top-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${
                      inStock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {getCategoryName(product.category)}
                  </div>

                  <h3 className="truncate text-sm font-bold text-gray-900">
                    {product.name}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                    {product.description ||
                      "Quality product available at ShopEase."}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-extrabold text-green-600">
                      ${Number(product.price).toFixed(2)}
                    </span>

                    <span className="text-[11px] text-gray-500">
                      {inStock ? `${product.stock} left` : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-2">
                <Link
                  href={`/products/${product.id}`}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  View
                </Link>

                <button
                  type="button"
                  disabled={!inStock || cartLoading}
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * CART SUMMARY
   * ---------------------------------------------------------
   */

  const renderCartSummary = () => {
    return (
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        {cart.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="mb-2 text-3xl">🛒</div>

            <p className="text-sm font-semibold text-gray-800">
              Your cart is empty
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Add some products to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Your Cart</p>

                <p className="text-xs text-gray-500">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </p>
              </div>

              <p className="text-base font-extrabold text-green-600">
                ${Number(cartTotal).toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              {cart.slice(0, 4).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl bg-white p-2"
                >
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">
                      {item.name}
                    </p>

                    <p className="text-[11px] text-gray-500">
                      Qty: {item.quantity || 1}
                    </p>
                  </div>

                  <p className="text-xs font-bold text-gray-700">
                    $
                    {(Number(item.price) * Number(item.quantity || 1)).toFixed(
                      2,
                    )}
                  </p>
                </div>
              ))}
            </div>

            {cart.length > 4 && (
              <p className="mt-2 text-center text-[11px] text-gray-500">
                + {cart.length - 4} more items
              </p>
            )}

            <Link
              href="/cart"
              className="mt-3 block rounded-xl bg-gray-900 px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-gray-800"
            >
              Open Cart
            </Link>
          </>
        )}
      </div>
    );
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-9999 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-emerald-700 text-2xl text-white shadow-2xl transition duration-200 hover:scale-105"
          aria-label="Open ShopEase AI"
        >
          <span className="relative">
            🤖
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-300" />
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-9999 flex h-[min(760px,calc(100vh-32px))] w-[min(440px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          {/* HEADER */}

          <div className="flex items-center justify-between bg-linear-to-r from-green-600 to-emerald-700 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
                🤖
              </div>

              <div>
                <h2 className="text-base font-bold">ShopEase AI</h2>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-300" />

                  <span className="text-[11px] text-green-50">
                    Online • Ready to help
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowCartSummary((prev) => !prev)}
                className="rounded-xl p-2 text-white/90 transition hover:bg-white/10"
                title="Cart"
              >
                🛒
              </button>

              <button
                type="button"
                onClick={clearChat}
                className="rounded-xl p-2 text-white/90 transition hover:bg-white/10"
                title="Clear chat"
              >
                🧹
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-white/90 transition hover:bg-white/10"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* CART */}

          {showCartSummary && renderCartSummary()}

          {/* QUICK QUESTIONS */}

          {messages.length <= 1 && !showCartSummary && (
            <div className="border-b border-gray-100 bg-white px-3 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Try asking
              </p>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="shrink-0 rounded-full border border-green-100 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}

          <div className="flex-1 overflow-y-auto bg-linear-to-b from-gray-50 to-white px-3 py-4">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const comparison =
                  message.products &&
                  message.products.length > 0 &&
                  isComparisonMessage(messages[index - 1]?.content || "");

                return (
                  <div
                    key={`${index}-${message.role}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[92%] ${
                        message.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-gray-400">
                          {message.role === "user" ? "You" : "ShopEase AI"}
                        </span>
                      </div>

                      <div
                        className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "rounded-br-md bg-green-600 text-white shadow-sm"
                            : "rounded-bl-md border border-gray-100 bg-white text-gray-700 shadow-sm"
                        }`}
                      >
                        {message.content}
                      </div>

                      {message.role === "assistant" && (
                        <div className="mt-1.5 flex items-center gap-2">
                          {!isSpeaking ? (
                            <button
                              type="button"
                              onClick={() => speakText(message.content)}
                              className="text-[10px] font-medium text-gray-400 transition hover:text-green-600"
                            >
                              🔊 Listen
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={stopSpeaking}
                              className="text-[10px] font-medium text-red-500 transition hover:text-red-600"
                            >
                              ⏹ Stop
                            </button>
                          )}
                        </div>
                      )}

                      {message.products &&
                        message.products.length > 0 &&
                        (productRequestForDisplay(messages, index) ||
                          comparison) &&
                        renderProducts(message.products, Boolean(comparison))}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-500" />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-green-500"
                        style={{
                          animationDelay: "120ms",
                        }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-green-500"
                        style={{
                          animationDelay: "240ms",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* INPUT */}

          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 focus-within:border-green-400 focus-within:bg-white">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading || cartLoading}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={startVoiceInput}
                disabled={isLoading}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  isListening
                    ? "bg-red-100 text-red-600"
                    : "text-gray-500 hover:bg-green-100 hover:text-green-600"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                🎤
              </button>

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || cartLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                title="Send"
              >
                ➤
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-gray-400">
              ShopEase AI • Smart shopping assistant
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/*
 * ---------------------------------------------------------
 * PRODUCT DISPLAY CHECK
 *
 * This extra protection ensures that even if the backend
 * accidentally returns products for "thanks", "okay", etc.,
 * the UI does NOT display them.
 * ---------------------------------------------------------
 */

function productRequestForDisplay(
  messages: Message[],
  assistantIndex: number,
): boolean {
  const previousUserMessage = [...messages]
    .slice(0, assistantIndex)
    .reverse()
    .find((message) => message.role === "user");

  if (!previousUserMessage) {
    return false;
  }

  const text = normalizeText(previousUserMessage.content);

  /*
   * Never display products for these conversational messages.
   */

  if (
    /^(thanks|thank you|thank's|thx|thanks a lot|thank you so much|many thanks|okay|ok|alright|great|perfect|cool|nice|got it|understood|bye|goodbye|see you|see ya)$/.test(
      text,
    )
  ) {
    return false;
  }

  /*
   * Product-related requests.
   */

  if (
    /\b(product|products|phone|phones|smartphone|smartphones|laptop|laptops|computer|computers|keyboard|keyboards|headphone|headphones|tablet|tablets|camera|cameras|monitor|monitors|watch|watches|electronics|accessories)\b/.test(
      text,
    )
  ) {
    return true;
  }

  if (
    /\b(recommend|recommendation|suggest|suggestion|best|better|compare|comparison|difference|versus|vs|price|cost|under|below|budget|cheaper)\b/.test(
      text,
    )
  ) {
    return true;
  }

  /*
   * Reference follow-up.
   */

  if (
    /\b(first|second|third|fourth|fifth|sixth|one|two|three|four|five|six|that one|this one|that product|this product|it)\b/.test(
      text,
    )
  ) {
    return true;
  }

  return false;
}
