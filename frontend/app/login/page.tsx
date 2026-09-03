"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      // Go back to homepage
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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl shadow-lg">
              🛍️
            </div>

            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>

            <p className="mt-2 text-sm text-slate-300">
              Sign in to continue shopping with ShopEase
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          {/* Register */}
          <div className="mt-7 text-center text-sm text-slate-300">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-400 transition hover:text-indigo-300"
            >
              Create Account
            </Link>
          </div>

          {/* Back */}
          <div className="mt-5 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
