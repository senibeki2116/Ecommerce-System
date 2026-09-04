"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  user: User;
  items: OrderItem[];
};

const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login as an admin first.");
        return;
      }

      const response = await fetch("http://localhost:3001/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "Access denied. Please make sure your account is ADMIN.",
          );
        }

        throw new Error("Failed to load orders.");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Please login as an admin first.");
      return;
    }

    try {
      setUpdatingId(orderId);
      setError("");

      const response = await fetch(
        `http://localhost:3001/admin/orders/${orderId}/status`,
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
        throw new Error(message || "Failed to update order.");
      }

      const updatedOrder = await response.json();

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? updatedOrder : order,
        ),
      );
    } catch (err: any) {
      setError(err.message || "Could not update order.");
    } finally {
      setUpdatingId(null);
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

  const totalRevenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.total, 0);

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

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
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur md:px-8">
          <div>
            <p className="text-sm font-medium text-blue-600">Admin Panel</p>

            <h2 className="text-2xl font-bold md:text-3xl">Order Management</h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all customer orders.
            </p>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Orders</p>

              <p className="mt-2 text-3xl font-bold">{orders.length}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Revenue</p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Pending</p>

              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Delivered</p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {deliveredCount}
              </p>
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-bold">All Orders</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage customer orders and delivery status.
                </p>
              </div>

              <button
                onClick={fetchOrders}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
              >
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-5xl">📦</div>

                <h4 className="mt-4 text-lg font-bold">No orders found</h4>

                <p className="mt-1 text-sm text-slate-500">
                  Customer orders will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-250">
                  <thead className="bg-slate-50 text-left text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order</th>

                      <th className="px-6 py-4 font-semibold">Customer</th>

                      <th className="px-6 py-4 font-semibold">Items</th>

                      <th className="px-6 py-4 font-semibold">Total</th>

                      <th className="px-6 py-4 font-semibold">Status</th>

                      <th className="px-6 py-4 font-semibold">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Order */}
                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-bold text-blue-600 hover:text-blue-800"
                          >
                            #{order.id}
                          </Link>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-5">
                          <p className="font-semibold">
                            {order.user?.name || "Unknown"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.user?.email || "No email"}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-5">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item) =>
                              item.product?.image ? (
                                <img
                                  key={item.id}
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                                />
                              ) : (
                                <div
                                  key={item.id}
                                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm"
                                >
                                  📦
                                </div>
                              ),
                            )}
                          </div>

                          <p className="mt-2 text-xs text-slate-500">
                            {order.items.length} product
                            {order.items.length !== 1 ? "s" : ""}
                          </p>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-5 font-bold">
                          ${order.total.toFixed(2)}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                            className={`rounded-full border-0 px-3 py-2 text-xs font-bold outline-none ${getStatusStyle(
                              order.status,
                            )}`}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          {updatingId === order.id && (
                            <p className="mt-1 text-xs text-slate-400">
                              Updating...
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
