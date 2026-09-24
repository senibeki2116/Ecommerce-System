"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../Context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type User = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
};

export default function ProfilePage() {
  const { cartCount } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadProfile();
    loadWishlist();
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
      } else {
        setWishlistCount(0);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirmation password do not match.");
      return;
    }

    alert("Password validation successful.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowChangePassword(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-100 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="font-semibold text-slate-500">
                Loading your profile...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            Unable to load profile
          </h1>

          <p className="mt-2 text-slate-500">
            {error || "Your profile could not be found."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
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
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* ================= HEADER ================= */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                My Account
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Profile
              </h1>

              <p className="mt-2 text-slate-500">
                Manage your account, orders and preferences.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                ← Continue Shopping
              </Link>

              <button
                onClick={() => setShowSettings(true)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                ⚙ Settings
              </button>
            </div>
          </div>

          {/* ================= PROFILE HERO ================= */}
          <section className="mb-6 overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl font-black text-blue-600 shadow-lg">
                    {initial}
                  </div>

                  <div className="text-white">
                    <p className="mb-1 text-sm font-semibold text-blue-100">
                      Welcome back
                    </p>

                    <h2 className="text-2xl font-black sm:text-3xl">
                      {displayName}
                    </h2>

                    <p className="mt-1 text-sm text-blue-100">{displayEmail}</p>

                    <div className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      {displayRole}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-100">
                    Customer ID
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-white">
                    #{displayId}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================= QUICK STATS ================= */}
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoCard
              icon="🛒"
              title="Cart Items"
              value={cartCount}
              href="/cart"
              description="Items waiting in your cart"
            />

            <InfoCard
              icon="❤️"
              title="Wishlist"
              value={wishlistCount}
              href="/wishlist"
              description="Products you saved"
            />

            <InfoCard
              icon="📦"
              title="Orders"
              value="View"
              href="/orders"
              description="Track your recent orders"
            />
          </section>

          {/* ================= MAIN CONTENT ================= */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT SIDE */}
            <aside className="space-y-6">
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-400">
                  Account Menu
                </h3>

                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 font-bold text-blue-700"
                  >
                    <span>👤</span>
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>📦</span>
                    <span>My Orders</span>
                  </Link>

                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>❤️</span>
                    <span>Wishlist</span>

                    {wishlistCount > 0 && (
                      <span className="ml-auto rounded-full bg-pink-100 px-2 py-0.5 text-xs font-black text-pink-600">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/cart"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <span>🛒</span>
                    <span>Shopping Cart</span>

                    {cartCount > 0 && (
                      <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-600">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Security
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep your account secure by using a strong password and
                  protecting your login information.
                </p>

                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowChangePassword(true);
                  }}
                  className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  🔒 Change Password
                </button>
              </div>
            </aside>

            {/* RIGHT SIDE */}
            <section className="space-y-6 lg:col-span-2">
              {/* PERSONAL INFORMATION */}
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                      Account Information
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      Personal Information
                    </h2>
                  </div>

                  <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl sm:flex">
                    👤
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Full Name
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {displayName}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Email Address
                    </p>

                    <p className="mt-2 break-all font-bold text-slate-900">
                      {displayEmail}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Account Role
                    </p>

                    <p className="mt-2 font-bold uppercase text-slate-900">
                      {displayRole}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      User ID
                    </p>

                    <p className="mt-2 font-mono font-bold text-slate-900">
                      {displayId}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCOUNT STATUS */}
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                      Account Status
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Your account is active
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      You can shop, manage your cart and place orders.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Active
                  </div>
                </div>
              </div>

              {/* LOGOUT */}
              <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-black text-red-700">
                      Sign out of your account
                    </h3>

                    <p className="mt-1 text-sm text-red-600/70">
                      You can sign back in anytime using your email and
                      password.
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* SMALL SETTINGS MODAL */}
      {/* ========================================================= */}

      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => {
            setShowSettings(false);
            setShowChangePassword(false);
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* SETTINGS HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Preferences
                </p>

                <h2 className="mt-0.5 text-xl font-black text-slate-900">
                  Settings
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setShowChangePassword(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* SETTINGS CONTENT */}
            {!showChangePassword ? (
              <div className="space-y-3 p-4">
                {/* ACCOUNT */}
                <div className="rounded-xl border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                      👤
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800">
                        Account
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* NOTIFICATIONS */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-lg">
                      🔔
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Notifications
                      </p>

                      <p className="text-xs text-slate-400">
                        Receive app notifications
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotifications(!notifications)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      notifications ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        notifications ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* EMAIL */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-lg">
                      ✉️
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Email Updates
                      </p>

                      <p className="text-xs text-slate-400">
                        Receive account emails
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEmailUpdates(!emailUpdates)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      emailUpdates ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        emailUpdates ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* CHANGE PASSWORD */}
                <button
                  type="button"
                  onClick={() => setShowChangePassword(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-lg">
                      🔒
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Change Password
                      </p>

                      <p className="text-xs text-slate-400">
                        Update your account password
                      </p>
                    </div>
                  </div>

                  <span className="text-lg text-slate-400">→</span>
                </button>
              </div>
            ) : (
              /* ========================================================= */
              /* CHANGE PASSWORD */
              /* ========================================================= */

              <div className="p-4">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="mb-3 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  ← Back to Settings
                </button>

                <div className="mb-4 rounded-xl bg-blue-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                      🔒
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Change Password
                      </h3>

                      <p className="text-xs text-slate-500">
                        Keep your account secure
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* CURRENT PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      Current Password
                    </label>

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* NEW PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      New Password
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* PASSWORD REQUIREMENTS */}
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="mb-1.5 text-xs font-black text-slate-700">
                      Password requirements
                    </p>

                    <div className="space-y-1 text-xs">
                      <p
                        className={
                          newPassword.length >= 6
                            ? "font-semibold text-emerald-600"
                            : "text-slate-400"
                        }
                      >
                        {newPassword.length >= 6 ? "✓" : "○"} At least 6
                        characters
                      </p>

                      <p
                        className={
                          newPassword &&
                          confirmPassword &&
                          newPassword === confirmPassword
                            ? "font-semibold text-emerald-600"
                            : "text-slate-400"
                        }
                      >
                        {newPassword &&
                        confirmPassword &&
                        newPassword === confirmPassword
                          ? "✓"
                          : "○"}{" "}
                        Passwords match
                      </p>
                    </div>
                  </div>
                </div>

                {/* PASSWORD BUTTONS */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setShowChangePassword(false);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* SETTINGS FOOTER */}
            {!showChangePassword && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function InfoCard({
  icon,
  title,
  value,
  href,
  description,
}: {
  icon: string;
  title: string;
  value: string | number;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
          {icon}
        </div>

        <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
          →
        </span>
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
}
