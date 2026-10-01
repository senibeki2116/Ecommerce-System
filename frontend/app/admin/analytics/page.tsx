"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* =========================================================
   TYPES
========================================================= */

type Order = {
  id: number;
  total: number | string;
  status: string;
  createdAt: string;
  user?: {
    id?: number;
    name: string;
    email: string;
  };
  payment?: Payment | null;
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
  description?: string;
  price: number | string;
  stock: number;
  image?: string | null;
};

type Payment = {
  id: number;
  amount?: number | string | null;
  total?: number | string | null;
  status: string;
  method?: string | null;
  paymentMethod?: string | null;
  type?: string | null;
  provider?: string | null;
  createdAt: string;
  order?: {
    id: number;
    total?: number | string | null;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
};

type Period = "7D" | "30D" | "6M" | "1Y";

type ChartPoint = {
  label: string;
  value: number;
};

type SearchResult = {
  type: string;
  name: string;
  detail: string;
  href: string;
};

type IconName =
  | "grid"
  | "bag"
  | "box"
  | "users"
  | "tag"
  | "store"
  | "refresh"
  | "arrow"
  | "trend"
  | "chart"
  | "bell"
  | "search"
  | "clock"
  | "check"
  | "truck"
  | "x"
  | "menu"
  | "calendar"
  | "download"
  | "dollar"
  | "activity"
  | "credit"
  | "wallet"
  | "alert";

/* =========================================================
   ICON
========================================================= */

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
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
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "bag":
      return (
        <svg {...common}>
          <path d="M6 8h12l1 13H5L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );

    case "box":
      return (
        <svg {...common}>
          <path d="m21 8-9-5-9 5 9 5 9-5Z" />
          <path d="M3 8v8l9 5 9-5V8" />
          <path d="M12 13v8" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "tag":
      return (
        <svg {...common}>
          <path d="M20.59 13.41 13.4 20.6a2 2 0 0 1-2.82 0L3.4 13.4a2 2 0 0 1 0-2.82l7.18-7.18A2 2 0 0 1 12 2.82H20v8a2 2 0 0 1 .59 1.41Z" />
          <circle cx="16.5" cy="7.5" r="1" />
        </svg>
      );

    case "store":
      return (
        <svg {...common}>
          <path d="M3 9h18" />
          <path d="M5 9v12h14V9" />
          <path d="M3 9 5 3h14l2 6" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8.1 8.1 0 0 0-14.9-4L3 10" />
          <path d="M3 4v6h6" />
          <path d="M4 13a8.1 8.1 0 0 0 14.9 4L21 14" />
          <path d="M21 20v-6h-6" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "trend":
      return (
        <svg {...common}>
          <path d="m3 17 6-6 4 4 7-8" />
          <path d="M14 7h6v6" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <rect x="7" y="12" width="3" height="5" rx=".5" />
          <rect x="12" y="9" width="3" height="8" rx=".5" />
          <rect x="17" y="6" width="3" height="11" rx=".5" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "truck":
      return (
        <svg {...common}>
          <path d="M3 6h11v10H3z" />
          <path d="M14 9h4l3 3v4h-7V9Z" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      );

    case "x":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );

    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );

    case "dollar":
      return (
        <svg {...common}>
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
        </svg>
      );

    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>
      );

    case "credit":
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <path d="M6 15h4" />
        </svg>
      );

    case "wallet":
      return (
        <svg {...common}>
          <path d="M4 5h15a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z" />
          <path d="M17 13h4" />
          <circle cx="17" cy="13" r=".5" />
        </svg>
      );

    case "alert":
      return (
        <svg {...common}>
          <path d="M10.3 3.8 2.5 17.5A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.5L13.7 3.8a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   HELPERS
========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const getNumber = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getPaymentAmount = (payment: Payment): number =>
  getNumber(payment.amount ?? payment.total ?? payment.order?.total ?? 0);

const normalizePaymentMethod = (payment: Payment): string => {
  const method = String(
    payment.method ??
      payment.paymentMethod ??
      payment.type ??
      payment.provider ??
      "",
  )
    .trim()
    .toUpperCase();

  if (
    method === "CASH_ON_DELIVERY" ||
    method === "CASH ON DELIVERY" ||
    method === "COD"
  ) {
    return "CASH_ON_DELIVERY";
  }

  if (method === "TELEBIRR") {
    return "TELEBIRR";
  }

  if (
    method === "CARD" ||
    method === "CREDIT_CARD" ||
    method === "DEBIT_CARD" ||
    method === "CREDIT / DEBIT CARD"
  ) {
    return "CARD";
  }

  return "UNKNOWN";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(getNumber(value));

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const extractArray = <T,>(data: unknown, key: string): T[] => {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as Record<string, unknown>)[key])
  ) {
    return (data as Record<string, unknown>)[key] as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as Record<string, unknown>).data)
  ) {
    return (data as Record<string, unknown>).data as T[];
  }

  return [];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("6M");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  /* =======================================================
     FETCH
  ======================================================= */

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      if (storedUser) {
        try {
          const currentUser = JSON.parse(storedUser);

          if (currentUser?.role !== "ADMIN") {
            window.location.href = "/";
            return;
          }
        } catch {
          window.location.href = "/login";
          return;
        }
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const responses = await Promise.all([
        fetch(`${API_URL}/admin/orders`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/admin/users`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/products`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/payments/admin/all`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const [
        ordersResponse,
        usersResponse,
        productsResponse,
        paymentsResponse,
      ] = responses;

      if (ordersResponse.status === 401 || ordersResponse.status === 403) {
        window.location.href = "/login";
        return;
      }

      if (!ordersResponse.ok) {
        throw new Error(
          `Orders API failed with status ${ordersResponse.status}`,
        );
      }

      if (!usersResponse.ok) {
        throw new Error(`Users API failed with status ${usersResponse.status}`);
      }

      if (!productsResponse.ok) {
        throw new Error(
          `Products API failed with status ${productsResponse.status}`,
        );
      }

      if (!paymentsResponse.ok) {
        throw new Error(
          `Payments API failed with status ${paymentsResponse.status}`,
        );
      }

      const [ordersData, usersData, productsData, paymentsData] =
        await Promise.all([
          ordersResponse.json(),
          usersResponse.json(),
          productsResponse.json(),
          paymentsResponse.json(),
        ]);

      setOrders(extractArray<Order>(ordersData, "orders"));
      setUsers(extractArray<User>(usersData, "users"));
      setProducts(extractArray<Product>(productsData, "products"));
      setPayments(extractArray<Payment>(paymentsData, "payments"));
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        err instanceof Error ? err.message : "Failed to load analytics data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  /* =======================================================
     USERS
  ======================================================= */

  const customers = useMemo(
    () => users.filter((user) => user.role === "CUSTOMER"),
    [users],
  );

  const admins = useMemo(
    () => users.filter((user) => user.role === "ADMIN"),
    [users],
  );

  /* =======================================================
     ORDERS
  ======================================================= */

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "CANCELLED"),
    [orders],
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "PENDING"),
    [orders],
  );

  const confirmedOrders = useMemo(
    () => orders.filter((order) => order.status === "CONFIRMED"),
    [orders],
  );

  const shippedOrders = useMemo(
    () => orders.filter((order) => order.status === "SHIPPED"),
    [orders],
  );

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED"),
    [orders],
  );

  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status === "CANCELLED"),
    [orders],
  );

  /* =======================================================
     PAYMENTS
  ======================================================= */

  const paidPayments = useMemo(
    () => payments.filter((payment) => payment.status === "PAID"),
    [payments],
  );

  const pendingPayments = useMemo(
    () => payments.filter((payment) => payment.status === "PENDING"),
    [payments],
  );

  const failedPayments = useMemo(
    () => payments.filter((payment) => payment.status === "FAILED"),
    [payments],
  );

  const cancelledPayments = useMemo(
    () => payments.filter((payment) => payment.status === "CANCELLED"),
    [payments],
  );

  const paidRevenue = useMemo(
    () =>
      paidPayments.reduce((sum, payment) => sum + getPaymentAmount(payment), 0),
    [paidPayments],
  );

  const pendingRevenue = useMemo(
    () =>
      pendingPayments.reduce(
        (sum, payment) => sum + getPaymentAmount(payment),
        0,
      ),
    [pendingPayments],
  );

  const failedRevenue = useMemo(
    () =>
      failedPayments.reduce(
        (sum, payment) => sum + getPaymentAmount(payment),
        0,
      ),
    [failedPayments],
  );

  const cancelledRevenue = useMemo(
    () =>
      cancelledPayments.reduce(
        (sum, payment) => sum + getPaymentAmount(payment),
        0,
      ),
    [cancelledPayments],
  );

  /* =======================================================
     PAYMENT METHODS
  ======================================================= */

  const cashOnDeliveryPayments = useMemo(
    () =>
      payments.filter(
        (payment) => normalizePaymentMethod(payment) === "CASH_ON_DELIVERY",
      ),
    [payments],
  );

  const telebirrPayments = useMemo(
    () =>
      payments.filter(
        (payment) => normalizePaymentMethod(payment) === "TELEBIRR",
      ),
    [payments],
  );

  const cardPayments = useMemo(
    () =>
      payments.filter((payment) => normalizePaymentMethod(payment) === "CARD"),
    [payments],
  );

  const paymentMethodTotal =
    cashOnDeliveryPayments.length +
    telebirrPayments.length +
    cardPayments.length;

  const cashPercentage =
    paymentMethodTotal > 0
      ? (cashOnDeliveryPayments.length / paymentMethodTotal) * 100
      : 0;

  const telebirrPercentage =
    paymentMethodTotal > 0
      ? (telebirrPayments.length / paymentMethodTotal) * 100
      : 0;

  const cardPercentage =
    paymentMethodTotal > 0
      ? (cardPayments.length / paymentMethodTotal) * 100
      : 0;

  /* =======================================================
     SALES
  ======================================================= */

  const totalSales = paidRevenue;
  const totalOrders = orders.length;

  const averageOrderValue =
    paidPayments.length > 0 ? paidRevenue / paidPayments.length : 0;

  /* =======================================================
     INVENTORY
  ======================================================= */

  const inStock = useMemo(
    () => products.filter((product) => getNumber(product.stock) > 0).length,
    [products],
  );

  const outOfStock = useMemo(
    () => products.filter((product) => getNumber(product.stock) <= 0).length,
    [products],
  );

  const lowStock = useMemo(
    () =>
      products.filter((product) => {
        const stock = getNumber(product.stock);
        return stock > 0 && stock <= 5;
      }).length,
    [products],
  );

  const lowStockProducts = useMemo(
    () =>
      [...products]
        .filter((product) => {
          const stock = getNumber(product.stock);
          return stock > 0 && stock <= 5;
        })
        .sort((a, b) => getNumber(a.stock) - getNumber(b.stock))
        .slice(0, 4),
    [products],
  );

  const outOfStockProducts = useMemo(
    () =>
      products.filter((product) => getNumber(product.stock) <= 0).slice(0, 4),
    [products],
  );

  const notificationCount =
    pendingOrders.length + lowStockProducts.length + outOfStockProducts.length;

  /* =======================================================
     PERIOD
  ======================================================= */

  const periodStart = useMemo(() => {
    const now = new Date();

    if (period === "7D") {
      now.setDate(now.getDate() - 6);
      now.setHours(0, 0, 0, 0);
      return now;
    }

    if (period === "30D") {
      now.setDate(now.getDate() - 29);
      now.setHours(0, 0, 0, 0);
      return now;
    }

    if (period === "6M") {
      now.setMonth(now.getMonth() - 5);
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      return now;
    }

    now.setMonth(now.getMonth() - 11);
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now;
  }, [period]);

  const periodOrders = useMemo(
    () =>
      activeOrders.filter((order) => new Date(order.createdAt) >= periodStart),
    [activeOrders, periodStart],
  );

  const periodPayments = useMemo(
    () =>
      payments.filter((payment) => new Date(payment.createdAt) >= periodStart),
    [payments, periodStart],
  );

  const periodPaidRevenue = useMemo(
    () =>
      periodPayments
        .filter((payment) => payment.status === "PAID")
        .reduce((sum, payment) => sum + getPaymentAmount(payment), 0),
    [periodPayments],
  );

  /* =======================================================
     PREVIOUS PERIOD
  ======================================================= */

  const previousPeriodStart = useMemo(() => {
    const start = new Date(periodStart);

    if (period === "7D") {
      start.setDate(start.getDate() - 7);
    } else if (period === "30D") {
      start.setDate(start.getDate() - 30);
    } else if (period === "6M") {
      start.setMonth(start.getMonth() - 6);
    } else {
      start.setFullYear(start.getFullYear() - 1);
    }

    return start;
  }, [period, periodStart]);

  const previousPeriodRevenue = useMemo(
    () =>
      payments
        .filter((payment) => {
          if (payment.status !== "PAID") {
            return false;
          }

          const date = new Date(payment.createdAt);

          return date >= previousPeriodStart && date < periodStart;
        })
        .reduce((sum, payment) => sum + getPaymentAmount(payment), 0),
    [payments, previousPeriodStart, periodStart],
  );

  const revenueChange = useMemo(() => {
    if (previousPeriodRevenue === 0) {
      return periodPaidRevenue > 0 ? 100 : 0;
    }

    return (
      ((periodPaidRevenue - previousPeriodRevenue) / previousPeriodRevenue) *
      100
    );
  }, [periodPaidRevenue, previousPeriodRevenue]);

  /* =======================================================
     REVENUE CHART
  ======================================================= */

  const revenueChart = useMemo<ChartPoint[]>(() => {
    const now = new Date();

    if (period === "7D") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);

        date.setDate(now.getDate() - (6 - index));
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const value = payments
          .filter((payment) => {
            if (payment.status !== "PAID") {
              return false;
            }

            const paymentDate = new Date(payment.createdAt);

            return paymentDate >= date && paymentDate < nextDate;
          })
          .reduce((sum, payment) => sum + getPaymentAmount(payment), 0);

        return {
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          value,
        };
      });
    }

    if (period === "30D") {
      return Array.from({ length: 6 }, (_, index) => {
        const start = new Date(now);

        start.setDate(now.getDate() - (5 - index) * 5 - 4);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 5);
        end.setHours(0, 0, 0, 0);

        const value = payments
          .filter((payment) => {
            if (payment.status !== "PAID") {
              return false;
            }

            const paymentDate = new Date(payment.createdAt);

            return paymentDate >= start && paymentDate < end;
          })
          .reduce((sum, payment) => sum + getPaymentAmount(payment), 0);

        return {
          label: start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value,
        };
      });
    }

    if (period === "6M") {
      return Array.from({ length: 6 }, (_, index) => {
        const date = new Date(now);

        date.setMonth(now.getMonth() - (5 - index));
        date.setDate(1);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setMonth(date.getMonth() + 1);

        const value = payments
          .filter((payment) => {
            if (payment.status !== "PAID") {
              return false;
            }

            const paymentDate = new Date(payment.createdAt);

            return paymentDate >= date && paymentDate < nextDate;
          })
          .reduce((sum, payment) => sum + getPaymentAmount(payment), 0);

        return {
          label: date.toLocaleDateString("en-US", {
            month: "short",
          }),
          value,
        };
      });
    }

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now);

      date.setMonth(now.getMonth() - (11 - index));
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setMonth(date.getMonth() + 1);

      const value = payments
        .filter((payment) => {
          if (payment.status !== "PAID") {
            return false;
          }

          const paymentDate = new Date(payment.createdAt);

          return paymentDate >= date && paymentDate < nextDate;
        })
        .reduce((sum, payment) => sum + getPaymentAmount(payment), 0);

      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        value,
      };
    });
  }, [period, payments]);

  const maxRevenue = Math.max(...revenueChart.map((item) => item.value), 1);

  /* =======================================================
     ORDERS CHART
  ======================================================= */

  const ordersChart = useMemo<ChartPoint[]>(() => {
    const now = new Date();

    if (period === "7D") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);

        date.setDate(now.getDate() - (6 - index));
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const value = periodOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);

          return orderDate >= date && orderDate < nextDate;
        }).length;

        return {
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          value,
        };
      });
    }

    if (period === "30D") {
      return Array.from({ length: 6 }, (_, index) => {
        const start = new Date(now);

        start.setDate(now.getDate() - (5 - index) * 5 - 4);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 5);
        end.setHours(0, 0, 0, 0);

        const value = periodOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);

          return orderDate >= start && orderDate < end;
        }).length;

        return {
          label: start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value,
        };
      });
    }

    if (period === "6M") {
      return Array.from({ length: 6 }, (_, index) => {
        const date = new Date(now);

        date.setMonth(now.getMonth() - (5 - index));
        date.setDate(1);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setMonth(date.getMonth() + 1);

        const value = periodOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);

          return orderDate >= date && orderDate < nextDate;
        }).length;

        return {
          label: date.toLocaleDateString("en-US", {
            month: "short",
          }),
          value,
        };
      });
    }

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now);

      date.setMonth(now.getMonth() - (11 - index));
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setMonth(date.getMonth() + 1);

      const value = periodOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);

        return orderDate >= date && orderDate < nextDate;
      }).length;

      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        value,
      };
    });
  }, [period, periodOrders]);

  const maxOrders = Math.max(...ordersChart.map((item) => item.value), 1);

  /* =======================================================
     TOP PRODUCTS
  ======================================================= */

  const topProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => getNumber(b.stock) - getNumber(a.stock))
        .slice(0, 6),
    [products],
  );

  /* =======================================================
     RECENT ORDERS
  ======================================================= */

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 6),
    [orders],
  );

  /* =======================================================
     SEARCH
  ======================================================= */

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    const results: SearchResult[] = [];

    orders.forEach((order) => {
      const searchable = [
        String(order.id),
        order.status,
        order.user?.name || "",
        order.user?.email || "",
      ]
        .join(" ")
        .toLowerCase();

      if (searchable.includes(query)) {
        results.push({
          type: "Order",
          name: `Order #${order.id}`,
          detail: `${order.status} • ${formatCurrency(getNumber(order.total))}`,
          href: "/admin/orders",
        });
      }
    });

    products.forEach((product) => {
      const searchable = [product.name, String(product.id)]
        .join(" ")
        .toLowerCase();

      if (searchable.includes(query)) {
        results.push({
          type: "Product",
          name: product.name,
          detail: `Stock: ${product.stock}`,
          href: "/admin/products",
        });
      }
    });

    customers.forEach((customer) => {
      const searchable = [customer.name, customer.email]
        .join(" ")
        .toLowerCase();

      if (searchable.includes(query)) {
        results.push({
          type: "Customer",
          name: customer.name,
          detail: customer.email,
          href: "/admin/users",
        });
      }
    });

    payments.forEach((payment) => {
      const method = normalizePaymentMethod(payment);

      const searchable = [
        String(payment.id),
        payment.status,
        method,
        payment.order?.user?.name || "",
        payment.order?.user?.email || "",
      ]
        .join(" ")
        .toLowerCase();

      if (searchable.includes(query)) {
        results.push({
          type: "Payment",
          name: `Payment #${payment.id}`,
          detail: `${payment.status} • ${formatCurrency(
            getPaymentAmount(payment),
          )}`,
          href: "/admin/orders",
        });
      }
    });

    return results.slice(0, 8);
  }, [search, orders, products, customers, payments]);

  /* =======================================================
     KPI
  ======================================================= */

  const deliveryCompletion =
    orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0;

  const fulfillmentRate =
    orders.length > 0
      ? ((shippedOrders.length + deliveredOrders.length) / orders.length) * 100
      : 0;

  const paymentSuccessRate =
    payments.length > 0 ? (paidPayments.length / payments.length) * 100 : 0;

  const inventoryHealth =
    products.length > 0 ? (inStock / products.length) * 100 : 0;

  /* =======================================================
     STATUS CLASS
  ======================================================= */

  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700";

      case "SHIPPED":
        return "bg-blue-50 text-blue-700";

      case "CONFIRMED":
        return "bg-indigo-50 text-indigo-700";

      case "PENDING":
        return "bg-amber-50 text-amber-700";

      case "CANCELLED":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const exportReport = () => {
    const rows = [
      ["ShopEase Analytics Report", ""],
      ["Generated", new Date().toLocaleString()],
      ["Reporting Period", period],
      ["", ""],

      ["Sales", ""],
      ["Total Sales", totalSales.toFixed(2)],
      ["Paid Revenue", paidRevenue.toFixed(2)],
      ["Pending Revenue", pendingRevenue.toFixed(2)],
      ["Failed Revenue", failedRevenue.toFixed(2)],
      ["Cancelled Revenue", cancelledRevenue.toFixed(2)],
      ["Average Paid Order Value", averageOrderValue.toFixed(2)],
      ["", ""],

      ["Orders", ""],
      ["Total Orders", totalOrders],
      ["Active Orders", activeOrders.length],
      ["Pending Orders", pendingOrders.length],
      ["Confirmed Orders", confirmedOrders.length],
      ["Shipped Orders", shippedOrders.length],
      ["Delivered Orders", deliveredOrders.length],
      ["Cancelled Orders", cancelledOrders.length],
      ["", ""],

      ["Payments", ""],
      ["Total Payments", payments.length],
      ["Paid Payments", paidPayments.length],
      ["Pending Payments", pendingPayments.length],
      ["Failed Payments", failedPayments.length],
      ["Cancelled Payments", cancelledPayments.length],
      ["", ""],

      ["Payment Methods", ""],
      ["Cash on Delivery", cashOnDeliveryPayments.length],
      ["Telebirr", telebirrPayments.length],
      ["Card", cardPayments.length],
      ["", ""],

      ["Users", ""],
      ["Total Users", users.length],
      ["Customers", customers.length],
      ["Admins", admins.length],
      ["", ""],

      ["Inventory", ""],
      ["Total Products", products.length],
      ["In Stock", inStock],
      ["Low Stock", lowStock],
      ["Out of Stock", outOfStock],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");

            if (
              value.includes(",") ||
              value.includes('"') ||
              value.includes("\n")
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }

            return value;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "shopease-analytics-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-600">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Icon name="alert" size={24} />
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Analytics could not be loaded
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={fetchAnalyticsData}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Icon name="refresh" size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-65 border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20.5 items-center justify-between border-b border-slate-200 px-5">
          <Link
            href="/admin"
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Icon name="store" size={21} />
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">ShopEase</div>

              <div className="text-xs text-slate-500">Admin Panel</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <Icon name="x" size={19} />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-5">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600"
          >
            <Icon name="grid" size={19} />
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600"
          >
            <span className="flex items-center gap-3">
              <Icon name="bag" size={19} />
              Orders
            </span>

            {pendingOrders.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {pendingOrders.length}
              </span>
            )}
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600"
          >
            <Icon name="box" size={19} />
            Products
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600"
          >
            <Icon name="tag" size={19} />
            Categories
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600"
          >
            <Icon name="users" size={19} />
            Users
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            <Icon name="chart" size={19} />
            Analytics
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
          <div className="rounded-xl bg-blue-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Administrator</p>

                <p className="text-xs text-slate-500">ShopEase Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="min-h-screen lg:pl-65">
        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-13 items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 lg:hidden"
            >
              <Icon name="menu" size={21} />
            </button>

            <div className="hidden min-w-0 flex-1 md:block">
              <h1 className="text-lg font-bold">Analytics</h1>

              <p className="text-xs text-slate-500">
                Monitor your store performance
              </p>
            </div>

            {/* SEARCH */}

            <div className="relative hidden md:block">
              <div className="flex w-57.5 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-300 focus-within:bg-white">
                <Icon name="search" size={17} />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              {searchOpen && search.trim() && (
                <div className="absolute right-0 top-full mt-2 max-h-87.5 w-85 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <Link
                        key={`${result.type}-${index}`}
                        href={result.href}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearch("");
                        }}
                        className="block rounded-lg px-3 py-2.5 hover:bg-blue-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">
                            {result.name}
                          </span>

                          <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
                            {result.type}
                          </span>
                        </div>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {result.detail}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-5 text-center text-sm text-slate-500">
                      No results found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={fetchAnalyticsData}
                className="rounded-xl p-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                title="Refresh"
              >
                <Icon name="refresh" size={19} />
              </button>

              {/* NOTIFICATIONS */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative rounded-xl p-2.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Icon name="bell" size={19} />

                  {notificationCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 max-h-105 w-87.5 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold">Notifications</h3>

                        <span className="text-xs text-slate-400">
                          {notificationCount} total
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      {pendingOrders.length > 0 && (
                        <Link
                          href="/admin/orders"
                          onClick={() => setNotificationsOpen(false)}
                          className="flex gap-3 rounded-lg p-3 hover:bg-blue-50"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                            <Icon name="clock" size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              Pending orders
                            </p>

                            <p className="text-xs text-slate-500">
                              {pendingOrders.length} order
                              {pendingOrders.length !== 1 ? "s" : ""} waiting
                              for processing.
                            </p>
                          </div>
                        </Link>
                      )}

                      {lowStockProducts.map((product) => (
                        <Link
                          key={`low-${product.id}`}
                          href="/admin/products"
                          onClick={() => setNotificationsOpen(false)}
                          className="flex gap-3 rounded-lg p-3 hover:bg-blue-50"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                            <Icon name="alert" size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              Low stock
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {product.name} has {product.stock} item
                              {product.stock !== 1 ? "s" : ""} left.
                            </p>
                          </div>
                        </Link>
                      ))}

                      {outOfStockProducts.map((product) => (
                        <Link
                          key={`out-${product.id}`}
                          href="/admin/products"
                          onClick={() => setNotificationsOpen(false)}
                          className="flex gap-3 rounded-lg p-3 hover:bg-blue-50"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <Icon name="x" size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              Out of stock
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {product.name} is out of stock.
                            </p>
                          </div>
                        </Link>
                      ))}

                      {notificationCount === 0 && (
                        <div className="px-4 py-8 text-center">
                          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <Icon name="check" size={20} />
                          </div>

                          <p className="text-sm font-semibold">All caught up</p>

                          <p className="mt-1 text-xs text-slate-500">
                            There are no new notifications.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE SEARCH */}

          <div className="px-4 pb-3 md:hidden">
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-blue-300 focus-within:bg-white">
                <Icon name="search" size={17} />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSearchOpen(true);
                  }}
                  placeholder="Search orders, products..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              {searchOpen && search.trim() && (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <Link
                        key={`${result.type}-${index}`}
                        href={result.href}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearch("");
                        }}
                        className="block rounded-lg px-3 py-2.5 hover:bg-blue-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">
                            {result.name}
                          </span>

                          <span className="text-[10px] font-semibold uppercase text-blue-500">
                            {result.type}
                          </span>
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {result.detail}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-5 text-center text-sm text-slate-500">
                      No results found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* HERO */}

          <section className="overflow-hidden rounded-2xl bg-linear-to-br from-blue-800 via-blue-600 to-blue-500 text-white shadow-sm">
            <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
                  <Icon name="activity" size={14} />
                  Store performance
                </div>

                <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                  Analytics &amp; Performance
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                  Track sales, payments, orders, customers, and inventory from
                  one place.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={exportReport}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    <Icon name="download" size={17} />
                    Export Report
                  </button>

                  <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    View Orders
                    <Icon name="arrow" size={16} />
                  </Link>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 lg:w-107.5">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs text-blue-100">Paid Revenue</p>

                  <p className="mt-2 text-xl font-bold">
                    {formatCurrency(paidRevenue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs text-blue-100">Total Orders</p>

                  <p className="mt-2 text-xl font-bold">{totalOrders}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs text-blue-100">Customers</p>

                  <p className="mt-2 text-xl font-bold">{customers.length}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs text-blue-100">Payments</p>

                  <p className="mt-2 text-xl font-bold">{payments.length}</p>
                </div>
              </div>
            </div>
          </section>

          {/* PERIOD */}

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold">Reporting Period</h3>

              <p className="mt-1 text-xs text-slate-500">
                Choose the period used by the charts and revenue comparison.
              </p>
            </div>

            <div className="flex flex-wrap rounded-xl bg-slate-100 p-1">
              {(["7D", "30D", "6M", "1Y"] as Period[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    period === item
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-blue-600"
                  }`}
                >
                  {item === "7D"
                    ? "7 Days"
                    : item === "30D"
                      ? "30 Days"
                      : item === "6M"
                        ? "6 Months"
                        : "1 Year"}
                </button>
              ))}
            </div>
          </section>

          {/* SALES KPIs */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Sales</p>

                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {formatCurrency(totalSales)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="dollar" size={19} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Revenue from paid payments
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Orders</p>

                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {totalOrders}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="bag" size={19} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">All order statuses</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Average Order Value</p>

                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {formatCurrency(averageOrderValue)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="trend" size={19} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Average paid order value
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Period Revenue</p>

                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {formatCurrency(periodPaidRevenue)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="chart" size={19} />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <span
                  className={
                    revenueChange >= 0
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-red-600"
                  }
                >
                  {revenueChange >= 0 ? "+" : ""}
                  {revenueChange.toFixed(1)}%
                </span>

                <span className="text-slate-500">vs previous period</span>
              </div>
            </div>
          </section>

          {/* CHARTS */}

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold">Revenue Overview</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Paid payment revenue
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                  {formatCurrency(periodPaidRevenue)}
                </div>
              </div>

              <div className="mt-8 flex h-70 items-end gap-2 overflow-x-auto">
                {revenueChart.map((item, index) => {
                  const height =
                    item.value > 0
                      ? Math.max((item.value / maxRevenue) * 100, 5)
                      : 2;

                  return (
                    <div
                      key={`${item.label}-${index}`}
                      className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="relative flex h-full w-full items-end justify-center">
                        <div
                          className="group relative w-full max-w-14 rounded-t-xl bg-blue-600 transition hover:bg-blue-700"
                          style={{
                            height: `${height}%`,
                            minHeight: item.value > 0 ? "8px" : "3px",
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-blue-700 px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                            {formatCurrency(item.value)}
                          </div>
                        </div>
                      </div>

                      <span className="whitespace-nowrap text-[10px] font-medium text-slate-400">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold">Orders Overview</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Active orders excluding cancelled orders
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                  {periodOrders.length} orders
                </div>
              </div>

              <div className="mt-8 flex h-70 items-end gap-2 overflow-x-auto">
                {ordersChart.map((item, index) => {
                  const height =
                    item.value > 0
                      ? Math.max((item.value / maxOrders) * 100, 5)
                      : 2;

                  return (
                    <div
                      key={`${item.label}-${index}`}
                      className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="relative flex h-full w-full items-end justify-center">
                        <div
                          className="group relative w-full max-w-14 rounded-t-xl bg-blue-400 transition hover:bg-blue-500"
                          style={{
                            height: `${height}%`,
                            minHeight: item.value > 0 ? "8px" : "3px",
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-blue-700 px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                            {item.value} orders
                          </div>
                        </div>
                      </div>

                      <span className="whitespace-nowrap text-[10px] font-medium text-slate-400">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* PAYMENT */}

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold">Payment Status</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Revenue by payment status
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    label: "Paid",
                    count: paidPayments.length,
                    amount: paidRevenue,
                    bg: "bg-emerald-50",
                    iconBg: "bg-white text-emerald-600",
                    text: "text-emerald-700",
                    icon: "check" as IconName,
                  },
                  {
                    label: "Pending",
                    count: pendingPayments.length,
                    amount: pendingRevenue,
                    bg: "bg-amber-50",
                    iconBg: "bg-white text-amber-600",
                    text: "text-amber-700",
                    icon: "clock" as IconName,
                  },
                  {
                    label: "Failed",
                    count: failedPayments.length,
                    amount: failedRevenue,
                    bg: "bg-red-50",
                    iconBg: "bg-white text-red-600",
                    text: "text-red-700",
                    icon: "x" as IconName,
                  },
                  {
                    label: "Cancelled",
                    count: cancelledPayments.length,
                    amount: cancelledRevenue,
                    bg: "bg-slate-50",
                    iconBg: "bg-white text-slate-600",
                    text: "text-slate-700",
                    icon: "x" as IconName,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between rounded-xl ${item.bg} p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.iconBg}`}
                      >
                        <Icon name={item.icon} size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.count} payments
                        </p>
                      </div>
                    </div>

                    <p className={`text-sm font-bold ${item.text}`}>
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold">Payment Methods</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Distribution of payment methods
                </p>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-[170px_1fr] sm:items-center">
                <div
                  className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background:
                      paymentMethodTotal > 0
                        ? `conic-gradient(
                            #2563eb 0% ${cashPercentage}%,
                            #60a5fa ${cashPercentage}% ${
                              cashPercentage + telebirrPercentage
                            }%,
                            #bfdbfe ${cashPercentage + telebirrPercentage}% 100%
                          )`
                        : "#e2e8f0",
                  }}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                    <div className="text-center">
                      <p className="text-xl font-bold">{paymentMethodTotal}</p>

                      <p className="text-[10px] text-slate-500">payments</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Cash on Delivery",
                      count: cashOnDeliveryPayments.length,
                      percentage: cashPercentage,
                      color: "bg-blue-600",
                    },
                    {
                      label: "Telebirr",
                      count: telebirrPayments.length,
                      percentage: telebirrPercentage,
                      color: "bg-blue-400",
                    },
                    {
                      label: "Card",
                      count: cardPayments.length,
                      percentage: cardPercentage,
                      color: "bg-blue-200",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-3 w-3 rounded-full ${item.color}`}
                        />

                        <div>
                          <p className="text-sm font-semibold">{item.label}</p>

                          <p className="text-xs text-slate-500">
                            {item.count} payments
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-bold">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ORDER STATUS + CUSTOMERS */}

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold">Order Status</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Current order distribution
                </p>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-[170px_1fr] sm:items-center">
                <div
                  className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background: (() => {
                      const total = orders.length || 1;

                      const pending = (pendingOrders.length / total) * 100;

                      const confirmed = (confirmedOrders.length / total) * 100;

                      const shipped = (shippedOrders.length / total) * 100;

                      const delivered = (deliveredOrders.length / total) * 100;

                      return `conic-gradient(
                        #f59e0b 0% ${pending}%,
                        #6366f1 ${pending}% ${pending + confirmed}%,
                        #3b82f6 ${pending + confirmed}% ${
                          pending + confirmed + shipped
                        }%,
                        #10b981 ${pending + confirmed + shipped}% ${
                          pending + confirmed + shipped + delivered
                        }%,
                        #ef4444 ${
                          pending + confirmed + shipped + delivered
                        }% 100%
                      )`;
                    })(),
                  }}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                    <div className="text-center">
                      <p className="text-xl font-bold">{orders.length}</p>

                      <p className="text-[10px] text-slate-500">total orders</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Pending",
                      count: pendingOrders.length,
                      color: "bg-amber-500",
                    },
                    {
                      label: "Confirmed",
                      count: confirmedOrders.length,
                      color: "bg-indigo-500",
                    },
                    {
                      label: "Shipped",
                      count: shippedOrders.length,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Delivered",
                      count: deliveredOrders.length,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Cancelled",
                      count: cancelledOrders.length,
                      color: "bg-red-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-3 w-3 rounded-full ${item.color}`}
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {item.label}
                        </span>
                      </div>

                      <span className="text-sm font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold">Customer Base</h3>

                <p className="mt-1 text-xs text-slate-500">
                  User account distribution
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">Customers</span>

                    <span className="text-sm font-bold">
                      {customers.length}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${
                          users.length > 0
                            ? (customers.length / users.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Administrators
                    </span>

                    <span className="text-sm font-bold">{admins.length}</span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-300"
                      style={{
                        width: `${
                          users.length > 0
                            ? (admins.length / users.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs text-blue-600">Total Users</p>

                    <p className="mt-1 text-xl font-bold">{users.length}</p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs text-blue-600">Customer Share</p>

                    <p className="mt-1 text-xl font-bold">
                      {users.length > 0
                        ? ((customers.length / users.length) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INVENTORY */}

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold">Inventory Overview</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Current product availability
                  </p>
                </div>

                <Link
                  href="/admin/products"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage Products
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-700">In Stock</p>

                  <p className="mt-2 text-2xl font-bold text-emerald-800">
                    {inStock}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs text-amber-700">Low Stock</p>

                  <p className="mt-2 text-2xl font-bold text-amber-800">
                    {lowStock}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-xs text-red-700">Out of Stock</p>

                  <p className="mt-2 text-2xl font-bold text-red-800">
                    {outOfStock}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Inventory health
                  </span>

                  <span className="text-xs font-bold text-blue-700">
                    {inventoryHealth.toFixed(1)}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${inventoryHealth}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold">
                    Product Stock Overview
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Products with the highest current stock
                  </p>
                </div>

                <div className="text-blue-600">
                  <Icon name="box" size={19} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {topProducts.length > 0 ? (
                  topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-xl bg-blue-50/60 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-blue-600">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Icon name="box" size={18} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {product.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatCurrency(getNumber(product.price))}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold">{product.stock}</p>

                        <p className="text-[10px] text-slate-400">units</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No products available.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* KEY METRICS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div>
              <h3 className="text-base font-bold">Key Performance Metrics</h3>

              <p className="mt-1 text-xs text-slate-500">
                Operational indicators for your store
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Delivery Completion",
                  value: deliveryCompletion,
                  icon: "truck" as IconName,
                },
                {
                  label: "Fulfillment Rate",
                  value: fulfillmentRate,
                  icon: "activity" as IconName,
                },
                {
                  label: "Payment Success",
                  value: paymentSuccessRate,
                  icon: "credit" as IconName,
                },
                {
                  label: "Inventory Health",
                  value: inventoryHealth,
                  icon: "box" as IconName,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">
                      <Icon name={item.icon} size={17} />
                    </div>

                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>

                  <p className="mt-4 text-2xl font-bold">
                    {item.value.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT ORDERS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold">Recent Orders</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Latest orders from your store
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
                <Icon name="arrow" size={14} />
              </Link>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-180 w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Order
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Customer
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Date
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30"
                      >
                        <td className="px-3 py-4">
                          <span className="text-sm font-bold">#{order.id}</span>
                        </td>

                        <td className="px-3 py-4">
                          <div>
                            <p className="text-sm font-semibold">
                              {order.user?.name || "Unknown customer"}
                            </p>

                            <p className="max-w-50 truncate text-xs text-slate-500">
                              {order.user?.email || "—"}
                            </p>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getOrderStatusClass(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-right text-sm font-bold">
                          {formatCurrency(getNumber(order.total))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-10 text-center text-sm text-slate-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAYMENT SNAPSHOT */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold">Payment Snapshot</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Current payment activity
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon name="wallet" size={18} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-700">Paid</p>

                <p className="mt-1 text-xl font-bold text-emerald-900">
                  {paidPayments.length}
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  {formatCurrency(paidRevenue)}
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-medium text-amber-700">Pending</p>

                <p className="mt-1 text-xl font-bold text-amber-900">
                  {pendingPayments.length}
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  {formatCurrency(pendingRevenue)}
                </p>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-medium text-red-700">Failed</p>

                <p className="mt-1 text-xl font-bold text-red-900">
                  {failedPayments.length}
                </p>

                <p className="mt-1 text-xs text-red-700">
                  {formatCurrency(failedRevenue)}
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-medium text-blue-600">Total</p>

                <p className="mt-1 text-xl font-bold text-blue-900">
                  {payments.length}
                </p>

                <p className="mt-1 text-xs text-blue-600">
                  {formatCurrency(
                    paidRevenue +
                      pendingRevenue +
                      failedRevenue +
                      cancelledRevenue,
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
