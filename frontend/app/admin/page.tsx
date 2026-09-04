"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login as an admin.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load dashboard.");
        setLoading(false);
        return;
      }

      setOrders(data);
    } catch (error) {
      console.error(error);
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const totalSales = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "CONFIRMED",
  ).length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200";

      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border border-blue-200";

      case "SHIPPED":
        return "bg-purple-50 text-purple-700 border border-purple-200";

      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 border border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-5" />

          <p className="text-slate-300 font-medium">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-72 bg-slate-950 text-white flex-col fixed left-0 top-0 bottom-0">
          {/* Logo */}
          <div className="px-7 py-7 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-600/20">
                🛒
              </div>

              <div>
                <h1 className="text-lg font-bold">
                  Shop<span className="text-blue-400">Hub</span>
                </h1>

                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-7">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold px-3 mb-3">
              Overview
            </p>

            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white mb-2 shadow-lg shadow-blue-600/20"
            >
              <span className="text-xl">📊</span>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition mb-1"
            >
              <span className="text-xl">📦</span>
              <span>Orders</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition mb-1"
            >
              <span className="text-xl">🛍️</span>
              <span>Products</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span className="text-xl">👥</span>
              <span>Customers</span>
            </Link>

            <div className="border-t border-slate-800 my-7" />

            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold px-3 mb-3">
              Store
            </p>

            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <span className="text-xl">🏪</span>
              <span>View Store</span>
            </Link>
          </nav>

          {/* Admin Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                A
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Administrator</p>

                <p className="text-xs text-slate-500 truncate">Store Manager</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 lg:ml-72">
          {/* TOP BAR */}
          <header className="bg-white border-b border-slate-200 px-5 sm:px-8 py-5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Welcome back 👋</p>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchOrders}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  🔄 Refresh
                </button>

                <Link
                  href="/"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition"
                >
                  Store →
                </Link>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* STATISTICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              {/* Sales */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Revenue
                    </p>

                    <h2 className="text-3xl font-bold text-slate-900 mt-2">
                      ${totalSales.toFixed(2)}
                    </h2>

                    <p className="text-xs text-emerald-600 font-medium mt-2">
                      ↗ From all active orders
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
                    💰
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Orders
                    </p>

                    <h2 className="text-3xl font-bold text-slate-900 mt-2">
                      {orders.length}
                    </h2>

                    <p className="text-xs text-blue-600 font-medium mt-2">
                      All customer orders
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
                    📦
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Pending
                    </p>

                    <h2 className="text-3xl font-bold text-slate-900 mt-2">
                      {pendingOrders}
                    </h2>

                    <p className="text-xs text-amber-600 font-medium mt-2">
                      Waiting for processing
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">
                    ⏳
                  </div>
                </div>
              </div>

              {/* Delivered */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Delivered
                    </p>

                    <h2 className="text-3xl font-bold text-slate-900 mt-2">
                      {deliveredOrders}
                    </h2>

                    <p className="text-xs text-emerald-600 font-medium mt-2">
                      Successfully completed
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
                    ✅
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Sales Overview */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Sales Overview
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Current store performance
                    </p>
                  </div>

                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                    All Time
                  </span>
                </div>

                <div className="h-56 flex items-end gap-3 sm:gap-5">
                  {[35, 52, 42, 68, 55, 78, 63, 88, 72, 94, 80, 100].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 h-full flex items-end group"
                      >
                        <div
                          className="w-full bg-blue-100 group-hover:bg-blue-600 rounded-t-lg transition-all"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ),
                  )}
                </div>

                <div className="flex justify-between text-xs text-slate-400 mt-3">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Order Status
                </h2>

                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Current order distribution
                </p>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Pending</span>
                      <span className="font-semibold">{pendingOrders}</span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${orders.length ? (pendingOrders / orders.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Confirmed</span>
                      <span className="font-semibold">{confirmedOrders}</span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${orders.length ? (confirmedOrders / orders.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Delivered</span>
                      <span className="font-semibold">{deliveredOrders}</span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${orders.length ? (deliveredOrders / orders.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href="/admin/orders"
                  className="block text-center mt-7 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-medium transition"
                >
                  Manage Orders →
                </Link>
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Recent Orders
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Latest customer activity
                  </p>
                </div>

                <Link
                  href="/admin/orders"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-5xl mb-4">📦</div>

                  <h3 className="text-lg font-bold text-slate-900">
                    No orders yet
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Orders will appear here when customers purchase products.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                          Order
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                          Customer
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                          Date
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                          Amount
                        </th>

                        <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.slice(0, 8).map((order) => (
                        <tr
                          key={order.id}
                          className="border-t border-slate-100 hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-5">
                            <span className="font-bold text-slate-900">
                              #{order.id}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                {order.user?.name?.charAt(0).toUpperCase() ||
                                  "C"}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {order.user?.name || "Customer"}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {order.user?.email || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-5 font-bold text-slate-900">
                            ${order.total.toFixed(2)}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Link
                  href="/admin/products"
                  className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                    🛍️
                  </div>

                  <h3 className="font-bold text-slate-900">Manage Products</h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Add, edit and remove products.
                  </p>
                </Link>

                <Link
                  href="/admin/orders"
                  className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                    📦
                  </div>

                  <h3 className="font-bold text-slate-900">Manage Orders</h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Process and update customer orders.
                  </p>
                </Link>

                <Link
                  href="/admin/users"
                  className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                    👥
                  </div>

                  <h3 className="font-bold text-slate-900">Manage Customers</h3>

                  <p className="text-sm text-slate-500 mt-1">
                    View and manage your customers.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
