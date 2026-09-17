"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../Context/CartContext";

export cdefault function Navbar() {
  const { cartCount } = useCart();

  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");

  // Check login status
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    checkLogin();

    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, [pathname]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    router.push("/login");
  };

  // Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="w-full bg-white">
      {/* ================= TOP HEADER ================= */}
      <div className="border-b border-gray-100">
        <div className="mx-auto flex max-w-350 items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-red-500 text-xl font-black text-white shadow-md">
              E
            </div>

            <div>
              <div className="text-2xl font-extrabold tracking-tight text-orange-600">
                E-Shop
              </div>

              <div className="text-[10px] font-semibold tracking-[0.25em] text-gray-400">
                SMART SHOPPING
              </div>
            </div>
          </Link>

          {/* Left menu */}
          <div className="hidden items-center gap-7 lg:flex">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-orange-600"
            >
              <span className="text-lg">☰</span>
              All categories
            </button>

            <Link
              href="/products"
              className="text-sm font-medium text-gray-700 transition hover:text-orange-600"
            >
              Verified sellers
            </Link>

            <Link
              href="/products"
              className="text-sm font-medium text-gray-700 transition hover:text-orange-600"
            >
              Dropshipping
            </Link>
          </div>

          {/* Right menu */}
          <div className="flex items-center gap-5">
            <div className="hidden text-sm text-gray-600 xl:block">
              <span className="text-xs text-gray-400">Deliver to:</span>
              <div className="font-medium">🇪🇹 ET</div>
            </div>

            <button
              type="button"
              className="hidden text-sm font-medium text-gray-600 transition hover:text-orange-600 md:block"
            >
              🌐 English-ETB
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-xl transition hover:border-orange-400 hover:text-orange-600"
              aria-label="Shopping cart"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login / Logout */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-orange-600"
              >
                <span className="text-xl">👤</span>
                Sign in
              </Link>
            )}

            {!isLoggedIn && (
              <Link
                href="/register"
                className="hidden rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 md:block"
              >
                Create account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ================= MAIN NAVIGATION ================= */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-350 items-center justify-center gap-8 px-6 py-5">
          <button
            type="button"
            className="text-2xl font-extrabold text-gray-900 transition hover:text-orange-600"
          >
            AI Mode
          </button>

          <span className="h-7 w-px bg-gray-300"></span>

          <Link
            href="/products"
            className="border-b-[3px] border-orange-500 pb-2 text-2xl font-extrabold text-orange-600"
          >
            Products
          </Link>

          <Link
            href="/products"
            className="text-2xl font-extrabold text-gray-900 transition hover:text-orange-600"
          >
            Manufacturers
          </Link>

          <Link
            href="/products"
            className="text-2xl font-extrabold text-gray-900 transition hover:text-orange-600"
          >
            Worldwide
          </Link>
        </div>
      </div>

      {/* ================= SEARCH AREA ================= */}
      <div className="bg-linear-to-b from-white to-orange-50/30 px-6 pb-8 pt-5">
        <div className="mx-auto max-w-240">
          <form
            onSubmit={handleSearch}
            className="overflow-hidden rounded-2xl border-2 border-orange-500 bg-white shadow-lg"
          >
            {/* Search input */}
            <div className="flex items-center px-5 pt-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, suppliers, categories..."
                className="w-full bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Search bottom */}
            <div className="flex items-center justify-between px-5 pb-4 pt-4">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-orange-600"
              >
                <span className="text-xl">🖼️</span>
                Image Search
              </button>

              <button
                type="submit"
                className="rounded-full bg-linear-to-r from-orange-400 to-orange-600 px-8 py-3 font-bold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg"
              >
                🔍 Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= QUICK LINKS ================= */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-350 items-center justify-center gap-8 px-6 py-4 text-sm font-semibold text-gray-700">
          <Link
            href="/products"
            className="flex items-center gap-2 transition hover:text-orange-600"
          >
            📋 Request for Quotation
          </Link>

          <span className="h-5 w-px bg-gray-300"></span>

          <Link
            href="/products"
            className="flex items-center gap-2 transition hover:text-orange-600"
          >
            🏆 Top Ranking
          </Link>

          <span className="h-5 w-px bg-gray-300"></span>

          <Link
            href="/products"
            className="flex items-center gap-2 transition hover:text-orange-600"
          >
            🛠️ Fast customization
          </Link>
        </div>
      </div>
    </header>
  );
}
