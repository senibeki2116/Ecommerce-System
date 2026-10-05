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

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(Boolean(token));
  }, []);

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
      {/* TOP ANNOUNCEMENT */}

      <div className="bg-slate-950 px-4 py-2.5 text-center text-xs font-bold text-white">
        <span className="text-blue-400">●</span> Free delivery on qualifying
        orders · Secure checkout
      </div>

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-5 px-5 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg shadow-lg">
              🛍️
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">E-Shop</p>

              <p className="hidden text-[8px] font-bold uppercase tracking-[0.25em] text-slate-400 sm:block">
                Shop smarter
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-950"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            >
              Shop
            </Link>

            <Link
              href="/categories"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            >
              Categories
            </Link>

            <Link
              href="/orders"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            >
              Orders
            </Link>
          </nav>

          <div className="ml-auto hidden max-w-sm flex-1 xl:block">
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

          <div className="flex items-center gap-2">
            <Link
              href="/wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-xl text-slate-600 transition hover:bg-slate-100 hover:text-red-500 sm:flex"
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
              <>
                <Link
                  href="/profile"
                  className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:border-slate-950 sm:block"
                >
                  Account
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600 sm:block"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-600 sm:px-5"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 lg:hidden">
          <div className="flex gap-2 overflow-x-auto px-4 py-2.5">
            <Link
              href="/"
              className="shrink-0 rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="shrink-0 rounded-lg bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600"
            >
              Shop
            </Link>

            <Link
              href="/categories"
              className="shrink-0 rounded-lg bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600"
            >
              Categories
            </Link>

            <Link
              href="/wishlist"
              className="shrink-0 rounded-lg bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600"
            >
              Wishlist
            </Link>

            <Link
              href="/orders"
              className="shrink-0 rounded-lg bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600"
            >
              Orders
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH */}

      <div className="border-b border-slate-100 bg-white px-5 py-3 xl:hidden">
        <div className="relative mx-auto max-w-7xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>
      </div>

      {/* HERO */}

      <section className="overflow-hidden bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              New shopping experience
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl">
              Everything you need.
              <span className="mt-2 block text-blue-600">
                All in one place.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-500 md:text-lg">
              Discover quality products, explore new categories, save your
              favorites and shop with confidence.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex h-13 items-center justify-center rounded-xl bg-slate-950 px-7 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-600"
              >
                Explore Products
                <span className="ml-3">→</span>
              </Link>

              <Link
                href="/categories"
                className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-200 bg-white px-7 text-sm font-black text-slate-700 transition hover:border-slate-400"
              >
                Browse Categories
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-7 border-t border-slate-200 pt-7">
              <div>
                <p className="text-2xl font-black">{products.length}+</p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  Products
                </p>
              </div>

              <div className="h-10 w-px bg-slate-200" />

              <div>
                <p className="text-2xl font-black">{categories.length}+</p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  Categories
                </p>
              </div>

              <div className="h-10 w-px bg-slate-200" />

              <div>
                <p className="text-2xl font-black">100%</p>
                <p className="mt-1 text-xs font-bold text-slate-400">Secure</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-4xl bg-slate-900 shadow-2xl">
              <img
                src={heroImage}
                alt="E-Shop shopping experience"
                className="h-105 w-full object-cover transition duration-700 hover:scale-105 sm:h-125"
              />

              <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-slate-950/10" />

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                      E-Shop Collection
                    </p>

                    <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                      Shop smarter.
                    </p>
                  </div>

                  <div className="hidden rounded-2xl bg-white/95 px-4 py-3 shadow-xl sm:block">
                    <p className="text-xs font-bold text-slate-400">Shopping</p>

                    <p className="mt-1 text-sm font-black text-slate-950">
                      Made simple
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:-left-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-black">Secure shopping</p>

                  <p className="mt-1 text-xs text-slate-400">
                    Shop with confidence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}

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

      {/* PRODUCTS */}

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

      {/* PROMOTIONAL BANNER */}

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

      {/* TRUST FEATURES */}

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

      {/* NEWSLETTER */}

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

      {/* FOOTER */}

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* FLOATING CHATBOT - KEPT */}

      <Chatbot />
    </div>
  );
}
