"use client";

import { useEffect, useMemo, useState } from "react";
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
  role?: string;
};

type Order = {
  id: number;
  userId?: number;

  status: string;

  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;

  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;

  address?: string | null;
  city?: string | null;
  country?: string | null;
  deliveryInstructions?: string | null;

  paymentMethod?: string | null;

  createdAt: string;
  updatedAt?: string;

  user?: User;
  items: OrderItem[];
};

const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

      if (response.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }

      if (response.status === 403) {
        throw new Error("Access denied. You must login with an ADMIN account.");
      }

      if (!response.ok) {
        throw new Error("Failed to load orders.");
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getAvailableStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING":
        return ["PENDING", "CONFIRMED", "CANCELLED"];

      case "CONFIRMED":
        return ["CONFIRMED", "SHIPPED", "CANCELLED"];

      case "SHIPPED":
        return ["SHIPPED", "DELIVERED"];

      case "DELIVERED":
        return ["DELIVERED"];

      case "CANCELLED":
        return ["CANCELLED"];

      default:
        return statuses;
    }
  };

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

      if (response.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }

      if (response.status === 403) {
        throw new Error("You do not have permission to update orders.");
      }

      if (!response.ok) {
        const message = await response.text();

        let readableMessage = "Failed to update order.";

        try {
          const parsed = JSON.parse(message);
          readableMessage = parsed.message || readableMessage;
        } catch {
          if (message) {
            readableMessage = message;
          }
        }

        throw new Error(readableMessage);
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

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName =
        `${order.firstName || ""} ${order.lastName || ""}`.trim();

      const matchesSearch =
        !query ||
        String(order.id).includes(query) ||
        customerName.toLowerCase().includes(query) ||
        order.email?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const confirmedCount = orders.filter(
    (order) => order.status === "CONFIRMED",
  ).length;

  const shippedCount = orders.filter(
    (order) => order.status === "SHIPPED",
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === "CANCELLED",
  ).length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "SHIPPED":
        return "bg-violet-50 text-violet-700 border-violet-200";

      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500";

      case "CONFIRMED":
        return "bg-blue-500";

      case "SHIPPED":
        return "bg-violet-500";

      case "DELIVERED":
        return "bg-emerald-500";

      case "CANCELLED":
        return "bg-red-500";

      default:
        return "bg-slate-400";
    }
  };

  const getCustomerName = (order: Order) => {
    const name = `${order.firstName || ""} ${order.lastName || ""}`.trim();

    return name || order.user?.name || "Unknown Customer";
  };

  const getCustomerEmail = (order: Order) => {
    return order.email || order.user?.email || "No email";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 text-white lg:block">
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl shadow-lg shadow-blue-900/30">
              S
            </div>

            <div>
              <h1 className="text-lg font-bold">ShopHub</h1>
              <p className="text-xs text-slate-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span>📊</span>
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20"
          >
            <span>📦</span>
            Orders
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span>🛍️</span>
            Products
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span>👥</span>
            Customers
          </Link>

          <div className="my-5 border-t border-slate-800" />

          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span>🏠</span>
            View Store
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-5 py-4 shadow-sm backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                <span>Admin Panel</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500">Orders</span>
              </div>

              <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                Order Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage customer orders, payments and delivery progress.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              Refresh
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="text-lg">⚠️</span>

              <div className="flex-1">
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1">{error}</p>
              </div>

              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  📦
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  ORDERS
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">Total Orders</p>

              <p className="mt-1 text-3xl font-bold">{orders.length}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  💰
                </div>

                <span className="text-xs font-semibold text-emerald-600">
                  REVENUE
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">Total Revenue</p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                  ⏳
                </div>

                <span className="text-xs font-semibold text-amber-600">
                  PENDING
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">Waiting</p>

              <p className="mt-1 text-3xl font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                  🚚
                </div>

                <span className="text-xs font-semibold text-violet-600">
                  SHIPPING
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">Shipped</p>

              <p className="mt-1 text-3xl font-bold text-violet-600">
                {shippedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  ✓
                </div>

                <span className="text-xs font-semibold text-emerald-600">
                  COMPLETED
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">Delivered</p>

              <p className="mt-1 text-3xl font-bold text-emerald-600">
                {deliveredCount}
              </p>
            </div>
          </div>

          {/* Secondary status overview */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Order Status Overview</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Current distribution of your orders
                </p>
              </div>

              <span className="text-sm font-semibold text-slate-500">
                {orders.length} total
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                {
                  label: "Pending",
                  value: pendingCount,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  label: "Confirmed",
                  value: confirmedCount,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Shipped",
                  value: shippedCount,
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                },
                {
                  label: "Delivered",
                  value: deliveredCount,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Cancelled",
                  value: cancelledCount,
                  color: "text-red-600",
                  bg: "bg-red-50",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() =>
                    setStatusFilter(
                      item.label.toUpperCase() === statusFilter
                        ? "ALL"
                        : item.label.toUpperCase(),
                    )
                  }
                  className={`rounded-xl p-4 text-left transition hover:scale-[1.01] ${item.bg} ${
                    statusFilter === item.label.toUpperCase()
                      ? "ring-2 ring-blue-500 ring-offset-1"
                      : ""
                  }`}
                >
                  <p className={`text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {item.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Orders Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Card Header */}
            <div className="border-b border-slate-100 p-5 md:p-6">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">All Customer Orders</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredOrders.length} order
                    {filteredOrders.length !== 1 ? "s" : ""} displayed
                  </p>
                </div>

                {(search || statusFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Search + Filter */}
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔎
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by order ID, customer name or email..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="p-12">
                <div className="mx-auto flex max-w-sm flex-col items-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-5 font-semibold text-slate-700">
                    Loading orders...
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Please wait while we fetch customer orders.
                  </p>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">
                  📦
                </div>

                <h4 className="mt-5 text-lg font-bold">
                  {orders.length === 0 ? "No orders yet" : "No matching orders"}
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {orders.length === 0
                    ? "Customer orders will appear here after customers complete checkout."
                    : "Try changing your search or status filter."}
                </p>

                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Show all orders
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-left">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Order
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Products
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Total
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Date
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                          Details
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((order) => {
                        const isExpanded = expandedId === order.id;

                        return (
                          <tr
                            key={order.id}
                            className="transition hover:bg-slate-50/80"
                          >
                            <td className="px-6 py-5 align-top">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                                  #
                                </div>

                                <div>
                                  <p className="font-bold text-slate-900">
                                    #{order.id}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Order ID
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5 align-top">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                                  {getCustomerName(order)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-40 truncate font-semibold">
                                    {getCustomerName(order)}
                                  </p>

                                  <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                                    {getCustomerEmail(order)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5 align-top">
                              <div className="flex -space-x-2">
                                {order.items.slice(0, 4).map((item) =>
                                  item.product?.image ? (
                                    <img
                                      key={item.id}
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                                    />
                                  ) : (
                                    <div
                                      key={item.id}
                                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm shadow-sm"
                                    >
                                      📦
                                    </div>
                                  ),
                                )}

                                {order.items.length > 4 && (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-xs font-bold text-white">
                                    +{order.items.length - 4}
                                  </div>
                                )}
                              </div>

                              <p className="mt-2 text-xs text-slate-500">
                                {order.items.length} product
                                {order.items.length !== 1 ? "s" : ""}
                              </p>
                            </td>

                            <td className="px-6 py-5 align-top">
                              <p className="font-bold text-slate-900">
                                ${Number(order.total || 0).toFixed(2)}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Order total
                              </p>
                            </td>

                            <td className="px-6 py-5 align-top">
                              <select
                                value={order.status}
                                disabled={
                                  updatingId === order.id ||
                                  order.status === "DELIVERED" ||
                                  order.status === "CANCELLED"
                                }
                                onChange={(e) =>
                                  updateStatus(order.id, e.target.value)
                                }
                                className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none transition ${getStatusStyle(
                                  order.status,
                                )} ${
                                  order.status === "DELIVERED" ||
                                  order.status === "CANCELLED"
                                    ? "cursor-not-allowed opacity-70"
                                    : "cursor-pointer hover:shadow-sm"
                                }`}
                              >
                                {getAvailableStatuses(order.status).map(
                                  (status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ),
                                )}
                              </select>

                              {updatingId === order.id && (
                                <p className="mt-2 text-xs font-medium text-blue-600">
                                  Updating...
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-5 align-top">
                              <p className="text-sm font-medium text-slate-700">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {new Date(order.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </td>

                            <td className="px-6 py-5 text-right align-top">
                              <button
                                onClick={() =>
                                  setExpandedId(isExpanded ? null : order.id)
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                {isExpanded ? "Hide" : "View"}
                              </button>

                              {isExpanded && (
                                <div className="absolute right-8 z-20 mt-3 w-96 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-2xl">
                                  <div className="mb-4 flex items-center justify-between">
                                    <div>
                                      <p className="font-bold">
                                        Order #{order.id}
                                      </p>

                                      <p className="text-xs text-slate-400">
                                        Customer & delivery details
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => setExpandedId(null)}
                                      className="text-slate-400 hover:text-slate-700"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  {/* Customer Information */}
                                  <div className="mb-4 rounded-xl bg-blue-50 p-4">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-700">
                                      Customer Information
                                    </p>

                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">
                                          Name
                                        </span>

                                        <span className="text-right font-semibold text-slate-800">
                                          {getCustomerName(order)}
                                        </span>
                                      </div>

                                      <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">
                                          Email
                                        </span>

                                        <span className="max-w-52 truncate text-right font-semibold text-slate-800">
                                          {getCustomerEmail(order)}
                                        </span>
                                      </div>

                                      <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">
                                          Phone
                                        </span>

                                        <span className="font-semibold text-slate-800">
                                          {order.phone || "Not provided"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delivery Information */}
                                  <div className="mb-4 rounded-xl bg-emerald-50 p-4">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-700">
                                      Delivery Information
                                    </p>

                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <p className="text-xs text-slate-500">
                                          Address
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                          {order.address || "Not provided"}
                                        </p>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <p className="text-xs text-slate-500">
                                            City
                                          </p>

                                          <p className="mt-1 font-semibold text-slate-800">
                                            {order.city || "Not provided"}
                                          </p>
                                        </div>

                                        <div>
                                          <p className="text-xs text-slate-500">
                                            Country
                                          </p>

                                          <p className="mt-1 font-semibold text-slate-800">
                                            {order.country || "Not provided"}
                                          </p>
                                        </div>
                                      </div>

                                      {order.deliveryInstructions && (
                                        <div className="pt-1">
                                          <p className="text-xs text-slate-500">
                                            Delivery Instructions
                                          </p>

                                          <p className="mt-1 font-medium text-slate-700">
                                            {order.deliveryInstructions}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Payment */}
                                  <div className="mb-4 rounded-xl bg-violet-50 p-4">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-700">
                                      Payment
                                    </p>

                                    <div className="flex justify-between gap-3">
                                      <span className="text-sm text-slate-500">
                                        Method
                                      </span>

                                      <span className="text-sm font-semibold text-slate-800">
                                        {order.paymentMethod || "Not provided"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                      Order Items
                                    </p>

                                    <div className="space-y-3">
                                      {order.items.map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                                        >
                                          {item.product?.image ? (
                                            <img
                                              src={item.product.image}
                                              alt={item.product.name}
                                              className="h-12 w-12 rounded-lg object-cover"
                                            />
                                          ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
                                              📦
                                            </div>
                                          )}

                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                              {item.product?.name || "Product"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                              {item.quantity} × $
                                              {Number(item.price).toFixed(2)}
                                            </p>
                                          </div>

                                          <p className="text-sm font-bold">
                                            $
                                            {(
                                              Number(item.price) * item.quantity
                                            ).toFixed(2)}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Summary */}
                                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">
                                        Subtotal
                                      </span>

                                      <span>
                                        $
                                        {Number(order.subtotal || 0).toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between">
                                      <span className="text-slate-500">
                                        Shipping
                                      </span>

                                      <span>
                                        $
                                        {Number(order.shipping || 0).toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between">
                                      <span className="text-slate-500">
                                        Tax
                                      </span>

                                      <span>
                                        ${Number(order.tax || 0).toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between">
                                      <span className="text-slate-500">
                                        Discount
                                      </span>

                                      <span>
                                        -$
                                        {Number(order.discount || 0).toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between border-t border-slate-100 pt-3">
                                      <span className="font-semibold">
                                        Total
                                      </span>

                                      <span className="font-bold">
                                        ${Number(order.total || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / Tablet Cards */}
                <div className="space-y-4 p-4 lg:hidden">
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedId === order.id;

                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                              #{order.id}
                            </div>

                            <div>
                              <p className="font-bold">
                                {getCustomerName(order)}
                              </p>

                              <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                                {getCustomerEmail(order)}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusStyle(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-400">Total</p>

                            <p className="mt-1 font-bold">
                              ${Number(order.total).toFixed(2)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-400">Products</p>

                            <p className="mt-1 font-bold">
                              {order.items.length}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                          <select
                            value={order.status}
                            disabled={
                              updatingId === order.id ||
                              order.status === "DELIVERED" ||
                              order.status === "CANCELLED"
                            }
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                            className={`w-full rounded-xl border px-4 py-3 text-sm font-bold outline-none ${getStatusStyle(
                              order.status,
                            )}`}
                          >
                            {getAvailableStatuses(order.status).map(
                              (status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ),
                            )}
                          </select>

                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : order.id)
                            }
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {isExpanded
                              ? "Hide Order Details"
                              : "View Order Details"}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 border-t border-slate-100 pt-4">
                            {/* Customer */}
                            <div className="rounded-xl bg-blue-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                                Customer
                              </p>

                              <p className="mt-2 font-semibold">
                                {getCustomerName(order)}
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                {getCustomerEmail(order)}
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                {order.phone || "No phone number"}
                              </p>
                            </div>

                            {/* Delivery */}
                            <div className="mt-3 rounded-xl bg-emerald-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                Delivery
                              </p>

                              <p className="mt-2 text-sm font-semibold">
                                {order.address || "No address"}
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                {order.city || "No city"},{" "}
                                {order.country || "No country"}
                              </p>

                              {order.deliveryInstructions && (
                                <p className="mt-2 text-sm text-slate-600">
                                  <span className="font-semibold">
                                    Instructions:
                                  </span>{" "}
                                  {order.deliveryInstructions}
                                </p>
                              )}
                            </div>

                            {/* Payment */}
                            <div className="mt-3 rounded-xl bg-violet-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
                                Payment
                              </p>

                              <p className="mt-2 text-sm font-semibold">
                                {order.paymentMethod || "Not provided"}
                              </p>
                            </div>

                            {/* Items */}
                            <p className="mb-3 mt-4 text-sm font-bold">
                              Order Items
                            </p>

                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                                >
                                  {item.product?.image ? (
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="h-12 w-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
                                      📦
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">
                                      {item.product?.name || "Product"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>

                                  <p className="text-sm font-bold">
                                    $
                                    {(
                                      Number(item.price) * item.quantity
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-xs text-slate-400">Order date</p>

                            <p className="mt-1 text-xs font-medium text-slate-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div
                            className={`h-2.5 w-2.5 rounded-full ${getStatusDot(
                              order.status,
                            )}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
