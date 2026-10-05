"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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

const categoryFallbackImages: Record<string, string> = {
  electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&auto=format&fit=crop",
  accessories:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop",
  cameras:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop",
  audio:
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&auto=format&fit=crop",
  gaming:
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=900&auto=format&fit=crop",
  fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&auto=format&fit=crop",
  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop",
  beauty:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&auto=format&fit=crop",
  sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop",
};

const defaultCategoryImage =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop";

const defaultProductImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";

const heroImage =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=90";

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

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  // Hamburger menu
  const [menuOpen, setMenuOpen] = useState(false);

  // E-Shop mega menu
  const [shopMenuOpen, setShopMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setShopMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Products request failed: ${response.status}`);
      }

      const data = await response.json();

      const productList: Product[] = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
            ? data.data
            : [];

      setProducts(productList);
    } catch (err) {
      console.error("Product error:", err);

      setError(
        "Could not load products. Please make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoryError("");

      const response = await fetch(`${API_URL}/categories`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Categories request failed: ${response.status}`);
      }

      const data = await response.json();

      const categoryList: Category[] = Array.isArray(data)
        ? data
        : Array.isArray(data.categories)
          ? data.categories
          : Array.isArray(data.data)
            ? data.data
            : [];

      setCategories(categoryList);
    } catch (err) {
      console.error("Category error:", err);

      setCategoryError("Could not load categories.");
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchWishlist = async () => {
    const token = getToken();

    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        setWishlist([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Wishlist request failed: ${response.status}`);
      }

      const data: WishlistResponse = await response.json();

      const ids = Array.isArray(data.items)
        ? data.items.map((item) => item.productId)
        : [];

      setWishlist(ids);
    } catch (err) {
      console.error("Wishlist error:", err);
      setWishlist([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
    if (product.stock <= 0) return;

    addToCart(product);
    setAddedProductId(product.id);

    window.setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  const toggleWishlist = async (productId: number) => {
    const token = getToken();

    if (!token) {
      alert("Please login first to use your wishlist.");
      window.location.href = "/login";
      return;
    }

    try {
      setWishlistLoading(true);

      const isWishlisted = wishlist.includes(productId);

      if (isWishlisted) {
        const response = await fetch(`${API_URL}/wishlist/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          throw new Error(
            data?.message || "Could not remove product from wishlist.",
          );
        }

        setWishlist((current) => current.filter((id) => id !== productId));

        return;
      }

      const response = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.message || "Could not add product to wishlist.");
      }

      setWishlist((current) =>
        current.includes(productId) ? current : [...current, productId],
      );
    } catch (err) {
      console.error("Wishlist error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong with wishlist.",
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";

      return name.includes(query) || description.includes(query);
    });
  }, [products, search]);

  const featuredProducts = filteredProducts.slice(0, 8);

  const getCategoryImage = (category: Category) => {
    const name = category.name?.trim().toLowerCase() || "";

    if (
      category.image &&
      category.image.trim() !== "" &&
      !category.image.includes("example.com")
    ) {
      return category.image;
    }

    if (categoryFallbackImages[name]) {
      return categoryFallbackImages[name];
    }

    const keyword = Object.keys(categoryFallbackImages).find((key) =>
      name.includes(key),
    );

    return keyword ? categoryFallbackImages[keyword] : defaultCategoryImage;
  };

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newsletterEmail.trim()) {
      setNewsletterMessage("Please enter your email address.");
      return;
    }

    setNewsletterMessage("Thanks! You're now subscribed to E-Shop.");

    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {/* =========================================================
          TOP ANNOUNCEMENT
      ========================================================= */}
      <div className="bg-slate-950 px-4 py-2.5 text-center text-xs font-bold text-white">
        <span className="text-blue-400">●</span> Free delivery on qualifying
        orders · Secure checkout
      </div>

      {/* =========================================================
          HEADER
      ========================================================= */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-200 ${
          shopMenuOpen
            ? "border-blue-200 bg-white shadow-lg"
            : "border-slate-200/80 bg-white/95"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-5 md:px-8">
          {/* HAMBURGER */}
          <button
            type="button"
            onClick={() => {
              setShopMenuOpen(false);
              setMenuOpen(true);
            }}
            className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-all duration-200 hover:bg-slate-950"
            aria-label="Open navigation menu"
          >
            <span className="pointer-events-none absolute left-1/2 top-full z-[100] mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              Menu
            </span>

            <span className="flex w-5 flex-col gap-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-slate-900 transition-colors duration-200 group-hover:bg-white" />
              <span className="block h-0.5 w-5 rounded-full bg-slate-900 transition-colors duration-200 group-hover:bg-white" />
              <span className="block h-0.5 w-5 rounded-full bg-slate-900 transition-colors duration-200 group-hover:bg-white" />
            </span>
          </button>

          {/* =====================================================
              E-SHOP MEGA MENU TRIGGER
          ===================================================== */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setShopMenuOpen(true)}
            onMouseLeave={() => setShopMenuOpen(false)}
          >
            <Link
              href="/"
              aria-expanded={shopMenuOpen}
              className={`flex items-center gap-2.5 rounded-2xl px-2 py-1.5 transition-all duration-200 ${
                shopMenuOpen ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-base shadow-md transition-all duration-200 ${
                  shopMenuOpen
                    ? "scale-105 bg-blue-600 shadow-lg"
                    : "bg-slate-950"
                }`}
              >
                🛍️
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <p
                    className={`text-lg font-black tracking-tight transition-colors duration-200 ${
                      shopMenuOpen ? "text-blue-600" : "text-slate-950"
                    }`}
                  >
                    E-Shop
                  </p>

                  <span
                    className={`text-xs font-black transition-transform duration-200 ${
                      shopMenuOpen
                        ? "rotate-180 text-blue-600"
                        : "text-slate-400"
                    }`}
                  >
                    ⌄
                  </span>
                </div>

                <p
                  className={`hidden text-[8px] font-bold uppercase tracking-[0.25em] transition-colors duration-200 sm:block ${
                    shopMenuOpen ? "text-blue-500" : "text-slate-400"
                  }`}
                >
                  Shop smarter
                </p>
              </div>
            </Link>
          </div>

          {/* DESKTOP SEARCH */}
          <div className="ml-auto hidden max-w-md flex-1 lg:block">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="ml-auto flex items-center gap-1.5 lg:ml-4">
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-xl text-slate-600 transition hover:bg-slate-100 hover:text-red-500"
              aria-label="Wishlist"
            >
              ♡
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-lg text-slate-600 transition hover:bg-slate-100"
              aria-label="Cart"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[8px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <Link
                href="/profile"
                className="hidden rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600 sm:block"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-600 sm:px-5"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <div className="border-t border-slate-100 px-4 py-3 lg:hidden">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        {/* =====================================================
            MEGA MENU
        ===================================================== */}
        <div
          onMouseEnter={() => setShopMenuOpen(true)}
          onMouseLeave={() => setShopMenuOpen(false)}
          className={`absolute left-0 right-0 top-full border-b border-slate-200 bg-white shadow-2xl transition-all duration-200 ${
            shopMenuOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* SHOP */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Shop
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-950">
                  Discover our store
                </h3>

                <div className="mt-5 space-y-1">
                  <Link
                    href="/"
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-blue-600 group-hover:text-white">
                      🏠
                    </span>

                    <span>
                      <span className="block text-sm font-black text-slate-800 group-hover:text-blue-600">
                        Home
                      </span>

                      <span className="block text-xs text-slate-400">
                        Back to homepage
                      </span>
                    </span>
                  </Link>

                  <Link
                    href="/products"
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-blue-600 group-hover:text-white">
                      🛍️
                    </span>

                    <span>
                      <span className="block text-sm font-black text-slate-800 group-hover:text-blue-600">
                        All Products
                      </span>

                      <span className="block text-xs text-slate-400">
                        Browse the full collection
                      </span>
                    </span>
                  </Link>

                  <Link
                    href="/categories"
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-blue-600 group-hover:text-white">
                      📂
                    </span>

                    <span>
                      <span className="block text-sm font-black text-slate-800 group-hover:text-blue-600">
                        Categories
                      </span>

                      <span className="block text-xs text-slate-400">
                        Explore products by category
                      </span>
                    </span>
                  </Link>
                </div>
              </div>

              {/* CUSTOMER */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Customer
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-950">
                  Your shopping
                </h3>

                <div className="mt-5 space-y-1">
                  <Link
                    href="/orders"
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-blue-600 group-hover:text-white">
                      📦
                    </span>

                    <span>
                      <span className="block text-sm font-black text-slate-800 group-hover:text-blue-600">
                        My Orders
                      </span>

                      <span className="block text-xs text-slate-400">
                        Track your purchases
                      </span>
                    </span>
                  </Link>

                  <Link
                    href="/wishlist"
                    className="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-red-500 group-hover:text-white">
                        ♡
                      </span>

                      <span>
                        <span className="block text-sm font-black text-slate-800 group-hover:text-red-500">
                          Wishlist
                        </span>

                        <span className="block text-xs text-slate-400">
                          Save your favorite products
                        </span>
                      </span>
                    </span>

                    {wishlist.length > 0 && (
                      <span className="rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black text-white">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/cart"
                    className="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-blue-600 group-hover:text-white">
                        🛒
                      </span>

                      <span>
                        <span className="block text-sm font-black text-slate-800 group-hover:text-blue-600">
                          Shopping Cart
                        </span>

                        <span className="block text-xs text-slate-400">
                          Review items and checkout
                        </span>
                      </span>
                    </span>

                    {cartCount > 0 && (
                      <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* ACCOUNT */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Account
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-950">
                  Manage your account
                </h3>

                <div className="mt-5 space-y-1">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/profile"
                        className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-blue-600 group-hover:text-white">
                          👤
                        </span>

                        <span>
                          <span className="block text-sm font-black text-slate-800 group-hover:text-blue-600">
                            My Profile
                          </span>

                          <span className="block text-xs text-slate-400">
                            View your account
                          </span>
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg transition group-hover:bg-red-500 group-hover:text-white">
                          🚪
                        </span>

                        <span>
                          <span className="block text-sm font-black text-slate-800 group-hover:text-red-600">
                            Logout
                          </span>

                          <span className="block text-xs text-slate-400">
                            Sign out of your account
                          </span>
                        </span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition group-hover:bg-blue-600 group-hover:text-white">
                        🔐
                      </span>

                      <span>
                        <span className="block text-sm font-black text-slate-800 group-hover:text-blue-600">
                          Login
                        </span>

                        <span className="block text-xs text-slate-400">
                          Sign in to your E-Shop account
                        </span>
                      </span>
                    </Link>
                  )}
                </div>
              </div>

              {/* PROMO CARD */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-600/30 blur-2xl" />
                <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" />

                <div className="relative">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg">
                    🛍️
                  </span>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                    E-Shop
                  </p>

                  <h3 className="mt-2 text-2xl font-black leading-tight">
                    Shop smarter.
                  </h3>

                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    Discover quality products, save favorites and enjoy a simple
                    shopping experience.
                  </p>

                  <Link
                    href="/products"
                    className="mt-5 inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-blue-500 hover:text-white"
                  >
                    Explore Products →
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
              <p className="text-xs font-medium text-slate-400">
                <span className="font-black text-slate-700">
                  {products.length}+
                </span>{" "}
                products ·{" "}
                <span className="font-black text-slate-700">
                  {categories.length}+
                </span>{" "}
                categories · Secure shopping
              </p>

              <Link
                href="/products"
                className="text-xs font-black text-blue-600 transition hover:text-blue-700"
              >
                View complete store →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          DARK MENU OVERLAY
      ========================================================= */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-[2px]"
        />
      )}

      {/* =========================================================
          SIDE MENU
      ========================================================= */}
      <aside
        className={`fixed left-0 top-0 z-[70] flex h-full w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg">
              🛍️
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">E-Shop</p>

              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Shop smarter
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close navigation menu"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Navigation
          </p>

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 rounded-xl bg-slate-100 px-4 py-3.5 text-sm font-black text-slate-950"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                🏠
              </span>
              Home
            </Link>

            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                🛍️
              </span>
              Shop
            </Link>

            <Link
              href="/categories"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                📂
              </span>
              Categories
            </Link>

            <Link
              href="/orders"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                📦
              </span>
              Orders
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  ♡
                </span>
                Wishlist
              </span>

              {wishlist.length > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  🛒
                </span>
                Shopping Cart
              </span>

              {cartCount > 0 && (
                <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Account
            </p>

            <div className="space-y-1">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      👤
                    </span>
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-bold text-red-500 transition hover:bg-red-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                      🚪
                    </span>
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    🔐
                  </span>
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-200 bg-slate-50 p-5">
          <div className="rounded-xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-black">E-Shop</p>

            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Shop smarter. Discover more.
            </p>
          </div>
        </div>
      </aside>

      {/* =========================================================
          COMPACT HERO
      ========================================================= */}
      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 md:px-8 md:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:py-12">
          {/* LEFT */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              New shopping experience
            </div>

            <h1 className="max-w-xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Everything you need.
              <span className="block text-blue-600">All in one place.</span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500 md:text-base">
              Discover quality products, explore new categories, save your
              favorites and shop with confidence.
            </p>

            {/* BUTTONS */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600"
              >
                Explore Products
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/categories"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Browse Categories
              </Link>
            </div>

            {/* STATS */}
            <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-slate-200 pt-5">
              <div>
                <p className="text-xl font-black">{products.length}+</p>

                <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                  Products
                </p>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div>
                <p className="text-xl font-black">{categories.length}+</p>

                <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                  Categories
                </p>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div>
                <p className="text-xl font-black">100%</p>

                <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                  Secure
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
              <img
                src={heroImage}
                alt="E-Shop shopping experience"
                className="h-64 w-full object-cover transition duration-700 hover:scale-105 sm:h-72 lg:h-80"
              />

              <div className="absolute inset-0 bg-linear-to-t from-slate-950/50 via-transparent to-transparent" />
            </div>

            {/* SMALL FLOATING CARD */}
            <div className="absolute -bottom-4 left-4 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg sm:left-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm text-emerald-600">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-black">Secure shopping</p>

                  <p className="text-[10px] text-slate-400">
                    Shop with confidence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Shop by category
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Find exactly what you're looking for.
              </p>
            </div>

            <Link
              href="/categories"
              className="hidden rounded-xl border border-slate-200 px-5 py-3 text-sm font-black transition hover:border-slate-950 sm:block"
            >
              View all →
            </Link>
          </div>

          <div className="mt-8">
            {categoriesLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-44 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : categoryError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-7 text-center">
                <p className="font-bold text-red-700">{categoryError}</p>

                <button
                  type="button"
                  onClick={fetchCategories}
                  className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
                <p className="text-3xl">🗂️</p>

                <p className="mt-3 font-black">No categories available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {categories.slice(0, 10).map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(
                      category.name,
                    )}`}
                    className="group relative h-44 overflow-hidden rounded-2xl bg-slate-900"
                  >
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultCategoryImage;
                      }}
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-lg font-black text-white">
                        {category.name}
                      </p>

                      <p className="mt-1 text-xs font-medium text-white/70">
                        Explore →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          PRODUCTS
      ========================================================= */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Trending now
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Popular products
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Products ready to become your next favorite.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-600 sm:block"
            >
              View all →
            </Link>
          </div>

          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="font-bold text-red-700">{error}</p>

              <button
                type="button"
                onClick={fetchProducts}
                className="mt-3 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="h-70 animate-pulse bg-slate-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🔍
              </div>

              <h3 className="mt-5 text-xl font-black">No products found</h3>

              <p className="mt-2 text-sm text-slate-500">Try another search.</p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white"
              >
                Show all products
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const isAdded = addedProductId === product.id;

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/70"
                  >
                    <div className="relative h-70 overflow-hidden bg-slate-100">
                      <img
                        src={
                          product.image?.trim()
                            ? product.image
                            : defaultProductImage
                        }
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = defaultProductImage;
                        }}
                      />

                      <div className="absolute left-4 top-4">
                        <span
                          className={`rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide shadow-lg ${
                            product.stock > 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock > 0 ? "In stock" : "Out of stock"}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={wishlistLoading}
                        onClick={() => toggleWishlist(product.id)}
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl shadow-lg transition hover:scale-110 ${
                          isWishlisted
                            ? "text-red-500"
                            : "text-slate-500 hover:text-red-500"
                        }`}
                      >
                        {isWishlisted ? "♥" : "♡"}
                      </button>

                      <Link
                        href={`/products/${product.id}`}
                        className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white text-lg opacity-0 shadow-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-slate-950 hover:text-white"
                        aria-label={`View ${product.name}`}
                      >
                        ↗
                      </Link>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm tracking-wide text-amber-400">
                          ★★★★★
                        </span>

                        <span className="text-xs font-bold text-slate-400">
                          Popular
                        </span>
                      </div>

                      <Link href={`/products/${product.id}`}>
                        <h3 className="mt-2 line-clamp-1 text-lg font-black transition hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {product.description ||
                          "Quality product with great value."}
                      </p>

                      <div className="mt-5 flex items-end justify-between">
                        <p className="text-2xl font-black">
                          ${Number(product.price).toFixed(2)}
                        </p>

                        <p className="text-xs font-bold text-slate-400">
                          {product.stock > 0
                            ? `${product.stock} available`
                            : "Unavailable"}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={product.stock <= 0}
                        onClick={() => handleAddToCart(product)}
                        className={`mt-5 flex h-12 w-full items-center justify-center rounded-xl text-sm font-black transition ${
                          product.stock <= 0
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : isAdded
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-950 text-white hover:bg-blue-600"
                        }`}
                      >
                        {product.stock <= 0
                          ? "Out of Stock"
                          : isAdded
                            ? "✓ Added to Cart"
                            : "🛒 Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && products.length > 8 && (
            <div className="mt-10 text-center sm:hidden">
              <Link
                href="/products"
                className="inline-flex rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-black text-white"
              >
                Explore all products →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          PROMOTIONAL BANNER
      ========================================================= */}
      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-4xl bg-slate-950">
          <div className="relative grid items-center gap-10 px-7 py-12 md:px-12 lg:grid-cols-[1fr_.8fr] lg:py-16">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                Discover more
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">
                Better products.
                <span className="block text-blue-400">Better shopping.</span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
                Explore our growing collection and find products designed to fit
                your everyday life.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-blue-500 hover:text-white"
              >
                Start Shopping →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-2xl">🚚</p>

                <p className="mt-4 text-sm font-black text-white">
                  Reliable Delivery
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Convenient order delivery.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-2xl">🔒</p>

                <p className="mt-4 text-sm font-black text-white">
                  Secure Checkout
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Shop with confidence.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-2xl">♡</p>

                <p className="mt-4 text-sm font-black text-white">
                  Save Favorites
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep products you love.
                </p>
              </div>

              <Link
                href="/products"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-blue-500/30 hover:bg-blue-500/10"
              >
                <p className="text-2xl">🛍️</p>

                <p className="mt-4 text-sm font-black text-white">
                  Explore Products
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Discover our collection.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST FEATURES
      ========================================================= */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-8">
          <div className="flex items-center gap-4 py-7 md:px-8 md:first:pl-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🚚
            </div>

            <div>
              <p className="text-sm font-black">Fast & reliable</p>

              <p className="mt-1 text-xs text-slate-500">
                Convenient delivery options
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-7 md:px-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
              🔒
            </div>

            <div>
              <p className="text-sm font-black">Secure shopping</p>

              <p className="mt-1 text-xs text-slate-500">
                Your account stays protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-7 text-left md:px-8 md:last:pr-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl">
              ⭐
            </div>

            <div>
              <p className="text-sm font-black">Quality products</p>

              <p className="mt-1 text-xs text-slate-500">
                Products you can trust
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}
      <section className="bg-slate-50 px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl rounded-4xl bg-blue-600 px-7 py-10 md:px-12 md:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_.9fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                Stay updated
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                Don't miss what is new.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Subscribe for new products, special updates and shopping
                inspiration.
              </p>
            </div>

            <form
              onSubmit={handleNewsletterSubmit}
              className="rounded-2xl bg-white/10 p-2"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="Your email address"
                  className="h-12 min-w-0 flex-1 rounded-xl bg-white px-4 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="h-12 rounded-xl bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Subscribe
                </button>
              </div>

              {newsletterMessage && (
                <p className="px-2 pt-2 text-xs font-bold text-white">
                  {newsletterMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* BRAND */}
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  🛍️
                </div>

                <div>
                  <p className="text-lg font-black">E-Shop</p>

                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-500">
                    Shop smarter
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
                A modern shopping destination built to make discovering and
                buying products simple.
              </p>
            </div>

            {/* SHOP */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                Shop
              </h3>

              <div className="mt-5 space-y-3">
                <Link
                  href="/products"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  All Products
                </Link>

                <Link
                  href="/categories"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Categories
                </Link>

                <Link
                  href="/wishlist"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Wishlist
                </Link>

                <Link
                  href="/cart"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Shopping Cart
                </Link>
              </div>
            </div>

            {/* ACCOUNT */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                Account
              </h3>

              <div className="mt-5 space-y-3">
                <Link
                  href="/profile"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  My Profile
                </Link>

                <Link
                  href="/orders"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  My Orders
                </Link>

                <Link
                  href="/login"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Login
                </Link>
              </div>
            </div>

            {/* CONTACT */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                Contact
              </h3>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-600">Email</p>

                  <a
                    href="mailto:support@eshop.com"
                    className="mt-1 block text-sm text-slate-400 transition hover:text-white"
                  >
                    support@eshop.com
                  </a>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-600">Phone</p>

                  <a
                    href="tel:+251900000000"
                    className="mt-1 block text-sm text-slate-400 transition hover:text-white"
                  >
                    +251 900 000 000
                  </a>
                </div>

                <p className="text-sm text-slate-400">📍 Main Store</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 pt-7 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-xs text-slate-500">
              © 2026 E-Shop. All rights reserved.
            </p>

            <p className="text-xs text-slate-500">
              Built for a better shopping experience.
            </p>
          </div>
        </div>
      </footer>

      {/* =========================================================
          FLOATING CHATBOT
      ========================================================= */}
      <Chatbot />
    </div>
  );
}
