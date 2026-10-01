"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

type Payment = {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: PaymentStatus;
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

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

async function getResponseData(response: Response) {
  return response.json().catch(() => ({}));
}

function PaymentPageContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD PAYMENT + ORDER
  // =========================================================
  const loadPayment = useCallback(async () => {
    if (!orderId) {
      setError("No order was selected.");
      setLoading(false);
      return;
    }

    const numericOrderId = Number(orderId);

    if (!Number.isInteger(numericOrderId) || numericOrderId <= 0) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        setError("Please login to view your payment.");
        return;
      }

      // -------------------------------------------------------
      // LOAD PAYMENT
      // -------------------------------------------------------
      const paymentResponse = await fetch(
        `${API_URL}/payments/order/${numericOrderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const paymentData = await getResponseData(paymentResponse);

      if (paymentResponse.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }

      if (paymentResponse.status === 403) {
        throw new Error("You do not have permission to view this payment.");
      }

      if (paymentResponse.status === 404) {
        throw new Error(
          paymentData?.message || "Payment was not found for this order.",
        );
      }

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData?.message || "Unable to load payment information.",
        );
      }

      // -------------------------------------------------------
      // VERIFY PAYMENT RESPONSE
      // -------------------------------------------------------
      if (!paymentData || !paymentData.id) {
        throw new Error("The server returned an invalid payment response.");
      }

      setPayment(paymentData);

      // -------------------------------------------------------
      // LOAD ORDER
      // -------------------------------------------------------
      const orderResponse = await fetch(`${API_URL}/orders/${numericOrderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const orderData = await getResponseData(orderResponse);

      if (orderResponse.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }

      if (orderResponse.ok && orderData?.id) {
        setOrder(orderData);
      } else {
        // Payment can still be displayed even if the
        // additional order request fails.
        setOrder(null);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load payment information.";

      setError(message);
      setPayment(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  // =========================================================
  // UPDATE PAYMENT STATUS
  // =========================================================
  const updatePaymentStatus = async (status: "PAID" | "FAILED") => {
    if (!payment) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/payments/${payment.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await getResponseData(response);

      if (response.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }

      if (response.status === 403) {
        throw new Error("You do not have permission to update this payment.");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update payment status.");
      }

      setPayment(data);

      if (status === "PAID") {
        setSuccess(
          "Payment marked as paid successfully. Your order is now confirmed.",
        );
      } else {
        setSuccess("Payment marked as failed.");
      }

      // Reload payment and order so the order status
      // is also immediately updated on the page.
      await loadPayment();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to update payment.";

      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // PAYMENT METHOD
  // =========================================================
  const getPaymentMethod = (method?: string) => {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return "Cash on Delivery";

      case "TELEBIRR":
        return "Telebirr";

      case "CARD":
        return "Credit / Debit Card";

      case "Cash on Delivery":
        return "Cash on Delivery";

      case "Telebirr":
        return "Telebirr";

      case "Credit / Debit Card":
        return "Credit / Debit Card";

      default:
        return method || "Unknown";
    }
  };

  // =========================================================
  // PAYMENT ICON
  // =========================================================
  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case "CASH_ON_DELIVERY":
      case "Cash on Delivery":
        return "💵";

      case "TELEBIRR":
      case "Telebirr":
        return "📱";

      case "CARD":
      case "Credit / Debit Card":
        return "💳";

      default:
        return "💰";
    }
  };

  // =========================================================
  // PAYMENT STATUS
  // =========================================================
  const getStatusInfo = (status?: PaymentStatus) => {
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

      case "PENDING":
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

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return <PaymentLoading />;
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error && !payment) {
    return (
      <main className="min-h-screen bg-[#f6f9fc]">
        <header className="border-b border-sky-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              Shop<span className="text-blue-600">Ease</span>
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
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl font-black text-red-600">
            !
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-900">
            Payment unavailable
          </h1>

          <p className="mt-3 text-slate-500">{error}</p>

          <p className="mt-3 text-xs text-slate-400">
            Order ID: {orderId || "Not provided"}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
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

  // =========================================================
  // PAYMENT PAGE
  // =========================================================
  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-900">
      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            Shop<span className="text-blue-600">Ease</span>
          </Link>

          <Link
            href="/orders"
            className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            ← My Orders
          </Link>
        </div>
      </header>

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
        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            ! {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* PAYMENT CARD */}
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

                {/* PAYMENT INFORMATION */}
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

            {/* DEVELOPMENT PAYMENT TESTING */}
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

      <footer className="border-t border-sky-100 bg-white py-8">
        <div className="mx-auto max-w-5xl px-5 text-center text-sm text-slate-400 lg:px-8">
          © {new Date().getFullYear()} ShopEase. Secure payment experience.
        </div>
      </footer>
    </main>
  );
}

// =========================================================
// PAYMENT DETAIL COMPONENT
// =========================================================
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

// =========================================================
// LOADING COMPONENT
// =========================================================
function PaymentLoading() {
  return (
    <main className="min-h-screen bg-[#f6f9fc]">
      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            Shop<span className="text-blue-600">Ease</span>
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

// =========================================================
// MAIN PAGE
// =========================================================
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentPageContent />
    </Suspense>
  );
}
