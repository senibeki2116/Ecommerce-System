"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "../Context/CartContext";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
};

const API_URL = "http://localhost:3001";

export default function ProductsPage() {
  const { addToCart, cartCount } = useCart();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // ================= FETCH PRODUCTS =================
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
    } catch (err) {
      console.error(err);

      setError(
        "Could not load products. Please make sure the backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= URL SEARCH =================
  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearch(searchFromUrl);
  }, [searchParams]);

  // ================= CATEGORIES =================
  const categories = useMemo(() => {
    const values = products
      .map((product) => product.name?.trim().split(" ")[0])
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [products]);

  // ================= FILTER + SORT =================
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";

        return name.includes(query) || description.includes(query);
      });
    }

    if (category !== "All") {
      result = result.filter((product) =>
        product.name?.toLowerCase().startsWith(category.toLowerCase()),
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sort === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return result;
  }, [products, search, category, sort]);

  // ================= ADD TO CART =================
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    addToCart(product);
    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1200);
  };

  // ================= WISHLIST =================
  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // ================= CLEAR FILTERS =================
  const clearFilters = () => {
    setSearch("");
    setCategory("All");

    if (searchParams.get("search")) {
      window.history.replaceState({}, "", "/products");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* =====================================================
          PAGE TOP
      ===================================================== */}
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="transition hover:text-blue-600">
            Home
          </Link>

          <span>/</span>

          <span className="font-medium text-slate-700">Products</span>
        </div>

        {/* =====================================================
            TITLE
        ===================================================== */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Our Collection
            </span>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Explore Products
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Discover quality products selected for you. Find something you
              love and add it to your cart.
            </p>
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="group relative flex w-fit items-center gap-3 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-blue-600"
          >
            <span className="text-lg transition group-hover:scale-110">🛒</span>

            <span>Cart</span>

            {cartCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-black">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* =====================================================
            SEARCH + SORT
        ===================================================== */}
        <div className="mb-7 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-12 w-full rounded-2xl bg-slate-50 pl-12 pr-12 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500 transition hover:bg-slate-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-12 rounded-2xl border-0 bg-slate-50 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 lg:w-56"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* =====================================================
            CATEGORY FILTER
        ===================================================== */}
        <div className="mb-9 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${
                category === item
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* =====================================================
            PRODUCTS HEADER
        ===================================================== */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">All Products</h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {(search || category !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-blue-600"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}
        {error && (
          <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-7">
            <div className="text-3xl">⚠️</div>

            <h3 className="mt-3 font-black text-red-800">
              Unable to load products
            </h3>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}
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
                  <div className="h-11 animate-pulse rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && filteredProducts.length === 0 ? (
          /* =====================================================
              EMPTY
          ===================================================== */
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
              🔍
            </div>

            <h3 className="mt-6 text-2xl font-black">No products found</h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another search term or choose a different category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Show All Products
            </button>
          </div>
        ) : (
          /* =====================================================
              PRODUCT GRID
          ===================================================== */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const isAdded = addedProductId === product.id;

              return (
                <article
                  key={product.id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/70"
                >
                  {/* ================= IMAGE ================= */}
                  <div className="relative h-72 overflow-hidden bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">
                        📦
                      </div>
                    )}

                    {/* Image Gradient */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />

                    {/* Stock */}
                    <div className="absolute left-4 top-4">
                      {product.stock > 0 ? (
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-emerald-600 shadow-md backdrop-blur">
                          ✓ In Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-red-600 shadow-md backdrop-blur">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Add to wishlist"
                      className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg shadow-md backdrop-blur transition hover:scale-110 ${
                        isWishlisted
                          ? "text-red-500"
                          : "text-slate-400 hover:text-red-500"
                      }`}
                    >
                      {isWishlisted ? "♥" : "♡"}
                    </button>

                    {/* View Product */}
                    <Link
                      href={`/products/${product.id}`}
                      className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-4 items-center justify-center rounded-full bg-white text-lg text-slate-900 opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-blue-600 hover:text-white"
                    >
                      ↗
                    </Link>
                  </div>

                  {/* ================= CONTENT ================= */}
                  <div className="p-5">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <span className="text-sm tracking-wide text-amber-400">
                        ★★★★★
                      </span>

                      <span className="ml-1 text-xs font-semibold text-slate-400">
                        4.8
                      </span>
                    </div>

                    {/* Name */}
                    <Link href={`/products/${product.id}`}>
                      <h3 className="mt-2 line-clamp-1 text-lg font-black text-slate-950 transition hover:text-blue-600">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {product.description ||
                        "Quality product with great value."}
                    </p>

                    {/* Price */}
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Price
                        </p>

                        <p className="mt-0.5 text-2xl font-black text-slate-950">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-slate-400">
                        {product.stock > 0
                          ? `${product.stock} left`
                          : "Unavailable"}
                      </span>
                    </div>

                    {/* Add Cart */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition duration-300 ${
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
                          <span className="text-base">🛒</span>
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
      </main>
    </div>
  );
}
