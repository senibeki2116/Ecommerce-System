"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

function Icon({
  name,
  size = 20,
}: {
  name:
    | "dashboard"
    | "orders"
    | "products"
    | "users"
    | "store"
    | "search"
    | "refresh"
    | "shield"
    | "customer"
    | "user"
    | "calendar"
    | "eye"
    | "edit"
    | "trash"
    | "menu"
    | "close";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <path d="M6 3h12v18H6z" />
          <path d="M9 7h6M9 11h6M9 15h4" />
        </svg>
      );

    case "products":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "store":
      return (
        <svg {...common}>
          <path d="M3 10h18" />
          <path d="M5 10v10h14V10" />
          <path d="M4 10 6 4h12l2 6" />
          <path d="M8 20v-5h8v5" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8.1 8.1 0 0 0-14.8-4L3 10" />
          <path d="M3 4v6h6" />
          <path d="M4 13a8.1 8.1 0 0 0 14.8 4L21 14" />
          <path d="M21 20v-6h-6" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "customer":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login as an admin.");
        return;
      }

      const response = await fetch("http://localhost:3001/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value),
    );
  }, [users, search]);

  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  const customerCount = users.filter((user) => user.role === "CUSTOMER").length;

  const changeRole = async (
    userId: number,
    currentRole: "CUSTOMER" | "ADMIN",
  ) => {
    const newRole = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN";

    const confirmed = window.confirm(
      `Are you sure you want to change this user to ${newRole}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingRole(userId);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please login as an admin.");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change user role");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: data.role,
                updatedAt: data.updatedAt,
              }
            : user,
        ),
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to change user role.");
    } finally {
      setUpdatingRole(null);
    }
  };

  const deleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUser(user.id);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please login as an admin.");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/admin/users/${user.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );

      alert("User deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Icon name="store" size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                ShopHub
              </h1>
              <p className="text-xs font-medium text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="dashboard" size={19} />
              Dashboard
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="orders" size={19} />
              Orders
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="products" size={19} />
              Products
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700"
            >
              <Icon name="users" size={19} />
              Customers
            </Link>
          </nav>

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Store
          </p>

          <nav>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="store" size={19} />
              View Store
            </Link>
          </nav>
        </div>

        {/* Bottom Admin Card */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                Administrator
              </p>
              <p className="text-xs text-slate-400">Store management</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Icon name="store" size={18} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">ShopHub</p>
            <p className="text-[10px] text-slate-400">Admin Panel</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600"
        >
          <Icon name={mobileMenuOpen ? "close" : "menu"} size={20} />
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-20 border-b border-slate-200 bg-white p-4 shadow-lg lg:hidden">
          <nav className="space-y-1">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Icon name="dashboard" size={18} />
              Dashboard
            </Link>

            <Link
              href="/admin/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Icon name="orders" size={18} />
              Orders
            </Link>

            <Link
              href="/admin/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Icon name="products" size={18} />
              Products
            </Link>

            <Link
              href="/admin/users"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
            >
              <Icon name="users" size={18} />
              Customers
            </Link>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Icon name="store" size={18} />
              View Store
            </Link>
          </nav>
        </div>
      )}

      {/* Main */}
      <main className="lg:ml-64">
        {/* Page Header */}
        <div className="border-b border-slate-200 bg-white">
          <div className="px-4 py-6 sm:px-6 lg:px-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
                  <Icon name="users" size={15} />
                  USER MANAGEMENT
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Customers
                </h2>

                <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                  Manage customer accounts, administrator access, and user
                  activity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Dashboard
                </Link>

                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name="refresh" size={17} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-10">
          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Total */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Users
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {users.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="users" size={22} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">
                  Accounts
                </span>
                Registered on your store
              </div>
            </div>

            {/* Admin */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Administrators
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {adminCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon name="shield" size={22} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-violet-50 px-2 py-1 font-medium text-violet-600">
                  Admin
                </span>
                Elevated access
              </div>
            </div>

            {/* Customers */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 xl:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Customers
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {customerCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="customer" size={22} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-600">
                  Customer
                </span>
                Regular store users
              </div>
            </div>
          </div>

          {/* Main Users Card */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Toolbar */}
            <div className="border-b border-slate-200 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      All Users
                    </h3>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {filteredUsers.length}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Search and manage registered accounts.
                  </p>
                </div>

                <div className="relative w-full lg:w-96">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Icon name="search" size={18} />
                  </div>

                  <input
                    type="text"
                    placeholder="Search by name, email or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex min-h-80 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="mt-4 text-sm font-medium text-slate-600">
                    Loading users...
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Please wait a moment
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-80 items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
                    !
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    Unable to load users
                  </h3>

                  <p className="mt-1 text-sm text-red-600">{error}</p>

                  <button
                    onClick={fetchUsers}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Icon name="refresh" size={16} />
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex min-h-80 items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon name="users" size={30} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    No users found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {search
                      ? "Try using a different search term."
                      : "There are no registered users yet."}
                  </p>

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          User
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Role
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Joined
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          User ID
                        </th>

                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          {/* User */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                                {user.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {user.name}
                                </p>

                                <p className="mt-0.5 truncate text-sm text-slate-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-5">
                            {user.role === "ADMIN" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                                <Icon name="shield" size={13} />
                                Administrator
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                                <Icon name="customer" size={13} />
                                Customer
                              </span>
                            )}
                          </td>

                          {/* Joined */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Icon name="calendar" size={15} />

                              {new Date(user.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </div>
                          </td>

                          {/* ID */}
                          <td className="px-6 py-5">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              #{user.id}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                              >
                                <Icon name="eye" size={14} />
                                View
                              </Link>

                              <button
                                onClick={() => changeRole(user.id, user.role)}
                                disabled={updatingRole === user.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Icon name="edit" size={14} />

                                {updatingRole === user.id
                                  ? "Updating..."
                                  : user.role === "ADMIN"
                                    ? "Customer"
                                    : "Admin"}
                              </button>

                              <button
                                onClick={() => deleteUser(user)}
                                disabled={deletingUser === user.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Icon name="trash" size={14} />

                                {deletingUser === user.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / Tablet Cards */}
                <div className="divide-y divide-slate-100 lg:hidden">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                            {user.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {user.name}
                            </p>

                            <p className="truncate text-sm text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {user.role === "ADMIN" ? (
                          <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                            ADMIN
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                            CUSTOMER
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Joined
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {new Date(user.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            User ID
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            #{user.id}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-xs font-semibold text-slate-700 shadow-sm"
                        >
                          <Icon name="eye" size={14} />
                          View
                        </Link>

                        <button
                          onClick={() => changeRole(user.id, user.role)}
                          disabled={updatingRole === user.id}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2.5 text-xs font-semibold text-blue-700 disabled:opacity-50"
                        >
                          <Icon name="edit" size={14} />

                          {updatingRole === user.id
                            ? "..."
                            : user.role === "ADMIN"
                              ? "Customer"
                              : "Admin"}
                        </button>

                        <button
                          onClick={() => deleteUser(user)}
                          disabled={deletingUser === user.id}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-2.5 text-xs font-semibold text-red-600 disabled:opacity-50"
                        >
                          <Icon name="trash" size={14} />

                          {deletingUser === user.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Footer */}
            {!loading && !error && filteredUsers.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:px-6">
                <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing{" "}
                    <strong className="text-slate-700">
                      {filteredUsers.length}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-slate-700">{users.length}</strong>{" "}
                    users
                  </span>

                  {search && (
                    <span>
                      Filtered by{" "}
                      <strong className="text-slate-700">"{search}"</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
