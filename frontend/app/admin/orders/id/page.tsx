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
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-4xl">📦</div>
          <p className="mt-3 text-slate-500">Loading order...</p>
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
              onClick={fetchOrder}
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-8">
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Orders
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Order Management
              </p>

              <h2 className="text-2xl font-bold md:text-3xl">
                Order #{order.id}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${getStatusStyle(
                order.status,
              )}`}
            >
              {order.status}
            </span>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Customer + Status */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Customer */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                  👤
                </div>

                <div>
                  <h3 className="font-bold">Customer</h3>
                  <p className="text-sm text-slate-500">Customer information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Name
                  </p>
                  <p className="mt-1 font-semibold">
                    {order.user?.name || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 text-slate-700">
                    {order.user?.email || "No email"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    User ID
                  </p>
                  <p className="mt-1 text-slate-700">#{order.user?.id}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  🔄
                </div>

                <div>
                  <h3 className="font-bold">Order Status</h3>
                  <p className="text-sm text-slate-500">
                    Update the order progress
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold">
                Current Status
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
                <p className="mt-2 text-sm text-slate-400">
                  Updating order status...
                </p>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h3 className="text-xl font-bold">Ordered Products</h3>

              <p className="mt-1 text-sm text-slate-500">
                {order.items.length} product
                {order.items.length !== 1 ? "s" : ""} in this order
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-3xl">
                        📦
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold">
                        {item.product?.name || "Product"}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Price: ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">Subtotal</p>

                    <p className="mt-1 text-xl font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-600">
                  Order Total
                </span>

                <span className="text-3xl font-bold text-blue-600">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-xl font-bold">Order Information</h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Order ID
                </p>
                <p className="mt-1 font-semibold">#{order.id}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Created
                </p>
                <p className="mt-1 text-sm">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Last Updated
                </p>
                <p className="mt-1 text-sm">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
