"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Components/Navbar";
import { useCart } from "../Context/CartContext";

/* =========================
   ICONS
========================= */

function ShoppingBagIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function TrashIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function BookmarkIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3-6 3V4.5Z" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h11v11H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m20 13-7 7-9-9V4h7l9 9Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* =========================
   PAGE
========================= */

export default function CartPage() {
  const router = useRouter();

  const {
    cart,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  /* =========================
     ADDRESS STATE
  ========================= */

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);
  const [addressMessage, setAddressMessage] = useState("");

  /* =========================
     LOAD SAVED ADDRESS
  ========================= */

  useEffect(() => {
    const savedAddress = localStorage.getItem("shippingAddress");

    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);

        setFullName(parsed.fullName || "");
        setAddress(parsed.address || "");
        setAddressSaved(true);
      } catch {
        localStorage.removeItem("shippingAddress");
      }
    }
  }, []);

  /* =========================
     ADDRESS CHANGE
  ========================= */

  const handleNameChange = (value: string) => {
    setFullName(value);
    setAddressSaved(false);
    setAddressMessage("");
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setAddressSaved(false);
    setAddressMessage("");
  };

  /* =========================
     SAVE ADDRESS
  ========================= */

  const handleSaveAddress = () => {
    const cleanName = fullName.trim();
    const cleanAddress = address.trim();

    if (!cleanName || !cleanAddress) {
      setAddressMessage("Please enter your full name and shipping address.");
      setAddressSaved(false);
      return;
    }

    const shippingAddress = {
      fullName: cleanName,
      address: cleanAddress,
    };

    localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));

    setFullName(cleanName);
    setAddress(cleanAddress);
    setAddressSaved(true);
    setAddressMessage("Address saved successfully.");
  };

  /* =========================
     CHECKOUT
  ========================= */

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }

    if (!fullName.trim() || !address.trim()) {
      setAddressMessage(
        "Please enter and save your shipping address before checkout.",
      );
      return;
    }

    if (!addressSaved) {
      setAddressMessage(
        "Please click Save address before continuing to checkout.",
      );
      return;
    }

    router.push("/checkout");
  };

  const shipping = cartTotal >= 100 ? 0 : 10;
  const tax = cartTotal * 0.08;

  /*
    Coupon discount is $40.60.
    Prevent total from becoming negative.
  */
  const couponDiscount = cartTotal > 40.6 ? 40.6 : cartTotal;

  const finalTotal = Math.max(0, cartTotal + shipping + tax - couponDiscount);

  const canCheckout =
    cart.length > 0 &&
    fullName.trim().length > 0 &&
    address.trim().length > 0 &&
    addressSaved;

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#171717]">
      {/* NAVBAR */}
      <Navbar />

      {/* PAGE */}
      <main className="mx-auto max-w-350 px-5 py-8 lg:px-8">
        {/* BREADCRUMB */}
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="transition hover:text-black">
            Home
          </Link>

          <span>›</span>

          <span className="text-gray-800">Shopping Cart</span>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* =========================
              LEFT CART SECTION
          ========================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_3px_15px_rgba(0,0,0,0.04)] sm:p-6">
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
                    <ShoppingBagIcon size={19} />
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight">
                    Your Shopping Cart
                  </h1>
                </div>

                <p className="text-sm text-gray-500">
                  Make sure everything looks right before checkout.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex w-fit items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Continue shopping
              </Link>
            </div>

            {/* ITEM COUNT */}
            {cart.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <p className="text-sm font-medium text-gray-700">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </p>

                <button
                  onClick={clearCart}
                  className="text-sm font-medium text-gray-500 transition hover:text-black"
                >
                  Clear cart
                </button>
              </div>
            )}

            {/* EMPTY CART */}
            {cart.length === 0 ? (
              <div className="flex min-h-107.5 flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <ShoppingBagIcon size={34} />
                </div>

                <h2 className="text-xl font-bold">Your cart is empty</h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  You haven't added anything to your cart yet. Explore our
                  products and find something you love.
                </p>

                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Start shopping
                  <ArrowRightIcon />
                </Link>
              </div>
            ) : (
              <>
                {/* PRODUCTS */}
                <div className="mt-5 space-y-3">
                  {cart.map((item: any) => (
                    <div
                      key={item._id || item.id}
                      className="group rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:shadow-sm sm:p-4"
                    >
                      <div className="flex gap-4">
                        {/* PRODUCT IMAGE */}
                        <div className="h-26.25 w-26.25 shrink-0 overflow-hidden rounded-xl bg-[#f1f4f6] sm:h-30 sm:w-30">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* PRODUCT INFORMATION */}
                        <div className="min-w-0 flex-1">
                          {/* TOP */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                                {item.name}
                              </h3>

                              <p className="mt-1 text-xs text-gray-500">
                                Premium quality product
                              </p>
                            </div>

                            <p className="whitespace-nowrap text-sm font-bold text-gray-900 sm:text-base">
                              ${Number(item.price).toFixed(2)}
                            </p>
                          </div>

                          {/* BOTTOM */}
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            {/* QUANTITY */}
                            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                              <button
                                onClick={() =>
                                  decreaseQuantity(item._id || item.id)
                                }
                                className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-200 hover:text-black"
                                aria-label="Decrease quantity"
                              >
                                <MinusIcon />
                              </button>

                              <span className="flex h-8 min-w-8 items-center justify-center border-x border-gray-200 bg-white text-sm font-semibold">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  increaseQuantity(item._id || item.id)
                                }
                                className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-200 hover:text-black"
                                aria-label="Increase quantity"
                              >
                                <PlusIcon />
                              </button>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() =>
                                  removeFromCart(item._id || item.id)
                                }
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-red-500"
                              >
                                <TrashIcon size={16} />
                                Remove
                              </button>

                              <button
                                className="text-gray-400 transition hover:text-black"
                                aria-label="Save product"
                              >
                                <BookmarkIcon size={17} />
                              </button>
                            </div>

                            {/* ITEM TOTAL */}
                            <p className="text-sm font-bold text-gray-800">
                              ${(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CART FOOTER */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                  <Link
                    href="/products"
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
                  >
                    ← Continue shopping
                  </Link>

                  <button
                    onClick={clearCart}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-black"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </section>

          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_3px_15px_rgba(0,0,0,0.04)] sm:p-6">
            {/* SUMMARY HEADER */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Order summary</h2>

              <span className="text-xs font-medium text-gray-500">
                {cartCount} items
              </span>
            </div>

            {/* SUMMARY ROWS */}
            <div className="mt-5 space-y-4">
              {/* SUBTOTAL */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <PackageIcon />
                  </div>

                  <span className="text-sm text-gray-600">Subtotal</span>
                </div>

                <span className="text-sm font-medium">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>

              {/* SHIPPING */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <TruckIcon />
                  </div>

                  <span className="text-sm text-gray-600">Shipping</span>
                </div>

                <span className="text-sm font-medium">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              {/* TAX */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <CardIcon />
                  </div>

                  <span className="text-sm text-gray-600">Tax</span>
                </div>

                <span className="text-sm font-medium">${tax.toFixed(2)}</span>
              </div>

              {/* COUPON */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <TagIcon />
                  </div>

                  <span className="text-sm font-medium text-green-600">
                    Coupon (DUO10)
                  </span>
                </div>

                <span className="text-sm font-semibold text-green-600">
                  - ${couponDiscount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="my-5 border-t border-gray-200" />

            {/* TOTAL */}
            <div className="flex items-center justify-between">
              <span className="text-base font-bold">Total</span>

              <span className="text-xl font-bold">
                ${finalTotal.toFixed(2)}
              </span>
            </div>

            {/* COUPON INPUT */}
            <div className="mt-5 flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-[#f8fafb] px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400"
              />

              <button
                type="button"
                className="rounded-lg bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
              >
                Apply
              </button>
            </div>

            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
              <CheckIcon />
              Applied DUO10
            </div>

            {/* =========================
                SHIPPING ADDRESS
            ========================= */}

            <div className="mt-5 rounded-xl bg-[#f8fbfc] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HomeIcon />

                  <span className="text-sm font-medium">Shipping address</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAddressSaved(false);
                    setAddressMessage("");
                  }}
                  className="text-xs font-medium text-gray-500 transition hover:text-black"
                >
                  Edit
                </button>
              </div>

              {/* FULL NAME */}
              <input
                type="text"
                value={fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Full name"
                className={`mt-3 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 transition ${
                  addressSaved
                    ? "border-green-200"
                    : "border-transparent focus:border-gray-200"
                }`}
              />

              {/* ADDRESS */}
              <input
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Street, city, ZIP"
                className={`mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 transition ${
                  addressSaved
                    ? "border-green-200"
                    : "border-transparent focus:border-gray-200"
                }`}
              />

              {/* SAVE ADDRESS BUTTON */}
              <button
                type="button"
                onClick={handleSaveAddress}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition ${
                  addressSaved
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-[#171717] hover:bg-black"
                }`}
              >
                {addressSaved ? (
                  <>
                    <CheckIcon />
                    Address saved
                  </>
                ) : (
                  <>
                    <BookmarkIcon size={16} />
                    Save address
                  </>
                )}
              </button>

              {/* ADDRESS MESSAGE */}
              {addressMessage && (
                <p
                  className={`mt-2 text-center text-xs font-medium ${
                    addressSaved ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {addressMessage}
                </p>
              )}
            </div>

            {/* PAYMENT */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold">Payment</p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#171717] px-2 py-2.5 text-xs font-medium text-white"
                >
                  <CardIcon />
                  Card
                </button>

                <button
                  type="button"
                  className="rounded-lg bg-[#f5fafc] px-2 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  UPI
                </button>

                <button
                  type="button"
                  className="rounded-lg bg-[#f5fafc] px-2 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  Wallet
                </button>
              </div>
            </div>

            {/* =========================
                CHECKOUT BUTTON
            ========================= */}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={!canCheckout}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition ${
                canCheckout
                  ? "bg-[#171717] hover:bg-black hover:shadow-md active:scale-[0.99]"
                  : "cursor-not-allowed bg-gray-300 text-gray-500"
              }`}
            >
              {canCheckout ? "Checkout" : "Complete address first"}

              <ArrowRightIcon />
            </button>

            {/* CHECKOUT INFORMATION */}
            {!canCheckout && cart.length > 0 && (
              <p className="mt-2 text-center text-xs text-gray-400">
                Enter your shipping address and save it to continue.
              </p>
            )}

            {/* CONTINUE */}
            <Link
              href="/products"
              className="mt-4 block text-center text-sm font-medium text-gray-600 transition hover:text-black"
            >
              Continue shopping
            </Link>

            {/* TRUST */}
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5">
              <div className="text-center">
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                  ✓
                </div>

                <p className="text-[10px] text-gray-500">Secure</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                  ✓
                </div>

                <p className="text-[10px] text-gray-500">Fast delivery</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                  ✓
                </div>

                <p className="text-[10px] text-gray-500">Easy returns</p>
              </div>
            </div>
          </aside>
        </div>

        {/* FREE SHIPPING MESSAGE */}
        {cart.length > 0 && shipping > 0 && (
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
            Add <strong>${(100 - cartTotal).toFixed(2)}</strong> more to your
            cart to get <strong>free shipping</strong>.
          </div>
        )}

        {cart.length > 0 && shipping === 0 && (
          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-700">
            ✓ Congratulations! You qualify for <strong>free shipping</strong>.
          </div>
        )}
      </main>
    </div>
  );
}
