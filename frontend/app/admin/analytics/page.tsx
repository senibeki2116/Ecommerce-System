"use client";

import { useEffect, useMemo, useState } from "react";
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
  description?: string;
  price: number;
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
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
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
          <path d="M20.59 13.41 11 3H4v7l10.59 10.59a2 2 0 0 0 2.82 0l3.18-3.18a2 2 0 0 0 0-2.82Z" />
          <circle cx="7.5" cy="7.5" r="1" />
        </svg>
      );

    case "store":
      return (
        <svg {...common}>
          <path d="M3 10h18" />
          <path d="M5 10v10h14V10" />
          <path d="M4 4h16l2 6H2l2-6Z" />
          <path d="M8 20v-6h8v6" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8.1 8.1 0 0 0-14.7-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8.1 8.1 0 0 0 14.7 4L21 14" />
          <path d="M21 19v-5h-5" />
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
          <path d="m3 17 6-6 4 4 8-9" />
          <path d="M15 6h6v6" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 16v-4" />
          <path d="M12 16V8" />
          <path d="M16 16v-6" />
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
          <path d="M14 9h4l3 3v4h-7z" />
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
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
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
          <circle cx="12" cy="12" r="9" />
          <path d="M15 8.5c-.6-.6-1.5-1-2.7-1-1.8 0-3 .9-3 2.1 0 3.3 5.7 1.4 5.7 4.5 0 1.2-1.2 2.2-3.1 2.2-1.2 0-2.2-.4-2.9-1.1" />
          <path d="M12 5.5v13" />
        </svg>
      );

    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l2-7 4 14 2-7h6" />
        </svg>
      );

    case "credit":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
      );

    case "wallet":
      return (
        <svg {...common}>
          <path d="M4 6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 1-2-2V6Z" />
          <path d="M4 7h15" />
          <path d="M16 12h3" />
        </svg>
      );

    case "alert":
      return (
        <svg {...common}>
          <path d="M10.3 4.2 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    default:
      return null;
  }
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("6M");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const API_URL = "http://localhost:3001";

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [ordersRes, usersRes, productsRes, paymentsRes] = await Promise.all(
        [
          fetch(`${API_URL}/admin/orders`, { headers }),
          fetch(`${API_URL}/admin/users`, { headers }),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/payments/admin/all`, { headers }),
        ],
      );

      if (ordersRes.ok) {
        const data = await ordersRes.json();

        setOrders(
          Array.isArray(data)
            ? data
            : Array.isArray(data.orders)
              ? data.orders
              : Array.isArray(data.data)
                ? data.data
                : [],
        );
      }

      if (usersRes.ok) {
        const data = await usersRes.json();

        setUsers(
          Array.isArray(data)
            ? data
            : Array.isArray(data.users)
              ? data.users
              : Array.isArray(data.data)
                ? data.data
                : [],
        );
      }

      if (productsRes.ok) {
        const data = await productsRes.json();

        setProducts(
          Array.isArray(data)
            ? data
            : Array.isArray(data.products)
              ? data.products
              : Array.isArray(data.data)
                ? data.data
                : [],
        );
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();

        setPayments(
          Array.isArray(data)
            ? data
            : Array.isArray(data.payments)
              ? data.payments
              : Array.isArray(data.data)
                ? data.data
                : [],
        );
      } else {
        console.error(
          "Payments request failed:",
          paymentsRes.status,
          paymentsRes.statusText,
        );
      }
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  /*
   * Payment helpers
   */

  const getPaymentAmount = (payment: Payment) => {
    const directAmount = Number(payment.amount);

    if (Number.isFinite(directAmount) && directAmount > 0) {
      return directAmount;
    }

    const totalAmount = Number(payment.total);

    if (Number.isFinite(totalAmount) && totalAmount > 0) {
      return totalAmount;
    }

    const orderAmount = Number(payment.order?.total);

    if (Number.isFinite(orderAmount) && orderAmount > 0) {
      return orderAmount;
    }

    return 0;
  };

  const getPaymentMethod = (payment: Payment) => {
    const raw =
      payment.method ||
      payment.paymentMethod ||
      payment.type ||
      payment.provider ||
      "UNKNOWN";

    const normalized = String(raw).trim().toUpperCase();

    if (
      normalized.includes("CASH") ||
      normalized.includes("COD") ||
      normalized.includes("DELIVERY")
    ) {
      return "CASH_ON_DELIVERY";
    }

    if (normalized.includes("TELEBIRR")) {
      return "TELEBIRR";
    }

    if (
      normalized.includes("CARD") ||
      normalized.includes("VISA") ||
      normalized.includes("MASTERCARD")
    ) {
      return "CARD";
    }

    return normalized || "UNKNOWN";
  };

  const customers = useMemo(
    () => users.filter((user) => user.role === "CUSTOMER"),
    [users],
  );

  const admins = useMemo(
    () => users.filter((user) => user.role === "ADMIN"),
    [users],
  );

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "CANCELLED"),
    [orders],
  );

  /*
   * Order status
   */

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "PENDING").length,
    [orders],
  );

  const confirmedOrders = useMemo(
    () => orders.filter((order) => order.status === "CONFIRMED").length,
    [orders],
  );

  const shippedOrders = useMemo(
    () => orders.filter((order) => order.status === "SHIPPED").length,
    [orders],
  );

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED").length,
    [orders],
  );

  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status === "CANCELLED").length,
    [orders],
  );

  /*
   * Sales
   */

  const totalSales = useMemo(
    () =>
      activeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [activeOrders],
  );

  const totalOrders = orders.length;

  const averageOrderValue =
    activeOrders.length > 0 ? totalSales / activeOrders.length : 0;

  /*
   * Payment statistics
   */

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

  const cashOnDeliveryPayments = useMemo(
    () =>
      payments.filter(
        (payment) => getPaymentMethod(payment) === "CASH_ON_DELIVERY",
      ),
    [payments],
  );

  const telebirrPayments = useMemo(
    () =>
      payments.filter((payment) => getPaymentMethod(payment) === "TELEBIRR"),
    [payments],
  );

  const cardPayments = useMemo(
    () => payments.filter((payment) => getPaymentMethod(payment) === "CARD"),
    [payments],
  );

  /*
   * Inventory
   */

  const inStock = useMemo(
    () => products.filter((product) => Number(product.stock || 0) > 0).length,
    [products],
  );

  const outOfStock = useMemo(
    () => products.filter((product) => Number(product.stock || 0) <= 0).length,
    [products],
  );

  const lowStock = useMemo(
    () =>
      products.filter(
        (product) =>
          Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5,
      ).length,
    [products],
  );

  /*
   * Notifications
   */

  const notificationLowStockProducts = useMemo(
    () =>
      products
        .filter(
          (product) =>
            Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5,
        )
        .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
        .slice(0, 4),
    [products],
  );

  const notificationOutOfStockProducts = useMemo(
    () =>
      products.filter((product) => Number(product.stock || 0) <= 0).slice(0, 4),
    [products],
  );

  const notificationCount = pendingOrders + lowStock + outOfStock;

  /*
   * Reporting period
   */

  const periodDays = {
    "7D": 7,
    "30D": 30,
    "6M": 180,
    "1Y": 365,
  }[period];

  const periodStart = useMemo(() => {
    const date = new Date();

    if (period === "6M") {
      date.setMonth(date.getMonth() - 5);
      date.setDate(1);
    } else if (period === "1Y") {
      date.setFullYear(date.getFullYear() - 1);
      date.setDate(1);
    } else {
      date.setDate(date.getDate() - periodDays);
    }

    return date;
  }, [period, periodDays]);

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

  const previousPeriodRevenue = useMemo(() => {
    const start = new Date(periodStart);
    const end = new Date(periodStart);

    if (period === "7D" || period === "30D") {
      const days = period === "7D" ? 7 : 30;

      start.setDate(start.getDate() - days);
    } else if (period === "6M") {
      start.setMonth(start.getMonth() - 6);
    } else {
      start.setFullYear(start.getFullYear() - 1);
    }

    return activeOrders
      .filter((order) => {
        const date = new Date(order.createdAt);

        return date >= start && date < end;
      })
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [activeOrders, period, periodStart]);

  const revenueChange = useMemo(() => {
    if (previousPeriodRevenue === 0) {
      return periodPaidRevenue > 0 ? 100 : 0;
    }

    return (
      ((periodPaidRevenue - previousPeriodRevenue) / previousPeriodRevenue) *
      100
    );
  }, [periodPaidRevenue, previousPeriodRevenue]);

  /*
   * Revenue chart
   */

  const revenueChartData = useMemo(() => {
    const now = new Date();

    if (period === "7D") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);

        date.setDate(now.getDate() - (6 - index));

        const key = date.toISOString().slice(0, 10);

        const revenue = periodPayments
          .filter((payment) => {
            if (payment.status !== "PAID") return false;

            return (
              new Date(payment.createdAt).toISOString().slice(0, 10) === key
            );
          })
          .reduce((sum, payment) => sum + getPaymentAmount(payment), 0);

        return {
          key,
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          value: revenue,
        };
      });
    }

    if (period === "30D") {
      return Array.from({ length: 6 }, (_, index) => {
        const end = new Date(now);

        end.setDate(now.getDate() - (5 - index) * 5);

        const start = new Date(end);

        start.setDate(start.getDate() - 4);

        const revenue = periodPayments
          .filter((payment) => {
            if (payment.status !== "PAID") return false;

            const date = new Date(payment.createdAt);

            return date >= start && date <= end;
          })
          .reduce((sum, payment) => sum + getPaymentAmount(payment), 0);

        return {
          key: String(index),
          label: `${start.getDate()}-${end.getDate()}`,
          value: revenue,
        };
      });
    }

    const months = period === "1Y" ? 12 : 6;

    return Array.from({ length: months }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (months - 1 - index),
        1,
      );

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const revenue = periodPayments
        .filter((payment) => {
          if (payment.status !== "PAID") return false;

          const paymentDate = new Date(payment.createdAt);

          return (
            paymentDate.getFullYear() === date.getFullYear() &&
            paymentDate.getMonth() === date.getMonth()
          );
        })
        .reduce((sum, payment) => sum + getPaymentAmount(payment), 0);

      return {
        key,
        label: date.toLocaleString("en-US", {
          month: "short",
        }),
        value: revenue,
      };
    });
  }, [period, periodPayments]);

  const maxRevenueChartValue = Math.max(
    ...revenueChartData.map((item) => item.value),
    1,
  );

  /*
   * Orders chart
   */

  const orderChartData = useMemo(() => {
    const now = new Date();

    if (period === "7D") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);

        date.setDate(now.getDate() - (6 - index));

        const key = date.toISOString().slice(0, 10);

        const count = periodOrders.filter(
          (order) =>
            new Date(order.createdAt).toISOString().slice(0, 10) === key,
        ).length;

        return {
          key,
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          value: count,
        };
      });
    }

    if (period === "30D") {
      return Array.from({ length: 6 }, (_, index) => {
        const end = new Date(now);

        end.setDate(now.getDate() - (5 - index) * 5);

        const start = new Date(end);

        start.setDate(start.getDate() - 4);

        const count = periodOrders.filter((order) => {
          const date = new Date(order.createdAt);

          return date >= start && date <= end;
        }).length;

        return {
          key: String(index),
          label: `${start.getDate()}-${end.getDate()}`,
          value: count,
        };
      });
    }

    const months = period === "1Y" ? 12 : 6;

    return Array.from({ length: months }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (months - 1 - index),
        1,
      );

      const count = periodOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);

        return (
          orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth()
        );
      }).length;

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleString("en-US", {
          month: "short",
        }),
        value: count,
      };
    });
  }, [period, periodOrders]);

  const maxOrderChartValue = Math.max(
    ...orderChartData.map((item) => item.value),
    1,
  );

  /*
   * Payment method percentages
   */

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

  /*
   * Top products
   */

  const topProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
        .slice(0, 6),
    [products],
  );

  /*
   * Recent orders
   */

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

  /*
   * Search
   */

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    const results: {
      type: string;
      name: string;
      detail: string;
      href: string;
    }[] = [];

    orders.forEach((order) => {
      if (
        String(order.id).includes(query) ||
        order.status.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "Order",
          name: `Order #${order.id}`,
          detail: order.user?.name || "Customer",
          href: "/admin/orders",
        });
      }
    });

    products.forEach((product) => {
      if (
        product.name.toLowerCase().includes(query) ||
        String(product.id).includes(query)
      ) {
        results.push({
          type: "Product",
          name: product.name,
          detail: `Stock: ${product.stock}`,
          href: "/admin/products",
        });
      }
    });

    customers.forEach((user) => {
      if (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      ) {
        results.push({
          type: "Customer",
          name: user.name,
          detail: user.email,
          href: "/admin/users",
        });
      }
    });

    payments.forEach((payment) => {
      if (
        String(payment.id).includes(query) ||
        payment.status.toLowerCase().includes(query) ||
        getPaymentMethod(payment).toLowerCase().includes(query)
      ) {
        results.push({
          type: "Payment",
          name: `Payment #${payment.id}`,
          detail: `${getPaymentMethod(payment)} • ${payment.status}`,
          href: "/admin/payments",
        });
      }
    });

    return results.slice(0, 8);
  }, [search, orders, products, customers, payments]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

      case "SHIPPED":
        return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";

      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

      case "CANCELLED":
        return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";

      default:
        return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
    }
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700";

      case "PENDING":
        return "bg-amber-50 text-amber-700";

      case "FAILED":
        return "bg-rose-50 text-rose-700";

      case "CANCELLED":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "grid" as IconName,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: "bag" as IconName,
      badge: pendingOrders,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: "box" as IconName,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: "tag" as IconName,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: "users" as IconName,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: "chart" as IconName,
      active: true,
    },
  ];

  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Sales", totalSales.toFixed(2)],
      ["Paid Revenue", paidRevenue.toFixed(2)],
      ["Pending Revenue", pendingRevenue.toFixed(2)],
      ["Failed Revenue", failedRevenue.toFixed(2)],
      ["Total Orders", totalOrders],
      ["Average Order Value", averageOrderValue.toFixed(2)],
      ["Pending Orders", pendingOrders],
      ["Confirmed Orders", confirmedOrders],
      ["Shipped Orders", shippedOrders],
      ["Delivered Orders", deliveredOrders],
      ["Cancelled Orders", cancelledOrders],
      ["Total Payments", payments.length],
      ["Paid Payments", paidPayments.length],
      ["Pending Payments", pendingPayments.length],
      ["Failed Payments", failedPayments.length],
      ["Cash on Delivery", cashOnDeliveryPayments.length],
      ["Telebirr", telebirrPayments.length],
      ["Card", cardPayments.length],
      ["Total Users", users.length],
      ["Customers", customers.length],
      ["Admins", admins.length],
      ["Products", products.length],
      ["In Stock", inStock],
      ["Low Stock", lowStock],
      ["Out of Stock", outOfStock],
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
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

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-65 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20.5 items-center border-b border-slate-100 px-5">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <Icon name="store" size={21} />
            </div>

            <div>
              <p className="text-[19px] font-black tracking-tight text-slate-950">
                ShopEase
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Admin Panel
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Main menu
          </p>

          <nav className="space-y-1.5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                  item.active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    item.active
                      ? "bg-white/15"
                      : "bg-slate-50 group-hover:bg-white"
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                </span>

                <span className="text-sm font-bold">{item.name}</span>

                {item.badge && item.badge > 0 && (
                  <span
                    className={`ml-auto rounded-full px-2 py-1 text-[9px] font-black ${
                      item.active
                        ? "bg-white text-indigo-600"
                        : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="my-7 h-px bg-slate-100" />

          <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Store
          </p>

          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-white">
              <Icon name="store" size={18} />
            </span>

            <span className="text-sm font-bold">View storefront</span>
          </Link>

          <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-900">Analytics</p>

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                <Icon name="chart" size={14} />
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              Track revenue, payments, orders, customers and inventory
              performance.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-bold text-emerald-600">
                Live data
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">
                Administrator
              </p>

              <p className="truncate text-[10px] font-medium text-slate-400">
                Store manager
              </p>
            </div>

            <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="min-h-screen lg:pl-65">
        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-h-13 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
              >
                <Icon name="menu" size={19} />
              </button>

              <div className="min-w-0">
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 sm:block">
                  Business intelligence
                </p>

                <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Analytics & Reports
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden lg:block">
                <div className="flex h-11 w-57.5 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
                  <Icon name="search" size={18} />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <Icon name="x" size={15} />
                    </button>
                  )}
                </div>

                {searchOpen && search.trim() !== "" && (
                  <div className="absolute right-0 top-14 z-50 w-85 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Search results
                      </p>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="max-h-87.5 overflow-y-auto p-2">
                        {searchResults.map((result, index) => (
                          <Link
                            key={`${result.type}-${result.name}-${index}`}
                            href={result.href}
                            onClick={() => {
                              setSearch("");
                              setSearchOpen(false);
                            }}
                            className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              <Icon
                                name={
                                  result.type === "Order"
                                    ? "bag"
                                    : result.type === "Product"
                                      ? "box"
                                      : result.type === "Payment"
                                        ? "credit"
                                        : "users"
                                }
                                size={16}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-black text-slate-800">
                                {result.name}
                              </p>

                              <p className="truncate text-[10px] text-slate-400">
                                {result.detail}
                              </p>
                            </div>

                            <span className="text-[9px] font-bold text-slate-400">
                              {result.type}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Icon name="search" size={22} />

                        <p className="mt-3 text-sm font-bold text-slate-600">
                          No results found
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
              >
                <Icon name="search" size={18} />
              </button>

              {/* NOTIFICATIONS */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((value) => !value)}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm transition ${
                    notificationsOpen
                      ? "border-indigo-200 text-indigo-600 ring-4 ring-indigo-500/10"
                      : "border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                  }`}
                >
                  <Icon name="bell" size={19} />

                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[8px] font-black text-white">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="fixed inset-0 z-40 cursor-default bg-transparent"
                    />

                    <div className="absolute right-0 top-14 z-50 w-87.5 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Icon name="bell" size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-900">
                              Notifications
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {notificationCount === 0
                                ? "Everything looks good"
                                : `${notificationCount} item${
                                    notificationCount === 1 ? "" : "s"
                                  } need attention`}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setNotificationsOpen(false)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                        >
                          <Icon name="x" size={16} />
                        </button>
                      </div>

                      <div className="max-h-105 overflow-y-auto p-2">
                        {pendingOrders > 0 && (
                          <Link
                            href="/admin/orders"
                            onClick={() => setNotificationsOpen(false)}
                            className="group flex items-start gap-3 rounded-xl p-3 hover:bg-amber-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                              <Icon name="clock" size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between gap-2">
                                <p className="text-xs font-black">
                                  Pending orders
                                </p>

                                <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black text-amber-700">
                                  {pendingOrders}
                                </span>
                              </div>

                              <p className="mt-1 text-[10px] text-slate-400">
                                Orders are waiting for confirmation.
                              </p>
                            </div>
                          </Link>
                        )}

                        {notificationLowStockProducts.length > 0 && (
                          <Link
                            href="/admin/products"
                            onClick={() => setNotificationsOpen(false)}
                            className="group flex items-start gap-3 rounded-xl p-3 hover:bg-orange-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                              <Icon name="box" size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between">
                                <p className="text-xs font-black">Low stock</p>

                                <span className="rounded-full bg-orange-100 px-2 py-1 text-[9px] font-black text-orange-700">
                                  {lowStock}
                                </span>
                              </div>

                              <div className="mt-2 space-y-1">
                                {notificationLowStockProducts.map((product) => (
                                  <div
                                    key={product.id}
                                    className="flex justify-between gap-3"
                                  >
                                    <span className="truncate text-[10px] text-slate-500">
                                      {product.name}
                                    </span>

                                    <span className="text-[10px] font-black text-orange-600">
                                      {product.stock} left
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Link>
                        )}

                        {notificationOutOfStockProducts.length > 0 && (
                          <Link
                            href="/admin/products"
                            onClick={() => setNotificationsOpen(false)}
                            className="group flex items-start gap-3 rounded-xl p-3 hover:bg-rose-50"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                              <Icon name="alert" size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between">
                                <p className="text-xs font-black">
                                  Out of stock
                                </p>

                                <span className="rounded-full bg-rose-100 px-2 py-1 text-[9px] font-black text-rose-700">
                                  {outOfStock}
                                </span>
                              </div>

                              <div className="mt-2 space-y-1">
                                {notificationOutOfStockProducts.map(
                                  (product) => (
                                    <p
                                      key={product.id}
                                      className="truncate text-[10px] text-slate-500"
                                    >
                                      {product.name}
                                    </p>
                                  ),
                                )}
                              </div>
                            </div>
                          </Link>
                        )}

                        {notificationCount === 0 && (
                          <div className="px-5 py-10 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                              <Icon name="check" size={25} />
                            </div>

                            <p className="mt-4 text-sm font-black">
                              You&apos;re all caught up
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              There are no pending orders or inventory issues
                              right now.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={fetchAnalyticsData}
                disabled={loading}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-50"
              >
                <Icon name="refresh" size={17} />

                <span className="hidden sm:inline">
                  {loading ? "Loading..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="mt-3 lg:hidden">
              <div className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                <Icon name="search" size={18} />

                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders, products..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />

                <button
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                >
                  <Icon name="x" size={17} />
                </button>
              </div>

              {search.trim() !== "" && (
                <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <Link
                        key={`${result.type}-${result.name}-${index}`}
                        href={result.href}
                        onClick={() => {
                          setSearch("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Icon
                            name={
                              result.type === "Order"
                                ? "bag"
                                : result.type === "Product"
                                  ? "box"
                                  : result.type === "Payment"
                                    ? "credit"
                                    : "users"
                            }
                            size={16}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">
                            {result.name}
                          </p>

                          <p className="truncate text-[10px] text-slate-400">
                            {result.detail}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="p-5 text-center text-xs text-slate-400">
                      No results found.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </header>

        {/* CONTENT */}

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* HERO */}

          <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
            <div className="relative overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />

                    <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                      Live store analytics
                    </span>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Understand your
                    <br />
                    store performance.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                    Analyze sales, revenue, payments, orders, customers and
                    inventory using your store&apos;s real data.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-107.5">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <Icon name="dollar" size={19} />

                    <p className="mt-4 text-xl font-black">
                      {formatCurrency(paidRevenue)}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-white/60">
                      Paid revenue
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <Icon name="bag" size={19} />

                    <p className="mt-4 text-xl font-black">{totalOrders}</p>

                    <p className="mt-1 text-[10px] font-semibold text-white/60">
                      Orders
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <Icon name="users" size={19} />

                    <p className="mt-4 text-xl font-black">
                      {customers.length}
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-white/60">
                      Customers
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <Icon name="credit" size={19} />

                    <p className="mt-4 text-xl font-black">{payments.length}</p>

                    <p className="mt-1 text-[10px] font-semibold text-white/60">
                      Payments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PERIOD */}

          <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon name="calendar" size={19} />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Reporting period
                </p>

                <p className="text-[11px] text-slate-400">
                  Select the period you want to analyze
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["7D", "7 Days"],
                ["30D", "30 Days"],
                ["6M", "6 Months"],
                ["1Y", "1 Year"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setPeriod(value as Period)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                    period === value
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}

              <button
                type="button"
                onClick={exportReport}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                <Icon name="download" size={15} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </section>

          {/* SALES KPI */}

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Total sales
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {formatCurrency(totalSales)}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="trend" size={22} />
                </div>
              </div>

              <p className="mt-5 text-[10px] font-bold text-slate-400">
                Active orders excluding cancelled
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Total orders
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {totalOrders}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon name="bag" size={22} />
                </div>
              </div>

              <p className="mt-5 text-[10px] font-bold text-slate-400">
                All order statuses
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Average order value
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {formatCurrency(averageOrderValue)}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon name="dollar" size={22} />
                </div>
              </div>

              <p className="mt-5 text-[10px] font-bold text-slate-400">
                Average active order value
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Period paid revenue
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {formatCurrency(periodPaidRevenue)}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Icon name="activity" size={22} />
                </div>
              </div>

              <div className="mt-5">
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black ${
                    revenueChange >= 0
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {revenueChange >= 0 ? "+" : ""}
                  {revenueChange.toFixed(1)}%
                </span>

                <span className="ml-2 text-[10px] font-semibold text-slate-400">
                  vs previous period
                </span>
              </div>
            </div>
          </section>

          {/* REVENUE + ORDERS CHARTS */}

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* REVENUE CHART */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Revenue analytics
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Revenue over time
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Paid payment revenue
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon name="chart" size={21} />
                </div>
              </div>

              <div className="mt-8 flex h-70 items-end gap-2 sm:gap-4">
                {revenueChartData.map((item) => {
                  const height =
                    item.value > 0
                      ? Math.max((item.value / maxRevenueChartValue) * 100, 7)
                      : 3;

                  return (
                    <div
                      key={item.key}
                      className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                    >
                      <div className="relative flex h-full items-end justify-center">
                        <div
                          className="w-full max-w-14 rounded-t-xl bg-indigo-100 transition-all duration-500 group-hover:bg-indigo-600"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                        {item.value > 0 && (
                          <div className="absolute bottom-[calc(100%-8px)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-xl group-hover:block">
                            {formatCurrency(item.value)}
                          </div>
                        )}
                      </div>

                      <p className="mt-3 truncate text-center text-[10px] font-bold text-slate-400 sm:text-xs">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ORDERS CHART */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Order analytics
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Orders over time
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Active orders during the selected period
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="activity" size={21} />
                </div>
              </div>

              <div className="mt-8 flex h-70 items-end gap-2 sm:gap-4">
                {orderChartData.map((item) => {
                  const height =
                    item.value > 0
                      ? Math.max((item.value / maxOrderChartValue) * 100, 7)
                      : 3;

                  return (
                    <div
                      key={item.key}
                      className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                    >
                      <div className="relative flex h-full items-end justify-center">
                        <div
                          className="w-full max-w-14 rounded-t-xl bg-emerald-100 transition-all duration-500 group-hover:bg-emerald-500"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                        {item.value > 0 && (
                          <div className="absolute bottom-[calc(100%-8px)] left-1/2 hidden -translate-x-1/2 rounded-lg bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-xl group-hover:block">
                            {item.value}
                          </div>
                        )}
                      </div>

                      <p className="mt-3 truncate text-center text-[10px] font-bold text-slate-400 sm:text-xs">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* REVENUE STATUS */}

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Revenue</p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Payment revenue
              </h2>

              <div className="mt-7 space-y-4">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-emerald-700">
                      Paid
                    </span>

                    <Icon name="check" size={16} />
                  </div>

                  <p className="mt-2 text-2xl font-black text-emerald-700">
                    {formatCurrency(paidRevenue)}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-amber-700">
                      Pending
                    </span>

                    <Icon name="clock" size={16} />
                  </div>

                  <p className="mt-2 text-2xl font-black text-amber-700">
                    {formatCurrency(pendingRevenue)}
                  </p>
                </div>

                <div className="rounded-xl bg-rose-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-rose-700">
                      Failed
                    </span>

                    <Icon name="x" size={16} />
                  </div>

                  <p className="mt-2 text-2xl font-black text-rose-700">
                    {formatCurrency(failedRevenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* PAYMENT METHODS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Payment analytics
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Payment methods
              </h2>

              <div className="mt-7 flex justify-center">
                <div
                  className="relative flex h-48 w-48 items-center justify-center rounded-full"
                  style={{
                    background:
                      paymentMethodTotal > 0
                        ? `conic-gradient(
                            #4f46e5 0% ${cashPercentage}%,
                            #8b5cf6 ${cashPercentage}% ${
                              cashPercentage + telebirrPercentage
                            }%,
                            #10b981 ${cashPercentage + telebirrPercentage}% 100%
                          )`
                        : "#e2e8f0",
                  }}
                >
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-black">
                      {paymentMethodTotal}
                    </span>

                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Payments
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-2">
                {[
                  {
                    label: "Cash on Delivery",
                    value: cashOnDeliveryPayments.length,
                    color: "bg-indigo-500",
                    revenue: cashOnDeliveryPayments.reduce(
                      (sum, payment) => sum + getPaymentAmount(payment),
                      0,
                    ),
                  },
                  {
                    label: "Telebirr",
                    value: telebirrPayments.length,
                    color: "bg-violet-500",
                    revenue: telebirrPayments.reduce(
                      (sum, payment) => sum + getPaymentAmount(payment),
                      0,
                    ),
                  },
                  {
                    label: "Card",
                    value: cardPayments.length,
                    color: "bg-emerald-500",
                    revenue: cardPayments.reduce(
                      (sum, payment) => sum + getPaymentAmount(payment),
                      0,
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                      />

                      <span className="text-xs font-semibold text-slate-500">
                        {item.label}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">
                        {item.value}
                      </p>

                      <p className="text-[9px] text-slate-400">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYMENT STATUS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Payment status
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Payment overview
              </h2>

              <div className="mt-7 space-y-3">
                {[
                  {
                    label: "Paid",
                    value: paidPayments.length,
                    color: "bg-emerald-500",
                    amount: paidRevenue,
                  },
                  {
                    label: "Pending",
                    value: pendingPayments.length,
                    color: "bg-amber-500",
                    amount: pendingRevenue,
                  },
                  {
                    label: "Failed",
                    value: failedPayments.length,
                    color: "bg-rose-500",
                    amount: failedRevenue,
                  },
                  {
                    label: "Cancelled",
                    value: cancelledPayments.length,
                    color: "bg-slate-400",
                    amount: cancelledPayments.reduce(
                      (sum, payment) => sum + getPaymentAmount(payment),
                      0,
                    ),
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                        />

                        <span className="text-xs font-bold text-slate-600">
                          {item.label}
                        </span>
                      </div>

                      <span className="text-sm font-black text-slate-900">
                        {item.value}
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-black text-slate-900">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ORDER STATUS */}

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-sm font-semibold text-slate-500">
                Order analytics
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Order status distribution
              </h2>

              <div className="mt-8 flex justify-center">
                <div
                  className="relative flex h-48 w-48 items-center justify-center rounded-full"
                  style={{
                    background:
                      orders.length > 0
                        ? `conic-gradient(
                            #f59e0b 0% ${
                              (pendingOrders / orders.length) * 100
                            }%,
                            #3b82f6 ${(pendingOrders / orders.length) * 100}% ${
                              ((pendingOrders + confirmedOrders) /
                                orders.length) *
                              100
                            }%,
                            #8b5cf6 ${
                              ((pendingOrders + confirmedOrders) /
                                orders.length) *
                              100
                            }% ${
                              ((pendingOrders +
                                confirmedOrders +
                                shippedOrders) /
                                orders.length) *
                              100
                            }%,
                            #10b981 ${
                              ((pendingOrders +
                                confirmedOrders +
                                shippedOrders) /
                                orders.length) *
                              100
                            }% ${
                              ((pendingOrders +
                                confirmedOrders +
                                shippedOrders +
                                deliveredOrders) /
                                orders.length) *
                              100
                            }%,
                            #f43f5e ${
                              ((pendingOrders +
                                confirmedOrders +
                                shippedOrders +
                                deliveredOrders) /
                                orders.length) *
                              100
                            }% 100%
                          )`
                        : "#e2e8f0",
                  }}
                >
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                    <span className="text-4xl font-black text-slate-950">
                      {orders.length}
                    </span>

                    <span className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Total orders
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  {
                    label: "Pending",
                    value: pendingOrders,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Confirmed",
                    value: confirmedOrders,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Shipped",
                    value: shippedOrders,
                    color: "bg-violet-500",
                  },
                  {
                    label: "Delivered",
                    value: deliveredOrders,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Cancelled",
                    value: cancelledOrders,
                    color: "bg-rose-500",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                      />

                      <span className="text-xs font-semibold text-slate-500">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-xs font-black text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CUSTOMERS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Customer analytics
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Customer base
              </h2>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-indigo-50 p-4">
                  <p className="text-[10px] font-bold text-indigo-600">
                    Total users
                  </p>

                  <p className="mt-2 text-2xl font-black text-indigo-700">
                    {users.length}
                  </p>
                </div>

                <div className="rounded-xl bg-violet-50 p-4">
                  <p className="text-[10px] font-bold text-violet-600">
                    Customers
                  </p>

                  <p className="mt-2 text-2xl font-black text-violet-700">
                    {customers.length}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-[10px] font-bold text-orange-600">
                    Admins
                  </p>

                  <p className="mt-2 text-2xl font-black text-orange-700">
                    {admins.length}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2 flex justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    Customer share
                  </span>

                  <span className="text-[10px] font-black text-slate-700">
                    {users.length > 0
                      ? Math.round((customers.length / users.length) * 100)
                      : 0}
                    %
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
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

              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <Icon name="users" size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Registered customers
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Customers with CUSTOMER role
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INVENTORY */}

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Inventory analytics
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Stock health
                  </h2>
                </div>

                <Link
                  href="/admin/products"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-950 hover:text-white"
                >
                  <Icon name="arrow" size={15} />
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold text-emerald-600">
                    In stock
                  </p>

                  <p className="mt-2 text-2xl font-black text-emerald-700">
                    {inStock}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-[10px] font-bold text-amber-600">
                    Low stock
                  </p>

                  <p className="mt-2 text-2xl font-black text-amber-700">
                    {lowStock}
                  </p>
                </div>

                <div className="rounded-xl bg-rose-50 p-4">
                  <p className="text-[10px] font-bold text-rose-600">Out</p>

                  <p className="mt-2 text-2xl font-black text-rose-700">
                    {outOfStock}
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <div className="mb-2 flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Inventory availability</span>

                  <span>
                    {products.length > 0
                      ? Math.round((inStock / products.length) * 100)
                      : 0}
                    %
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${
                        products.length > 0
                          ? (inStock / products.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-7 divide-y divide-slate-100">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Icon name="box" size={18} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-slate-800">
                        {product.name}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Product #{product.id}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">
                        {product.stock}
                      </p>

                      <p
                        className={`text-[9px] font-bold ${
                          product.stock <= 0
                            ? "text-rose-500"
                            : product.stock <= 5
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }`}
                      >
                        {product.stock <= 0
                          ? "Out"
                          : product.stock <= 5
                            ? "Low"
                            : "Healthy"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KEY METRICS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Store performance
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Key metrics
              </h2>

              <div className="mt-7 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Icon name="check" size={15} />
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        Delivery completion
                      </span>
                    </div>

                    <span className="text-sm font-black text-slate-900">
                      {orders.length > 0
                        ? Math.round((deliveredOrders / orders.length) * 100)
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          orders.length > 0
                            ? (deliveredOrders / orders.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Icon name="truck" size={15} />
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        Fulfillment
                      </span>
                    </div>

                    <span className="text-sm font-black text-slate-900">
                      {orders.length > 0
                        ? Math.round(
                            ((shippedOrders + deliveredOrders) /
                              orders.length) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${
                          orders.length > 0
                            ? ((shippedOrders + deliveredOrders) /
                                orders.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <Icon name="credit" size={15} />
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        Payment success
                      </span>
                    </div>

                    <span className="text-sm font-black text-slate-900">
                      {payments.length > 0
                        ? Math.round(
                            (paidPayments.length / payments.length) * 100,
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{
                        width: `${
                          payments.length > 0
                            ? (paidPayments.length / payments.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                        <Icon name="box" size={15} />
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        Inventory health
                      </span>
                    </div>

                    <span className="text-sm font-black text-slate-900">
                      {products.length > 0
                        ? Math.round((inStock / products.length) * 100)
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{
                        width: `${
                          products.length > 0
                            ? (inStock / products.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Pending orders
                  </p>

                  <p className="mt-2 text-2xl font-black text-amber-700">
                    {pendingOrders}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Delivered
                  </p>

                  <p className="mt-2 text-2xl font-black text-emerald-700">
                    {deliveredOrders}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RECENT ORDERS */}

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Latest activity
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  Recent orders
                </h2>
              </div>

              <Link
                href="/admin/orders"
                className="flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-950 hover:text-white"
              >
                View all orders
                <Icon name="arrow" size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-180">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-700">
                            #{order.id}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-black text-indigo-600">
                              {(order.user?.name || "C")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="max-w-50">
                              <p className="truncate text-xs font-black text-slate-800">
                                {order.user?.name || "Customer"}
                              </p>

                              <p className="truncate text-[10px] text-slate-400">
                                {order.user?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-xs font-semibold text-slate-500">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-6 py-5 text-sm font-black text-slate-900">
                          {formatCurrency(Number(order.total || 0))}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black ${getStatusStyle(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Icon name="bag" size={22} />
                        </div>

                        <p className="mt-4 text-sm font-black text-slate-600">
                          No orders yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Orders will appear here when customers make purchases.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAYMENT SNAPSHOT */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Payment activity
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Latest payments
                </h2>
              </div>

              <Link
                href="/admin/payments"
                className="flex w-fit items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-950 hover:text-white"
              >
                Manage payments
                <Icon name="arrow" size={14} />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-[10px] font-bold text-emerald-600">Paid</p>

                <p className="mt-2 text-2xl font-black text-emerald-700">
                  {paidPayments.length}
                </p>

                <p className="mt-1 text-[10px] text-emerald-600">
                  {formatCurrency(paidRevenue)}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-[10px] font-bold text-amber-600">Pending</p>

                <p className="mt-2 text-2xl font-black text-amber-700">
                  {pendingPayments.length}
                </p>

                <p className="mt-1 text-[10px] text-amber-600">
                  {formatCurrency(pendingRevenue)}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-[10px] font-bold text-rose-600">Failed</p>

                <p className="mt-2 text-2xl font-black text-rose-700">
                  {failedPayments.length}
                </p>

                <p className="mt-1 text-[10px] text-rose-600">
                  {formatCurrency(failedRevenue)}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-4">
                <p className="text-[10px] font-bold text-indigo-600">
                  Total payments
                </p>

                <p className="mt-2 text-2xl font-black text-indigo-700">
                  {payments.length}
                </p>

                <p className="mt-1 text-[10px] text-indigo-600">
                  All payment records
                </p>
              </div>
            </div>
          </section>

          <div className="h-10" />
        </div>
      </main>
    </div>
  );
}
