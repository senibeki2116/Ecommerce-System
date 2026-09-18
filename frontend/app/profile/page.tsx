"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      {" "}
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700"
        >
          ← Back to Home
        </Link>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-950">My Account</h1>

          <p className="mt-2 text-slate-500">
            Manage your account and shopping activity.
          </p>
        </div>
        {/* Profile Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Blue Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-8 text-white">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
                👤
              </div>

              <div>
                <h2 className="text-2xl font-black">Welcome Back!</h2>

                <p className="mt-1 text-blue-100">E-Shop Customer Account</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {/* Orders */}
            <Link
              href="/orders"
              className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                📦
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600">
                My Orders
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View and track your orders.
              </p>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl">
                ❤️
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600">
                Wishlist
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View your saved products.
              </p>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                🛒
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600">
                Shopping Cart
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View products in your cart.
              </p>
            </Link>

            {/* Products */}
            <Link
              href="/products"
              className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                🛍️
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600">
                Browse Products
              </h3>

              <p className="mt-1 text-sm text-slate-500">Continue shopping.</p>
            </Link>
          </div>

          {/* Account Status */}
          <div className="border-t border-slate-100 p-6">
            <div className="mb-5 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Account Status
              </p>

              <p
                className={`mt-2 font-black ${
                  isLoggedIn ? "text-green-600" : "text-red-500"
                }`}
              >
                {isLoggedIn ? "● Logged In" : "● Not Logged In"}
              </p>
            </div>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="block w-full rounded-xl bg-blue-600 px-5 py-3 text-center font-black text-white transition hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
