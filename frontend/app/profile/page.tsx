"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

type User = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
};

type Order = {
  id: string | number;
  status: string;
  total?: number;
  createdAt?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
    loadWishlist();
    loadCart();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return;
        }

        throw new Error("Failed to load profile");
      }

      const data = await response.json();

      console.log("PROFILE RESPONSE:", data);

      setUser(data.user);
    } catch (err) {
      console.error(err);
      setError("Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) return;

      const response = await fetch(`${API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      if (Array.isArray(data)) {
        setWishlistCount(data.length);
      } else if (Array.isArray(data?.items)) {
        setWishlistCount(data.items.length);
      } else if (data?.items) {
        setWishlistCount(Object.keys(data.items).length);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      const cart = JSON.parse(savedCart);

      if (Array.isArray(cart)) {
        setCartCount(cart.length);
      } else if (typeof cart === "object") {
        setCartCount(
          Object.values(cart).reduce(
            (total: number, quantity: unknown) => total + Number(quantity || 0),
            0,
          ),
        );
      }
    } catch (err) {
      console.error("Cart error:", err);
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f9ff] px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-slate-200" />

          <div className="h-72 animate-pulse rounded-4xl bg-white shadow-sm" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="h-96 animate-pulse rounded-3xl bg-white" />
            <div className="h-96 animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f9ff] px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-blue-100/50">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            Profile unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "We could not find your account information."}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const displayName = user.name || "Customer";
  const displayEmail = user.email || "No email available";
  const displayRole = user.role || "CUSTOMER";
  const displayId = user.id ?? "N/A";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#f5f9ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Heading */}
        <div className="mb-7">
          <p className="text-sm font-bold text-blue-600">ACCOUNT CENTER</p>

          <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Manage your account, orders and shopping preferences.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>

        {/* Profile Hero */}
        <section className="relative overflow-hidden rounded-4xl bg-white shadow-xl shadow-blue-100/50">
          {/* Blue Cover */}
          <div className="relative h-48 overflow-hidden bg-linear-to-br from-blue-700 via-blue-600 to-cyan-500 sm:h-56">
            {/* Decorative circles */}
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute right-24 top-12 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10" />

            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] bg-size-[24px_24px]" />
            </div>

            <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md sm:left-8">
              ✦ Premium Account
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-7 sm:px-8">
            <div className="-mt-16 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
              {/* Avatar + User */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-4xl border-[6px] border-white bg-linear-to-br from-blue-500 to-cyan-400 text-5xl font-black text-white shadow-2xl shadow-blue-200">
                  {initial}
                </div>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">
                      {displayName}
                    </h2>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-600">
                      ✓ Active
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">{displayEmail}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-600">
                      {displayRole}
                    </span>

                    <span className="text-xs font-semibold text-slate-400">
                      ID: {String(displayId)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                ✎ Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* Main Dashboard */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="px-3 pb-3 pt-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
              My Account
            </p>

            <div className="space-y-1">
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3.5 text-sm font-black text-blue-600"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                  👤
                </span>
                Profile
              </Link>

              <Link
                href="/orders"
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    📦
                  </span>
                  Orders
                </span>

                <span className="text-xs text-slate-400">→</span>
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                    ♥
                  </span>
                  Wishlist
                </span>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
                  {wishlistCount}
                </span>
              </Link>

              <Link
                href="/cart"
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    🛒
                  </span>
                  Cart
                </span>

                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-600">
                  {cartCount}
                </span>
              </Link>
            </div>

            <div className="my-4 h-px bg-slate-100" />

            <p className="px-3 pb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
              Account
            </p>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                ⚙️
              </span>
              Settings
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-500 transition hover:bg-red-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                ↪
              </span>
              Logout
            </button>
          </aside>

          {/* Right Content */}
          <section className="space-y-6">
            {/* Welcome */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-100 sm:p-7">
              <div className="relative z-10 max-w-xl">
                <p className="text-sm font-bold text-blue-100">
                  YOUR SHOPPING SPACE
                </p>

                <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                  Welcome back, {displayName.split(" ")[0]} 👋
                </h2>

                <p className="mt-2 text-sm leading-6 text-blue-50">
                  Everything you need for your shopping account is available
                  here. Check your orders, wishlist and cart anytime.
                </p>
              </div>

              <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-40 border-white/10" />
              <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full border-30 border-white/10" />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/orders"
                className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                    📦
                  </div>

                  <span className="text-slate-300 transition group-hover:text-blue-500">
                    →
                  </span>
                </div>

                <p className="mt-5 text-3xl font-black text-slate-950">
                  {orders.length || 0}
                </p>

                <p className="mt-1 text-sm font-bold text-slate-500">
                  Total Orders
                </p>
              </Link>

              <Link
                href="/wishlist"
                className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-100/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-xl text-pink-500">
                    ♥
                  </div>

                  <span className="text-slate-300 transition group-hover:text-pink-500">
                    →
                  </span>
                </div>

                <p className="mt-5 text-3xl font-black text-slate-950">
                  {wishlistCount}
                </p>

                <p className="mt-1 text-sm font-bold text-slate-500">
                  Wishlist Items
                </p>
              </Link>

              <Link
                href="/cart"
                className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-100/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-xl">
                    🛒
                  </div>

                  <span className="text-slate-300 transition group-hover:text-cyan-500">
                    →
                  </span>
                </div>

                <p className="mt-5 text-3xl font-black text-slate-950">
                  {cartCount}
                </p>

                <p className="mt-1 text-sm font-bold text-slate-500">
                  Cart Items
                </p>
              </Link>
            </div>

            {/* Personal Information */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                    Account Details
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your basic account information.
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-600 transition hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <InfoCard icon="👤" label="Full Name" value={displayName} />

                <InfoCard
                  icon="✉️"
                  label="Email Address"
                  value={displayEmail}
                />

                <InfoCard icon="🛡️" label="Account Role" value={displayRole} />

                <InfoCard
                  icon="#"
                  label="Account ID"
                  value={String(displayId)}
                />
              </div>
            </div>

            {/* Account Security */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                  🔐
                </div>

                <div>
                  <h2 className="font-black text-slate-950">
                    Account Security
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your account is protected with secure authentication.
                  </p>
                </div>

                <div className="ml-auto hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600 sm:block">
                  Protected
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-slate-800">
                      Password & Login
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage your login credentials and account access.
                    </p>
                  </div>

                  <Link
                    href="/login"
                    className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-blue-600"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="py-8 text-center">
          <p className="text-xs font-semibold text-slate-400">
            © 2026 E-Shop • Your shopping account
          </p>
        </div>
      </div>
    </main>
  );
}

/* --------------------------------
   Information Card
-------------------------------- */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-black text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
