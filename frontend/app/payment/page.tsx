"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Payment = {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  transactionId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Order = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  payment?: Payment | null;
};

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");

  const [payment, setPayment] = useState<Payment | null>(null);

  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order was selected.");
      setLoading(false);
      return;
    }

    loadPayment();
  }, [orderId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your payment.");
        return;
      }

      /*
       * Get payment for this order
       */
      const response = await fetch(
        `http://localhost:3001/payments/order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load payment.");
      }

      setPayment(data);

      /*
       * Load order information too
       */
      const orderResponse = await fetch(
        `http://localhost:3001/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const orderData = await orderResponse.json().catch(() => ({}));

      if (orderResponse.ok) {
        setOrder(orderData);
      }
    } catch (err: any) {
      setError(err?.message || "Unable to load payment information.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * DEVELOPMENT / TEST PAYMENT STATUS
   *
   * In a real payment system, the customer should
   * NOT directly mark a payment as PAID.
   *
   * This is only for testing the project.
   */
  const updatePaymentStatus = async (status: "PAID" | "FAILED") => {
    if (!payment) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `http://localhost:3001/payments/${payment.id}/status`,
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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update payment.");
      }

      setPayment(data);

      setSuccess(
        status === "PAID"
          ? "Payment marked as paid successfully."
          : "Payment marked as failed.",
      );

      await loadPayment();
    } catch (err: any) {
      setError(err?.message || "Unable to update payment.");
    } finally {
      setUpdating(false);
    }
  };

  /*
   * PAYMENT METHOD LABEL
   */
  const getPaymentMethod = (method?: string) => {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return "Cash on Delivery";

      case "TELEBIRR":
        return "Telebirr";

      case "CARD":
        return "Credit / Debit Card";

      default:
        return method || "Unknown";
    }
  };

  /*
   * PAYMENT ICON
   */
  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return "💵";

      case "TELEBIRR":
        return "📱";

      case "CARD":
        return "💳";

      default:
        return "💰";
    }
  };

  /*
   * STATUS INFORMATION
   */
  const getStatusInfo = (status?: Payment["status"]) => {
    switch (status) {
      case "PAID":
        return {
          label: "Paid",
          description: "Your payment has been successfully confirmed.",
          icon: "✓",
          className: "border-emerald-200 bg-emerald-50 text-emerald-700",
          iconClass: "bg-emerald-100 text-emerald-600",
        };

      case "FAILED":
        return {
          label: "Failed",
          description: "The payment could not be completed.",
          icon: "!",
          className: "border-red-200 bg-red-50 text-red-700",
          iconClass: "bg-red-100 text-red-600",
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          description: "This payment has been cancelled.",
          icon: "×",
          className: "border-slate-200 bg-slate-50 text-slate-600",
          iconClass: "bg-slate-200 text-slate-600",
        };

      default:
        return {
          label: "Pending",
          description: "Your payment is waiting for confirmation.",
          icon: "…",
          className: "border-amber-200 bg-amber-50 text-amber-700",
          iconClass: "bg-amber-100 text-amber-600",
        };
    }
  };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f9fc]">
        <header className="border-b border-sky-100 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              Shop
              <span className="text-blue-600">Ease</span>
            </Link>
          </div>
        </header>

        <div className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-blue-600" />

            <p className="mt-5 font-bold text-slate-600">Loading payment...</p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ERROR
   */
  if (error && !payment) {
    return (
      <main className="min-h-screen bg-[#f6f9fc]">
        <header className="border-b border-sky-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              Shop
              <span className="text-blue-600">Ease</span>
            </Link>

            <Link
              href="/orders"
              className="rounded-xl bg-sky-50 px-4 py-2 text-sm font-bold text-blue-700"
            >
              My Orders
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl text-red-600">
            !
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-900">
            Payment unavailable
          </h1>

          <p className="mt-3 text-slate-500">{error}</p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={loadPayment}
              className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-600"
            >
              Try Again
            </button>

            <Link
              href="/orders"
              className="rounded-xl border border-sky-200 bg-white px-6 py-3 font-bold text-blue-700 transition hover:bg-sky-50"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusInfo = getStatusInfo(payment?.status);

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-900">
      {/* HEADER */}
      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            Shop
            <span className="text-blue-600">Ease</span>
          </Link>

          <Link
            href="/orders"
            className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            ← My Orders
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-linear-to-br from-sky-100 via-blue-50 to-indigo-100">
        <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">
            Payment
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Payment details
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Review your payment information and current payment status.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            ✓ {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            ! {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* MAIN PAYMENT CARD */}
          <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
              <div className="bg-linear-to-br from-sky-500 via-blue-600 to-indigo-600 p-7 text-white sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-sm font-bold text-blue-100">
                      Payment amount
                    </p>

                    <p className="mt-2 text-4xl font-black sm:text-5xl">
                      ${Number(payment?.amount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                    {getPaymentIcon(payment?.method)}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* STATUS */}
                <div
                  className={`rounded-2xl border p-5 ${statusInfo.className}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${statusInfo.iconClass}`}
                    >
                      {statusInfo.icon}
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-wider opacity-70">
                        Payment status
                      </p>

                      <p className="mt-1 text-2xl font-black">
                        {statusInfo.label}
                      </p>

                      <p className="mt-1 text-sm">{statusInfo.description}</p>
                    </div>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-7">
                  <h2 className="text-lg font-black text-slate-900">
                    Payment information
                  </h2>

                  <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
                    <PaymentDetail
                      label="Payment ID"
                      value={`#${payment?.id || "-"}`}
                    />

                    <PaymentDetail
                      label="Order ID"
                      value={`#${payment?.orderId || orderId || "-"}`}
                    />

                    <PaymentDetail
                      label="Payment method"
                      value={getPaymentMethod(payment?.method)}
                    />

                    <PaymentDetail
                      label="Amount"
                      value={`$${Number(payment?.amount || 0).toFixed(2)}`}
                    />

                    <PaymentDetail
                      label="Transaction ID"
                      value={payment?.transactionId || "Not available"}
                    />

                    <PaymentDetail
                      label="Created"
                      value={
                        payment?.createdAt
                          ? new Date(payment.createdAt).toLocaleString()
                          : "Not available"
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* DEVELOPMENT TESTING */}
            {payment?.status === "PENDING" && (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-7">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
                    🧪
                  </div>

                  <div className="flex-1">
                    <h2 className="font-black text-slate-900">
                      Payment testing
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      These buttons are for development and testing only. A
                      production application should update payment status only
                      after verification from the payment provider.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => updatePaymentStatus("PAID")}
                        className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "✓ Mark as Paid"}
                      </button>

                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => updatePaymentStatus("FAILED")}
                        className="rounded-xl border border-red-200 bg-white px-5 py-3 font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark as Failed
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                Order
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-900">
                #{order?.id || orderId}
              </h2>

              {order && (
                <>
                  <div className="mt-6 space-y-4">
                    <PaymentDetail
                      label="Order total"
                      value={`$${Number(order.total || 0).toFixed(2)}`}
                    />

                    <PaymentDetail label="Order status" value={order.status} />

                    <PaymentDetail
                      label="Placed"
                      value={
                        order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "-"
                      }
                    />
                  </div>
                </>
              )}

              <div className="mt-6 rounded-2xl bg-sky-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                    {getPaymentIcon(payment?.method)}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400">Method</p>

                    <p className="font-black text-slate-800">
                      {getPaymentMethod(payment?.method)}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/orders"
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 font-black text-white transition hover:bg-indigo-600"
              >
                View My Orders
              </Link>

              <Link
                href="/products"
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-4 font-bold text-blue-700 transition hover:bg-sky-50"
              >
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-sky-100 bg-white py-8">
        <div className="mx-auto max-w-5xl px-5 text-center text-sm text-slate-400 lg:px-8">
          © {new Date().getFullYear()} ShopEase. Secure payment experience.
        </div>
      </footer>
    </main>
  );
}

/* =====================================================
   PAYMENT DETAIL
===================================================== */

function PaymentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 px-4 py-4">
      <span className="text-sm font-medium text-slate-500">{label}</span>

      <span className="text-right text-sm font-black text-slate-900">
        {value}
      </span>
    </div>
  );
}
