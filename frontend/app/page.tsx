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

export default function HomePage() {
  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // =========================================================
  // CHECK LOGIN
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    if (typeof window === "undefined") return null;

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
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load products");
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
      console.error(error);

      setError(
        "Could not load products. Please make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
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
        throw new Error("Failed to load wishlist");
      }

      const data: WishlistResponse = await response.json();

      const ids = data.items.map((item) => item.productId);

      setWishlist(ids);
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    addToCart(product);

    setAddedProductId(product.id);

    setTimeout(() => {
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

      // REMOVE
      if (isCurrentlyWishlisted) {
        const response = await fetch(`${API_URL}/wishlist/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Could not remove product from wishlist");
        }

        setWishlist((current) => current.filter((id) => id !== productId));

        return;
      }

      // ADD
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
          errorData?.message || "Could not add product to wishlist",
        );
      }

      setWishlist((current) => [...current, productId]);
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
    if (!search.trim()) {
      return products;
    }

    const query = search.toLowerCase().trim();

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";

      return name.includes(query) || description.includes(query);
    });
  }, [products, search]);

  // =========================================================
  // FEATURED PRODUCTS
  // =========================================================

  const featuredProducts = filteredProducts.slice(0, 8);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const categoryList = products
      .map((product) => product.name?.trim().split(" ")[0])
      .filter(Boolean);

    return Array.from(new Set(categoryList)).slice(0, 6);
  }, [products]);

  // =========================================================
  // IMAGE
  // =========================================================

  const getImage = (product: Product) => {
    if (product.image && product.image.trim() !== "") {
      return product.image;
    }

    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER / NAVBAR
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
            {/* HOME */}

            <Link
              href="/"
              className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
            >
              🏠 Home
            </Link>

            {/* PRODUCTS */}

            <Link
              href="/products"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              🛍️ Products
            </Link>

            {/* ORDERS */}

            <Link
              href="/orders"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              📦 Orders
            </Link>

            {/* WISHLIST */}

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

            {/* CART */}

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

          {/* LOGIN / ACCOUNT */}

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

        {/* =================================================
            MOBILE NAVIGATION
        ================================================= */}

        <div className="border-t border-slate-100 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between overflow-x-auto px-3 py-2">
            <Link
              href="/"
              className="flex min-w-fit flex-col items-center gap-1 rounded-xl bg-blue-50 px-4 py-2 text-[10px] font-bold text-blue-600"
            >
              <span className="text-lg">🏠</span>
              Home
            </Link>

            <Link
              href="/products"
              className="flex min-w-fit flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-blue-600"
            >
              <span className="text-lg">🛍️</span>
              Products
            </Link>

            <Link
              href="/orders"
              className="flex min-w-fit flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-blue-600"
            >
              <span className="text-lg">📦</span>
              Orders
            </Link>

            <Link
              href="/wishlist"
              className="relative flex min-w-fit flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-red-500"
            >
              <span className="text-lg">♥</span>
              Wishlist
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex min-w-fit flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-blue-600"
            >
              <span className="text-lg">🛒</span>
              Cart
              {cartCount > 0 && (
                <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[8px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isLoggedIn && (
              <Link
                href="/login"
                className="flex min-w-fit flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-blue-600"
              >
                <span className="text-lg">🔐</span>
                Login
              </Link>
            )}
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
          {/* HERO LEFT */}

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

            {/* QUICK INFO */}

            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-black text-slate-950">
                  {products.length}+
                </p>

                <p className="text-xs font-semibold text-slate-400">Products</p>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">24/7</p>

                <p className="text-xs font-semibold text-slate-400">Shopping</p>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-950">100%</p>

                <p className="text-xs font-semibold text-slate-400">Secure</p>
              </div>
            </div>
          </div>

          {/* HERO RIGHT */}

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

            {/* FLOATING CARD */}

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
            {/* WISHLIST */}

            <Link
              href="/wishlist"
              className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-500"
            >
              <span className="text-lg">♥</span>
              Wishlist
              {wishlist.length > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* CART */}

            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-600"
            >
              <span className="text-lg">🛒</span>
              Cart
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
          CATEGORY SECTION
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                Explore
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Shop by Category
              </h2>
            </div>

            <Link
              href="/products"
              className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              View all →
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?search=${encodeURIComponent(category)}`}
                className="whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                {category}
              </Link>
            ))}

            {categories.length === 0 && (
              <span className="text-sm text-slate-400">
                Categories will appear here.
              </span>
            )}
          </div>
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

        {/* ERROR */}

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

        {/* LOADING */}

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
                  {/* IMAGE */}

                  <div className="relative h-72 overflow-hidden bg-slate-100">
                    <img
                      src={getImage(product)}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";
                      }}
                    />

                    {/* STOCK */}

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

                    {/* WISHLIST */}

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

                    {/* VIEW PRODUCT */}

                    <Link
                      href={`/products/${product.id}`}
                      className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-4 items-center justify-center rounded-full bg-white text-lg text-slate-900 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-blue-600 hover:text-white"
                    >
                      ↗
                    </Link>
                  </div>

                  {/* CONTENT */}

                  <div className="p-5">
                    {/* RATING */}

                    <div className="flex items-center gap-2">
                      <span className="text-sm tracking-wide text-amber-400">
                        ★★★★★
                      </span>

                      <span className="text-xs font-semibold text-slate-400">
                        4.8
                      </span>
                    </div>

                    {/* NAME */}

                    <Link href={`/products/${product.id}`}>
                      <h3 className="mt-2 line-clamp-1 text-lg font-black text-slate-950 transition hover:text-blue-600">
                        {product.name}
                      </h3>
                    </Link>

                    {/* DESCRIPTION */}

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {product.description ||
                        "Quality product with great value."}
                    </p>

                    {/* PRICE */}

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

                    {/* ADD TO CART */}

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

        {/* VIEW ALL */}

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
          FEATURES
      ===================================================== */}

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 md:grid-cols-3 md:px-8">
          <div className="rounded-3xl bg-blue-50 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
              🚚
            </div>

            <h3 className="mt-5 font-black text-slate-950">Fast Delivery</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Get your favorite products delivered safely and quickly.
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white">
              ✓
            </div>

            <h3 className="mt-5 font-black text-slate-950">Quality Products</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Carefully selected products with quality and value in mind.
            </p>
          </div>

          <div className="rounded-3xl bg-violet-50 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-xl text-white">
              🔒
            </div>

            <h3 className="mt-5 font-black text-slate-950">Secure Shopping</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your account, wishlist and shopping experience are protected.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER CTA
      ===================================================== */}

      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-14 text-center md:px-8">
          <h2 className="text-3xl font-black text-white md:text-4xl">
            Ready to start shopping?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Explore our complete collection and find something perfect for you.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white transition hover:bg-blue-500"
            >
              Explore Products
            </Link>

            <Link
              href="/wishlist"
              className="rounded-2xl border border-slate-700 bg-slate-900 px-7 py-3.5 text-sm font-black text-white transition hover:bg-slate-800"
            >
              View Wishlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
