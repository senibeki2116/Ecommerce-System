"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = "http://localhost:3001";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

type PaymentMethod = "CASH_ON_DELIVERY" | "TELEBIRR" | "CARD";

type Payment = {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;

  order?: {
    id: number;
    total: number;
    status: string;
    createdAt: string;

    user?: {
      id: number;
      name: string;
      email: string;
    };

    items?: {
      id: number;
      quantity: number;
      price: number;
      product?: {
        name: string;
      };
    }[];
  };
};

const statusStyles: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
};

const methodLabels: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: "Cash on Delivery",
  TELEBIRR: "Telebirr",
  CARD: "Credit / Debit Card",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentStatus>(
    "ALL",
  );
  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>(
    "ALL",
  );
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH PAYMENTS
  // =========================================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/payments/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load payments (${response.status})`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setPayments(data);
      } else if (Array.isArray(data.payments)) {
        setPayments(data.payments);
      } else if (Array.isArray(data.data)) {
        setPayments(data.data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredPayments = useMemo(() => {
    const term = search.toLowerCase().trim();

    return payments.filter((payment) => {
      const matchesSearch =
        !term ||
        payment.id.toString().includes(term) ||
        payment.orderId.toString().includes(term) ||
        payment.order?.user?.name?.toLowerCase().includes(term) ||
        payment.order?.user?.email?.toLowerCase().includes(term) ||
        payment.transactionId?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL" || payment.status === statusFilter;

      const matchesMethod =
        methodFilter === "ALL" || payment.method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

    const paid = payments
      .filter((payment) => payment.status === "PAID")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pending = payments.filter((payment) => payment.status === "PENDING");

    const failed = payments.filter((payment) => payment.status === "FAILED");

    return {
      total,
      paid,
      pending: pending.length,
      failed: failed.length,
    };
  }, [payments]);

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updatePaymentStatus = async (
    paymentId: number,
    status: PaymentStatus,
  ) => {
    try {
      setUpdating(true);

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/payments/admin/${paymentId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update payment");
      }

      setPayments((current) =>
        current.map((payment) =>
          payment.id === paymentId
            ? {
                ...payment,
                status,
              }
            : payment,
        ),
      );

      setSelectedPayment((current) =>
        current && current.id === paymentId
          ? {
              ...current,
              status,
            }
          : current,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // FORMAT
  // =========================================================

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-350">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-350 items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Link href="/admin">Admin</Link>

              <span className="text-slate-300">/</span>

              <span>Payments</span>
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Payment Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage transactions, payment status, and customer payments.
            </p>
          </div>

          <button
            onClick={fetchPayments}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 lg:px-8">
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* OVERVIEW */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Payment Overview
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Keep track of every transaction
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Review customer payments, check transaction status, and manage
                payment issues from one place.
              </p>
            </div>

            <div className="rounded-2xl border border-white bg-white/80 px-6 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Transactions
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {payments.length}
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Value</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(stats.total)}
            </p>

            <p className="mt-1 text-xs text-slate-400">All payment records</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Paid</p>

            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {formatCurrency(stats.paid)}
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              Successfully completed
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">Pending</p>

            <p className="mt-2 text-2xl font-bold text-amber-800">
              {stats.pending}
            </p>

            <p className="mt-1 text-xs text-amber-600">Awaiting payment</p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5 shadow-sm">
            <p className="text-sm font-medium text-rose-700">Failed</p>

            <p className="mt-2 text-2xl font-bold text-rose-800">
              {stats.failed}
            </p>

            <p className="mt-1 text-xs text-rose-600">Requires attention</p>
          </div>
        </section>

        {/* FILTERS */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_220px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payment, order, customer..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | PaymentStatus)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) =>
                setMethodFilter(e.target.value as "ALL" | PaymentMethod)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
              <option value="TELEBIRR">Telebirr</option>
              <option value="CARD">Card</option>
            </select>
          </div>
        </section>

        {/* DESKTOP TABLE */}

        <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Method
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-5">
                      <div className="font-bold text-slate-900">
                        PAY-{payment.id}
                      </div>

                      <Link
                        href={`/admin/orders?id=${payment.orderId}`}
                        className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Order #{payment.orderId}
                      </Link>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-semibold text-slate-900">
                        {payment.order?.user?.name || "Unknown Customer"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {payment.order?.user?.email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-sm font-medium text-slate-700">
                      {methodLabels[payment.method]}
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-bold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(payment.createdAt)}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyles[payment.status]}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-right">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">💳</div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No payments found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </section>

        {/* MOBILE CARDS */}

        <section className="space-y-4 lg:hidden">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900">PAY-{payment.id}</p>

                  <p className="mt-1 text-sm text-indigo-600">
                    Order #{payment.orderId}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[payment.status]}`}
                >
                  {payment.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-400">Customer</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {payment.order?.user?.name || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Amount</p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Method</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {methodLabels[payment.method]}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Date</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(payment)}
                className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Manage Payment
              </button>
            </div>
          ))}

          {filteredPayments.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <div className="text-4xl">💳</div>

              <h3 className="mt-4 font-bold text-slate-900">
                No payments found
              </h3>
            </div>
          )}
        </section>
      </main>

      {/* PAYMENT MODAL */}

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">
                    Payment Details
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    PAY-{selectedPayment.id}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MODAL CONTENT */}

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">Order</p>

                  <p className="mt-1 font-bold text-slate-900">
                    #{selectedPayment.orderId}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">Amount</p>

                  <p className="mt-1 font-bold text-slate-900">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Customer
                </p>

                <p className="mt-2 font-bold text-slate-900">
                  {selectedPayment.order?.user?.name || "Unknown Customer"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedPayment.order?.user?.email || "No email"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Payment Method</p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {methodLabels[selectedPayment.method]}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Transaction ID</p>

                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {selectedPayment.transactionId || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Created</p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(selectedPayment.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Current Status</p>

                  <span
                    className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[selectedPayment.status]}`}
                  >
                    {selectedPayment.status}
                  </span>
                </div>
              </div>

              {/* STATUS ACTIONS */}

              <div className="border-t border-slate-100 pt-5">
                <p className="mb-3 text-sm font-bold text-slate-900">
                  Update Payment Status
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    disabled={updating || selectedPayment.status === "PAID"}
                    onClick={() =>
                      updatePaymentStatus(selectedPayment.id, "PAID")
                    }
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ✓ Mark Paid
                  </button>

                  <button
                    disabled={updating || selectedPayment.status === "FAILED"}
                    onClick={() =>
                      updatePaymentStatus(selectedPayment.id, "FAILED")
                    }
                    className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ✕ Failed
                  </button>

                  <button
                    disabled={
                      updating || selectedPayment.status === "CANCELLED"
                    }
                    onClick={() =>
                      updatePaymentStatus(selectedPayment.id, "CANCELLED")
                    }
                    className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
