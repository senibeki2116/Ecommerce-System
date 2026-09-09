"use client";

import Link from "next/link";
import Navbar from "../Components/Navbar";
import { useCart } from "../Context/CartContext";

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const shipping = cartTotal >= 100 ? 0 : 10;
  const finalTotal = cartTotal + shipping;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 px-6 py-14 text-white">
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-200">
            <span>🛒</span>
            Shopping Cart
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Your Cart
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-blue-100 md:text-lg">
            Review your products, adjust quantities, and continue to checkout
            when you&apos;re ready.
          </p>
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        {cart.length === 0 ? (
          /* ================= EMPTY CART ================= */
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-blue-50 to-indigo-100 text-5xl shadow-inner">
              🛒
            </div>

            <h2 className="mt-7 text-3xl font-black text-slate-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-slate-500">
              You haven&apos;t added any products to your cart yet. Explore our
              collection and discover something you&apos;ll love.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
            >
              Start Shopping
              <span className="text-lg">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* ================= LEFT: CART ITEMS ================= */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Shopping Cart
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {cartCount} {cartCount === 1 ? "item" : "items"} in your
                    cart
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 hover:text-red-700"
                >
                  Clear Cart
                </button>
              </div>

              {/* Products */}
              <div className="space-y-5">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      {/* Product Image */}
                      <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-36 sm:w-36">
                        <img
                          src={
                            item.image ??
                            "https://placehold.co/600x600?text=Product"
                          }
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />

                        {/* Image overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
                      </div>

                      {/* Product Details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              {item.category && (
                                <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                                  {item.category}
                                </span>
                              )}

                              <h3 className="mt-2 truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                                {item.name}
                              </h3>
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              ✕
                            </button>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {item.description}
                          </p>
                        </div>

                        {/* Bottom */}
                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          {/* Quantity */}
                          <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                              Quantity
                            </p>

                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                              <button
                                type="button"
                                onClick={() => decreaseQuantity(item.id)}
                                className="flex h-10 w-10 items-center justify-center bg-slate-50 text-xl font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                −
                              </button>

                              <span className="flex h-10 min-w-12 items-center justify-center border-x border-slate-200 px-3 font-black text-slate-900">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => increaseQuantity(item.id)}
                                disabled={
                                  typeof item.stock === "number" &&
                                  item.quantity >= item.stock
                                }
                                aria-label={
                                  typeof item.stock === "number" &&
                                  item.quantity >= item.stock
                                    ? `Maximum available quantity: ${item.stock}`
                                    : `Increase quantity of ${item.name}`
                                }
                                title={
                                  typeof item.stock === "number" &&
                                  item.quantity >= item.stock
                                    ? `Only ${item.stock} available`
                                    : "Increase quantity"
                                }
                                className="flex h-10 w-10 items-center justify-center bg-slate-50 text-xl font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="sm:text-right">
                            <p className="text-xs text-slate-400">
                              ${Number(item.price).toFixed(2)} × {item.quantity}
                            </p>

                            <p className="mt-1 text-2xl font-black text-slate-900">
                              ${(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="mt-7 inline-flex items-center gap-2 rounded-xl px-2 py-2 font-bold text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
              >
                <span className="text-lg">←</span>
                Continue Shopping
              </Link>
            </div>

            {/* ================= RIGHT: SUMMARY ================= */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                {/* Summary Header */}
                <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Checkout
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        Order Summary
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl">
                      🛍️
                    </div>
                  </div>
                </div>

                {/* Summary Body */}
                <div className="p-6">
                  <div className="space-y-5">
                    {/* Items */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Items</span>

                      <span className="font-bold text-slate-900">
                        {cartCount}
                      </span>
                    </div>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Subtotal</span>

                      <span className="font-bold text-slate-900">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Shipping</span>

                      {shipping === 0 ? (
                        <span className="font-black text-green-600">FREE</span>
                      ) : (
                        <span className="font-bold text-slate-900">
                          ${shipping.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Free Shipping Message */}
                  {shipping === 0 ? (
                    <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4">
                      <div className="flex gap-3">
                        <span className="text-xl">🎉</span>

                        <div>
                          <p className="text-sm font-black text-green-800">
                            Free shipping unlocked!
                          </p>

                          <p className="mt-1 text-xs leading-5 text-green-700">
                            Your order qualifies for free delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex gap-3">
                        <span className="text-xl">🚚</span>

                        <div>
                          <p className="text-sm font-black text-blue-800">
                            Spend $100 for FREE shipping
                          </p>

                          <p className="mt-1 text-xs leading-5 text-blue-700">
                            Add ${(100 - cartTotal).toFixed(2)} more to unlock
                            free delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-6 border-t border-dashed border-slate-200" />

                  {/* Total */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Including shipping
                      </p>
                    </div>

                    <span className="text-3xl font-black text-blue-600">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout */}
                  <Link
                    href="/checkout"
                    className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
                  >
                    Proceed to Checkout
                    <span className="text-xl">→</span>
                  </Link>

                  {/* Secure Checkout */}
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                        🔒
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900">
                          Secure Checkout
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Your payment information is protected with secure
                          encryption.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Secure Payment
                    </p>

                    <div className="mt-3 flex justify-center gap-2">
                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 shadow-sm">
                        VISA
                      </span>

                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 shadow-sm">
                        MC
                      </span>

                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 shadow-sm">
                        AMEX
                      </span>

                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 shadow-sm">
                        PAY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-2xl font-black text-slate-900">
            Shop<span className="text-blue-600">Ease</span>
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Quality products. Great prices. Easy shopping.
          </p>

          <div className="mx-auto mt-5 h-px max-w-xs bg-slate-100" />

          <p className="mt-5 text-xs text-slate-400">
            © 2026 ShopEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
