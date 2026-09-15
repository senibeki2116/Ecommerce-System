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
     LOAD SAVED INFORMATION
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
          city: parsed.city || "",
          country: parsed.country || "Ethiopia",
        }));
      }

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
    } catch (err) {
      console.error("Could not load checkout data:", err);
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
     INPUT
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
     PAYMENT
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

      const createdOrderId =
        data?.id || data?._id || data?.order?.id || data?.order?._id || "";

      setOrderId(createdOrderId);
      setOrderPlaced(true);

      clearCart();
    } catch (err) {
      console.error("Order request failed:", err);

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
      <div className="min-h-screen bg-[#f5f7fb]">
        <Navbar />

        <main className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white px-6 py-20 text-center shadow-xl">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-100 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-blue-100 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-5xl shadow-inner">
                🛒
              </div>

              <p className="mt-7 text-xs font-black uppercase tracking-[0.25em] text-indigo-500">
                Checkout
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                Your cart is empty
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
                You need to add some products to your shopping cart before you
                can continue to checkout.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 hover:bg-black hover:shadow-xl"
              >
                Browse Products
                <span className="text-lg">→</span>
              </Link>
            </div>
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
      <div className="min-h-screen bg-[#f5f7fb]">
        <Navbar />

        <main className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:py-20">
          <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl">
            {/* SUCCESS HEADER */}

            <div className="relative overflow-hidden bg-slate-900 px-6 py-16 text-center text-white">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-5xl font-black shadow-2xl shadow-emerald-500/30">
                  ✓
                </div>

                <p className="mt-7 text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
                  Order Confirmed
                </p>

                <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                  Thank You! 🎉
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  Your order has been successfully placed. We'll contact you
                  shortly to confirm your delivery.
                </p>
              </div>
            </div>

            {/* DETAILS */}

            <div className="p-6 sm:p-10">
              {orderId && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
                    Order ID
                  </p>

                  <p className="mt-2 break-all text-sm font-black text-slate-900">
                    {orderId}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Customer
                  </p>

                  <p className="mt-2 font-black text-slate-900">
                    {formData.firstName} {formData.lastName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {formData.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment
                  </p>

                  <p className="mt-2 font-black text-slate-900">
                    {formData.payment}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Payment method selected
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    📍
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Delivery Address
                    </p>

                    <p className="mt-2 font-black text-slate-900">
                      {formData.address}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formData.city}, {formData.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-900 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Order Total</p>

                    <p className="mt-1 text-xs text-slate-500">
                      Including taxes & shipping
                    </p>
                  </div>

                  <p className="text-3xl font-black">
                    ${finalTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/products"
                  className="flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-black"
                >
                  Continue Shopping →
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Navbar />

      {/* HERO */}

      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Secure checkout
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Complete your
                <span className="block text-indigo-400">order</span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                You're just a few steps away from receiving your products. Enter
                your delivery details and choose your preferred payment method.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                🔒
              </div>

              <div>
                <p className="text-sm font-black">Safe & Secure</p>

                <p className="text-xs text-slate-400">
                  Your information is protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHECKOUT */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* LEFT */}

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ERROR */}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 font-black text-red-600">
                      !
                    </div>

                    <div>
                      <p className="font-black text-red-900">
                        Something went wrong
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PERSONAL INFORMATION */}

              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-linear-to-r from-indigo-50 to-white px-6 py-6 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-600/20">
                      01
                    </div>

                    <div>
                      <h2 className="text-xl font-black">
                        Personal information
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Tell us who will receive this order.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InputField
                      label="First name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Your first name"
                    />

                    <InputField
                      label="Last name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Your last name"
                    />

                    <InputField
                      label="Email address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />

                    <InputField
                      label="Phone number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>
                </div>
              </section>

              {/* DELIVERY */}

              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-linear-to-r from-blue-50 to-white px-6 py-6 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20">
                      02
                    </div>

                    <div>
                      <h2 className="text-xl font-black">Delivery address</h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <InputField
                    label="Street address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, building, house number"
                  />

                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InputField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Addis Ababa"
                    />

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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      >
                        <option>Ethiopia</option>
                        <option>Kenya</option>
                        <option>Uganda</option>
                        <option>Tanzania</option>
                      </select>
                    </div>
                  </div>

                  {formData.address && (
                    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        ✓
                      </span>

                      <div>
                        <p className="text-sm font-black text-emerald-800">
                          Saved address loaded
                        </p>

                        <p className="mt-0.5 text-xs text-emerald-700">
                          Your saved delivery information was added
                          automatically.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* PAYMENT */}

              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-linear-to-r from-violet-50 to-white px-6 py-6 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-sm font-black text-white shadow-lg shadow-violet-600/20">
                      03
                    </div>

                    <div>
                      <h2 className="text-xl font-black">Payment method</h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Select how you'd like to pay.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-6 sm:p-8">
                  <PaymentCard
                    icon="💵"
                    title="Cash on Delivery"
                    description="Pay when your order arrives."
                    selected={formData.payment === "Cash on Delivery"}
                    onClick={() => selectPayment("Cash on Delivery")}
                  />

                  <PaymentCard
                    icon="📱"
                    title="Telebirr"
                    description="Pay securely using Telebirr."
                    selected={formData.payment === "Telebirr"}
                    onClick={() => selectPayment("Telebirr")}
                  />

                  <PaymentCard
                    icon="💳"
                    title="Credit / Debit Card"
                    description="Visa, Mastercard and other cards."
                    selected={formData.payment === "Credit / Debit Card"}
                    onClick={() => selectPayment("Credit / Debit Card")}
                  />
                </div>
              </section>

              {/* PLACE ORDER */}

              <button
                type="submit"
                disabled={placingOrder}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-6 py-5 text-base font-black text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placingOrder ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing your order...
                  </>
                ) : (
                  <>
                    Place order
                    <span className="text-xl transition group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>🔒</span>
                <span>Your personal information is securely protected.</span>
              </div>
            </form>
          </div>

          {/* RIGHT */}

          <aside>
            <div className="sticky top-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
              {/* SUMMARY HEADER */}

              <div className="relative overflow-hidden bg-slate-900 p-6 text-white">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-600/20 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Your order
                      </p>

                      <h2 className="mt-1 text-2xl font-black">Summary</h2>
                    </div>

                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                      {cartCount} items
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* PRODUCTS */}

                <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                  {cart.map((item: any) => {
                    const itemId = item._id || item.id;

                    return (
                      <div key={itemId} className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                          <img
                            src={item.image || "/file.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />

                          <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-black text-white">
                            {item.quantity}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-900">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ${Number(item.price).toFixed(2)} × {item.quantity}
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

                {/* PRICES */}

                <div className="space-y-4">
                  <SummaryRow
                    label="Subtotal"
                    value={`$${cartTotal.toFixed(2)}`}
                  />

                  <SummaryRow
                    label="Shipping"
                    value={shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    valueClass={
                      shipping === 0 ? "text-emerald-600" : "text-slate-900"
                    }
                  />

                  <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} />

                  <SummaryRow
                    label="Coupon (DUO10)"
                    value={`- $${couponDiscount.toFixed(2)}`}
                    valueClass="text-emerald-600"
                    labelClass="text-emerald-600"
                  />
                </div>

                <div className="my-6 border-t border-slate-200" />

                {/* TOTAL */}

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-500">Total</p>

                      <p className="mt-1 text-xs text-slate-400">
                        Including taxes & shipping
                      </p>
                    </div>

                    <p className="text-3xl font-black text-slate-900">
                      ${finalTotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* ADDRESS */}

                {formData.address && (
                  <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                        📍
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900">
                          Delivery to
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formData.city}, {formData.country}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                      {formData.address}
                    </p>
                  </div>
                )}

                {/* BENEFITS */}

                <div className="mt-5 space-y-3">
                  <TrustItem
                    icon="🔒"
                    title="Secure checkout"
                    description="Your information is protected."
                  />

                  <TrustItem
                    icon="🚚"
                    title="Reliable delivery"
                    description="We'll deliver your order safely."
                  />

                  <TrustItem
                    icon="✓"
                    title="Easy ordering"
                    description="Simple and transparent checkout."
                  />
                </div>

                {/* BACK */}

                <Link
                  href="/cart"
                  className="mt-6 flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  ← Back to cart
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-2xl font-black text-slate-900">
            Shop<span className="text-indigo-500">Ease</span>
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Quality products. Great prices. Easy shopping.
          </p>

          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-5 text-xs font-bold text-slate-400">
            <span>🔒 Secure</span>
            <span>•</span>
            <span>🚚 Reliable</span>
            <span>•</span>
            <span>✓ Trusted</span>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            © 2026 ShopEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =========================
   INPUT COMPONENT
========================= */

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
      />
    </div>
  );
}

/* =========================
   PAYMENT CARD
========================= */

function PaymentCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-indigo-500 bg-indigo-50/60 ring-4 ring-indigo-50"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${
          selected ? "bg-white shadow-sm" : "bg-slate-100"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-black text-slate-900">{title}</p>

        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>

      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

/* =========================
   SUMMARY ROW
========================= */

function SummaryRow({
  label,
  value,
  labelClass = "text-slate-500",
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  labelClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={labelClass}>{label}</span>

      <span className={`font-black ${valueClass}`}>{value}</span>
    </div>
  );
}

/* =========================
   TRUST ITEM
========================= */

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-sm">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black text-slate-900">{title}</p>

        <p className="mt-0.5 text-[11px] text-slate-400">{description}</p>
      </div>
    </div>
  );
}
