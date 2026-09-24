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
        return "bg-sky-50 text-sky-700 border-sky-200";

      case "SHIPPED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500";

      case "CONFIRMED":
        return "bg-sky-500";

      case "SHIPPED":
        return "bg-indigo-500";

      case "DELIVERED":
        return "bg-emerald-500";

      case "CANCELLED":
        return "bg-rose-500";

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

  const statusCards = [
    {
      label: "Pending",
      value: pendingCount,
      status: "PENDING",
      icon: "⏳",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      text: "text-amber-700",
    },
    {
      label: "Confirmed",
      value: confirmedCount,
      status: "CONFIRMED",
      icon: "✓",
      bg: "bg-sky-50",
      iconBg: "bg-sky-100",
      text: "text-sky-700",
    },
    {
      label: "Shipped",
      value: shippedCount,
      status: "SHIPPED",
      icon: "🚚",
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      text: "text-indigo-700",
    },
    {
      label: "Delivered",
      value: deliveredCount,
      status: "DELIVERED",
      icon: "✓",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      text: "text-emerald-700",
    },
    {
      label: "Cancelled",
      value: cancelledCount,
      status: "CANCELLED",
      icon: "×",
      bg: "bg-rose-50",
      iconBg: "bg-rose-100",
      text: "text-rose-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
        {/* Logo */}
        <div className="border-b border-slate-100 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-200">
              S
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                ShopHub
              </h1>

              <p className="text-xs font-medium text-slate-400">
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 p-4">
          <Link
            href="/admin"
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            <span className="text-lg">📊</span>
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 shadow-sm"
          >
            <span className="text-lg">📦</span>
            Orders
            {pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/products"
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            <span className="text-lg">🛍️</span>
            Products
          </Link>

          <Link
            href="/admin/users"
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            <span className="text-lg">👥</span>
            Customers
          </Link>

          <div className="my-5 border-t border-slate-100" />

          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="text-lg">🏠</span>
            View Store
          </Link>
        </nav>

        {/* Sidebar bottom */}
        <div className="absolute bottom-5 left-4 right-4">
          <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-violet-50 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
              <span className="text-xs font-bold text-slate-700">
                System Online
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Your store administration panel is running normally.
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-5 py-4 shadow-sm backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="text-indigo-600">Admin Panel</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400">Orders</span>
              </div>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                Order Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage customer orders, payments and delivery progress.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={`text-lg ${loading ? "animate-spin" : ""}`}>
                ↻
              </span>
              Refresh Orders
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {/* Page Intro */}
          <section className="mb-7 overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-r from-indigo-50 via-white to-violet-50 p-6 shadow-sm md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live Order Overview
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 md:text-2xl">
                  Keep your orders moving
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Monitor incoming orders, update delivery status and review
                  customer information from one place.
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white/80 px-6 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Orders
                </p>

                <p className="mt-1 text-3xl font-extrabold text-indigo-600">
                  {pendingCount + confirmedCount + shippedCount}
                </p>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
              <span className="text-lg">⚠️</span>

              <div className="flex-1">
                <p className="font-bold">Something went wrong</p>
                <p className="mt-1">{error}</p>
              </div>

              <button
                onClick={() => setError("")}
                className="rounded-lg px-2 py-1 text-rose-500 transition hover:bg-rose-100 hover:text-rose-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {/* Total Orders */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                  📦
                </div>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold text-indigo-600">
                  ORDERS
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Total Orders
              </p>

              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                {orders.length}
              </p>
            </div>

            {/* Revenue */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                  💰
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-600">
                  REVENUE
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Total Revenue
              </p>

              <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>

            {/* Pending */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                  ⏳
                </div>

                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-600">
                  PENDING
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">Waiting</p>

              <p className="mt-1 text-3xl font-extrabold text-amber-600">
                {pendingCount}
              </p>
            </div>

            {/* Shipped */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                  🚚
                </div>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold text-indigo-600">
                  SHIPPING
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">Shipped</p>

              <p className="mt-1 text-3xl font-extrabold text-indigo-600">
                {shippedCount}
              </p>
            </div>

            {/* Delivered */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                  ✓
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-600">
                  COMPLETED
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Delivered
              </p>

              <p className="mt-1 text-3xl font-extrabold text-emerald-600">
                {deliveredCount}
              </p>
            </div>
          </div>

          {/* Status Overview */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Order Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Click a status to filter the orders below.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                {orders.length} total orders
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {statusCards.map((item) => (
                <button
                  key={item.status}
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === item.status ? "ALL" : item.status,
                    )
                  }
                  className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${item.bg} ${
                    statusFilter === item.status
                      ? "border-indigo-300 ring-2 ring-indigo-100"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${item.iconBg} ${item.text}`}
                    >
                      {item.icon}
                    </div>

                    {statusFilter === item.status && (
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </div>

                  <p className={`mt-4 text-2xl font-extrabold ${item.text}`}>
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-600">
                    {item.label}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Orders Card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Card Header */}
            <div className="border-b border-slate-100 p-5 md:p-6">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      All Customer Orders
                    </h3>

                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                      {filteredOrders.length}
                    </span>
                  </div>

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
                    className="w-fit rounded-lg px-3 py-2 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 md:min-w-48"
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
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                  <p className="mt-5 font-bold text-slate-700">
                    Loading orders...
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Please wait while we fetch customer orders.
                  </p>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
                  📦
                </div>

                <h4 className="mt-5 text-lg font-extrabold text-slate-900">
                  {orders.length === 0 ? "No orders yet" : "No matching orders"}
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
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
                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
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
                    <thead className="border-b border-slate-100 bg-slate-50/80 text-left">
                      <tr>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Order
                        </th>

                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Products
                        </th>

                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Total
                        </th>

                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          Date
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">
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
                            className="transition hover:bg-indigo-50/30"
                          >
                            <td className="px-6 py-5 align-top">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                                  #
                                </div>

                                <div>
                                  <p className="font-extrabold text-slate-900">
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
                                  {getCustomerName(order)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-40 truncate font-bold text-slate-800">
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
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-xs font-bold text-white">
                                    +{order.items.length - 4}
                                  </div>
                                )}
                              </div>

                              <p className="mt-2 text-xs font-medium text-slate-500">
                                {order.items.length} product
                                {order.items.length !== 1 ? "s" : ""}
                              </p>
                            </td>

                            <td className="px-6 py-5 align-top">
                              <p className="font-extrabold text-slate-900">
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
                                className={`rounded-xl border px-3 py-2 text-xs font-extrabold outline-none transition ${getStatusStyle(
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
                                <p className="mt-2 text-xs font-bold text-indigo-600">
                                  Updating...
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-5 align-top">
                              <p className="text-sm font-bold text-slate-700">
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

                            <td className="relative px-6 py-5 text-right align-top">
                              <button
                                onClick={() =>
                                  setExpandedId(isExpanded ? null : order.id)
                                }
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                {isExpanded ? "Hide" : "View"}
                              </button>

                              {isExpanded && (
                                <div className="absolute right-8 z-20 mt-3 w-96 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-2xl">
                                  <div className="mb-4 flex items-center justify-between">
                                    <div>
                                      <p className="font-extrabold text-slate-900">
                                        Order #{order.id}
                                      </p>

                                      <p className="text-xs text-slate-400">
                                        Customer & delivery details
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => setExpandedId(null)}
                                      className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  {/* Customer */}
                                  <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                                    <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-indigo-700">
                                      Customer Information
                                    </p>

                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">
                                          Name
                                        </span>

                                        <span className="text-right font-bold text-slate-800">
                                          {getCustomerName(order)}
                                        </span>
                                      </div>

                                      <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">
                                          Email
                                        </span>

                                        <span className="max-w-52 truncate text-right font-bold text-slate-800">
                                          {getCustomerEmail(order)}
                                        </span>
                                      </div>

                                      <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">
                                          Phone
                                        </span>

                                        <span className="font-bold text-slate-800">
                                          {order.phone || "Not provided"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delivery */}
                                  <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                    <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                                      Delivery Information
                                    </p>

                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <p className="text-xs text-slate-500">
                                          Address
                                        </p>

                                        <p className="mt-1 font-bold text-slate-800">
                                          {order.address || "Not provided"}
                                        </p>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <p className="text-xs text-slate-500">
                                            City
                                          </p>

                                          <p className="mt-1 font-bold text-slate-800">
                                            {order.city || "Not provided"}
                                          </p>
                                        </div>

                                        <div>
                                          <p className="text-xs text-slate-500">
                                            Country
                                          </p>

                                          <p className="mt-1 font-bold text-slate-800">
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
                                  <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50 p-4">
                                    <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-violet-700">
                                      Payment
                                    </p>

                                    <div className="flex justify-between gap-3">
                                      <span className="text-sm text-slate-500">
                                        Method
                                      </span>

                                      <span className="text-sm font-bold text-slate-800">
                                        {order.paymentMethod || "Not provided"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Items */}
                                  <div>
                                    <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
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
                                            <p className="truncate text-sm font-bold">
                                              {item.product?.name || "Product"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                              {item.quantity} × $
                                              {Number(item.price).toFixed(2)}
                                            </p>
                                          </div>

                                          <p className="text-sm font-extrabold">
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
                                      <span className="text-rose-600">
                                        -$
                                        {Number(order.discount || 0).toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between border-t border-slate-100 pt-3">
                                      <span className="font-bold">Total</span>

                                      <span className="font-extrabold text-indigo-600">
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

                {/* Mobile / Tablet */}
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
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                              #{order.id}
                            </div>

                            <div>
                              <p className="font-extrabold text-slate-900">
                                {getCustomerName(order)}
                              </p>

                              <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                                {getCustomerEmail(order)}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${getStatusStyle(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs font-medium text-slate-400">
                              Total
                            </p>

                            <p className="mt-1 font-extrabold text-slate-900">
                              ${Number(order.total).toFixed(2)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs font-medium text-slate-400">
                              Products
                            </p>

                            <p className="mt-1 font-extrabold text-slate-900">
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
                            className={`w-full rounded-xl border px-4 py-3 text-sm font-extrabold outline-none ${getStatusStyle(
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
                            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            {isExpanded
                              ? "Hide Order Details"
                              : "View Order Details"}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 border-t border-slate-100 pt-4">
                            {/* Customer */}
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                              <p className="text-xs font-extrabold uppercase tracking-wide text-indigo-700">
                                Customer
                              </p>

                              <p className="mt-2 font-bold text-slate-900">
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
                            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                              <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                                Delivery
                              </p>

                              <p className="mt-2 text-sm font-bold text-slate-800">
                                {order.address || "No address"}
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                {order.city || "No city"},{" "}
                                {order.country || "No country"}
                              </p>

                              {order.deliveryInstructions && (
                                <p className="mt-2 text-sm text-slate-600">
                                  <span className="font-bold">
                                    Instructions:
                                  </span>{" "}
                                  {order.deliveryInstructions}
                                </p>
                              )}
                            </div>

                            {/* Payment */}
                            <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 p-4">
                              <p className="text-xs font-extrabold uppercase tracking-wide text-violet-700">
                                Payment
                              </p>

                              <p className="mt-2 text-sm font-bold text-slate-800">
                                {order.paymentMethod || "Not provided"}
                              </p>
                            </div>

                            {/* Items */}
                            <p className="mb-3 mt-4 text-sm font-extrabold text-slate-800">
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
                                    <p className="truncate text-sm font-bold">
                                      {item.product?.name || "Product"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>

                                  <p className="text-sm font-extrabold text-indigo-600">
                                    $
                                    {(
                                      Number(item.price) * item.quantity
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Mobile Summary */}
                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Subtotal</span>
                                <span>
                                  ${Number(order.subtotal || 0).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-slate-500">Shipping</span>
                                <span>
                                  ${Number(order.shipping || 0).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-slate-500">Tax</span>
                                <span>
                                  ${Number(order.tax || 0).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-slate-500">Discount</span>
                                <span className="text-rose-600">
                                  -$
                                  {Number(order.discount || 0).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex justify-between border-t border-slate-100 pt-3">
                                <span className="font-bold">Total</span>

                                <span className="font-extrabold text-indigo-600">
                                  ${Number(order.total || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              Order date
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${getStatusDot(
                                order.status,
                              )}`}
                            />

                            <span className="text-xs font-bold text-slate-500">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
