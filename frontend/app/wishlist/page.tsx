"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:3001";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
};

type WishlistItem = {
  id: number;
  productId: number;
  product: Product;
};

type Wishlist = {
  id: number;
  userId: number;
  items: WishlistItem[];
};

export default function WishlistPage() {
  const router = useRouter();

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [cartMessage, setCartMessage] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  };

  const loadWishlist = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load wishlist");
      }

      const data = await response.json();
      setWishlist(data);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeFromWishlist = async (productId: number) => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setRemovingId(productId);

      const response = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove product");
      }

      setWishlist((current) => {
        if (!current) return current;

        return {
          ...current,
          items: current.items.filter((item) => item.productId !== productId),
        };
      });
    } catch (error) {
      console.error("Remove wishlist error:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = async (product: Product) => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      setCartMessage(`${product.name} added to cart`);

      setTimeout(() => {
        setCartMessage("");
      }, 2500);
    } catch (error) {
      console.error("Cart error:", error);
      setCartMessage("Could not add product to cart");

      setTimeout(() => {
        setCartMessage("");
      }, 2500);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-3 h-5 w-40 animate-pulse rounded-lg bg-slate-200" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="h-64 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-8 w-1/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const items = wishlist?.items ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Toast */}
      {cartMessage && (
        <div className="fixed right-4 top-5 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {cartMessage}
        </div>
      )}

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                href="/products"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
              >
                ← Continue Shopping
              </Link>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                My Wishlist
              </h1>

              <p className="mt-2 text-slate-500">
                Save your favorite products and come back to them anytime.
              </p>
            </div>

            <Link
              href="/cart"
              className="inline-flex w-fit items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              🛒 View Cart
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="flex min-h-125 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-5xl">
              ♡
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              Your wishlist is empty
            </h2>

            <p className="mt-3 max-w-md text-slate-500">
              You haven't saved any products yet. Browse our products and tap
              the heart icon to save something you love.
            </p>

            <Link
              href="/products"
              className="mt-7 rounded-2xl bg-blue-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Saved Products
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  {items.length} {items.length === 1 ? "Product" : "Products"}
                </h2>
              </div>

              <Link
                href="/products"
                className="text-sm font-bold text-slate-600 transition hover:text-blue-600"
              >
                + Add more products
              </Link>
            </div>

            {/* Product Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const product = item.product;

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <Link href={`/products/${product.id}`}>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            No image
                          </div>
                        )}
                      </Link>

                      {/* Wishlist button */}
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        disabled={removingId === product.id}
                        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl shadow-lg backdrop-blur transition hover:scale-105 hover:bg-red-50"
                        title="Remove from wishlist"
                      >
                        {removingId === product.id ? "…" : "♥"}
                      </button>

                      {/* Stock */}
                      <div className="absolute bottom-4 left-4">
                        {product.stock > 0 ? (
                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-600 shadow backdrop-blur">
                            ✓ In Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-red-600 shadow backdrop-blur">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product info */}
                    <div className="p-5">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="line-clamp-1 text-lg font-black text-slate-900 transition group-hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {product.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900">
                          ${product.price.toFixed(2)}
                        </span>

                        <span className="text-sm text-slate-400">
                          {product.stock} left
                        </span>
                      </div>

                      {/* Buttons */}
                      <div className="mt-5 flex gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        >
                          Details
                        </Link>

                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="flex-1 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
