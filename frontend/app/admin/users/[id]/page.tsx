"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Order = {
  id: number;
  total: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  orders: Order[];
};

export default function AdminUserDetailsPage() {
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login as an admin.");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load user");
      }

      setUser(data);
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Unable to load user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const changeRole = async () => {
    if (!user) return;

    const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please login as an admin.");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/admin/users/${user.id}/role`,
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
        throw new Error(data.message || "Failed to change role");
      }

      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              role: data.role,
              updatedAt: data.updatedAt,
            }
          : null,
      );

      alert(`User role changed to ${newRole}.`);
    } catch (err) {
      console.error(err);

      alert(err instanceof Error ? err.message : "Failed to change role.");
    }
  };

  const deleteUser = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
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

      alert("User deleted successfully.");

      window.location.href = "/admin/users";
    } catch (err) {
      console.error(err);

      alert(err instanceof Error ? err.message : "Failed to delete user.");
    }
  };

  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "SHIPPED":
        return "bg-purple-100 text-purple-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const totalSpent =
    user?.orders.reduce((sum, order) => sum + Number(order.total), 0) ?? 0;

  const completedOrders =
    user?.orders.filter((order) => order.status === "DELIVERED").length ?? 0;

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
            className="mb-2 block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="mb-2 block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Orders
          </Link>

          <Link
            href="/admin/products"
            className="mb-2 block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Products
          </Link>

          <Link
            href="/admin/users"
            className="mb-2 block rounded-xl bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Customers
          </Link>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Store
          </p>

          <Link
            href="/"
            className="block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            View Store
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Customer Management
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                User Details
              </h2>
            </div>

            <Link
              href="/admin/users"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back to Customers
            </Link>
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {loading ? (
            <div className="flex min-h-96 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm text-slate-500">Loading user...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="text-4xl">⚠️</div>

              <h3 className="mt-4 font-bold text-red-800">
                Unable to load user
              </h3>

              <p className="mt-2 text-sm text-red-600">{error}</p>

              <button
                onClick={fetchUser}
                className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : user ? (
            <>
              {/* User profile */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {user.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>

                      <p className="mt-2 text-slate-500">{user.email}</p>

                      <p className="mt-1 text-sm text-slate-400">
                        User ID: #{user.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={changeRole}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      {user.role === "ADMIN" ? "Make Customer" : "Make Admin"}
                    </button>

                    <button
                      onClick={deleteUser}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Total Orders</p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {user.orders.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Completed Orders</p>

                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {completedOrders}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Total Spent</p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    ${totalSpent.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">Joined</p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Account information */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Account Information
                </h3>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Full Name
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {user.name}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {user.email}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Account Role
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {user.role}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Last Updated
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {new Date(user.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Order History
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Orders placed by this user.
                  </p>
                </div>

                {user.orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl">📦</div>

                    <h4 className="mt-4 font-semibold text-slate-900">
                      No orders yet
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      This user has not placed any orders.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left">
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Order
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Date
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Status
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {user.orders.map((order) => (
                          <tr
                            key={order.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-6 py-5">
                              <span className="font-bold text-slate-900">
                                #{order.id}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>

                            <td className="px-6 py-5 font-semibold text-slate-900">
                              ${Number(order.total).toFixed(2)}
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                                  order.status,
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-right">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                View Order
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
