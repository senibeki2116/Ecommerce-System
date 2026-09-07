"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Product = {
  id: number;
  name: string;
  image?: string | null;
};

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: Product;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Order = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  items: OrderItem[];
};

const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const id = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login as an admin first.");
        return;
      }

      const response = await fetch(`http://localhost:3001/admin/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Your account must be ADMIN.");
        }

        if (response.status === 404) {
          throw new Error("Order not found.");
        }

        throw new Error("Failed to load order.");
      }

      const data = await response.json();

      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Could not load order.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Please login as an admin first.");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response = await fetch(
        `http://localhost:3001/admin/orders/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message || "Failed to update status.");
      }

      const updatedOrder = await response.json();

      setOrder(updatedOrder);
    } catch (err: any) {
      setError(err.message || "Could not update status.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "SHIPPED":
        return "bg-purple-100 text-purple-700";

      case "DELIVERED":
        return "bg-emerald-100 text-emerald-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳";

      case "CONFIRMED":
        return "✓";

      case "SHIPPED":
        return "🚚";

      case "DELIVERED":
        return "✓";

      case "CANCELLED":
        return "✕";

      default:
        return "📦";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Order is waiting for confirmation.";

      case "CONFIRMED":
        return "Order has been confirmed.";

      case "SHIPPED":
        return "Order has been shipped to the customer.";

      case "DELIVERED":
        return "Order has been successfully delivered.";

      case "CANCELLED":
        return "This order has been cancelled.";

      default:
        return "Order status.";
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case "PENDING":
        return "0%";

      case "CONFIRMED":
        return "33%";

      case "SHIPPED":
        return "66%";

      case "DELIVERED":
        return "100%";

      default:
        return "0%";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-5xl">📦</div>

          <p className="mt-4 font-medium text-slate-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Orders
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="text-5xl">⚠️</div>

            <h2 className="mt-4 text-xl font-bold text-red-800">
              Unable to load order
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error || "Order not found."}
            </p>

            <button
              onClick={() => fetchOrder()}
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const calculatedSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white lg:block">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-xl font-bold">ShopHub</h1>

          <p className="mt-1 text-sm text-slate-400">Admin Panel</p>
        </div>

        <nav className="space-y-2 p-4">
          <Link
            href="/admin"
            className="block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="block rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            📦 Orders
          </Link>

          <Link
            href="/admin/products"
            className="block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            🛍️ Products
          </Link>

          <Link
            href="/admin/users"
            className="block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            👥 Customers
          </Link>

          <Link
            href="/"
            className="mt-6 block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            🏠 View Store
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <Link
                href="/admin/orders"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                ← Back to Orders
              </Link>

              <p className="mt-4 text-sm font-medium text-blue-600">
                Order Management
              </p>

              <h2 className="text-2xl font-bold md:text-3xl">
                Order #{order.id}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <span
                className={`rounded-full px-4 py-2 text-sm font-bold ${getStatusStyle(
                  order.status,
                )}`}
              >
                {getStatusIcon(order.status)} {order.status}
              </span>

              <button
                onClick={() => fetchOrder(true)}
                disabled={refreshing}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Order Progress */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Order Progress</h3>

              <p className="mt-1 text-sm text-slate-500">
                Track the current status of this order.
              </p>
            </div>

            {order.status === "CANCELLED" ? (
              <div className="rounded-xl bg-red-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
                    ✕
                  </div>

                  <div>
                    <p className="font-bold text-red-800">Order Cancelled</p>

                    <p className="text-sm text-red-600">
                      {getStatusDescription(order.status)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div className="relative mb-8">
                  <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-200" />

                  <div
                    className="absolute left-0 top-5 h-1 rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: getProgressWidth(order.status),
                    }}
                  />

                  <div className="relative flex justify-between">
                    {statuses
                      .filter((status) => status !== "CANCELLED")
                      .map((status, index) => {
                        const currentIndex = statuses
                          .filter((item) => item !== "CANCELLED")
                          .indexOf(order.status);

                        const completed = index <= currentIndex;

                        return (
                          <div
                            key={status}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-bold shadow-sm ${
                                completed
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {completed ? "✓" : index + 1}
                            </div>

                            <p
                              className={`mt-2 text-xs font-semibold ${
                                completed ? "text-blue-600" : "text-slate-400"
                              }`}
                            >
                              {status}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold">
                    Current status:{" "}
                    <span className="text-blue-600">{order.status}</span>
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {getStatusDescription(order.status)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Customer + Status */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Customer */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                  👤
                </div>

                <div>
                  <h3 className="font-bold">Customer Information</h3>

                  <p className="text-sm text-slate-500">
                    Details about the customer
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">Name</span>

                  <span className="font-semibold">
                    {order.user?.name || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">Email</span>

                  <span className="break-all text-right text-sm font-medium">
                    {order.user?.email || "No email"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">User ID</span>

                  <span className="font-semibold">#{order.user?.id}</span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  🔄
                </div>

                <div>
                  <h3 className="font-bold">Update Order</h3>

                  <p className="text-sm text-slate-500">
                    Change the order status
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold">
                Order Status
              </label>

              <select
                value={order.status}
                disabled={updating}
                onChange={(e) => updateStatus(e.target.value)}
                className={`w-full rounded-xl border-0 px-4 py-3 font-bold outline-none ring-1 ring-slate-200 ${getStatusStyle(
                  order.status,
                )}`}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {updating && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                  <span className="animate-spin">⟳</span>
                  Updating order status...
                </div>
              )}

              {!updating && (
                <p className="mt-3 text-xs text-slate-400">
                  Changes are saved immediately.
                </p>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-bold">Ordered Products</h3>

                <p className="mt-1 text-sm text-slate-500">
                  {order.items.length} product
                  {order.items.length !== 1 ? "s" : ""} • {totalItems} item
                  {totalItems !== 1 ? "s" : ""} total
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const itemSubtotal = Number(item.price) * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-3xl">
                          📦
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="truncate font-bold">
                          {item.product?.name || "Product"}
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                          Product ID: #{item.product?.id}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-600">
                            Qty: {item.quantity}
                          </span>

                          <span className="rounded-lg bg-blue-50 px-2 py-1 text-blue-600">
                            ${Number(item.price).toFixed(2)} each
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:min-w-32.5 sm:text-right">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Subtotal
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        ${itemSubtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-6">
              <div className="ml-auto max-w-md space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Items</span>

                  <span className="font-semibold">{totalItems}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Calculated Subtotal</span>

                  <span className="font-semibold">
                    ${calculatedSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-600">
                      Order Total
                    </span>

                    <span className="text-3xl font-bold text-blue-600">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                ℹ️
              </div>

              <div>
                <h3 className="text-xl font-bold">Order Information</h3>

                <p className="text-sm text-slate-500">
                  Important order details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Order ID
                </p>

                <p className="mt-2 text-lg font-bold">#{order.id}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Status
                </p>

                <p className="mt-2 font-bold text-blue-600">{order.status}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Created
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Last Updated
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
            <Link
              href="/admin/orders"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold transition hover:bg-slate-50"
            >
              ← Back to All Orders
            </Link>

            <Link
              href="/admin"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              📊 Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
