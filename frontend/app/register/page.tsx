"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again.",
        );
      }

      setSuccess(data.message || "Account created successfully!");

      // Small delay so user can see success message
      setTimeout(() => {
        router.push("/login");
      }, 1200);
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
          {/* LOGO */}
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

          {/* NAVIGATION */}
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
            href="/login"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* =====================================================
          REGISTER SECTION
      ===================================================== */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-linear-to-br from-blue-50 via-white to-violet-50">
        {/* Background decoration */}

        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-125 w-125 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-100/30 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-2 lg:px-8 lg:py-16">
          {/* =================================================
              LEFT SIDE
          ================================================= */}
          <div className="hidden lg:block">
            <div className="max-w-xl">
              {/* Badge */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  ✦
                </span>

                <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Join E-Shop
                </span>
              </div>

              {/* Heading */}

              <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.04em] text-slate-900 xl:text-6xl">
                Create your
                <br />
                <span className="bg-linear-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                  shopping account.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-500">
                Join E-Shop and discover a better way to shop. Save your orders,
                manage your cart and enjoy a smooth shopping experience.
              </p>

              {/* Benefits */}

              <div className="mt-10 space-y-4">
                {/* Benefit 1 */}

                <div className="flex items-center gap-4 rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                    🛍️
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Easy shopping
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Browse and order your favorite products.
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}

                <div className="flex items-center gap-4 rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xl">
                    📦
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Track your orders
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Keep everything organized in one place.
                    </p>
                  </div>
                </div>

                {/* Benefit 3 */}

                <div className="flex items-center gap-4 rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                    🔒
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Secure account
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Your account and information stay protected.
                    </p>
                  </div>
                </div>
              </div>

              {/* Small stats */}

              <div className="mt-8 flex items-center gap-8">
                <div>
                  <div className="text-2xl font-black text-slate-900">10K+</div>

                  <div className="text-xs text-slate-400">Customers</div>
                </div>

                <div className="h-10 w-px bg-slate-200" />

                <div>
                  <div className="text-2xl font-black text-slate-900">
                    4.9
                    <span className="ml-1 text-yellow-400">★</span>
                  </div>

                  <div className="text-xs text-slate-400">Rating</div>
                </div>

                <div className="h-10 w-px bg-slate-200" />

                <div>
                  <div className="text-2xl font-black text-slate-900">24/7</div>

                  <div className="text-xs text-slate-400">Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              REGISTER CARD
          ================================================= */}
          <div className="mx-auto w-full max-w-md">
            {/* Mobile heading */}

            <div className="mb-7 text-center lg:hidden">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 text-2xl font-black text-white shadow-xl shadow-blue-200">
                E
              </div>

              <h1 className="mt-4 text-3xl font-black text-slate-900">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-slate-500">Join E-Shop today</p>
            </div>

            {/* Card */}

            <div className="rounded-4xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-200/60 sm:p-9">
              {/* Header */}

              <div className="mb-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  ✨
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  Create account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create your E-Shop account in just a few steps.
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-600">
                  <span>⚠️</span>

                  <p className="leading-5">{error}</p>
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-600">
                  <span>✓</span>

                  <p className="leading-5">{success}</p>
                </div>
              )}

              {/* FORM */}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* NAME */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      👤
                    </span>

                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* EMAIL */}

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

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔒
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-14 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-sm text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔐
                    </span>

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-14 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-sm text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* PASSWORD REQUIREMENT */}

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        password.length >= 8
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      ✓
                    </span>

                    <span className="text-xs font-semibold text-slate-500">
                      Password must contain at least 8 characters
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={
                        password &&
                        confirmPassword &&
                        password === confirmPassword
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      ✓
                    </span>

                    <span className="text-xs font-semibold text-slate-500">
                      Passwords must match
                    </span>
                  </div>
                </div>

                {/* CREATE ACCOUNT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-blue-600 to-violet-600 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-violet-700 hover:shadow-2xl hover:shadow-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create my account
                      <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* DIVIDER */}

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100" />

                <span className="text-xs font-semibold text-slate-400">
                  Already registered?
                </span>

                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* LOGIN */}

              <Link
                href="/login"
                className="flex h-13 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                Sign in to your account
              </Link>

              {/* BACK */}

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-xs font-bold text-slate-400 transition hover:text-blue-600"
                >
                  ← Back to E-Shop
                </Link>
              </div>
            </div>

            {/* Security */}

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
