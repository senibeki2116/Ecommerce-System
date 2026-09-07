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

type User = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login as an admin.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [ordersResponse, usersResponse, productsResponse] =
        await Promise.all([
          fetch("http://localhost:3001/admin/orders", {
            headers,
          }),

          fetch("http://localhost:3001/admin/users", {
            headers,
          }),

          fetch("http://localhost:3001/products"),
        ]);

      if (!ordersResponse.ok) {
        throw new Error("Failed to load orders.");
      }

      if (!usersResponse.ok) {
        throw new Error("Failed to load users.");
      }

      if (!productsResponse.ok) {
        throw new Error("Failed to load products.");
      }

      const ordersData = await ordersResponse.json();
      const usersData = await usersResponse.json();
      const productsData = await productsResponse.json();

      setOrders(ordersData);
      setUsers(usersData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Could not load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =========================================================
  // REAL STATISTICS
  // =========================================================

  const totalOrders = orders.length;

  const totalCustomers = users.filter(
    (user) => user.role === "CUSTOMER",
  ).length;

  const totalProducts = products.length;

  const totalSales = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + Number(order.total), 0);

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "CONFIRMED",
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "SHIPPED",
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED",
  ).length;

  const inStockProducts = products.filter(
    (product) => product.stock > 0,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0,
  ).length;

  // =========================================================
  // REAL MONTHLY SALES
  // =========================================================

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlySales = monthNames.map((month, monthIndex) => {
    const sales = orders
      .filter((order) => {
        if (order.status === "CANCELLED") {
          return false;
        }

        const date = new Date(order.createdAt);

        return date.getMonth() === monthIndex;
      })
      .reduce((sum, order) => sum + Number(order.total), 0);

    return {
      month,
      sales,
    };
  });

  const maxMonthlySales = Math.max(
    ...monthlySales.map((item) => item.sales),
    1,
  );

  const bestSalesMonth = monthlySales.reduce(
    (best, current) => (current.sales > best.sales ? current : best),
    monthlySales[0],
  );

  // =========================================================
  // STATUS PERCENTAGE
  // =========================================================

  const getStatusPercentage = (count: number) => {
    if (totalOrders === 0) {
      return 0;
    }

    return Math.round((count / totalOrders) * 100);
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

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

  // =========================================================
  // RECENT ORDERS
  // =========================================================

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-5 text-sm font-medium text-slate-400">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 hidden h-screen w-72 bg-slate-950 text-white lg:block">
        <div className="border-b border-slate-800 px-7 py-7">
          <h1 className="text-2xl font-bold">ShopHub</h1>

          <p className="mt-1 text-sm text-slate-400">Admin Panel</p>
        </div>

        <nav className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Management
          </p>

          <Link
            href="/admin"
            className="mb-2 flex items-center rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 shadow-sm"
          >
            📊
            <span className="ml-3">Dashboard</span>
          </Link>

          <Link
            href="/admin/orders"
            className="mb-2 flex items-center rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            📦
            <span className="ml-3">Orders</span>
          </Link>

          <Link
            href="/admin/products"
            className="mb-2 flex items-center rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            🛍️
            <span className="ml-3">Products</span>
          </Link>

          <Link
            href="/admin/users"
            className="mb-2 flex items-center rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            👥
            <span className="ml-3">Customers</span>
          </Link>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Store
          </p>

          <Link
            href="/"
            className="flex items-center rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            🏠
            <span className="ml-3">View Store</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold">
              A
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Administrator</p>

              <p className="text-xs text-slate-500">Store Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="lg:ml-72">
        {/* HEADER */}

        <header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Administration
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Dashboard
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Welcome back. Here is what is happening in your store.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchDashboardData}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ↻ Refresh
              </button>

              <Link
                href="/"
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View Store
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              TOP STATISTICS
          ================================================= */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* REVENUE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Revenue
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    ${totalSales.toFixed(2)}
                  </p>

                  <p className="mt-2 text-sm text-emerald-600">
                    Excluding cancelled orders
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                  💰
                </div>
              </div>
            </div>

            {/* ORDERS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Orders
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {totalOrders}
                  </p>

                  <p className="mt-2 text-sm text-blue-600">All orders</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  📦
                </div>
              </div>
            </div>

            {/* CUSTOMERS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Customers
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {totalCustomers}
                  </p>

                  <p className="mt-2 text-sm text-purple-600">
                    Registered customers
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                  👥
                </div>
              </div>
            </div>

            {/* PRODUCTS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Products
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {totalProducts}
                  </p>

                  <p className="mt-2 text-sm text-amber-600">
                    {inStockProducts} currently in stock
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">
                  🛍️
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              ORDER STATUS CARDS
          ================================================= */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pending</p>

              <p className="mt-2 text-2xl font-bold text-amber-600">
                {pendingOrders}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Confirmed</p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {confirmedOrders}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Shipped</p>

              <p className="mt-2 text-2xl font-bold text-purple-600">
                {shippedOrders}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Delivered</p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {deliveredOrders}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Cancelled</p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {cancelledOrders}
              </p>
            </div>
          </div>

          {/* =================================================
              MIDDLE SECTION
          ================================================= */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {/* REAL SALES OVERVIEW */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Sales Overview
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Real sales from your orders
                  </p>
                </div>

                <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  ${totalSales.toFixed(2)} total
                </span>
              </div>

              {/* BEST MONTH */}

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Best Sales Month
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {bestSalesMonth.month}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Sales</p>

                    <p className="text-lg font-bold text-emerald-600">
                      ${bestSalesMonth.sales.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* CHART */}

              <div className="mt-8 flex h-64 items-end gap-2">
                {monthlySales.map((item) => {
                  const height =
                    item.sales === 0
                      ? 3
                      : Math.max((item.sales / maxMonthlySales) * 100, 8);

                  return (
                    <div
                      key={item.month}
                      className="group flex h-full flex-1 flex-col justify-end"
                    >
                      {/* SALES VALUE */}

                      {item.sales > 0 && (
                        <div className="mb-2 text-center text-[10px] font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100">
                          ${item.sales.toFixed(0)}
                        </div>
                      )}

                      {/* BAR */}

                      <div
                        className={`w-full rounded-t-lg transition ${
                          item.sales > 0
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-slate-100"
                        }`}
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* MONTH LABELS */}

              <div className="mt-4 grid grid-cols-12 text-center text-xs text-slate-400">
                {monthNames.map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>

            {/* ORDER STATUS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Order Status</h3>

              <p className="mt-1 text-sm text-slate-500">
                Current order distribution
              </p>

              <div className="mt-8 space-y-6">
                {/* PENDING */}

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Pending</span>

                    <span className="font-semibold text-slate-900">
                      {pendingOrders} ({getStatusPercentage(pendingOrders)}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${getStatusPercentage(pendingOrders)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* CONFIRMED */}

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Confirmed
                    </span>

                    <span className="font-semibold text-slate-900">
                      {confirmedOrders} ({getStatusPercentage(confirmedOrders)}
                      %)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${getStatusPercentage(confirmedOrders)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* SHIPPED */}

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Shipped</span>

                    <span className="font-semibold text-slate-900">
                      {shippedOrders} ({getStatusPercentage(shippedOrders)}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{
                        width: `${getStatusPercentage(shippedOrders)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* DELIVERED */}

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Delivered
                    </span>

                    <span className="font-semibold text-slate-900">
                      {deliveredOrders} ({getStatusPercentage(deliveredOrders)}
                      %)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${getStatusPercentage(deliveredOrders)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* CANCELLED */}

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Cancelled
                    </span>

                    <span className="font-semibold text-slate-900">
                      {cancelledOrders} ({getStatusPercentage(cancelledOrders)}
                      %)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{
                        width: `${getStatusPercentage(cancelledOrders)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              QUICK STORE STATUS
          ================================================= */}

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Customers</p>

                  <p className="mt-2 text-2xl font-bold">{totalCustomers}</p>
                </div>

                <div className="text-3xl">👥</div>
              </div>

              <Link
                href="/admin/users"
                className="mt-5 block text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage customers →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Products</p>

                  <p className="mt-2 text-2xl font-bold">{totalProducts}</p>
                </div>

                <div className="text-3xl">🛍️</div>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {inStockProducts} in stock · {outOfStockProducts} out of stock
              </p>

              <Link
                href="/admin/products"
                className="mt-5 block text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage products →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Orders</p>

                  <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
                </div>

                <div className="text-3xl">📦</div>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {pendingOrders} waiting for processing
              </p>

              <Link
                href="/admin/orders"
                className="mt-5 block text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage orders →
              </Link>
            </div>
          </div>

          {/* =================================================
              RECENT ORDERS
          ================================================= */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Orders
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Latest orders from your store
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all orders →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-4xl">📦</div>

                <p className="mt-3 font-semibold text-slate-900">
                  No orders yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Orders will appear here when customers place them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Order
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-semibold text-blue-600 hover:text-blue-700"
                          >
                            #{order.id}
                          </Link>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                              {order.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>

                            <div>
                              <p className="font-medium text-slate-900">
                                {order.user?.name || "Unknown"}
                              </p>

                              <p className="text-xs text-slate-500">
                                {order.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-5 font-semibold text-slate-900">
                          ${Number(order.total).toFixed(2)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
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

          {/* FOOTER */}

          <div className="mt-8 pb-4 text-center text-sm text-slate-400">
            ShopHub Admin Dashboard
          </div>
        </div>
      </main>
    </div>
  );
}
