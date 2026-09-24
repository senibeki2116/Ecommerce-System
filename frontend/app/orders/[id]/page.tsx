"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../Components/Navbar";

type OrderItem = {
  id?: number | string;
  productId?: number | string;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
  product?: {
    name?: string;
    image?: string;
  };
};

type Order = {
  id?: number | string;
  _id?: number | string;

  status?: string;

  total?: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;

  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  address?: string;
  city?: string;
  country?: string;
  deliveryInstructions?: string;

  paymentMethod?: string;

  createdAt?: string;
  updatedAt?: string;

  items?: OrderItem[];
  orderItems?: OrderItem[];
};

const STATUS_STEPS = [
  {
    key: "PENDING",
    title: "Order Placed",
    description: "Your order has been received",
    icon: "✓",
  },
  {
    key: "CONFIRMED",
    title: "Order Confirmed",
    description: "Your order has been confirmed",
    icon: "✓",
  },
  {
    key: "SHIPPED",
    title: "Shipped",
    description: "Your package is on the way",
    icon: "🚚",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    description: "Package delivered successfully",
    icon: "⌂",
  },
];

const statusOrder = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

function formatMoney(value: number | undefined) {
  return `${Number(value || 0).toLocaleString()} ETB`;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeStatus(status?: string) {
  return String(status || "PENDING").toUpperCase();
}

function getStatusIndex(status?: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "CANCELLED") {
    return -1;
  }

  const index = statusOrder.indexOf(normalized);

  return index === -1 ? 0 : index;
}

function getStatusLabel(status?: string) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "PENDING":
      return "Order Placed";
    case "CONFIRMED":
      return "Confirmed";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return normalized;
  }
}

function getItemName(item: OrderItem) {
  return item.name || item.product?.name || "Product";
}

function getItemImage(item: OrderItem) {
  return (
    item.image ||
    item.product?.image ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:3001/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (response.status === 404) {
          throw new Error("Order not found.");
        }

        if (!response.ok) {
          throw new Error("Unable to load this order.");
        }

        const data = await response.json();

        const normalizedOrder = data?.order || data?.data || data;

        setOrder(normalizedOrder);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the order.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const items = useMemo(() => {
    return order?.items || order?.orderItems || [];
  }, [order]);

  const currentStatus = normalizeStatus(order?.status);

  const currentStatusIndex = getStatusIndex(currentStatus);

  const subtotal =
    order?.subtotal ??
    items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );

  const shipping = Number(order?.shipping || 0);
  const tax = Number(order?.tax || 0);
  const discount = Number(order?.discount || 0);

  const total = order?.total ?? subtotal + shipping + tax - discount;

  const canCancel =
    currentStatus === "PENDING" || currentStatus === "CONFIRMED";

  const cancelOrder = async () => {
    try {
      setCancelling(true);

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to cancel this order.");
      }

      const updatedOrder = data?.order || data?.data || data;

      setOrder((previous) => ({
        ...(previous || {}),
        ...(updatedOrder || {}),
        status: updatedOrder?.status || "CANCELLED",
      }));

      setShowCancelConfirm(false);
    } catch (err) {
      console.error(err);

      alert(err instanceof Error ? err.message : "Unable to cancel the order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-slate-200" />

            <div className="h-4 w-96 rounded bg-slate-200" />

            <div className="h-56 rounded-3xl bg-white shadow-sm" />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-96 rounded-3xl bg-white lg:col-span-2" />

              <div className="h-96 rounded-3xl bg-white" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="flex min-h-[75vh] items-center justify-center px-4">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
              !
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              Order not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error || "We could not find the order you are looking for."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/orders"
                className="flex-1 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                My Orders
              </Link>

              <Link
                href="/products"
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            ← Back to My Orders
          </Link>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Order Tracking
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Order #{order.id || order._id}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-black ${
                currentStatus === "CANCELLED"
                  ? "bg-red-500/15 text-red-300"
                  : currentStatus === "DELIVERED"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-indigo-500/15 text-indigo-300"
              }`}
            >
              {getStatusLabel(currentStatus)}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TRACKING */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                Delivery progress
              </p>

              <h2 className="mt-1 text-xl font-black">Track your order</h2>
            </div>

            {currentStatus !== "CANCELLED" && (
              <span className="text-sm font-semibold text-slate-500">
                {currentStatus === "DELIVERED"
                  ? "Your package has arrived"
                  : "Your order is being processed"}
              </span>
            )}
          </div>

          {currentStatus === "CANCELLED" ? (
            <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg text-red-600">
                  ×
                </div>

                <div>
                  <h3 className="font-black text-red-900">Order Cancelled</h3>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    This order has been cancelled and will not be shipped.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <div className="relative">
                <div className="absolute left-[9%] right-[9%] top-6 hidden h-1 rounded-full bg-slate-100 sm:block" />

                <div
                  className="absolute left-[9%] top-6 hidden h-1 rounded-full bg-indigo-600 transition-all duration-700 sm:block"
                  style={{
                    width:
                      currentStatusIndex === 0
                        ? "0%"
                        : `${(currentStatusIndex / 3) * 82}%`,
                  }}
                />

                <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
                  {STATUS_STEPS.map((step, index) => {
                    const completed = index <= currentStatusIndex;

                    const active = index === currentStatusIndex;

                    return (
                      <div
                        key={step.key}
                        className="relative flex flex-col items-center text-center"
                      >
                        <div
                          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-sm font-black shadow-md transition ${
                            completed
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          } ${active ? "ring-4 ring-indigo-100" : ""}`}
                        >
                          {completed ? step.icon : index + 1}
                        </div>

                        <h3
                          className={`mt-4 text-sm font-black ${
                            completed ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </h3>

                        <p className="mt-1 max-w-37.5 text-xs leading-5 text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CONTENT */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            {/* ITEMS */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                    Your purchase
                  </p>

                  <h2 className="mt-1 text-xl font-black">Order Items</h2>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-7 divide-y divide-slate-100">
                {items.map((item, index) => {
                  const quantity = Number(item.quantity || 1);

                  const price = Number(item.price || 0);

                  return (
                    <div
                      key={item.id || `${item.productId}-${index}`}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        <img
                          src={getItemImage(item)}
                          alt={getItemName(item)}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-black text-slate-900">
                          {getItemName(item)}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Quantity: {quantity}
                        </p>

                        <p className="mt-3 text-sm font-bold text-indigo-600">
                          {formatMoney(price)} each
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">
                          {formatMoney(price * quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CUSTOMER + ADDRESS */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* CUSTOMER INFORMATION */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                  👤
                </div>

                <h2 className="font-black">Customer Information</h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {order.firstName || order.lastName
                        ? `${order.firstName || ""} ${
                            order.lastName || ""
                          }`.trim()
                        : "Customer"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 break-all font-semibold text-slate-800">
                      {order.email || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {order.phone || "—"}
                    </p>
                  </div>
                </div>
              </section>

              {/* DELIVERY ADDRESS */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                  📍
                </div>

                <h2 className="font-black">Delivery Address</h2>

                <div className="mt-5 text-sm leading-6 text-slate-600">
                  <p className="font-bold text-slate-900">
                    {order.address || "—"}
                  </p>

                  <p>{order.city || "—"}</p>

                  <p>{order.country || "—"}</p>

                  {order.deliveryInstructions && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Delivery Instructions
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {order.deliveryInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ORDER HISTORY */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                Order information
              </p>

              <h2 className="mt-1 text-xl font-black">Order History</h2>

              <div className="mt-6 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm">
                    ✓
                  </div>

                  <div>
                    <p className="font-bold">Order placed</p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>

                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
                      ↻
                    </div>

                    <div>
                      <p className="font-bold">Order last updated</p>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateTime(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="space-y-6">
            {/* SUMMARY */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Order Summary</h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Subtotal</span>

                  <span className="font-bold">{formatMoney(subtotal)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Shipping</span>

                  <span className="font-bold">
                    {shipping === 0 ? "Free" : formatMoney(shipping)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Tax</span>

                  <span className="font-bold">{formatMoney(tax)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between gap-4 text-emerald-600">
                    <span>Discount</span>

                    <span className="font-bold">-{formatMoney(discount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-black">Total</span>

                    <span className="text-2xl font-black text-indigo-600">
                      {formatMoney(total)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-xl">
                  💳
                </div>

                <div>
                  <h2 className="font-black">Payment Method</h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Secure payment information
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-900">
                  {order.paymentMethod || "Payment information unavailable"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Payment method selected during checkout
                </p>
              </div>
            </section>

            {/* ACTIONS */}
            <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
              <h2 className="font-black">Need help?</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                You can return to your orders or continue shopping while we
                process your order.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/orders"
                  className="flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-100"
                >
                  View All Orders
                </Link>

                <Link
                  href="/products"
                  className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Continue Shopping
                </Link>

                {canCancel && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* CANCEL MODAL */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
              !
            </div>

            <h2 className="mt-5 text-center text-xl font-black">
              Cancel this order?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to cancel order #{order.id || order._id}?
              This action cannot be undone.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Keep Order
              </button>

              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
