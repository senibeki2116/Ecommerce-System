"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = {
  id?: number;
  productId?: number;
  quantity?: number;
  price?: number;
  product?: {
    id?: number;
    name?: string;
    price?: number;
    image?: string | null;
  };
};

type Order = {
  id?: number | string;
  _id?: string;

  status?: string;

  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total?: number;

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

  items?: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to view your orders.");
      }

      const response = await fetch("http://localhost:3001/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load orders.");
      }

      const orderData = Array.isArray(data)
        ? data
        : data.orders || data.data || [];

      setOrders(orderData);
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to load orders. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CANCEL ORDER
  // =========================================================

  const cancelOrder = async (id: string) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3001/orders/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to cancel order.");
      }

      setOrders((prev) =>
        prev.map((order) => {
          const orderId = String(order.id || order._id || "");

          return orderId === id
            ? {
                ...order,
                status: "CANCELLED",
              }
            : order;
        }),
      );
    } catch (err: any) {
      alert(err?.message || "Unable to cancel order.");
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => {
          const status = normalizeStatus(order.status || "PENDING");

          return status === filter;
        });

  // =========================================================
  // STATS
  // =========================================================

  const activeOrders = orders.filter((order) => {
    const status = normalizeStatus(order.status || "PENDING");

    return status !== "CANCELLED" && status !== "DELIVERED";
  }).length;

  const deliveredOrders = orders.filter(
    (order) => normalizeStatus(order.status || "") === "DELIVERED",
  ).length;

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-900">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            Shop<span className="text-blue-600">Ease</span>
          </Link>

          <Link
            href="/products"
            className="rounded-full border border-sky-200 bg-sky-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="bg-linear-to-br from-sky-100 via-blue-50 to-indigo-100">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">
            My Account
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Your orders
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Track your purchases, check delivery status, and manage your recent
            orders.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <StatCard number={orders.length} label="Total Orders" />

            <StatCard number={activeOrders} label="Active" />

            <StatCard number={deliveredOrders} label="Delivered" />
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {/* ===================================================
            FILTERS
        =================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">Order history</p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Recent purchases
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "All",
              "PENDING",
              "CONFIRMED",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  filter === status
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "border border-sky-100 bg-white text-slate-500 hover:bg-sky-50 hover:text-blue-600"
                }`}
              >
                {status === "All" ? "All" : formatStatus(status)}
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (
          <div className="rounded-4xl border border-sky-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-blue-600" />

            <p className="mt-5 font-bold text-slate-500">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          /* =================================================
             ERROR
          ================================================= */

          <div className="rounded-4xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl">
              !
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              Unable to load orders
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-slate-500">{error}</p>

            <button
              onClick={fetchOrders}
              className="mt-7 rounded-full bg-blue-600 px-7 py-3 font-bold text-white transition hover:bg-indigo-600"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <div className="rounded-4xl border border-sky-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-5xl">
              📦
            </div>

            <h2 className="mt-7 text-3xl font-black text-slate-900">
              No orders found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              {filter === "All"
                ? "You haven't placed any orders yet."
                : `You don't have any ${formatStatus(
                    filter,
                  ).toLowerCase()} orders.`}
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-indigo-600"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* =================================================
             ORDERS
          ================================================= */

          <div className="space-y-8">
            {filteredOrders.map((order, index) => {
              const id = String(order.id || order._id || "");

              const status = normalizeStatus(order.status || "PENDING");

              const createdDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Recent order";

              return (
                <div
                  key={id || index}
                  className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm transition hover:shadow-xl hover:shadow-blue-100"
                >
                  {/* =================================================
                      ORDER HEADER
                  ================================================= */}

                  <div className="border-b border-sky-50 bg-linear-to-r from-sky-50 to-blue-50 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Order #{id || index + 1}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Placed on {createdDate}
                        </p>
                      </div>

                      <StatusBadge status={status} />
                    </div>
                  </div>

                  {/* =================================================
                      ORDER BODY
                  ================================================= */}

                  <div className="p-5 sm:p-6">
                    {/* =================================================
                        PRODUCTS
                    ================================================= */}

                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-4">
                        {order.items.map((item, itemIndex) => {
                          const product = item.product || {};

                          const image = product.image || "/placeholder.png";

                          const quantity = item.quantity || 1;

                          const price = Number(
                            item.price ?? product.price ?? 0,
                          );

                          return (
                            <div
                              key={item.id || itemIndex}
                              className="flex items-center gap-4"
                            >
                              {/* Product image */}

                              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-sky-50">
                                <img
                                  src={image}
                                  alt={product.name || "Product"}
                                  className="h-full w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.src =
                                      "/placeholder.png";
                                  }}
                                />
                              </div>

                              {/* Product info */}

                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-black text-slate-900">
                                  {product.name || "Product"}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                  Quantity: {quantity}
                                </p>
                              </div>

                              {/* Price */}

                              <p className="font-black text-slate-900">
                                ${(price * quantity).toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Order items are not available.
                      </p>
                    )}

                    {/* =================================================
                        DELIVERY INFORMATION
                    ================================================= */}

                    <div className="mt-7 rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 to-sky-50 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                          📍
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                            Delivery Address
                          </p>

                          <p className="mt-2 font-black text-slate-900">
                            {order.address || "Address not specified"}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {[order.city, order.country]
                              .filter(Boolean)
                              .join(", ") || "Location not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Delivery instructions */}

                      {order.deliveryInstructions && (
                        <div className="mt-5 border-t border-blue-100 pt-4">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Delivery Instructions
                          </p>

                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                            {order.deliveryInstructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* =================================================
                        CUSTOMER + PAYMENT
                    ================================================= */}

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {/* Customer */}

                      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                            👤
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                              Customer
                            </p>

                            <p className="font-black text-slate-900">
                              {[order.firstName, order.lastName]
                                .filter(Boolean)
                                .join(" ") || "Customer"}
                            </p>
                          </div>
                        </div>

                        {order.phone && (
                          <p className="mt-4 text-sm text-slate-600">
                            📱 {order.phone}
                          </p>
                        )}

                        {order.email && (
                          <p className="mt-1 break-all text-sm text-slate-600">
                            ✉️ {order.email}
                          </p>
                        )}
                      </div>

                      {/* Payment */}

                      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                            💳
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                              Payment Method
                            </p>

                            <p className="font-black text-slate-900">
                              {formatPaymentMethod(order.paymentMethod)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        ORDER SUMMARY
                    ================================================= */}

                    <div className="mt-6 rounded-3xl border border-slate-100 bg-white">
                      <div className="border-b border-slate-100 px-5 py-4">
                        <h3 className="font-black text-slate-900">
                          Order Summary
                        </h3>
                      </div>

                      <div className="space-y-3 p-5">
                        <SummaryRow label="Subtotal" value={order.subtotal} />

                        <SummaryRow label="Shipping" value={order.shipping} />

                        <SummaryRow label="Tax" value={order.tax} />

                        {Number(order.discount || 0) > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-500">
                              Discount
                            </span>

                            <span className="font-bold text-emerald-600">
                              -$
                              {Number(order.discount || 0).toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-slate-100 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900">
                              Total
                            </span>

                            <span className="text-2xl font-black text-blue-600">
                              ${Number(order.total || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      {status !== "CANCELLED" && status !== "DELIVERED" && (
                        <button
                          onClick={() => cancelOrder(id)}
                          className="rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                        >
                          Cancel Order
                        </button>
                      )}

                      <Link
                        href={`/orders/${id}`}
                        className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white shadow-md shadow-blue-100 transition hover:bg-indigo-600"
                      >
                        View Order
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-sky-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-5 text-center text-sm text-slate-400 lg:px-8">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({ number, label }: { number: number; label: string }) {
  return (
    <div className="min-w-32.5 rounded-2xl border border-white/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
      <p className="text-2xl font-black text-blue-700">{number}</p>

      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);

  let classes = "bg-amber-50 text-amber-700 border-amber-200";

  if (normalized === "CONFIRMED") {
    classes = "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (normalized === "SHIPPED") {
    classes = "bg-indigo-50 text-indigo-700 border-indigo-200";
  }

  if (normalized === "DELIVERED") {
    classes = "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalized === "CANCELLED") {
    classes = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-black ${classes}`}
    >
      {formatStatus(normalized)}
    </span>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold text-slate-500">{label}</span>

      <span className="font-bold text-slate-900">
        ${Number(value || 0).toFixed(2)}
      </span>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(status: string) {
  const value = status.toUpperCase();

  // Support old frontend/backend status names
  if (value === "PROCESSING") {
    return "CONFIRMED";
  }

  return value;
}

function formatStatus(status: string) {
  if (!status) return "Pending";

  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPaymentMethod(paymentMethod?: string) {
  if (!paymentMethod) {
    return "Not specified";
  }

  return paymentMethod
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
