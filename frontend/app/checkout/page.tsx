"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../Context/CartContext";
import Navbar from "../Components/Navbar";

type FormDataType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  payment: string;
};

export default function CheckoutPage() {
  const { cart, cartTotal, cartCount, clearCart } = useCart();

  /* =========================
     STATE
  ========================= */

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Ethiopia",
    payment: "Cash on Delivery",
  });

  /* =========================
     LOAD SAVED ADDRESS
  ========================= */

  useEffect(() => {
    try {
      const savedAddress = localStorage.getItem("shippingAddress");

      if (savedAddress) {
        const parsed = JSON.parse(savedAddress);

        const savedFullName = parsed.fullName || "";
        const nameParts = savedFullName.trim().split(" ");

        setFormData((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          address: parsed.address || "",
        }));
      }

      /* Try to load logged-in user information */
      const userData =
        localStorage.getItem("user") || localStorage.getItem("currentUser");

      if (userData) {
        const user = JSON.parse(userData);

        setFormData((prev) => ({
          ...prev,
          firstName:
            prev.firstName || user.firstName || user.name?.split(" ")[0] || "",
          lastName:
            prev.lastName ||
            user.lastName ||
            user.name?.split(" ").slice(1).join(" ") ||
            "",
          email: prev.email || user.email || "",
        }));
      }
    } catch (error) {
      console.error("Could not load saved checkout data:", error);
    }
  }, []);

  /* =========================
     PRICE CALCULATIONS
  ========================= */

  const shipping = cartTotal >= 100 ? 0 : 10;

  const tax = cartTotal * 0.08;

  const couponDiscount = cartTotal > 0 ? Math.min(40.6, cartTotal) : 0;

  const finalTotal = Math.max(0, cartTotal + shipping + tax - couponDiscount);

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  /* =========================
     PAYMENT SELECT
  ========================= */

  const selectPayment = (payment: string) => {
    setFormData((prev) => ({
      ...prev,
      payment,
    }));

    setError("");
  };

  /* =========================
     VALIDATION
  ========================= */

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      return "Please enter your first name.";
    }

    if (!formData.lastName.trim()) {
      return "Please enter your last name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!formData.address.trim()) {
      return "Please enter your delivery address.";
    }

    if (!formData.city.trim()) {
      return "Please enter your city.";
    }

    if (!formData.country.trim()) {
      return "Please select your country.";
    }

    if (!formData.payment.trim()) {
      return "Please select a payment method.";
    }

    return "";
  };

  /* =========================
     PLACE ORDER
  ========================= */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setPlacingOrder(true);

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        setError("Please login before placing an order.");

        setPlacingOrder(false);
        return;
      }

      /* =========================
         CREATE ORDER DATA
      ========================= */

      const orderData = {
        items: cart.map((item: any) => ({
          productId: item._id || item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || "",
        })),

        subtotal: Number(cartTotal.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        discount: Number(couponDiscount.toFixed(2)),
        total: Number(finalTotal.toFixed(2)),

        customer: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },

        shippingAddress: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country,
        },

        paymentMethod: formData.payment,
      };

      console.log("Sending order:", orderData);

      /* =========================
         BACKEND REQUEST
      ========================= */

      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(orderData),
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("Order response:", data);

      /* =========================
         BACKEND ERROR
      ========================= */

      if (!response.ok) {
        if (response.status === 401) {
          setError("Your login session has expired. Please login again.");
        } else {
          setError(
            data?.message || "Failed to place the order. Please try again.",
          );
        }

        return;
      }

      /* =========================
         SUCCESS
      ========================= */

      const createdOrderId =
        data?.id || data?._id || data?.order?.id || data?.order?._id || "";

      setOrderId(createdOrderId);

      setOrderPlaced(true);

      /*
        Clear cart only after backend confirms
        the order was successfully created.
      */
      clearCart();
    } catch (error) {
      console.error("Order request failed:", error);

      setError(
        "Could not connect to the server. Make sure your NestJS backend is running on port 3001.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =========================
     EMPTY CART
  ========================= */

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-[#f6f7f9]">
        <Navbar />

        <main className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-4xl">
              🛒
            </div>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Checkout
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Add some products to your cart before proceeding to checkout.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-black hover:-translate-y-0.5"
            >
              Browse Products
              <span>→</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     SUCCESS PAGE
  ========================= */

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#f6f7f9]">
        <Navbar />

        <main className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            {/* SUCCESS HEADER */}

            <div className="bg-[#171717] px-6 py-12 text-center text-white">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-5xl font-black shadow-lg shadow-green-500/20">
                ✓
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-green-400">
                Order Successful
              </p>

              <h1 className="mt-2 text-4xl font-black">Thank You!</h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300">
                Your order has been successfully placed. We'll contact you
                shortly to confirm your delivery.
              </p>
            </div>

            {/* ORDER DETAILS */}

            <div className="p-6 sm:p-8">
              {orderId && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Order ID
                  </p>

                  <p className="mt-2 break-all text-sm font-black text-slate-900">
                    {orderId}
                  </p>
                </div>
              )}

              <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Customer</span>

                  <span className="text-right text-sm font-bold text-slate-900">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Email</span>

                  <span className="break-all text-right text-sm font-bold text-slate-900">
                    {formData.email}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Phone</span>

                  <span className="text-sm font-bold text-slate-900">
                    {formData.phone}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Payment</span>

                  <span className="text-sm font-bold text-slate-900">
                    {formData.payment}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">Delivery</span>

                  <span className="max-w-[60%] text-right text-sm font-bold text-slate-900">
                    {formData.address}, {formData.city}, {formData.country}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">Total</span>

                    <span className="text-2xl font-black text-green-600">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/products"
                  className="flex items-center justify-center rounded-xl bg-[#171717] px-5 py-4 text-sm font-bold text-white transition hover:bg-black"
                >
                  Continue Shopping →
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center justify-center rounded-xl border border-slate-200 px-5 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     CHECKOUT PAGE
  ========================= */

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <Navbar />

      {/* =========================
          HERO
      ========================= */}

      <section className="bg-[#171717] px-5 py-12 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Secure Checkout
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                Complete Your Order
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Enter your delivery information, select a payment method, and
                place your order securely.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                ✓
              </span>

              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          MAIN
      ========================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* =========================
              LEFT
          ========================= */}

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ERROR */}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                      !
                    </span>

                    <div>
                      <p className="font-black">
                        Please check your information
                      </p>

                      <p className="mt-1 text-sm leading-5">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================
                  PERSONAL INFORMATION
              ========================= */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-7 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black">
                    01
                  </div>

                  <div>
                    <h2 className="text-xl font-black">Personal Information</h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Tell us who will receive this order.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* FIRST NAME */}

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
                      placeholder="Your first name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  {/* LAST NAME */}

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
                      placeholder="Your last name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  {/* EMAIL */}

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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  {/* PHONE */}

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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </section>

              {/* =========================
                  DELIVERY
              ========================= */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-7 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black">
                    02
                  </div>

                  <div>
                    <h2 className="text-xl font-black">Delivery Address</h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                {/* ADDRESS */}

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
                    placeholder="Street, building, house number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* CITY */}

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
                      placeholder="Addis Ababa"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  {/* COUNTRY */}

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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    >
                      <option>Ethiopia</option>
                      <option>Kenya</option>
                      <option>Uganda</option>
                      <option>Tanzania</option>
                    </select>
                  </div>
                </div>

                {/* SAVED ADDRESS INFO */}

                {formData.address && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      ✓
                    </span>

                    <div>
                      <p className="text-sm font-bold text-green-800">
                        Saved address loaded
                      </p>

                      <p className="text-xs text-green-700">
                        Your address from the Cart page has been added
                        automatically.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* =========================
                  PAYMENT
              ========================= */}

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-7 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black">
                    03
                  </div>

                  <div>
                    <h2 className="text-xl font-black">Payment Method</h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Select your preferred payment method.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* CASH */}

                  <button
                    type="button"
                    onClick={() => selectPayment("Cash on Delivery")}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      formData.payment === "Cash on Delivery"
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-100"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                        formData.payment === "Cash on Delivery"
                          ? "bg-green-100"
                          : "bg-slate-100"
                      }`}
                    >
                      💵
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-900">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pay when your order arrives.
                      </p>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        formData.payment === "Cash on Delivery"
                          ? "border-slate-900 bg-slate-900"
                          : "border-slate-300"
                      }`}
                    >
                      {formData.payment === "Cash on Delivery" && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>

                  {/* TELEBIRR */}

                  <button
                    type="button"
                    onClick={() => selectPayment("Telebirr")}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      formData.payment === "Telebirr"
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-100"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                        formData.payment === "Telebirr"
                          ? "bg-blue-100"
                          : "bg-slate-100"
                      }`}
                    >
                      📱
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-900">Telebirr</p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pay securely using Telebirr.
                      </p>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        formData.payment === "Telebirr"
                          ? "border-slate-900 bg-slate-900"
                          : "border-slate-300"
                      }`}
                    >
                      {formData.payment === "Telebirr" && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>

                  {/* CARD */}

                  <button
                    type="button"
                    onClick={() => selectPayment("Credit / Debit Card")}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      formData.payment === "Credit / Debit Card"
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-100"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                        formData.payment === "Credit / Debit Card"
                          ? "bg-purple-100"
                          : "bg-slate-100"
                      }`}
                    >
                      💳
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-900">
                        Credit / Debit Card
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Visa, Mastercard and other cards.
                      </p>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        formData.payment === "Credit / Debit Card"
                          ? "border-slate-900 bg-slate-900"
                          : "border-slate-300"
                      }`}
                    >
                      {formData.payment === "Credit / Debit Card" && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                </div>
              </section>

              {/* =========================
                  PLACE ORDER
              ========================= */}

              <button
                type="submit"
                disabled={placingOrder}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#171717] px-6 py-5 text-base font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-black hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <span className="text-xl transition group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>🔒</span>

                <span>Your personal information is secure and protected.</span>
              </div>
            </form>
          </div>

          {/* =========================
              RIGHT ORDER SUMMARY
          ========================= */}

          <aside>
            <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              {/* HEADER */}

              <div className="bg-[#171717] p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Your Order
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-black">Summary</h2>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                    {cartCount} items
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* PRODUCTS */}

                <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                  {cart.map((item: any) => {
                    const itemId = item._id || item.id;

                    return (
                      <div key={itemId} className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={item.image || "/file.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />

                          <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] font-bold text-white">
                            {item.quantity}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ${Number(item.price).toFixed(2)} each
                          </p>
                        </div>

                        <p className="text-sm font-black text-slate-900">
                          $
                          {(Number(item.price) * Number(item.quantity)).toFixed(
                            2,
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="my-6 border-t border-dashed border-slate-200" />

                {/* PRICE DETAILS */}

                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>

                    <span className="font-bold text-slate-900">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Shipping</span>

                    {shipping === 0 ? (
                      <span className="font-black text-green-600">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-900">
                        ${shipping.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Tax</span>

                    <span className="font-bold text-slate-900">
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon (DUO10)</span>

                    <span className="font-bold text-green-600">
                      - ${couponDiscount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-slate-200" />

                {/* TOTAL */}

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Total</p>

                    <p className="mt-1 text-xs text-slate-400">
                      Including taxes & shipping
                    </p>
                  </div>

                  <p className="text-3xl font-black text-slate-900">
                    ${finalTotal.toFixed(2)}
                  </p>
                </div>

                {/* ADDRESS PREVIEW */}

                {formData.address && (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <span>📍</span>

                      <p className="text-sm font-black text-slate-900">
                        Delivery to
                      </p>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {formData.address}
                      {formData.city && `, ${formData.city}`}
                      {formData.country && `, ${formData.country}`}
                    </p>
                  </div>
                )}

                {/* SECURITY */}

                <div className="mt-5 flex gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <span className="text-xl">🔒</span>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Secure Checkout
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your information is protected during checkout.
                    </p>
                  </div>
                </div>

                {/* BACK */}

                <Link
                  href="/cart"
                  className="mt-5 flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  ← Back to Cart
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-2xl font-black text-slate-900">
            Shop<span className="text-slate-500">Ease</span>
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
