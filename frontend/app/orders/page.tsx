"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Order = {
  id?: string;
  _id?: string;
  status?: string;
  total?: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  createdAt?: string;
  items?: any[];
  customer?: any;
  shippingAddress?: any;
  paymentMethod?: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/orders", {
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      if (response.status === 401) {
        throw new Error("Please login to view your orders.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load orders.");
      }

      setOrders(Array.isArray(data) ? data : data.orders || data.data || []);
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to load orders. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

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
          const orderId = order.id || order._id;

          return orderId === id
            ? {
                ...order,
                status: "Cancelled",
              }
            : order;
        }),
      );
    } catch (err: any) {
      alert(err?.message || "Unable to cancel order.");
    }
  };

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter(
          (order) =>
            (order.status || "Pending").toLowerCase() === filter.toLowerCase(),
        );

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-900">
      {/* Header */}
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

      {/* Hero */}
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

            <StatCard
              number={
                orders.filter(
                  (o) => !["Cancelled", "Delivered"].includes(o.status || ""),
                ).length
              }
              label="Active"
            />

            <StatCard
              number={orders.filter((o) => o.status === "Delivered").length}
              label="Delivered"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {/* Filters */}
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
              "Pending",
              "Processing",
              "Shipped",
              "Delivered",
              "Cancelled",
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
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-4xl border border-sky-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-blue-600" />

            <p className="mt-5 font-bold text-slate-500">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
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
                : `You don't have any ${filter.toLowerCase()} orders.`}
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-indigo-600"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const id = order.id || order._id || "";
              const status = order.status || "Pending";

              const createdDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "Recent order";

              return (
                <div
                  key={id || index}
                  className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm transition hover:shadow-xl hover:shadow-blue-100"
                >
                  {/* Order Top */}
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

                  {/* Items */}
                  <div className="p-5 sm:p-6">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-4">
                        {order.items.map((item: any, itemIndex: number) => {
                          const product = item.product || item;

                          const image = product.image || "/placeholder.png";

                          const quantity = item.quantity || 1;

                          const price = Number(product.price || 0);

                          return (
                            <div
                              key={itemIndex}
                              className="flex items-center gap-4"
                            >
                              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-sky-50">
                                <img
                                  src={image}
                                  alt={product.name || "Product"}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="truncate font-black text-slate-900">
                                  {product.name || "Product"}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                  Quantity: {quantity}
                                </p>
                              </div>

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

                    {/* Bottom */}
                    <div className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-3">
                      <InfoBlock
                        label="Payment"
                        value={order.paymentMethod || "Not specified"}
                      />

                      <InfoBlock
                        label="Delivery"
                        value={order.shippingAddress?.city || "Not specified"}
                      />

                      <InfoBlock
                        label="Total"
                        value={`$${Number(order.total || 0).toFixed(2)}`}
                        highlight
                      />
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      {!["Cancelled", "Delivered"].includes(status) && (
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

      <footer className="border-t border-sky-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-5 text-center text-sm text-slate-400 lg:px-8">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

/* ---------------- Components ---------------- */

function StatCard({ number, label }: { number: number; label: string }) {
  return (
    <div className="min-w-32.5 rounded-2xl border border-white/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
      <p className="text-2xl font-black text-blue-700">{number}</p>

      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let classes = "bg-sky-100 text-blue-700 border-sky-200";

  if (normalized === "delivered") {
    classes = "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalized === "cancelled") {
    classes = "bg-red-50 text-red-700 border-red-200";
  }

  if (normalized === "processing" || normalized === "shipped") {
    classes = "bg-indigo-50 text-indigo-700 border-indigo-200";
  }

  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-black ${classes}`}
    >
      {status}
    </span>
  );
}

function InfoBlock({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black ${
          highlight ? "text-blue-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
