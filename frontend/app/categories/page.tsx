"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  image?: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/categories`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load categories");
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
      console.error(error);

      setError(
        "Could not load categories. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

    if (categoryFallbackImages[name]) {
      return categoryFallbackImages[name];
    }

    const matchedKey = Object.keys(categoryFallbackImages).find((key) =>
      name.includes(key),
    );

    if (matchedKey) {
      return categoryFallbackImages[matchedKey];
    }

    return defaultCategoryImage;
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

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

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
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
              className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
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
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-red-500"
            >
              ♥ Wishlist
            </Link>

            <Link
              href="/cart"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              🛒 Cart
            </Link>
          </nav>

          {/* LOGIN */}

          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            🔐 Login
          </Link>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-white">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-100 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 text-center md:px-8 md:py-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
            🗂️ Explore E-Shop
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Shop by Category
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
            Explore our categories and quickly find the products you are looking
            for.
          </p>

          {/* SEARCH */}

          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-13 pr-5 text-sm font-medium shadow-lg shadow-slate-100 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY GRID
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        {/* TITLE */}

        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              Categories
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Explore Our Categories
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {filteredCategories.length} categories available
            </p>
          </div>

          <Link
            href="/products"
            className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 sm:block"
          >
            View Products →
          </Link>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
              ⚠️
            </div>

            <p className="mt-4 font-bold text-red-700">{error}</p>

            <button
              type="button"
              onClick={fetchCategories}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading && !error && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="h-56 animate-pulse bg-slate-200" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                  <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && filteredCategories.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
              🔍
            </div>

            <h3 className="mt-5 text-2xl font-black text-slate-950">
              No categories found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try searching for another category.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Show All Categories
            </button>
          </div>
        )}

        {/* CATEGORY CARDS */}

        {!loading && !error && filteredCategories.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100"
              >
                {/* IMAGE */}

                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={getCategoryImage(category)}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = defaultCategoryImage;
                    }}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-800 shadow-lg">
                      Category
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <h3 className="text-2xl font-black text-white">
                      {category.name}
                    </h3>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-black text-slate-900 shadow-lg transition group-hover:bg-blue-600 group-hover:text-white">
                      →
                    </div>
                  </div>
                </div>

                {/* CONTENT */}

                <div className="p-5">
                  <p className="text-sm leading-6 text-slate-500">
                    Discover products from our {category.name} collection.
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-black text-blue-600">
                      Browse Products
                    </span>

                    <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center md:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white">
            🛍️
          </div>

          <h2 className="mt-6 text-3xl font-black text-white md:text-4xl">
            Can't decide what to buy?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Explore all of our products and discover something perfect for you.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950 transition hover:bg-blue-500"
          >
            Explore All Products →
          </Link>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-8 text-center md:px-8">
          <p className="text-sm font-bold text-slate-500">
            © 2026 E-Shop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
