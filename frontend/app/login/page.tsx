"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed. Please check your email and password.",
        );
      }

      // Save JWT token
      localStorage.setItem("accessToken", data.accessToken);

      // Save logged-in user
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect to homepage
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 text-xl font-black text-white shadow-lg shadow-blue-200">
              E
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900">
                E-Shop
              </div>

              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
                Smart Shopping
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
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

          <Link
            href="/register"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            Create account
          </Link>
        </div>
      </header>

      {/* =====================================================
          LOGIN AREA
      ===================================================== */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-linear-to-br from-blue-50 via-white to-violet-50">
        {/* Background decorations */}

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-125 w-125 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-100/30 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-2 lg:px-8 lg:py-16">
          {/* =================================================
              LEFT SIDE
          ================================================= */}
          <div className="hidden lg:block">
            <div className="max-w-xl">
              {/* Small badge */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  ✦
                </span>

                <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Welcome to E-Shop
                </span>
              </div>

              {/* Heading */}

              <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.04em] text-slate-900 xl:text-6xl">
                Your shopping
                <br />
                <span className="bg-linear-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                  starts here.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-500">
                Sign in to your E-Shop account and continue discovering products
                you'll love.
              </p>

              {/* Product visual */}

              <div className="relative mt-10 h-77.5 overflow-hidden rounded-[2.5rem] border border-white bg-white p-3 shadow-2xl shadow-blue-100">
                <div className="relative h-full overflow-hidden rounded-4xl bg-linear-to-br from-blue-100 via-violet-100 to-fuchsia-100">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                    alt="E-Shop shopping"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />

                  {/* Image overlay */}

                  <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/50 bg-white/85 p-4 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                          🛍️
                        </div>

                        <div>
                          <p className="text-sm font-black text-slate-900">
                            Shop smarter
                          </p>

                          <p className="text-xs text-slate-400">
                            Quality products, better prices
                          </p>
                        </div>
                      </div>

                      <span className="text-lg">✨</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust items */}

              <div className="mt-7 flex gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>

                  <span className="text-xs font-bold text-slate-500">
                    Secure
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>

                  <span className="text-xs font-bold text-slate-500">Fast</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg">💙</span>

                  <span className="text-xs font-bold text-slate-500">
                    Trusted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT LOGIN CARD
          ================================================= */}
          <div className="mx-auto w-full max-w-md">
            {/* Mobile brand */}

            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 text-2xl font-black text-white shadow-xl shadow-blue-200">
                E
              </div>

              <h1 className="mt-4 text-3xl font-black text-slate-900">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue shopping
              </p>
            </div>

            {/* Card */}

            <div className="rounded-4xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-200/60 sm:p-9">
              {/* Card header */}

              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  👋
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your details to access your account.
                </p>
              </div>

              {/* Error */}

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-600">
                  <span className="mt-0.5">⚠️</span>

                  <p className="leading-5">{error}</p>
                </div>
              )}

              {/* Form */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ✉
                    </span>

                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-bold text-slate-700"
                    >
                      Password
                    </label>

                    <span className="text-xs font-semibold text-slate-400">
                      Required
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔒
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-14 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-sm text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Remember / help */}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />

                    <span className="text-xs font-semibold text-slate-500">
                      Remember me
                    </span>
                  </label>

                  <span className="text-xs font-semibold text-blue-600">
                    Secure login
                  </span>
                </div>

                {/* Login button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-blue-600 to-violet-600 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-violet-700 hover:shadow-2xl hover:shadow-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to E-Shop
                      <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100" />

                <span className="text-xs font-semibold text-slate-400">
                  New to E-Shop?
                </span>

                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Register */}

              <Link
                href="/register"
                className="flex h-13 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                Create a new account
              </Link>

              {/* Back */}

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-xs font-bold text-slate-400 transition hover:text-blue-600"
                >
                  ← Back to E-Shop
                </Link>
              </div>
            </div>

            {/* Bottom security message */}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <span>🔒</span>

              <span>Your information is protected and secure</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
