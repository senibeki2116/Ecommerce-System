"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../Context/CartContext";

type FormDataType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  deliveryInstructions: string;
  payment: string;
};

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const [saveAddress, setSaveAddress] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Ethiopia",
    deliveryInstructions: "",
    payment: "Cash on Delivery",
  });

  /*
   * LOAD LOGGED-IN USER
   */
  useEffect(() => {
    const loadUserInformation = async () => {
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch("http://localhost:3001/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const user = await response.json();

        setUserId(user.id);

        const userName = user.name || "";

        const nameParts = userName.trim().split(" ");

        const firstName = user.firstName || nameParts[0] || "";

        const lastName = user.lastName || nameParts.slice(1).join(" ") || "";

        setFormData((prev) => ({
          ...prev,
          firstName,
          lastName,
          email: user.email || "",
          phone: user.phone || "",
        }));
      } catch (error) {
        console.error("Could not load user information:", error);
      }
    };

    loadUserInformation();
  }, []);

  /*
   * LOAD SAVED ADDRESS
   */
  useEffect(() => {
    if (!userId) {
      return;
    }

    try {
      const storageKey = `savedShippingAddress_${userId}`;

      const savedAddress = localStorage.getItem(storageKey);

      if (!savedAddress) {
        setSaveAddress(false);

        setFormData((prev) => ({
          ...prev,
          address: "",
          city: "",
          country: "Ethiopia",
          deliveryInstructions: "",
        }));

        return;
      }

      const address = JSON.parse(savedAddress);

      setFormData((prev) => ({
        ...prev,
        address: address.address || "",
        city: address.city || "",
        country: address.country || "Ethiopia",
        deliveryInstructions: address.deliveryInstructions || "",
      }));

      setSaveAddress(true);
    } catch (error) {
      console.error("Could not load saved delivery address:", error);
    }
  }, [userId]);

  /*
   * ORDER CALCULATIONS
   */
  const shipping = cartTotal >= 100 ? 0 : 10;

  const tax = cartTotal * 0.08;

  const couponDiscount = cartTotal > 0 ? Math.min(40.6, cartTotal) : 0;

  const finalTotal = Math.max(0, cartTotal + shipping + tax - couponDiscount);

  const cartProducts = cart.filter((item) => item.quantity > 0);

  const itemCount = cartProducts.reduce(
    (sum: number, item) => sum + (item.quantity || 0),
    0,
  );

  /*
   * INPUT CHANGE
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * PAYMENT SELECTION
   */
  const selectPayment = (payment: string) => {
    setFormData((prev) => ({
      ...prev,
      payment,
    }));

    setError("");
  };

  /*
   * VALIDATION
   */
  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "country",
    ];

    for (const field of requiredFields) {
      const value = formData[field as keyof FormDataType];

      if (typeof value === "string" && !value.trim()) {
        return `Please enter your ${field
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()}.`;
      }
    }

    if (!formData.email.includes("@")) {
      return "Please enter a valid email address.";
    }

    if (formData.phone.trim().length < 9) {
      return "Please enter a valid phone number.";
    }

    if (!formData.payment) {
      return "Please select a payment method.";
    }

    return "";
  };

  /*
   * PLACE ORDER
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (cartProducts.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setPlacingOrder(true);

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      /*
       * SAVE ADDRESS
       */
      if (saveAddress && userId) {
        const storageKey = `savedShippingAddress_${userId}`;

        localStorage.setItem(
          storageKey,
          JSON.stringify({
            address: formData.address,
            city: formData.city,
            country: formData.country,
            deliveryInstructions: formData.deliveryInstructions,
          }),
        );
      }

      /*
       * REMOVE SAVED ADDRESS
       */
      if (!saveAddress && userId) {
        const storageKey = `savedShippingAddress_${userId}`;

        localStorage.removeItem(storageKey);
      }

      /*
       * ORDER ITEMS
       */
      const items = cartProducts.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        product: item,
      }));

      /*
       * ORDER DATA
       */
      const orderData = {
        items,

        subtotal: cartTotal,

        shipping,

        tax,

        discount: couponDiscount,

        total: finalTotal,

        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },

        shippingAddress: {
          address: formData.address,
          city: formData.city,
          country: formData.country,
          deliveryInstructions: formData.deliveryInstructions,
        },

        paymentMethod: formData.payment,
      };

      /*
       * CREATE ORDER
       */
      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        body: JSON.stringify(orderData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to place your order.",
        );
      }

      const newOrderId =
        data?.id || data?._id || data?.order?.id || data?.order?._id || "";

      setOrderId(String(newOrderId));

      setOrderPlaced(true);

      clearCart();
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong. Please make sure your backend is running on port 3001.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /*
   * EMPTY CART
   */
  if (cartProducts.length === 0 && !orderPlaced) {
    return (
      <main className="min-h-screen bg-[#f6f9fc]">
        <div className="border-b border-sky-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              Shop
              <span className="text-blue-600">Ease</span>
            </Link>

            <Link
              href="/cart"
              className="rounded-full border border-sky-200 bg-sky-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              ← Cart
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-5xl">
            🛒
          </div>

          <h1 className="mt-7 text-4xl font-black text-slate-900">
            Nothing to checkout
          </h1>

          <p className="mx-auto mt-4 max-w-md text-slate-500">
            Add some products to your shopping cart before continuing to
            checkout.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-indigo-600"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ORDER SUCCESS
   */
  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-[#f6f9fc]">
        <div className="border-b border-sky-100 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              Shop
              <span className="text-blue-600">Ease</span>
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
          <div className="rounded-4xl border border-sky-100 bg-white p-7 text-center shadow-xl shadow-blue-100 sm:p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-5xl text-emerald-600">
              ✓
            </div>

            <p className="mt-7 text-sm font-black uppercase tracking-[0.2em] text-emerald-600">
              Order confirmed
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Thank you for your order!
            </h1>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-500">
              Your order has been successfully placed. We will process it and
              contact you with delivery updates.
            </p>

            <div className="mt-9 rounded-2xl bg-sky-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order number
              </p>

              <p className="mt-2 break-all text-xl font-black text-blue-600">
                {orderId || "Order received"}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
              <div className="flex gap-3">
                <span className="text-xl">
                  {formData.payment === "Cash on Delivery"
                    ? "💵"
                    : formData.payment === "Telebirr"
                      ? "📱"
                      : "💳"}
                </span>

                <div>
                  <p className="font-black text-slate-800">Payment method</p>

                  <p className="mt-1 text-sm text-slate-600">
                    {formData.payment}
                  </p>

                  <p className="mt-1 text-xs font-bold text-amber-700">
                    Payment status: Pending
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/products"
                className="rounded-2xl bg-blue-600 px-6 py-4 font-black text-white transition hover:bg-indigo-600"
              >
                Continue Shopping
              </Link>

              <Link
                href="/orders"
                className="rounded-2xl border border-sky-200 bg-sky-50 px-6 py-4 font-black text-blue-700 transition hover:bg-blue-100"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-900">
      {/* HEADER */}
      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            Shop
            <span className="text-blue-600">Ease</span>
          </Link>

          <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
            <span className="hidden sm:inline">Secure checkout</span>

            <span className="text-lg">🔒</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-linear-to-br from-sky-100 via-blue-50 to-indigo-100">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
            Checkout
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Complete your order
          </h1>

          <p className="mt-4 text-slate-600">
            Enter your information, delivery address, and preferred payment
            method.
          </p>

          <div className="mt-9 flex max-w-2xl items-center">
            <CheckoutStep number="1" title="Information" active />

            <div className="h-px flex-1 bg-blue-200" />

            <CheckoutStep number="2" title="Delivery" active />

            <div className="h-px flex-1 bg-blue-200" />

            <CheckoutStep number="3" title="Payment" active />
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          {/* ERROR */}
          {error && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <span className="text-xl">!</span>

              <div>
                <p className="font-black">Unable to continue</p>

                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* PERSONAL INFORMATION */}
              <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
                <SectionHeading
                  number="01"
                  title="Personal information"
                  description="Tell us who is placing this order."
                />

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <InputField
                    label="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                  />

                  <InputField
                    label="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                  />

                  <InputField
                    label="Email address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                  />

                  <InputField
                    label="Phone number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+251 9..."
                  />
                </div>
              </section>

              {/* DELIVERY ADDRESS */}
              <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
                <SectionHeading
                  number="02"
                  title="📍 Delivery address"
                  description="Tell us exactly where you want your order delivered."
                />

                <div className="mt-7 space-y-5">
                  <InputField
                    label="🏠 Street / House address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Example: 04 Kebele, Street 2, House 15"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="🏙️ City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Arba Minch"
                    />

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        🌍 Country
                      </label>

                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="Ethiopia">Ethiopia</option>

                        <option value="Kenya">Kenya</option>

                        <option value="Uganda">Uganda</option>

                        <option value="Tanzania">Tanzania</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      📝 Delivery instructions
                      <span className="ml-2 font-medium text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <textarea
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Example: Call me before delivery. Leave the package with the security guard if I am not available."
                      className="w-full resize-none rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="h-5 w-5 rounded border-sky-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Save this address
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Use this delivery address for my next order.
                      </p>
                    </div>
                  </label>

                  {(formData.address || formData.city) && (
                    <div className="rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-sky-50 p-5">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                          📍
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                            Delivery location
                          </p>

                          <p className="mt-1 font-bold text-slate-800">
                            {formData.address || "Address not entered"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formData.city || "City not entered"}
                            {formData.country ? `, ${formData.country}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* PAYMENT */}
              <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
                <SectionHeading
                  number="03"
                  title="Payment method"
                  description="Choose how you would like to pay."
                />

                <div className="mt-7 space-y-3">
                  <PaymentCard
                    title="Cash on Delivery"
                    description="Pay when your order arrives"
                    icon="💵"
                    selected={formData.payment === "Cash on Delivery"}
                    onClick={() => selectPayment("Cash on Delivery")}
                  />

                  <PaymentCard
                    title="Telebirr"
                    description="Pay securely using Telebirr"
                    icon="📱"
                    selected={formData.payment === "Telebirr"}
                    onClick={() => selectPayment("Telebirr")}
                  />

                  <PaymentCard
                    title="Credit / Debit Card"
                    description="Visa, Mastercard and other cards"
                    icon="💳"
                    selected={formData.payment === "Credit / Debit Card"}
                    onClick={() => selectPayment("Credit / Debit Card")}
                  />
                </div>

                {/* CASH ON DELIVERY */}
                {formData.payment === "Cash on Delivery" && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                        💵
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black text-slate-900">
                          Cash on Delivery
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          You will pay the delivery person when your order
                          arrives.
                        </p>

                        <div className="mt-3 rounded-xl bg-white px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Amount to pay
                          </p>

                          <p className="mt-1 text-xl font-black text-slate-900">
                            ${finalTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TELEBIRR */}
                {formData.payment === "Telebirr" && (
                  <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-2xl">
                        📱
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black text-slate-900">
                          Telebirr Payment
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Your payment will be created as pending. Complete the
                          Telebirr payment and the payment status can then be
                          confirmed.
                        </p>

                        <div className="mt-4 rounded-xl bg-white p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-500">
                              Amount
                            </span>

                            <span className="text-xl font-black text-slate-900">
                              ${finalTotal.toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-600">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            Payment status: Pending
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD */}
                {formData.payment === "Credit / Debit Card" && (
                  <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                        💳
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black text-slate-900">
                          Credit / Debit Card
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Enter your card information to continue.
                        </p>

                        <div className="mt-4 grid gap-4">
                          <input
                            type="text"
                            placeholder="Card number"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                          />

                          <input
                            type="text"
                            placeholder="Cardholder name"
                            autoComplete="cc-name"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                          />

                          <div className="grid gap-4 sm:grid-cols-2">
                            <input
                              type="text"
                              placeholder="MM / YY"
                              autoComplete="cc-exp"
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />

                            <input
                              type="password"
                              placeholder="CVV"
                              maxLength={4}
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                            />
                          </div>

                          <div className="flex items-start gap-2 rounded-xl bg-white p-3 text-xs leading-5 text-slate-500">
                            <span>🔒</span>

                            <span>
                              This is a demo card form. Do not send real card
                              numbers or CVV information to your own backend.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT - ORDER SUMMARY */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="overflow-hidden rounded-4xl bg-linear-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-200">
                <div className="p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-blue-100">
                        Your order
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        Order summary
                      </h2>
                    </div>

                    <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white">
                      {itemCount} items
                    </span>
                  </div>

                  {/* PRODUCTS */}
                  <div className="mt-7 space-y-4">
                    {cartProducts.map((item) => {
                      const product = item;

                      const image = product.image || "/placeholder.png";

                      const price = Number(product.price || 0);

                      const quantity = item.quantity || 1;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-2xl bg-white/15 p-3"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/20">
                            <img
                              src={image}
                              alt={product.name || "Product"}
                              className="h-full w-full object-cover"
                            />

                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-blue-700">
                              {quantity}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">
                              {product.name || "Product"}
                            </p>

                            <p className="mt-1 text-xs text-blue-100">
                              ${price.toFixed(2)} each
                            </p>
                          </div>

                          <p className="text-sm font-black">
                            ${(price * quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* PRICES */}
                  <div className="my-7 space-y-4 border-y border-white/20 py-6">
                    <SummaryRow
                      label="Subtotal"
                      value={`$${cartTotal.toFixed(2)}`}
                    />

                    <SummaryRow
                      label="Shipping"
                      value={
                        shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`
                      }
                    />

                    <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} />

                    <SummaryRow
                      label="Discount"
                      value={`-$${couponDiscount.toFixed(2)}`}
                      discount
                    />
                  </div>

                  {/* TOTAL */}
                  <div className="flex items-end justify-between">
                    <span className="text-blue-100">Total</span>

                    <span className="text-3xl font-black">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* SELECTED PAYMENT */}
                  <div className="mt-5 rounded-2xl bg-white/15 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                      Payment method
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg">
                        {formData.payment === "Cash on Delivery"
                          ? "💵"
                          : formData.payment === "Telebirr"
                            ? "📱"
                            : "💳"}
                      </span>

                      <span className="text-sm font-bold">
                        {formData.payment}
                      </span>
                    </div>
                  </div>

                  {/* PLACE ORDER */}
                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black text-blue-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {placingOrder ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-blue-100">
                    <span>🔒</span>
                    Secure and protected checkout
                  </div>
                </div>
              </div>

              <Link
                href="/cart"
                className="mt-4 flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-4 text-sm font-bold text-blue-700 transition hover:bg-sky-50"
              >
                ← Return to Cart
              </Link>
            </aside>
          </div>
        </div>
      </form>

      {/* FOOTER */}
      <footer className="border-t border-sky-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-5 text-center text-sm text-slate-400 lg:px-8">
          © {new Date().getFullYear()} ShopEase. Secure shopping experience.
        </div>
      </footer>
    </main>
  );
}

/* =====================================================
   CHECKOUT STEP
===================================================== */

function CheckoutStep({
  number,
  title,
  active,
}: {
  number: string;
  title: string;
  active?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
          active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
            : "bg-white text-slate-400"
        }`}
      >
        {number}
      </div>

      <span
        className={`hidden text-xs font-bold sm:block ${
          active ? "text-slate-900" : "text-slate-400"
        }`}
      >
        {title}
      </span>
    </div>
  );
}

/* =====================================================
   SECTION HEADING
===================================================== */

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-black text-blue-600">
        {number}
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

/* =====================================================
   INPUT FIELD
===================================================== */

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
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

/* =====================================================
   PAYMENT CARD
===================================================== */

function PaymentCard({
  title,
  description,
  icon,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-blue-500 bg-sky-50 ring-2 ring-blue-100"
          : "border-sky-100 bg-white hover:border-blue-200 hover:bg-sky-50"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
          selected ? "bg-blue-600 text-white" : "bg-sky-100"
        }`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-black text-slate-900">{title}</p>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300"
        }`}
      >
        {selected && <span className="text-xs">✓</span>}
      </div>
    </button>
  );
}

/* =====================================================
   SUMMARY ROW
===================================================== */

function SummaryRow({
  label,
  value,
  discount = false,
}: {
  label: string;
  value: string;
  discount?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-blue-100">{label}</span>

      <span
        className={`font-bold ${discount ? "text-emerald-200" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
