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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);

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
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white lg:block">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-2xl font-bold">ShopHub</h1>
          <p className="mt-1 text-sm text-slate-400">Admin Panel</p>
        </div>

        <nav className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Management
          </p>

          <Link
            href="/admin"
            className="mb-2 flex items-center rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="mb-2 flex items-center rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Orders
          </Link>

          <Link
            href="/admin/products"
            className="mb-2 flex items-center rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Products
          </Link>

          <Link
            href="/admin/users"
            className="mb-2 flex items-center rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 shadow-sm"
          >
            Customers
          </Link>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Store
          </p>

          <Link
            href="/"
            className="flex items-center rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            View Store
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Administration
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Customers
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your store users and administrators.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Dashboard
              </Link>

              <button
                onClick={fetchUsers}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {/* Statistics */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {users.length}
              </p>
              <p className="mt-2 text-sm text-slate-500">Registered accounts</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Administrators
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {adminCount}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Users with admin access
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Customers</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {customerCount}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Regular store customers
              </p>
            </div>
          </div>

          {/* Users section */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    All Users
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {filteredUsers.length} user
                    {filteredUsers.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <div className="w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search name, email or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                  <p className="mt-4 text-sm text-slate-500">
                    Loading users...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="font-medium text-red-600">{error}</p>

                <button
                  onClick={fetchUsers}
                  className="mt-4 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl">👥</div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-250">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Role
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Joined
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User ID
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* User */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {user.name}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        {/* ID */}
                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600">
                            #{user.id}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            {/* View */}
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              View
                            </Link>

                            {/* Change Role */}
                            <button
                              onClick={() => changeRole(user.id, user.role)}
                              disabled={updatingRole === user.id}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingRole === user.id
                                ? "Updating..."
                                : user.role === "ADMIN"
                                  ? "Make Customer"
                                  : "Make Admin"}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deleteUser(user)}
                              disabled={deletingUser === user.id}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
