"use client";

import Link from "next/link";
import { useState } from "react";
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

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // Shipping
  const shipping = cartTotal >= 100 || cartTotal === 0 ? 0 : 10;

  // Tax
  const tax = cartTotal * 0.08;

  // Coupon discount
  const discount = couponApplied ? cartTotal * 0.1 : 0;

  // Final total
  const grandTotal = cartTotal + shipping + tax - discount;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "DUO10") {
      setCouponApplied(true);
    } else {
      setCouponApplied(false);
    }
  };

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto flex min-h-[75vh] max-w-5xl items-center justify-center px-4 py-12">
          <div className="w-full rounded-[2rem] bg-white px-6 py-14 text-center shadow-xl shadow-slate-200/60 sm:px-10">
            {/* Icon */}
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-blue-50">
              <span className="text-6xl">🛒</span>
            </div>

            <h1 className="mt-7 text-3xl font-black text-slate-900 sm:text-4xl">
              Your Cart is Empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              Looks like you haven't added anything to your cart yet. Explore
              our products and find something you love.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Start Shopping →
            </Link>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <span>🚚 Fast Delivery</span>
              <span>🔒 Secure Payment</span>
              <span>↩️ Easy Returns</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-600">
                🛍️ Shopping Cart
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Your Cart
              </h1>

              <p className="mt-2 text-slate-500">
                You have{" "}
                <span className="font-black text-slate-800">{cartCount}</span>{" "}
                {cartCount === 1 ? "item" : "items"} in your cart.
              </p>
            </div>

            <button
              onClick={clearCart}
              className="w-fit rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50"
            >
              🗑️ Clear Cart
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
          {/* LEFT SIDE */}
          <div className="space-y-5">
            {/* Free shipping banner */}
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                  🚚
                </div>

                <div>
                  {cartTotal >= 100 ? (
                    <>
                      <p className="font-black text-emerald-700">
                        🎉 You unlocked FREE shipping!
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Your order qualifies for free delivery.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-black text-slate-800">
                        Free shipping on orders over $100
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Add ${(100 - cartTotal).toFixed(2)} more to unlock free
                        shipping.
                      </p>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${Math.min((cartTotal / 100) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Cart products */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/50">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <h2 className="text-xl font-black text-slate-900">
                  Cart Items
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {cart.map((item: any) => {
                  const itemPrice = Number(item.price) || 0;
                  const itemQuantity = Number(item.quantity) || 1;
                  const itemTotal = itemPrice * itemQuantity;

                  return (
                    <div
                      key={item.id}
                      className="p-5 transition hover:bg-slate-50/70 sm:p-7"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row">
                        {/* Product image */}
                        <Link
                          href={`/products/${item.id}`}
                          className="group relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 sm:h-32 sm:w-32"
                        >
                          <img
                            src={
                              item.image ||
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
                            }
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.src =
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
                            }}
                          />
                        </Link>

                        {/* Product details */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <Link
                                  href={`/products/${item.id}`}
                                  className="line-clamp-2 text-lg font-black text-slate-900 transition hover:text-blue-600"
                                >
                                  {item.name}
                                </Link>

                                <p className="mt-1 text-sm text-slate-400">
                                  Premium quality product
                                </p>
                              </div>

                              {/* Remove */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                title="Remove item"
                              >
                                🗑️
                              </button>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                              <span className="text-xl font-black text-blue-600">
                                ${itemPrice.toFixed(2)}
                              </span>

                              <span className="text-xs text-slate-400">
                                each
                              </span>
                            </div>
                          </div>

                          {/* Bottom controls */}
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                            {/* Quantity */}
                            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="flex h-10 w-10 items-center justify-center bg-slate-50 text-lg font-black text-slate-700 transition hover:bg-slate-100"
                              >
                                −
                              </button>

                              <div className="flex h-10 w-12 items-center justify-center border-x border-slate-200 bg-white text-sm font-black text-slate-900">
                                {itemQuantity}
                              </div>

                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="flex h-10 w-10 items-center justify-center bg-slate-50 text-lg font-black text-slate-700 transition hover:bg-slate-100"
                              >
                                +
                              </button>
                            </div>

                            {/* Total */}
                            <div className="text-right">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total
                              </p>

                              <p className="mt-1 text-lg font-black text-slate-900">
                                ${itemTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Continue shopping */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl font-bold text-blue-600 transition hover:text-blue-700"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <aside className="h-fit lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60">
              {/* Summary header */}
              <div className="bg-slate-900 px-6 py-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Order Summary
                </p>

                <h2 className="mt-2 text-2xl font-black">Checkout Summary</h2>
              </div>

              <div className="p-6">
                {/* Prices */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal ({cartCount} items)
                    </span>

                    <span className="font-bold text-slate-900">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>

                    {shipping === 0 ? (
                      <span className="font-bold text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-900">
                        ${shipping.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tax</span>

                    <span className="font-bold text-slate-900">
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  {couponApplied && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600">Coupon discount</span>

                      <span className="font-bold text-emerald-600">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="my-6 h-px bg-slate-100" />

                {/* Coupon */}
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-800">
                    Have a coupon?
                  </label>

                  <div className="flex overflow-hidden rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value)}
                      placeholder="Enter code"
                      className="min-w-0 flex-1 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    />

                    <button
                      onClick={applyCoupon}
                      className="bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-slate-800"
                    >
                      Apply
                    </button>
                  </div>

                  {couponApplied && (
                    <p className="mt-2 text-xs font-bold text-emerald-600">
                      ✓ DUO10 applied — 10% discount
                    </p>
                  )}

                  {!couponApplied && coupon.length > 0 && (
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Try code: <strong>DUO10</strong>
                    </p>
                  )}
                </div>

                <div className="my-6 h-px bg-slate-100" />

                {/* Grand total */}
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600">Total</span>

                    <span className="text-3xl font-black text-blue-600">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Including taxes and shipping
                  </p>
                </div>

                {/* Checkout */}
                <Link
                  href="/checkout"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30"
                >
                  Proceed to Checkout
                  <span>→</span>
                </Link>

                {/* Payment methods */}
                <div className="mt-5">
                  <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    Secure payment
                  </p>

                  <div className="mt-3 flex justify-center gap-2">
                    <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black text-blue-600">
                      VISA
                    </div>

                    <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black text-red-500">
                      MC
                    </div>

                    <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-700">
                      UPI
                    </div>

                    <div className="flex h-9 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-black text-emerald-600">
                      COD
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust card */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="text-xl">🔒</div>

                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Safe & Secure Shopping
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your personal and payment information is protected with
                    secure checkout.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
