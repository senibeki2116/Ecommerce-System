"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "../Components/Navbar";
import { useCart } from "../Context/CartContext";

export default function CheckoutPage() {
  const { cart, cartTotal, cartCount, clearCart } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);

  const shipping = cartTotal >= 100 ? 0 : 10;
  const finalTotal = cartTotal + shipping;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Ethiopia",
    payment: "Cash on Delivery",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setOrderPlaced(true);
    clearCart();
  };

  /* ================= EMPTY CART ================= */

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-4xl px-6 py-20">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-5xl">
              🛒
            </div>

            <h1 className="mt-7 text-3xl font-black text-slate-900">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              Add some products to your cart before proceeding to checkout.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700"
            >
              Browse Products →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* ================= SUCCESS ================= */

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl border border-green-100 bg-white px-6 py-16 text-center shadow-xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl">
              ✓
            </div>

            <p className="mt-7 text-sm font-black uppercase tracking-widest text-green-600">
              Order Successful
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Thank You!
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
              Your order has been successfully placed. We will contact you
              shortly to confirm your delivery details.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-2xl bg-slate-50 p-5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer</span>
                <span className="font-bold text-slate-900">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>

              <div className="mt-3 flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-bold text-slate-900">
                  {formData.email}
                </span>
              </div>

              <div className="mt-3 flex justify-between">
                <span className="text-slate-500">Payment</span>
                <span className="font-bold text-slate-900">
                  {formData.payment}
                </span>
              </div>
            </div>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700"
            >
              Continue Shopping →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* ================= CHECKOUT ================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ================= HERO ================= */}

      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-4xl font-black md:text-5xl">
            Complete Your Order
          </h1>

          <p className="mt-3 max-w-2xl text-blue-100">
            Enter your delivery information and choose your preferred payment
            method.
          </p>
        </div>
      </section>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ================= CUSTOMER INFORMATION ================= */}

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Personal Information */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                    Step 01
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Personal Information
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Tell us who we are delivering the order to.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* First Name */}

                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      First Name
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Last Name */}

                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Phone */}

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251 9XX XXX XXX"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* ================= DELIVERY ================= */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                    Step 02
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Delivery Address
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Where should we deliver your order?
                  </p>
                </div>

                {/* Address */}

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Street Address
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your street address"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* City */}

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Country */}

                  <div>
                    <label
                      htmlFor="country"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Country
                    </label>

                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    >
                      <option>Ethiopia</option>
                      <option>Kenya</option>
                      <option>Uganda</option>
                      <option>Tanzania</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ================= PAYMENT ================= */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                    Step 03
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Payment Method
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Select how you would like to pay.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Cash */}

                  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-blue-400 hover:bg-blue-50">
                    <input
                      type="radio"
                      name="payment"
                      value="Cash on Delivery"
                      checked={formData.payment === "Cash on Delivery"}
                      onChange={handleChange}
                      className="h-5 w-5 accent-blue-600"
                    />

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                      💵
                    </div>

                    <div>
                      <p className="font-black text-slate-900">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </label>

                  {/* Telebirr */}

                  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-blue-400 hover:bg-blue-50">
                    <input
                      type="radio"
                      name="payment"
                      value="Telebirr"
                      checked={formData.payment === "Telebirr"}
                      onChange={handleChange}
                      className="h-5 w-5 accent-blue-600"
                    />

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                      📱
                    </div>

                    <div>
                      <p className="font-black text-slate-900">Telebirr</p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pay securely using Telebirr.
                      </p>
                    </div>
                  </label>

                  {/* Card */}

                  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-blue-400 hover:bg-blue-50">
                    <input
                      type="radio"
                      name="payment"
                      value="Credit / Debit Card"
                      checked={formData.payment === "Credit / Debit Card"}
                      onChange={handleChange}
                      className="h-5 w-5 accent-blue-600"
                    />

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                      💳
                    </div>

                    <div>
                      <p className="font-black text-slate-900">
                        Credit / Debit Card
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Visa, Mastercard and other cards.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Place Order */}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-5 text-lg font-black text-white shadow-xl shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-2xl"
              >
                Place Order
                <span className="text-2xl">→</span>
              </button>

              <p className="text-center text-xs text-slate-400">
                🔒 Your information is secure and protected.
              </p>
            </form>
          </div>

          {/* ================= ORDER SUMMARY ================= */}

          <div className="lg:col-span-1">
            <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              {/* Header */}

              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Your Order
                </p>

                <div className="mt-1 flex items-center justify-between">
                  <h2 className="text-2xl font-black">Order Summary</h2>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                    {cartCount} items
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Products */}

                <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-black text-slate-900">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="my-6 border-t border-dashed border-slate-200" />

                {/* Prices */}

                <div className="space-y-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Items</span>
                    <span className="font-bold text-slate-900">
                      {cartCount}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Shipping</span>

                    {shipping === 0 ? (
                      <span className="font-black text-green-600">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-900">
                        ${shipping.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="my-6 border-t border-slate-200" />

                {/* Total */}

                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">
                    Total
                  </span>

                  <span className="text-3xl font-black text-blue-600">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* Security */}

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <span className="text-xl">🔒</span>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Secure Order
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your personal information is protected.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back */}

                <Link
                  href="/cart"
                  className="mt-5 flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  ← Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
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

          <p className="mt-5 text-xs text-slate-400">
            © 2026 ShopEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
