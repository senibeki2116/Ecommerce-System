"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "./Context/CartContext";

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

const API_URL = "http://localhost:3001";

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
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop";

const defaultProductImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";

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

  // =========================================================
  // CHECK LOGIN
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(Boolean(token));
  }, []);

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("accessToken");
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load products. Status: ${response.status}`);
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
    } catch (error) {
      console.error("Product error:", error);

      setError(
        "Could not load products. Please make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoryError("");

      const response = await fetch(`${API_URL}/categories`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load categories. Status: ${response.status}`,
        );
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
    } catch (error) {
      console.error("Category error:", error);

      setCategoryError("Could not load categories.");
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // =========================================================
  // FETCH WISHLIST
  // =========================================================

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
        throw new Error(`Failed to load wishlist. Status: ${response.status}`);
      }

      const data: WishlistResponse = await response.json();

      const ids = Array.isArray(data.items)
        ? data.items.map((item) => item.productId)
        : [];

      setWishlist(ids);
    } catch (error) {
      console.error("Wishlist error:", error);
      setWishlist([]);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchWishlist();
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setWishlist([]);

    window.location.href = "/";
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      return;
    }

    addToCart(product);

    setAddedProductId(product.id);

    window.setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  // =========================================================
  // WISHLIST
  // =========================================================

  const toggleWishlist = async (productId: number) => {
    const token = getToken();

    if (!token) {
      alert("Please login first to use your wishlist.");
      window.location.href = "/login";
      return;
    }

    try {
      setWishlistLoading(true);

      const isCurrentlyWishlisted = wishlist.includes(productId);

      if (isCurrentlyWishlisted) {
        const response = await fetch(`${API_URL}/wishlist/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message || "Could not remove product from wishlist.",
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
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Could not add product to wishlist.",
        );
      }

      setWishlist((current) => {
        if (current.includes(productId)) {
          return current;
        }

        return [...current, productId];
      });
    } catch (error) {
      console.error("Wishlist error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong with wishlist.",
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";

      return name.includes(query) || description.includes(query);
    });
  }, [products, search]);

  const featuredProducts = filteredProducts.slice(0, 8);

  // =========================================================
  // CATEGORY IMAGE
  // =========================================================

  const getCategoryImage = (category: Category) => {
    const name = category.name?.trim().toLowerCase() || "";

    if (
      category.image &&
      category.image.trim() !== "" &&
      !category.image.includes("example.com")
    ) {
      return category.image;
    }

    const exactMatch = categoryFallbackImages[name];

    if (exactMatch) {
      return exactMatch;
    }

    const keywordMatch = Object.keys(categoryFallbackImages).find((key) =>
      name.includes(key),
    );

    if (keywordMatch) {
      return categoryFallbackImages[keywordMatch];
    }

    return defaultCategoryImage;
  };

  // =========================================================
  // NEWSLETTER
  // =========================================================

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newsletterEmail.trim()) {
      setNewsletterMessage("Please enter your email address.");
      return;
    }

    setNewsletterMessage(
      "Thank you! You are now subscribed to E-Shop updates.",
    );

    setNewsletterEmail("");
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          {/* LOGO */}

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
              🛍️
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-950">
                E-Shop
              </p>

              <p className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:block">
                Shop smarter
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600"
            >
              🏠 Home
            </Link>

            <Link
              href="/products"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              🛍️ Products
            </Link>

            <Link
              href="/categories"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              🗂️ Categories
            </Link>

            <Link
              href="/orders"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              📦 Orders
            </Link>

            <Link
              href="/wishlist"
              className="relative rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-red-500"
            >
              ♥ Wishlist
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* ACCOUNT */}

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600 sm:block"
                >
                  👤 Account
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                🔐 Login
              </Link>
            )}
          </div>
        </div>

        {/* MOBILE NAV */}

        <div className="border-t border-slate-100 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between overflow-x-auto px-3 py-2">
            <Link
              href="/"
              className="flex min-w-fit flex-col items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-600"
            >
              <span className="text-lg">🏠</span>
              Home
            </Link>

            <Link
              href="/products"
              className="flex min-w-fit flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-500"
            >
              <span className="text-lg">🛍️</span>
              Products
            </Link>

            <Link
              href="/categories"
              className="flex min-w-fit flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-500"
            >
              <span className="text-lg">🗂️</span>
              Categories
            </Link>

            <Link
              href="/orders"
              className="flex min-w-fit flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-500"
            >
              <span className="text-lg">📦</span>
              Orders
            </Link>

            <Link
              href="/wishlist"
              className="relative flex min-w-fit flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-500"
            >
              <span className="text-lg">♥</span>
              Wishlist
              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex min-w-fit flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-500"
            >
              <span className="text-lg">🛒</span>
              Cart
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[8px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-white">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-100 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
              ✨ Welcome to E-Shop
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Everything you need.
              <span className="block text-blue-600">All in one place.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 md:text-lg">
              Discover quality products, compare prices, save your favorites and
              shop with confidence.
            </p>

            {/* SEARCH */}

            <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-5 text-sm font-medium shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <Link
                href="/products"
                className="flex h-14 items-center justify-center rounded-2xl bg-slate-950 px-7 text-sm font-black text-white transition hover:bg-blue-600"
              >
                Browse All
              </Link>
            </div>

            {/* STATS */}

            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-black text-slate-950">
                  {products.length}+
                </p>

                <p className="text-xs font-semibold text-slate-400">Products</p>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">
                  {categories.length}+
                </p>

                <p className="text-xs font-semibold text-slate-400">
                  Categories
                </p>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">100%</p>

                <p className="text-xs font-semibold text-slate-400">Secure</p>
              </div>
            </div>
          </div>

          {/* HERO IMAGE */}

          <div className="relative">
            <div className="overflow-hidden rounded-4xl border border-white bg-white p-3 shadow-2xl shadow-blue-100">
              <div className="relative h-87.5 overflow-hidden rounded-3xl bg-blue-100 sm:h-107.5">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                  alt="E-Shop shopping"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />

                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-xl backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                        🛍️
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900">
                          Shop smarter
                        </p>

                        <p className="text-xs text-slate-500">
                          Quality products, better prices
                        </p>
                      </div>
                    </div>

                    <span className="text-xl">✨</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-white bg-white px-5 py-4 shadow-xl sm:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Secure Shopping
                  </p>

                  <p className="text-xs text-slate-400">Shop with confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK ACTION BAR
      ===================================================== */}

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              Your Shopping
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Manage your cart and favorite products
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/categories"
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              🗂️ Categories
            </Link>

            <Link
              href="/wishlist"
              className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-500"
            >
              ♥ Wishlist
              {wishlist.length > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-600"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-black">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Shop by Category
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Find exactly what you are looking for by browsing our product
                categories.
              </p>
            </div>

            <Link
              href="/categories"
              className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              View All Categories →
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
                >
                  <div className="h-40 animate-pulse bg-slate-200" />

                  <div className="p-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />

                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoryError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-bold text-red-700">{categoryError}</p>

              <button
                type="button"
                onClick={fetchCategories}
                className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🗂️
              </div>

              <h3 className="mt-4 text-xl font-black text-slate-950">
                No categories yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Categories created by the administrator will appear here.
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
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultCategoryImage;
                      }}
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm">
                        Explore
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="line-clamp-1 text-base font-black text-slate-950 transition group-hover:text-blue-600">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Browse products
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white">
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-600">
              Our Collection
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Popular Products
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Discover products you will love.
            </p>
          </div>

          <Link
            href="/products"
            className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
          >
            View All Products →
          </Link>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-red-700">{error}</p>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-3 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="h-72 animate-pulse bg-slate-200" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                  <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
              🔍
            </div>

            <h3 className="mt-5 text-2xl font-black">No products found</h3>

            <p className="mt-2 text-sm text-slate-500">
              Try searching for another product.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const isAdded = addedProductId === product.id;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/70"
                >
                  <div className="relative h-72 overflow-hidden bg-slate-100">
                    <img
                      src={
                        product.image && product.image.trim() !== ""
                          ? product.image
                          : defaultProductImage
                      }
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultProductImage;
                      }}
                    />

                    <div className="absolute left-4 top-4">
                      {product.stock > 0 ? (
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-emerald-600 shadow-md">
                          ✓ In Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-red-600 shadow-md">
                          Out of Stock
                        </span>
                      )}
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
                      className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl shadow-md backdrop-blur transition hover:scale-110 ${
                        isWishlisted
                          ? "text-red-500"
                          : "text-slate-400 hover:text-red-500"
                      }`}
                    >
                      {isWishlisted ? "♥" : "♡"}
                    </button>

                    <Link
                      href={`/products/${product.id}`}
                      className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-4 items-center justify-center rounded-full bg-white text-lg text-slate-900 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-blue-600 hover:text-white"
                    >
                      ↗
                    </Link>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm tracking-wide text-amber-400">
                        ★★★★★
                      </span>

                      <span className="text-xs font-semibold text-slate-400">
                        4.8
                      </span>
                    </div>

                    <Link href={`/products/${product.id}`}>
                      <h3 className="mt-2 line-clamp-1 text-lg font-black text-slate-950 transition hover:text-blue-600">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {product.description ||
                        "Quality product with great value."}
                    </p>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Price
                        </p>

                        <p className="mt-1 text-2xl font-black text-slate-950">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-slate-400">
                        {product.stock > 0
                          ? `${product.stock} left`
                          : "Unavailable"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition ${
                        product.stock <= 0
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : isAdded
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-950 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200"
                      }`}
                    >
                      {product.stock <= 0 ? (
                        "Out of Stock"
                      ) : isAdded ? (
                        <>
                          <span>✓</span>
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <span>🛒</span>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && products.length > 8 && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl"
            >
              View All Products →
            </Link>
          </div>
        )}
      </main>

      {/* =====================================================
          WHY CHOOSE US
      ===================================================== */}

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              Why E-Shop
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Shopping made simple
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              We focus on making every part of your shopping experience
              convenient, secure and reliable.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
                🚚
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-950">
                Fast & Reliable Delivery
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                We work to get your orders delivered safely and conveniently.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white shadow-lg shadow-emerald-100">
                🔒
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-950">
                Secure Shopping
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your account and shopping experience are protected with secure
                authentication and payment processing.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-2xl text-white shadow-lg shadow-violet-100">
                💬
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-950">
                Customer Support
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Need help? Our support team is here to help you with your
                shopping experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT US
      ===================================================== */}

      <section
        id="about"
        className="scroll-mt-24 border-t border-slate-200 bg-slate-50"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:px-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-4xl bg-white p-3 shadow-xl">
            <div className="relative h-80 overflow-hidden rounded-3xl">
              <img
                src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=85"
                alt="E-Shop shopping experience"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6">
                <p className="text-sm font-bold text-white">E-Shop</p>

                <p className="mt-1 text-xs text-white/70">
                  Making online shopping easier
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              About Us
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              More than a store.
              <span className="block text-blue-600">A better way to shop.</span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              E-Shop is designed to make online shopping simple, convenient and
              enjoyable. Browse products, explore categories, save your favorite
              items and manage your orders from one place.
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Whether you are looking for electronics, fashion, gaming products,
              accessories or everyday essentials, our goal is to give you a
              smooth shopping experience from discovery to delivery.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                Start Shopping
              </Link>

              <Link
                href="/categories"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION + CONTACT
      ===================================================== */}

      <section
        id="contact"
        className="scroll-mt-24 border-t border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* LOCATION */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
                📍
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-widest text-blue-600">
                Our Location
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-950">
                Main Store
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Visit our store or shop online from anywhere. Our online store
                is available whenever you need it.
              </p>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Store Hours
                </p>

                <p className="mt-2 text-sm font-bold text-slate-800">
                  Monday – Saturday
                </p>

                <p className="mt-1 text-sm text-slate-500">8:00 AM – 8:00 PM</p>
              </div>
            </div>

            {/* CONTACT */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white">
                📞
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-widest text-emerald-600">
                Contact Us
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-950">
                We are here to help
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    📧
                  </span>

                  <div>
                    <p className="text-xs font-bold text-slate-400">Email</p>

                    <a
                      href="mailto:support@eshop.com"
                      className="text-sm font-bold text-slate-800 hover:text-blue-600"
                    >
                      support@eshop.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    ☎️
                  </span>

                  <div>
                    <p className="text-xs font-bold text-slate-400">Phone</p>

                    <a
                      href="tel:+251900000000"
                      className="text-sm font-bold text-slate-800 hover:text-blue-600"
                    >
                      +251 900 000 000
                    </a>
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-600"
              >
                Contact Support →
              </Link>
            </div>

            {/* DELIVERY */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-2xl text-white">
                🚚
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-widest text-violet-600">
                Delivery
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-950">
                Delivered to your door
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Place your order online and we will prepare it for delivery.
                Track your orders from your account.
              </p>

              <Link
                href="/orders"
                className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-violet-200 hover:text-violet-600"
              >
                Track My Orders →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section
        id="faq"
        className="scroll-mt-24 border-t border-slate-200 bg-slate-50"
      >
        <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              Help Center
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Quick answers to common questions about shopping with E-Shop.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none font-black text-slate-950">
                How do I place an order?
              </summary>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Browse our products, add the items you want to your cart, review
                your order and complete the checkout process.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none font-black text-slate-950">
                Can I save products for later?
              </summary>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Yes. Log in to your account and use the wishlist button to save
                products you are interested in.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none font-black text-slate-950">
                How can I check my order?
              </summary>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Open the Orders section from your account to view your order
                history and order status.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none font-black text-slate-950">
                How can I contact customer support?
              </summary>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                You can contact our support team using the contact information
                provided in the Contact Us section.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* =====================================================
          NEWSLETTER
      ===================================================== */}

      <section className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-200">
                Stay Updated
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
                Get the latest from E-Shop
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Subscribe to receive new product announcements, shopping tips
                and special updates.
              </p>
            </div>

            <form
              onSubmit={handleNewsletterSubmit}
              className="rounded-3xl bg-white/10 p-3 backdrop-blur"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-14 flex-1 rounded-2xl border border-white/20 bg-white px-5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/20"
                />

                <button
                  type="submit"
                  className="h-14 rounded-2xl bg-slate-950 px-7 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Subscribe
                </button>
              </div>

              {newsletterMessage && (
                <p className="px-3 pt-3 text-xs font-bold text-white">
                  {newsletterMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center md:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl shadow-xl shadow-blue-950">
            🛍️
          </div>

          <h2 className="mt-6 text-3xl font-black text-white md:text-4xl">
            Ready to start shopping?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Explore our collection, discover your favorites and enjoy a simple
            online shopping experience.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white transition hover:bg-blue-500"
            >
              Explore Products
            </Link>

            <Link
              href="/categories"
              className="rounded-2xl border border-slate-700 bg-slate-900 px-7 py-3.5 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROFESSIONAL FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* BRAND */}

            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl">
                  🛍️
                </div>

                <div>
                  <p className="text-lg font-black">E-Shop</p>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Shop smarter
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
                Your modern online shopping destination for quality products,
                great value and a better shopping experience.
              </p>

              <div className="mt-5 flex gap-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-slate-300 transition hover:bg-blue-600 hover:text-white"
                >
                  f
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-slate-300 transition hover:bg-pink-600 hover:text-white"
                >
                  ◎
                </a>

                <a
                  href="#"
                  aria-label="Twitter"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-slate-300 transition hover:bg-sky-500 hover:text-white"
                >
                  𝕏
                </a>
              </div>
            </div>

            {/* SHOP */}

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
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

                <Link
                  href="/orders"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  My Orders
                </Link>
              </div>
            </div>

            {/* COMPANY */}

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Company
              </h3>

              <div className="mt-5 space-y-3">
                <a
                  href="#about"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  About Us
                </a>

                <a
                  href="#contact"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Contact Us
                </a>

                <a
                  href="#faq"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  FAQ
                </a>

                <a
                  href="#"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Privacy Policy
                </a>

                <a
                  href="#"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Terms & Conditions
                </a>
              </div>
            </div>

            {/* CONTACT */}

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Get In Touch
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <span className="text-lg">📍</span>

                  <div>
                    <p className="text-xs font-bold text-slate-500">Location</p>

                    <p className="mt-1 text-sm text-slate-400">Main Store</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">📧</span>

                  <div>
                    <p className="text-xs font-bold text-slate-500">Email</p>

                    <a
                      href="mailto:support@eshop.com"
                      className="mt-1 block text-sm text-slate-400 hover:text-white"
                    >
                      support@eshop.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">📞</span>

                  <div>
                    <p className="text-xs font-bold text-slate-500">Phone</p>

                    <a
                      href="tel:+251900000000"
                      className="mt-1 block text-sm text-slate-400 hover:text-white"
                    >
                      +251 900 000 000
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER BOTTOM */}

          <div className="mt-12 border-t border-slate-800 pt-7">
            <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <p className="text-xs text-slate-500">
                © 2026 E-Shop. All rights reserved.
              </p>

              <div className="flex flex-wrap justify-center gap-5 sm:justify-end">
                <a
                  href="#"
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  Privacy
                </a>

                <a
                  href="#"
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  Terms
                </a>

                <a
                  href="#contact"
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  Contact
                </a>

                <a
                  href="#about"
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  About
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
