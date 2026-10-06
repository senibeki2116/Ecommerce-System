"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "./Context/CartContext";
import Chatbot from "../components/Chatbot";
import { getApiUrl } from "../lib/api";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
};

type Category = {
  id: number;
  name: string;
  image?: string | null;
};

type WishlistItem = {
  id: number;
  productId: number;
  product: Product;
};

type WishlistResponse = {
  id: number;
  userId: number;
  items: WishlistItem[];
};

const API_URL = getApiUrl();

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85";

const CATEGORY_FALLBACKS: Record<string, string> = {
  electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80",

  accessories:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",

  cameras:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",

  audio:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",

  gaming:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",

  fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",

  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",

  beauty:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",

  sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80";

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function HomePage() {
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const [search, setSearch] = useState("");
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  // Full-screen desktop hover menu
  const [shopMenuOpen, setShopMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data?.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data?.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Product fetch error:", err);
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoryError("");

        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data?.categories)) {
          setCategories(data.categories);
        } else if (Array.isArray(data?.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Category fetch error:", err);
        setCategoryError("Unable to load categories.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setWishlist([]);
        return;
      }

      try {
        setWishlistLoading(true);

        const response = await fetch(`${API_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setWishlist([]);
            return;
          }

          throw new Error("Failed to load wishlist");
        }

        const data: WishlistResponse = await response.json();

        const productIds =
          data?.items?.map((item) => Number(item.productId)) ?? [];

        setWishlist(productIds);
      } catch (err) {
        console.error("Wishlist fetch error:", err);
        setWishlist([]);
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setWishlist([]);
    setMenuOpen(false);
    setShopMenuOpen(false);

    window.location.href = "/";
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);

    setAddedProductId(product.id);

    window.setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1500);
  };

  const toggleWishlist = async (productId: number) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setWishlistLoading(true);

      const alreadyInWishlist = wishlist.includes(productId);

      const response = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: alreadyInWishlist ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Wishlist update failed");
      }

      setWishlist((current) => {
        if (alreadyInWishlist) {
          return current.filter((id) => id !== productId);
        }

        return [...current, productId];
      });
    } catch (err) {
      console.error("Wishlist update error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const featuredProducts = filteredProducts.slice(0, 8);

  const dealProducts = useMemo(() => {
    return products.filter((product) => product.stock > 0).slice(0, 6);
  }, [products]);

  const getDealDiscount = (index: number) => {
    const discounts = [25, 20, 30, 15, 25, 20];
    return discounts[index % discounts.length];
  };

  const getDealPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const getCategoryImage = (category: Category) => {
    const image = category.image?.trim();

    if (
      image &&
      !image.includes("example.com") &&
      !image.includes("placeholder")
    ) {
      return image;
    }

    const categoryName = category.name.toLowerCase();

    const matchedKey = Object.keys(CATEGORY_FALLBACKS).find((key) =>
      categoryName.includes(key),
    );

    return matchedKey ? CATEGORY_FALLBACKS[matchedKey] : DEFAULT_CATEGORY_IMAGE;
  };

  const getProductImage = (product: Product) => {
    if (
      product.image &&
      product.image.trim() &&
      !product.image.includes("example.com")
    ) {
      return product.image;
    }

    return DEFAULT_PRODUCT_IMAGE;
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* TOP ANNOUNCEMENT */}
      <div className="bg-slate-950 px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm">
        Free delivery on qualifying orders
        <span className="mx-2 text-slate-500">·</span>
        Secure checkout
        <span className="mx-2 text-slate-500">·</span>
        Shop with confidence
      </div>

      {/* ================= HEADER ================= */}
      <header
        className={`sticky top-0 z-100 border-b border-slate-200 bg-white/95 backdrop-blur transition-all duration-300 ${
          shopMenuOpen ? "shadow-xl" : ""
        }`}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-blue-600 lg:hidden"
            aria-label="Open menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>

          {/* LOGO */}
          <Link
            href="/"
            className="group flex min-w-fit items-center gap-2.5"
            onMouseEnter={() => setShopMenuOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-blue-700 group-hover:shadow-lg group-hover:shadow-blue-600/20">
              ES
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-lg font-black tracking-tight text-slate-950 transition group-hover:text-blue-600">
                E-Shop
              </p>

              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Smart shopping
              </p>
            </div>
          </Link>

          {/* ================= SHOP HOVER AREA ================= */}
          <div
            className="relative ml-2 hidden h-full items-center lg:flex"
            onMouseEnter={() => setShopMenuOpen(true)}
            onMouseLeave={() => setShopMenuOpen(false)}
          >
            <button
              type="button"
              className={`relative flex h-full items-center gap-1 px-4 text-sm font-bold transition duration-200 ${
                shopMenuOpen
                  ? "text-blue-600"
                  : "text-slate-700 hover:text-blue-600"
              }`}
            >
              Shop
              <span
                className={`text-xs transition-transform duration-300 ${
                  shopMenuOpen ? "rotate-180" : ""
                }`}
              >
                ⌄
              </span>
              <span
                className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 transition-all duration-300 ${
                  shopMenuOpen ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>

            {/* FULL SCREEN HOVER OVERLAY */}
            {shopMenuOpen && (
              <div
                className="fixed left-0 right-0 top-26 z-90 h-[calc(100vh-104px)] bg-slate-950/55 backdrop-blur-[3px]"
                onMouseEnter={() => setShopMenuOpen(true)}
                onMouseLeave={() => setShopMenuOpen(false)}
              >
                <div
                  className="mx-auto h-full max-w-7xl overflow-y-auto px-4 pb-10 pt-5 sm:px-6 lg:px-8"
                  onMouseEnter={() => setShopMenuOpen(true)}
                  onMouseLeave={() => setShopMenuOpen(false)}
                >
                  <div
                    className="overflow-hidden rounded-4xl border border-white/10 bg-white shadow-2xl shadow-black/30"
                    onMouseEnter={() => setShopMenuOpen(true)}
                  >
                    {/* MENU TOP */}
                    <div className="border-b border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-blue-950 px-7 py-8 text-white md:px-10">
                      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                            E-SHOP MENU
                          </p>

                          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                            What are you looking for?
                          </h2>

                          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                            Explore products, categories, deals and everything
                            you need from one place.
                          </p>
                        </div>

                        <Link
                          href="/products"
                          onClick={() => setShopMenuOpen(false)}
                          className="inline-flex w-fit items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50"
                        >
                          Explore Products
                          <span className="ml-2">→</span>
                        </Link>
                      </div>
                    </div>

                    {/* MENU CONTENT */}
                    <div className="grid gap-8 p-7 md:grid-cols-3 md:p-10">
                      {/* SHOP */}
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                            🛍️
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                              Shop
                            </p>

                            <h3 className="font-black text-slate-950">
                              Discover
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link
                            href="/"
                            onClick={() => setShopMenuOpen(false)}
                            className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:translate-x-1 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <span>Home</span>
                            <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                              →
                            </span>
                          </Link>

                          <Link
                            href="/products"
                            onClick={() => setShopMenuOpen(false)}
                            className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:translate-x-1 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <span>All Products</span>
                            <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                              →
                            </span>
                          </Link>

                          <Link
                            href="/categories"
                            onClick={() => setShopMenuOpen(false)}
                            className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:translate-x-1 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <span>Categories</span>
                            <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                              →
                            </span>
                          </Link>

                          <Link
                            href="/products"
                            onClick={() => setShopMenuOpen(false)}
                            className="group flex items-center justify-between rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition duration-200 hover:translate-x-1 hover:bg-blue-700"
                          >
                            <span>🔥 Today&apos;s Deals</span>
                            <span className="transition group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        </div>
                      </div>

                      {/* CATEGORIES */}
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                            📦
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                              Categories
                            </p>

                            <h3 className="font-black text-slate-950">
                              Explore
                            </h3>
                          </div>
                        </div>

                        {categories.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {categories.slice(0, 8).map((category) => (
                              <Link
                                key={category.id}
                                href={`/products?category=${encodeURIComponent(
                                  category.name,
                                )}`}
                                onClick={() => setShopMenuOpen(false)}
                                className="group rounded-2xl border border-slate-200 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                                    {getInitials(category.name)}
                                  </div>

                                  <span className="line-clamp-1 text-xs font-bold text-slate-700 group-hover:text-blue-600">
                                    {category.name}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                            Categories are loading...
                          </div>
                        )}
                      </div>

                      {/* CUSTOMER */}
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-lg">
                            ❤️
                          </div>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-rose-500">
                              Customer
                            </p>

                            <h3 className="font-black text-slate-950">
                              Your Account
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link
                            href="/orders"
                            onClick={() => setShopMenuOpen(false)}
                            className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:translate-x-1 hover:bg-slate-50 hover:text-blue-600"
                          >
                            <span>📦 My Orders</span>
                            <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                              →
                            </span>
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={() => setShopMenuOpen(false)}
                            className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:translate-x-1 hover:bg-rose-50 hover:text-rose-500"
                          >
                            <span>♡ Wishlist</span>

                            {wishlist.length > 0 ? (
                              <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-black text-rose-600">
                                {wishlist.length}
                              </span>
                            ) : (
                              <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                                →
                              </span>
                            )}
                          </Link>

                          <Link
                            href="/cart"
                            onClick={() => setShopMenuOpen(false)}
                            className="group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:translate-x-1 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <span>🛒 Shopping Cart</span>

                            {cartCount > 0 ? (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black text-blue-600">
                                {cartCount}
                              </span>
                            ) : (
                              <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                                →
                              </span>
                            )}
                          </Link>

                          <Link
                            href={isLoggedIn ? "/profile" : "/login"}
                            onClick={() => setShopMenuOpen(false)}
                            className="group flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition duration-200 hover:translate-x-1 hover:bg-blue-600"
                          >
                            <span>
                              {isLoggedIn
                                ? "👤 My Profile"
                                : "🔐 Login / Register"}
                            </span>

                            <span className="transition group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM FEATURE BAR */}
                    <div className="grid border-t border-slate-200 bg-slate-50 md:grid-cols-4">
                      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r">
                        <span className="text-xl">🚚</span>

                        <div>
                          <p className="text-xs font-black text-slate-900">
                            Reliable Delivery
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Convenient shopping
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r">
                        <span className="text-xl">🔒</span>

                        <div>
                          <p className="text-xs font-black text-slate-900">
                            Secure Checkout
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Shop with confidence
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r">
                        <span className="text-xl">🤖</span>

                        <div>
                          <p className="text-xs font-black text-slate-900">
                            AI Assistant
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Smart product help
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 px-6 py-5">
                        <span className="text-xl">✨</span>

                        <div>
                          <p className="text-xs font-black text-slate-900">
                            Easy Shopping
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500">
                            Simple experience
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div className="relative ml-auto hidden max-w-xl flex-1 md:block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔎
            </span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* WISHLIST */}
          <Link
            href="/wishlist"
            onMouseEnter={() => setShopMenuOpen(false)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-xl transition duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-500"
            aria-label="Wishlist"
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              ♡
            </span>

            {wishlist.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* CART */}
          <Link
            href="/cart"
            onMouseEnter={() => setShopMenuOpen(false)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-xl transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-600"
            aria-label="Cart"
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              🛒
            </span>

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* LOGIN / LOGOUT */}
          {isLoggedIn ? (
            <button
              type="button"
              onMouseEnter={() => setShopMenuOpen(false)}
              onClick={handleLogout}
              className="hidden rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20 sm:block"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onMouseEnter={() => setShopMenuOpen(false)}
              className="hidden rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20 sm:block"
            >
              Login
            </Link>
          )}
        </div>

        {/* MOBILE SEARCH */}
        <div className="border-t border-slate-100 px-4 py-3 md:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔎
            </span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-200 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />

          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                  ES
                </div>

                <div>
                  <p className="font-black">E-Shop</p>
                  <p className="text-xs text-slate-400">Smart shopping</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl transition hover:bg-blue-50 hover:text-blue-600"
              >
                ×
              </button>
            </div>

            <div className="mt-8 space-y-2">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold transition hover:bg-blue-50 hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold transition hover:bg-blue-50 hover:text-blue-600"
              >
                All Products
              </Link>

              <Link
                href="/categories"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold transition hover:bg-blue-50 hover:text-blue-600"
              >
                Categories
              </Link>

              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold transition hover:bg-blue-50 hover:text-blue-600"
              >
                My Orders
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold transition hover:bg-blue-50 hover:text-blue-600"
              >
                Wishlist
              </Link>

              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 font-semibold transition hover:bg-blue-50 hover:text-blue-600"
              >
                Shopping Cart
              </Link>

              <div className="my-4 border-t border-slate-200" />

              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-3 font-semibold transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-slate-950 px-4 py-3 text-left font-semibold text-white transition hover:bg-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-blue-600"
                >
                  Login
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              New shopping experience
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Everything you need.
              <span className="block text-blue-600">All in one place.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Discover quality products, find great deals, build your wishlist
              and shop faster with a smarter E-Shop experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Explore Products
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/categories"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                Browse Categories
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-black text-slate-950">
                  {products.length}+
                </p>

                <p className="mt-1 text-xs text-slate-500">Products</p>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">
                  {categories.length}+
                </p>

                <p className="mt-1 text-xs text-slate-500">Categories</p>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">100%</p>

                <p className="mt-1 text-xs text-slate-500">Secure shopping</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-4xl bg-white shadow-2xl shadow-slate-300/40">
              <img
                src={HERO_IMAGE}
                alt="E-Shop shopping experience"
                className="h-80 w-full object-cover sm:h-96 lg:h-105"
              />
            </div>

            <div className="absolute -bottom-5 left-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl transition duration-300 hover:-translate-y-1 sm:left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Secure shopping
                  </p>

                  <p className="text-xs text-slate-500">
                    Safe & reliable checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TODAY'S DEALS ================= */}
      <section className="px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">🔥</span>

                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Limited-time offers
                </p>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Today&apos;s Deals
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Grab selected products at special promotional prices before
                they&apos;re gone.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center text-sm font-bold text-blue-600 transition hover:translate-x-1 hover:text-blue-700"
            >
              View all products →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                >
                  <div className="h-44 animate-pulse bg-slate-100" />

                  <div className="space-y-3 p-4">
                    <div className="h-4 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : dealProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="text-4xl">🛍️</div>

              <h3 className="mt-3 text-lg font-bold">Deals are coming soon</h3>

              <p className="mt-2 text-sm text-slate-500">
                Check back soon for special offers.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {dealProducts.map((product, index) => {
                const discount = getDealDiscount(index);
                const dealPrice = getDealPrice(product.price, discount);

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                  >
                    <div className="relative">
                      <Link href={`/products/${product.id}`}>
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </Link>

                      <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black text-white">
                        -{discount}%
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        disabled={wishlistLoading}
                        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-lg shadow-sm transition hover:scale-110 ${
                          wishlist.includes(product.id)
                            ? "text-rose-500"
                            : "text-slate-500 hover:text-rose-500"
                        }`}
                        aria-label="Toggle wishlist"
                      >
                        {wishlist.includes(product.id) ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="p-4">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                        Today&apos;s deal
                      </p>

                      <Link
                        href={`/products/${product.id}`}
                        className="line-clamp-2 min-h-10 text-sm font-bold text-slate-900 hover:text-blue-600"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-lg font-black text-slate-950">
                          ${dealPrice.toFixed(2)}
                        </span>

                        <span className="text-xs text-slate-400 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">
                          {product.stock} left
                        </span>

                        <span className="font-bold text-emerald-600">
                          Save ${(product.price - dealPrice).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={`mt-4 w-full rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                          addedProductId === product.id
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-950 text-white hover:bg-blue-600"
                        }`}
                      >
                        {addedProductId === product.id
                          ? "✓ Added to Cart"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="bg-slate-50 px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Explore the store
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Shop by category
              </h2>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Find exactly what you&apos;re looking for.
              </p>
            </div>

            <Link
              href="/categories"
              className="text-sm font-bold text-blue-600 transition hover:translate-x-1 hover:text-blue-700"
            >
              View all categories →
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-3xl bg-slate-200"
                />
              ))}
            </div>
          ) : categoryError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
              <p className="text-sm font-semibold text-rose-700">
                {categoryError}
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold text-slate-700">
                No categories available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(
                    category.name,
                  )}`}
                  className="group relative overflow-hidden rounded-3xl bg-slate-900"
                >
                  <img
                    src={getCategoryImage(category)}
                    alt={category.name}
                    className="h-52 w-full object-cover opacity-80 transition duration-500 group-hover:scale-110 group-hover:opacity-70"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-xs font-black text-white backdrop-blur">
                      {getInitials(category.name)}
                    </div>

                    <h3 className="text-base font-black text-white">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-xs text-white/70">
                      Explore products →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= TRENDING PRODUCTS ================= */}
      <section className="px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Popular right now
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Trending products
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Discover products customers are checking out right now.
              </p>
            </div>

            <Link
              href="/products"
              className="text-sm font-bold text-blue-600 transition hover:translate-x-1 hover:text-blue-700"
            >
              Explore all products →
            </Link>
          </div>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
              <p className="font-semibold text-rose-700">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-slate-200"
                >
                  <div className="h-64 animate-pulse bg-slate-100" />

                  <div className="space-y-3 p-5">
                    <div className="h-4 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <div className="text-5xl">🔎</div>

              <h3 className="mt-4 text-xl font-black">No products found</h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search term.
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                  >
                    <div className="relative overflow-hidden bg-slate-100">
                      <Link href={`/products/${product.id}`}>
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </Link>

                      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-600 shadow-sm">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        disabled={wishlistLoading}
                        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl shadow-sm transition hover:scale-110 ${
                          isWishlisted
                            ? "text-rose-500"
                            : "text-slate-500 hover:text-rose-500"
                        }`}
                        aria-label="Toggle wishlist"
                      >
                        {isWishlisted ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-center gap-1 text-xs">
                        <span className="text-amber-400">★★★★★</span>

                        <span className="text-slate-400">Popular</span>
                      </div>

                      <Link
                        href={`/products/${product.id}`}
                        className="line-clamp-1 text-lg font-black text-slate-950 transition hover:text-blue-600"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {product.description ||
                          "Quality product available at E-Shop."}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <div>
                          <p className="text-xl font-black text-slate-950">
                            ${product.price.toFixed(2)}
                          </p>

                          <p className="text-xs text-slate-400">
                            Available stock: {product.stock}
                          </p>
                        </div>

                        <Link
                          href={`/products/${product.id}`}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          View
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold transition ${
                          product.stock <= 0
                            ? "cursor-not-allowed bg-slate-200 text-slate-400"
                            : addedProductId === product.id
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-950 text-white hover:bg-blue-600"
                        }`}
                      >
                        {product.stock <= 0
                          ? "Out of Stock"
                          : addedProductId === product.id
                            ? "✓ Added to Cart"
                            : "Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= PROMO ================= */}
      <section className="px-5 pb-16 sm:px-6 md:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-4xl bg-slate-950">
          <div className="grid items-center gap-10 px-7 py-12 md:px-12 md:py-16 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                A better way to shop
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                Better products.
                <span className="block text-blue-400">Better shopping.</span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Save your favorites, manage your cart, compare products and
                enjoy a secure shopping experience designed around you.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Start Shopping
                <span className="ml-2">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15">
                <div className="text-2xl">🚚</div>

                <h3 className="mt-4 font-bold text-white">Reliable Delivery</h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Convenient order delivery.
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15">
                <div className="text-2xl">🔒</div>

                <h3 className="mt-4 font-bold text-white">Secure Checkout</h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Shop with confidence.
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15">
                <div className="text-2xl">♡</div>

                <h3 className="mt-4 font-bold text-white">Save Favorites</h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Keep products you love.
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5 transition hover:bg-white/15">
                <div className="text-2xl">✨</div>

                <h3 className="mt-4 font-bold text-white">Easy Shopping</h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Simple and modern experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST FEATURES ================= */}
      <section className="bg-slate-50 px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                ⚡
              </div>

              <h3 className="mt-5 text-lg font-black">Fast & reliable</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Browse products, manage your cart and place orders with a smooth
                shopping experience.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                🔒
              </div>

              <h3 className="mt-5 text-lg font-black">Secure shopping</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your account and checkout experience are protected with secure
                authentication and payment workflows.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
                ♥
              </div>

              <h3 className="mt-5 text-lg font-black">Quality products</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Discover products across multiple categories and save your
                favorites for later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AI ASSISTANT ================= */}
      <section className="px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-4xl bg-blue-600 px-7 py-12 md:px-12 md:py-14">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-white/5" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white">
                  🤖 AI SHOPPING ASSISTANT
                </div>

                <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Need help finding the right product?
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                  Ask our AI assistant to search products, compare options, find
                  products within your budget and even help manage your cart.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                    🔎 Product search
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                    ⚖️ Compare products
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                    🛒 Cart assistance
                  </span>
                </div>
              </div>

              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 text-5xl backdrop-blur transition duration-300 hover:scale-110">
                🤖
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white transition group-hover:bg-blue-700">
                  ES
                </div>

                <div>
                  <p className="font-black text-slate-950 group-hover:text-blue-600">
                    E-Shop
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    Smart shopping
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                A modern e-commerce experience designed to make discovering,
                comparing and purchasing products easier.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-950">Shop</h3>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <Link
                  href="/products"
                  className="block transition hover:translate-x-1 hover:text-blue-600"
                >
                  Products
                </Link>

                <Link
                  href="/categories"
                  className="block transition hover:translate-x-1 hover:text-blue-600"
                >
                  Categories
                </Link>

                <Link
                  href="/cart"
                  className="block transition hover:translate-x-1 hover:text-blue-600"
                >
                  Shopping Cart
                </Link>

                <Link
                  href="/wishlist"
                  className="block transition hover:translate-x-1 hover:text-blue-600"
                >
                  Wishlist
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-950">Account</h3>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <Link
                  href="/profile"
                  className="block transition hover:translate-x-1 hover:text-blue-600"
                >
                  Profile
                </Link>

                <Link
                  href="/orders"
                  className="block transition hover:translate-x-1 hover:text-blue-600"
                >
                  My Orders
                </Link>

                <Link
                  href="/login"
                  className="block transition hover:translate-x-1 hover:text-blue-600"
                >
                  Login
                </Link>

                <p>support@eshop.com</p>
                <p>+251 900 000 000</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} E-Shop. All rights reserved.</p>

            <p>Main Store · Ethiopia</p>
          </div>
        </div>
      </footer>

      {/* AI CHATBOT */}
      <Chatbot />
    </main>
  );
}
