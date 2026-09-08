"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./Context/CartContext";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("http://localhost:3001/products");

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();

        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error("Product loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const getImage = (product: Product, index: number) => {
    return product.image || fallbackImages[index % fallbackImages.length];
  };

  const handleAddToCart = (product: Product, index: number) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description ?? "Premium product",
      price: Number(product.price),
      image: getImage(product, index),
    });
  };

  const featuredProducts = products.slice(0, 4);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 text-xl font-black text-white shadow-lg shadow-blue-200">
              E
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">E-Shop</div>

              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
                Smart Shopping
              </div>
            </div>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-bold text-blue-600">
              Home
            </Link>

            <Link
              href="/products"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              Products
            </Link>

            <Link
              href="/orders"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              Orders
            </Link>

            <Link
              href="/cart"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              Cart
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg transition hover:border-blue-300 hover:bg-blue-50 sm:flex"
            >
              🛒
            </Link>

            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-blue-600"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-violet-50">
        {/* Decorative circles */}
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative mx-auto grid min-h-162.5 max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8">
          {/* LEFT */}
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                ✦
              </span>

              <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
                New collection available
              </span>
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.02] tracking-tighter sm:text-6xl lg:text-7xl">
              Everything you
              <br />
              <span className="bg-linear-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                love to shop.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500">
              Discover the latest technology, smart devices and everyday
              essentials — carefully selected for quality, style and value.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="group rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700"
              >
                Start shopping
                <span className="ml-3 transition group-hover:ml-5">→</span>
              </Link>

              <Link
                href="/products"
                className="rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:text-blue-600"
              >
                Explore products
              </Link>
            </div>

            {/* TRUST */}
            <div className="mt-12 flex flex-wrap items-center gap-8">
              <div>
                <div className="text-2xl font-black">10K+</div>

                <div className="text-xs font-medium text-slate-400">
                  Happy customers
                </div>
              </div>

              <div className="h-10 w-px bg-slate-200" />

              <div>
                <div className="flex items-center gap-1 text-lg font-black">
                  4.9
                  <span className="text-yellow-400">★</span>
                </div>

                <div className="text-xs font-medium text-slate-400">
                  Customer rating
                </div>
              </div>

              <div className="h-10 w-px bg-slate-200" />

              <div>
                <div className="text-2xl font-black">24/7</div>

                <div className="text-xs font-medium text-slate-400">
                  Customer support
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT HERO */}
          <div className="relative mx-auto w-full max-w-xl">
            {/* Main card */}
            <div className="relative overflow-hidden rounded-[3rem] border border-white bg-white p-4 shadow-2xl shadow-blue-100">
              <div className="relative overflow-hidden rounded-[2.4rem] bg-linear-to-br from-blue-100 to-violet-100">
                <img
                  src={
                    featuredProducts[0]
                      ? getImage(featuredProducts[0], 0)
                      : fallbackImages[0]
                  }
                  alt="Featured product"
                  className="h-117.5 w-full object-cover transition duration-700 hover:scale-105"
                />

                {/* Image overlay */}
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/50 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                        Featured product
                      </p>

                      <h3 className="mt-1 text-lg font-black">
                        {featuredProducts[0]?.name || "Premium Technology"}
                      </h3>
                    </div>

                    <Link
                      href="/products"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition hover:scale-110"
                    >
                      →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount badge */}
            <div className="absolute -right-4 top-8 flex h-24 w-24 rotate-12 flex-col items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-violet-600 text-white shadow-2xl">
              <span className="text-xl font-black">30%</span>

              <span className="text-[9px] font-bold uppercase tracking-widest">
                OFF
              </span>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                  ✓
                </div>

                <div>
                  <div className="text-sm font-black">Free delivery</div>

                  <div className="text-xs text-slate-400">
                    On selected orders
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK FEATURES
      ===================================================== */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 border-b border-r border-slate-100 p-7 lg:border-b-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl">
              🚚
            </div>

            <div>
              <h3 className="text-sm font-black">Fast delivery</h3>

              <p className="mt-1 text-xs text-slate-400">Quick & reliable</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b border-slate-100 p-7 lg:border-b-0 lg:border-r">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-xl">
              🔒
            </div>

            <div>
              <h3 className="text-sm font-black">Secure payment</h3>

              <p className="mt-1 text-xs text-slate-400">100% protected</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-r border-slate-100 p-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-xl">
              ↩️
            </div>

            <div>
              <h3 className="text-sm font-black">Easy returns</h3>

              <p className="mt-1 text-xs text-slate-400">Simple process</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-xl">
              💬
            </div>

            <div>
              <h3 className="text-sm font-black">24/7 support</h3>

              <p className="mt-1 text-xs text-slate-400">We're here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-blue-600">
              Popular right now
            </div>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Trending products
            </h2>

            <p className="mt-4 max-w-xl text-slate-500">
              Shop some of our most popular products, selected for quality and
              everyday performance.
            </p>
          </div>

          <Link
            href="/products"
            className="w-fit rounded-full border border-slate-200 px-5 py-3 text-sm font-bold transition hover:border-blue-300 hover:text-blue-600"
          >
            View all products →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-110 animate-pulse rounded-3xl bg-slate-100"
              />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-20 text-center">
            <div className="text-5xl">📦</div>

            <h3 className="mt-5 text-xl font-black">No products yet</h3>

            <p className="mt-2 text-slate-500">
              Add products from your admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-500 hover:-translate-y-2 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-100/50"
              >
                {/* IMAGE */}
                <div className="relative h-72 overflow-hidden bg-slate-100">
                  <img
                    src={getImage(product, index)}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Popular
                  </div>

                  <div className="absolute bottom-4 right-4 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Link
                      href="/products"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-xl"
                    >
                      ↗
                    </Link>
                  </div>
                </div>

                {/* INFO */}
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm tracking-widest text-yellow-400">
                      ★★★★★
                    </span>

                    <span className="text-xs font-medium text-slate-400">
                      4.9
                    </span>
                  </div>

                  <h3 className="mt-3 truncate text-lg font-black">
                    {product.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 h-10 text-sm leading-5 text-slate-500">
                    {product.description ||
                      "Premium quality product made for your everyday needs."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black">
                        ${Number(product.price).toFixed(2)}
                      </span>

                      {product.stock > 0 && (
                        <span className="ml-2 text-xs font-semibold text-green-600">
                          In stock
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product, index)}
                    disabled={product.stock <= 0}
                    className="mt-5 w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200"
                  >
                    {product.stock > 0 ? "Add to cart" : "Out of stock"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          BIG PROMO
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
          {/* Decorative shapes */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 right-40 h-80 w-80 rounded-full bg-white/10" />

          <div className="relative grid items-center gap-10 px-8 py-14 sm:px-14 lg:grid-cols-2 lg:px-20 lg:py-20">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur">
                Limited offer
              </span>

              <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                Upgrade your
                <br />
                everyday tech.
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-blue-100">
                Get amazing products at prices you'll love. Don't miss our
                latest deals and new arrivals.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex rounded-full bg-white px-7 py-4 text-sm font-black text-blue-700 shadow-xl transition hover:-translate-y-1"
              >
                Shop the deals →
              </Link>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="translate-y-8 overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl">
                  <img
                    src={fallbackImages[1]}
                    alt="Smartphone"
                    className="h-48 w-full object-cover"
                  />
                </div>

                <div className="overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl">
                  <img
                    src={fallbackImages[2]}
                    alt="Headphones"
                    className="h-48 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
    WHY SHOP WITH US - ACTIVE UI
===================================================== */}
      <section className="relative overflow-hidden bg-slate-50 py-28">
        {/* Background decorations */}
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          {/* Section heading */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                ✦
              </span>

              <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                Why choose E-Shop
              </span>
            </div>

            <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Shopping made{" "}
              <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                simple.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500">
              Everything you need for a smooth, secure and enjoyable shopping
              experience.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {/* CARD 1 */}
            <div className="group relative overflow-hidden rounded-4xl border border-blue-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-200/40">
              {/* Decorative circle */}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-100" />

              <div className="relative">
                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 text-3xl shadow-lg shadow-blue-200 transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                  ⚡
                </div>

                {/* Number */}
                <span className="absolute right-0 top-0 text-5xl font-black text-slate-100 transition group-hover:text-blue-50">
                  01
                </span>

                <h3 className="mt-8 text-2xl font-black text-slate-900">
                  Fast & simple
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  Find what you need quickly with a clean and easy shopping
                  experience designed around you.
                </p>

                <Link
                  href="/products"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-black text-blue-600 transition-all group-hover:gap-4"
                >
                  Start shopping
                  <span>→</span>
                </Link>
              </div>

              {/* Bottom line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />
            </div>

            {/* CARD 2 */}
            <div className="group relative overflow-hidden rounded-4xl border border-violet-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-200/40">
              {/* Decorative circle */}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-violet-100" />

              <div className="relative">
                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-purple-700 text-3xl shadow-lg shadow-violet-200 transition duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  💎
                </div>

                {/* Number */}
                <span className="absolute right-0 top-0 text-5xl font-black text-slate-100 transition group-hover:text-violet-50">
                  02
                </span>

                <h3 className="mt-8 text-2xl font-black text-slate-900">
                  Quality products
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  We focus on products that combine quality, performance and
                  modern design.
                </p>

                <Link
                  href="/products"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-black text-violet-600 transition-all group-hover:gap-4"
                >
                  Explore products
                  <span>→</span>
                </Link>
              </div>

              {/* Bottom line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-violet-600 transition-all duration-500 group-hover:w-full" />
            </div>

            {/* CARD 3 */}
            <div className="group relative overflow-hidden rounded-4xl border border-emerald-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-200/40">
              {/* Decorative circle */}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-emerald-100" />

              <div className="relative">
                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-green-600 text-3xl shadow-lg shadow-emerald-200 transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                  ❤️
                </div>

                {/* Number */}
                <span className="absolute right-0 top-0 text-5xl font-black text-slate-100 transition group-hover:text-emerald-50">
                  03
                </span>

                <h3 className="mt-8 text-2xl font-black text-slate-900">
                  Customer first
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  Your satisfaction matters. We're always here whenever you need
                  help.
                </p>

                <Link
                  href="/products"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-black text-emerald-600 transition-all group-hover:gap-4"
                >
                  Shop with confidence
                  <span>→</span>
                </Link>
              </div>

              {/* Bottom line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 transition-all duration-500 group-hover:w-full" />
            </div>
          </div>

          {/* Bottom statistics */}
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">10K+</div>
              <div className="mt-1 text-xs font-medium text-slate-400">
                Happy customers
              </div>
            </div>

            <div className="border-l border-slate-100 text-center">
              <div className="text-2xl font-black text-slate-900">500+</div>
              <div className="mt-1 text-xs font-medium text-slate-400">
                Products
              </div>
            </div>

            <div className="border-l border-slate-100 text-center">
              <div className="text-2xl font-black text-slate-900">
                4.9
                <span className="ml-1 text-yellow-400">★</span>
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">
                Average rating
              </div>
            </div>

            <div className="border-l border-slate-100 text-center">
              <div className="text-2xl font-black text-slate-900">24/7</div>
              <div className="mt-1 text-xs font-medium text-slate-400">
                Support
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
