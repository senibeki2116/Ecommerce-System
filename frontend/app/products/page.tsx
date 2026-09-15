"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "../Components/Navbar";
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      const productList = Array.isArray(data)
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
        "Could not load products. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products.map((product) => {
      const firstWord = product.name.trim().split(" ")[0];
      return firstWord;
    });

    return ["All", ...Array.from(new Set(values))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query),
      );
    }

    if (category !== "All") {
      result = result.filter((product) =>
        product.name.toLowerCase().startsWith(category.toLowerCase()),
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, category, sort]);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    addToCart(product);

    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-indigo-100 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600">
              ✨ Discover something you love
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Find products that
              <span className="block text-blue-600">fit your lifestyle.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
              Explore our collection of quality products at great prices.
              Search, compare and add your favorites to your cart.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-14 text-base shadow-lg shadow-slate-200/40 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  category === item
                    ? "bg-slate-950 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-500 sm:block">
              Sort:
            </span>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>

            <Link
              href="/cart"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-lg text-white transition hover:bg-blue-600"
              aria-label="Shopping cart"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-black text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-blue-600">OUR COLLECTION</p>

            <h2 className="mt-1 text-2xl font-black md:text-3xl">
              Popular Products
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {(search || category !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="hidden rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200 sm:block"
            >
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-bold">Unable to load products</p>

            <p className="mt-1 text-sm">{error}</p>

            <button
              onClick={fetchProducts}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white"
              >
                <div className="h-64 animate-pulse bg-slate-200" />

                <div className="space-y-3 p-5">
                  <div className="h-4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
            <div className="text-6xl">🔍</div>

            <h3 className="mt-5 text-2xl font-black">No products found</h3>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              We couldn't find any products matching your search. Try another
              search term.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";

                        const parent = e.currentTarget.parentElement;

                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex h-full w-full items-center justify-center text-6xl">
                              📦
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl">
                      📦
                    </div>
                  )}

                  {/* Stock */}
                  <div className="absolute left-4 top-4">
                    {product.stock > 0 ? (
                      <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-emerald-600 shadow-sm backdrop-blur">
                        ✓ In Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-red-600 shadow-sm backdrop-blur">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Product Link */}
                  <Link
                    href={`/products/${product.id}`}
                    className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-white text-lg opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100 hover:bg-blue-600 hover:text-white"
                    aria-label={`View ${product.name}`}
                  >
                    ↗
                  </Link>
                </div>

                {/* Details */}
                <div className="p-5">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="line-clamp-1 text-lg font-black transition hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                    disabled={product.stock === 0}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition ${
                      product.stock === 0
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : addedProductId === product.id
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-950 text-white hover:bg-blue-600"
                    }`}
                  >
                    {product.stock === 0 ? (
                      "Out of Stock"
                    ) : addedProductId === product.id ? (
                      <>✓ Added to Cart</>
                    ) : (
                      <>🛒 Add to Cart</>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8 md:pb-16">
        <div className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-center text-white md:px-12 md:py-14">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            ShopEase
          </p>

          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Ready to find your next favorite?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            Add your favorite products to your cart and enjoy a simple shopping
            experience.
          </p>

          <Link
            href="/cart"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 font-black text-white transition hover:bg-blue-500"
          >
            View Cart 🛒
          </Link>
        </div>
      </section>
    </div>
  );
}
