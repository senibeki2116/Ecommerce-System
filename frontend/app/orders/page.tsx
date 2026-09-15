"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";

type OrderItem = {
  id?: string | number;
  productId?: string | number;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
  product?: {
    name?: string;
    image?: string;
    price?: number;
  };
};

type Order = {
  id?: string | number;
  _id?: string | number;

  total?: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;

  status?: string;
  createdAt?: string;
  updatedAt?: string;

  paymentMethod?: string;

  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };

  shippingAddress?: {
    address?: string;
    city?: string;
    country?: string;
  };

  items?: OrderItem[];
  orderItems?: OrderItem[];
};

type FilterType =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [cancellingId, setCancellingId] = useState<string | number | null>(
    null,
  );

  /* =========================
     FETCH ORDERS
  ========================= */

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          setError("Your login session has expired. Please login again.");
        } else {
          setError(
            data?.message || "Could not load your orders. Please try again.",
          );
        }

        return;
      }

      /*
        Support common NestJS response formats:
        [
          {...}
        ]

        or

        {
          orders: [...]
        }

        or

        {
          data: [...]
        }
      */
      const receivedOrders = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setOrders(receivedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);

      setError(
        "Could not connect to the server. Make sure your NestJS backend is running on port 3001.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================
     CANCEL ORDER
  ========================= */

  const cancelOrder = async (order: Order) => {
    const orderId = getOrderId(order);

    if (!orderId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(orderId);

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(
          data?.message || "Could not cancel the order. Please try again.",
        );
        return;
      }

      /*
        Update the order immediately instead of forcing
        the user to refresh the page.
      */
      setOrders((currentOrders) =>
        currentOrders.map((item) => {
          if (getOrderId(item) === orderId) {
            return {
              ...item,
              status: "CANCELLED",
            };
          }

          return item;
        }),
      );
    } catch (err) {
      console.error("Cancel order error:", err);
      setError("Could not connect to the server.");
    } finally {
      setCancellingId(null);
    }
  };

  /* =========================
     FILTER
  ========================= */

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") {
      return orders;
    }

    return orders.filter((order) => normalizeStatus(order.status) === filter);
  }, [orders, filter]);

  /* =========================
     STATS
  ========================= */

  const totalSpent = orders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0,
  );

  const deliveredCount = orders.filter(
    (order) => normalizeStatus(order.status) === "DELIVERED",
  ).length;

  const pendingCount = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "SHIPPED"].includes(normalizeStatus(order.status)),
  ).length;

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Navbar />

      {/* HERO */}

      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />

        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                My ShopEase
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                My Orders
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Track your purchases, review order details, and manage your
                recent orders in one place.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-900 shadow-xl transition hover:-translate-y-1 hover:bg-slate-100"
            >
              Continue Shopping
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 font-black text-red-600">
                !
              </div>

              <div className="flex-1">
                <p className="font-black text-red-900">Something went wrong</p>

                <p className="mt-1 text-sm leading-6 text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={fetchOrders}
                  className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATS */}

        {!loading && orders.length > 0 && (
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="📦"
              label="Total Orders"
              value={orders.length.toString()}
              description="All your purchases"
            />

            <StatCard
              icon="🚚"
              label="In Progress"
              value={pendingCount.toString()}
              description="Orders being processed"
            />

            <StatCard
              icon="✓"
              label="Delivered"
              value={deliveredCount.toString()}
              description="Successfully delivered"
            />

            <StatCard
              icon="💰"
              label="Total Spent"
              value={`$${totalSpent.toFixed(2)}`}
              description="Across all orders"
            />
          </section>
        )}

        {/* FILTER BAR */}

        {!loading && orders.length > 0 && (
          <div className="mb-7 overflow-x-auto">
            <div className="flex min-w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <FilterButton
                label="All Orders"
                active={filter === "ALL"}
                onClick={() => setFilter("ALL")}
              />

              <FilterButton
                label="Pending"
                active={filter === "PENDING"}
                onClick={() => setFilter("PENDING")}
              />

              <FilterButton
                label="Confirmed"
                active={filter === "CONFIRMED"}
                onClick={() => setFilter("CONFIRMED")}
              />

              <FilterButton
                label="Shipped"
                active={filter === "SHIPPED"}
                onClick={() => setFilter("SHIPPED")}
              />

              <FilterButton
                label="Delivered"
                active={filter === "DELIVERED"}
                onClick={() => setFilter("DELIVERED")}
              />

              <FilterButton
                label="Cancelled"
                active={filter === "CANCELLED"}
                onClick={() => setFilter("CANCELLED")}
              />
            </div>
          </div>
        )}

        {/* LOADING */}

        {loading && <OrdersSkeleton />}

        {/* EMPTY */}

        {!loading && !error && orders.length === 0 && <EmptyOrders />}

        {/* FILTER EMPTY */}

        {!loading && orders.length > 0 && filteredOrders.length === 0 && (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">
              🔍
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are no orders with the selected status.
            </p>

            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-black text-white transition hover:bg-black"
            >
              View All Orders
            </button>
          </div>
        )}

        {/* ORDERS */}

        {!loading && filteredOrders.length > 0 && (
          <section className="space-y-5">
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={getOrderId(order) || index}
                order={order}
                onCancel={cancelOrder}
                cancelling={cancellingId === getOrderId(order)}
              />
            ))}
          </section>
        )}
      </main>

      {/* FOOTER */}

      <footer className="mt-8 border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-2xl font-black text-slate-900">
            Shop<span className="text-indigo-500">Ease</span>
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Quality products. Great prices. Easy shopping.
          </p>

          <p className="mt-5 text-xs text-slate-400">
            © 2026 ShopEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =====================================================
   ORDER CARD
===================================================== */

function OrderCard({
  order,
  onCancel,
  cancelling,
}: {
  order: Order;
  onCancel: (order: Order) => void;
  cancelling: boolean;
}) {
  const orderId = getOrderId(order);
  const status = normalizeStatus(order.status);
  const items = getOrderItems(order);

  const canCancel = status === "PENDING" || status === "CONFIRMED";

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* ORDER HEADER */}

      <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
              📦
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black text-slate-900">
                  Order #{shortOrderId(orderId)}
                </h2>

                <StatusBadge status={status} />
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Placed {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left lg:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total
              </p>

              <p className="mt-1 text-xl font-black text-slate-900">
                ${getOrderTotal(order).toFixed(2)}
              </p>
            </div>

            {orderId && (
              <Link
                href={`/orders/${orderId}`}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                Details
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* PROGRESS */}

      {status !== "CANCELLED" && (
        <div className="px-5 pt-6 sm:px-7">
          <OrderProgress status={status} />
        </div>
      )}

      {/* PRODUCTS */}

      <div className="px-5 py-6 sm:px-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">
              Items
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {items.length} {items.length === 1 ? "product" : "products"}
            </p>
          </div>

          <div className="text-xs text-slate-400">
            {getTotalQuantity(items)} items
          </div>
        </div>

        <div className="space-y-3">
          {items.slice(0, 3).map((item, index) => (
            <OrderProduct
              key={`${item.productId || item.id || index}`}
              item={item}
            />
          ))}

          {items.length > 3 && (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-xs font-bold text-slate-500">
              + {items.length - 3} more products
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}

      <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoBox
            icon="💳"
            label="Payment"
            value={order.paymentMethod || "Payment selected"}
          />

          <InfoBox
            icon="📍"
            label="Delivery"
            value={getDeliveryLocation(order)}
          />

          <InfoBox
            icon="📅"
            label="Order date"
            value={formatShortDate(order.createdAt)}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(order)}
              disabled={cancelling}
              className="rounded-xl border border-red-200 px-5 py-3 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}

          {orderId && (
            <Link
              href={`/orders/${orderId}`}
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-xs font-black text-white transition hover:bg-black"
            >
              View Order Details →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/* =====================================================
   ORDER PRODUCT
===================================================== */

function OrderProduct({ item }: { item: OrderItem }) {
  const name = item.name || item.product?.name || "Product";

  const image = item.image || item.product?.image || "/file.svg";

  const price = Number(item.price ?? item.product?.price ?? 0);

  const quantity = Number(item.quantity ?? 1);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-slate-900">{name}</p>

        <p className="mt-1 text-xs text-slate-400">
          ${price.toFixed(2)} × {quantity}
        </p>
      </div>

      <p className="text-sm font-black text-slate-900">
        ${(price * quantity).toFixed(2)}
      </p>
    </div>
  );
}

/* =====================================================
   ORDER PROGRESS
===================================================== */

function OrderProgress({ status }: { status: string }) {
  const steps = [
    {
      key: "PENDING",
      label: "Placed",
      icon: "✓",
    },
    {
      key: "CONFIRMED",
      label: "Confirmed",
      icon: "✓",
    },
    {
      key: "SHIPPED",
      label: "Shipped",
      icon: "🚚",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      icon: "✓",
    },
  ];

  const statusOrder = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

  const currentIndex = statusOrder.indexOf(status);

  return (
    <div>
      <div className="relative flex justify-between">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200" />

        <div
          className="absolute left-0 top-5 h-0.5 bg-indigo-500 transition-all duration-500"
          style={{
            width:
              currentIndex <= 0
                ? "0%"
                : `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const active = index <= currentIndex;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-xs font-black shadow-sm ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step.icon}
              </div>

              <span
                className={`mt-2 text-[10px] font-black uppercase tracking-wider ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    SHIPPED: "bg-violet-50 text-violet-700 border-violet-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };

  const style = styles[status] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${style}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {icon}
        </div>

        <span className="text-2xl font-black text-slate-900">{value}</span>
      </div>

      <p className="mt-5 text-sm font-black text-slate-900">{label}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

/* =====================================================
   FILTER BUTTON
===================================================== */

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
        active
          ? "bg-slate-900 text-white shadow-md"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

/* =====================================================
   INFO BOX
===================================================== */

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY ORDERS
===================================================== */

function EmptyOrders() {
  return (
    <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-5xl">
        📦
      </div>

      <p className="mt-7 text-xs font-black uppercase tracking-[0.25em] text-indigo-500">
        Your orders
      </p>

      <h2 className="mt-3 text-3xl font-black text-slate-900">No orders yet</h2>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
        You haven't placed an order yet. Explore our products and find something
        you love.
      </p>

      <Link
        href="/products"
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 hover:bg-black"
      >
        Start Shopping
        <span className="text-lg">→</span>
      </Link>
    </div>
  );
}

/* =====================================================
   LOADING SKELETON
===================================================== */

function OrdersSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse overflow-hidden rounded-[28px] border border-slate-200 bg-white"
        >
          <div className="h-24 bg-slate-100" />

          <div className="space-y-4 p-7">
            <div className="h-4 w-32 rounded bg-slate-100" />

            <div className="h-16 rounded-2xl bg-slate-100" />

            <div className="h-16 rounded-2xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function getOrderId(order: Order) {
  return order.id ?? order._id ?? "";
}

function shortOrderId(id: string | number) {
  const value = String(id);

  if (value.length <= 10) {
    return value;
  }

  return value.slice(0, 8) + "...";
}

function normalizeStatus(status?: string) {
  return String(status || "PENDING").toUpperCase();
}

function getOrderTotal(order: Order) {
  return Number(order.total ?? order.subtotal ?? 0);
}

function getOrderItems(order: Order): OrderItem[] {
  if (Array.isArray(order.items)) {
    return order.items;
  }

  if (Array.isArray(order.orderItems)) {
    return order.orderItems;
  }

  return [];
}

function getTotalQuantity(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);
}

function getDeliveryLocation(order: Order) {
  const address = order.shippingAddress;

  if (!address) {
    return "Delivery address";
  }

  const parts = [address.city, address.country].filter(Boolean);

  return parts.length > 0
    ? parts.join(", ")
    : address.address || "Delivery address";
}

function formatDate(date?: string) {
  if (!date) {
    return "recently";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "recently";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date?: string) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
