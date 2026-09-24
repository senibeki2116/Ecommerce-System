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
  description: string;
  price: number;
  stock: number;
  image?: string | null;
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
  | "plus"
  | "warning"
  | "calendar"
  | "activity"
  | "chevron";

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

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          <path d="M10.3 3.8 2.4 17.5A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.5L13.7 3.8a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );

    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    default:
      return null;
  }
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="mt-4 h-8 w-32 rounded bg-slate-200" />
        <div className="mt-4 h-3 w-28 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const fetchDashboardData = async () => {
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

      const [ordersRes, usersRes, productsRes] = await Promise.all([
        fetch("http://localhost:3001/admin/orders", { headers }),
        fetch("http://localhost:3001/admin/users", { headers }),
        fetch("http://localhost:3001/products"),
      ]);

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
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalOrders = orders.length;

  const totalCustomers = users.filter(
    (user) => user.role === "CUSTOMER",
  ).length;

  const totalProducts = products.length;

  const totalSales = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

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
    (product) => Number(product.stock || 0) > 0,
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) <= 0,
  ).length;

  const inventoryHealth =
    totalProducts > 0 ? Math.round((inStockProducts / totalProducts) * 100) : 0;

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 6);
  }, [orders]);

  const lowStockList = useMemo(() => {
    return [...products]
      .filter((product) => Number(product.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 5);
  }, [products]);

  const monthlySales = useMemo(() => {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        name: date.toLocaleString("en-US", {
          month: "short",
        }),
        sales: 0,
        orders: 0,
      };
    });

    orders
      .filter((order) => order.status !== "CANCELLED")
      .forEach((order) => {
        const date = new Date(order.createdAt);

        const month = months.find(
          (item) => item.key === `${date.getFullYear()}-${date.getMonth()}`,
        );

        if (month) {
          month.sales += Number(order.total || 0);
          month.orders += 1;
        }
      });

    return months;
  }, [orders]);

  const maxMonthlySales = Math.max(
    ...monthlySales.map((month) => month.sales),
    1,
  );

  const totalStatusOrders =
    pendingOrders +
    confirmedOrders +
    shippedOrders +
    deliveredOrders +
    cancelledOrders;

  const statusPercent = (value: number) => {
    if (!totalStatusOrders) return 0;
    return Math.round((value / totalStatusOrders) * 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatShortDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200";

      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border border-blue-200";

      case "SHIPPED":
        return "bg-violet-50 text-violet-700 border border-violet-200";

      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";

      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border border-rose-200";

      default:
        return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  const filteredSearchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    const results: {
      type: string;
      name: string;
      href: string;
      detail: string;
    }[] = [];

    orders.forEach((order) => {
      const name = order.user?.name?.toLowerCase() || "";
      const email = order.user?.email?.toLowerCase() || "";

      if (
        String(order.id).includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        order.status.toLowerCase().includes(query)
      ) {
        results.push({
          type: "Order",
          name: `Order #${order.id}`,
          href: "/admin/orders",
          detail: order.user?.name || "Customer",
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
          href: "/admin/products",
          detail: `Stock: ${product.stock}`,
        });
      }
    });

    users.forEach((user) => {
      if (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      ) {
        results.push({
          type: "Customer",
          name: user.name,
          href: "/admin/users",
          detail: user.email,
        });
      }
    });

    return results.slice(0, 8);
  }, [search, orders, products, users]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: "grid" as IconName,
      active: true,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: "chart" as IconName,
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
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center border-b border-slate-100 px-5">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Icon name="store" size={20} />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-950">
                ShopEase
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Administration
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Main menu
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    item.active
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                </span>

                <span className="text-sm font-bold">{item.name}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto rounded-full bg-rose-100 px-2 py-1 text-[9px] font-black text-rose-600">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="my-6 h-px bg-slate-100" />

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Store
          </p>

          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
              <Icon name="store" size={18} />
            </span>

            <span className="text-sm font-bold">View storefront</span>

            <span className="ml-auto">
              <Icon name="arrow" size={14} />
            </span>
          </Link>

          <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <span className="text-xs font-black text-emerald-800">
                Store online
              </span>
            </div>

            <p className="mt-2 text-[10px] leading-5 text-emerald-700/70">
              Your ecommerce system is running normally.
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full w-[94%] rounded-full bg-emerald-500" />
            </div>

            <div className="mt-2 flex justify-between">
              <span className="text-[9px] font-bold text-emerald-700/60">
                System health
              </span>

              <span className="text-[9px] font-black text-emerald-700">
                94%
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-slate-900">
                Administrator
              </p>

              <p className="truncate text-[9px] text-slate-400">
                Store manager
              </p>
            </div>

            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="min-h-screen lg:pl-[250px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
              >
                <Icon name="menu" size={19} />
              </button>

              <div>
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 sm:block">
                  Store management
                </p>

                <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden lg:block">
                <div className="flex h-10 w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
                  <Icon name="search" size={17} />

                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                    placeholder="Search orders, products..."
                    className="min-w-0 flex-1 bg-transparent text-xs font-medium outline-none placeholder:text-slate-400"
                  />

                  {search && (
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setSearch("")}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  )}
                </div>

                {searchOpen && search.trim() !== "" && (
                  <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Search results
                      </p>
                    </div>

                    {filteredSearchResults.length > 0 ? (
                      <div className="max-h-[340px] overflow-y-auto p-2">
                        {filteredSearchResults.map((result, index) => (
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

                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase text-slate-500">
                              {result.type}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-8 text-center">
                        <Icon name="search" size={20} />
                        <p className="mt-3 text-xs font-bold text-slate-700">
                          No results found
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSearchOpen((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-indigo-200 hover:text-indigo-600 lg:hidden"
              >
                <Icon name="search" size={18} />
              </button>

              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-indigo-200 hover:text-indigo-600">
                <Icon name="bell" size={18} />

                {pendingOrders > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </button>

              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Icon name="refresh" size={16} />

                <span className="hidden sm:inline">
                  {loading ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="pb-3 lg:hidden">
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:bg-white">
                <Icon name="search" size={17} />

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
                  <Icon name="x" size={16} />
                </button>
              </div>

              {search.trim() !== "" && (
                <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  {filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((result, index) => (
                      <Link
                        key={`${result.type}-${result.name}-${index}`}
                        href={result.href}
                        onClick={() => {
                          setSearch("");
                          setSearchOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Icon
                            name={
                              result.type === "Order"
                                ? "bag"
                                : result.type === "Product"
                                  ? "box"
                                  : "users"
                            }
                            size={16}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-black">
                            {result.name}
                          </p>

                          <p className="truncate text-[10px] text-slate-400">
                            {result.detail}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-5 text-center text-xs text-slate-400">
                      No results found.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* WELCOME */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                    Store is online
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Welcome back, Administrator
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Monitor your store, manage orders, review inventory and track
                  your ecommerce activity from one dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin/orders"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-indigo-700"
                >
                  Review orders
                  <Icon name="arrow" size={14} />
                </Link>

                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  <Icon name="chart" size={15} />
                  Analytics
                </Link>
              </div>
            </div>
          </section>

          {/* KPI CARDS */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              <>
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Total revenue
                      </p>

                      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                        {formatCurrency(totalSales)}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Active order revenue
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Icon name="trend" size={21} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Total orders
                      </p>

                      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                        {totalOrders}
                      </p>

                      <p className="mt-2 text-xs text-amber-600">
                        {pendingOrders} pending
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon name="bag" size={21} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Customers
                      </p>

                      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                        {totalCustomers}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Registered customers
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Icon name="users" size={21} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Products
                      </p>

                      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                        {totalProducts}
                      </p>

                      <p className="mt-2 text-xs">
                        <span className="font-bold text-emerald-600">
                          {inStockProducts} in stock
                        </span>
                        <span className="mx-1 text-slate-300">•</span>
                        <span className="font-bold text-rose-500">
                          {outOfStockProducts} out
                        </span>
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon name="box" size={21} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* ANALYTICS */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
            {/* REVENUE CHART */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Performance
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Revenue overview
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">Last six months</p>
                </div>

                <Link
                  href="/admin/analytics"
                  className="hidden items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 sm:flex"
                >
                  Analytics
                  <Icon name="arrow" size={13} />
                </Link>
              </div>

              <div className="mt-8 flex h-[250px] items-end gap-3 sm:gap-5">
                {monthlySales.map((month) => {
                  const height =
                    month.sales > 0
                      ? Math.max((month.sales / maxMonthlySales) * 100, 8)
                      : 4;

                  return (
                    <div
                      key={month.key}
                      className="group flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="relative flex h-full items-end justify-center">
                        <div
                          className="w-full max-w-14 rounded-t-xl bg-indigo-100 transition-all duration-300 group-hover:bg-indigo-500"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                        {month.sales > 0 && (
                          <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[9px] font-bold text-white shadow-lg group-hover:block">
                            {formatCurrency(month.sales)}
                          </div>
                        )}
                      </div>

                      <p className="mt-3 text-center text-[11px] font-bold text-slate-400">
                        {month.name}
                      </p>

                      <p className="mt-1 text-center text-[9px] text-slate-300">
                        {month.orders} orders
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Revenue
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    {formatCurrency(totalSales)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Avg. order
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    {formatCurrency(averageOrderValue)}
                  </p>
                </div>

                <div className="col-span-2 rounded-xl bg-slate-50 p-3 sm:col-span-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Six months
                  </p>

                  <p className="mt-1 text-sm font-black text-indigo-600">
                    {monthlySales.reduce((sum, month) => sum + month.orders, 0)}{" "}
                    orders
                  </p>
                </div>
              </div>
            </div>

            {/* ORDER STATUS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order workflow
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Order status
              </h2>

              <div className="mt-7 flex justify-center">
                <div
                  className="relative flex h-44 w-44 items-center justify-center rounded-full"
                  style={{
                    background:
                      totalStatusOrders > 0
                        ? `conic-gradient(
                          #f59e0b 0% ${statusPercent(pendingOrders)}%,
                          #3b82f6 ${statusPercent(
                            pendingOrders,
                          )}% ${statusPercent(
                            pendingOrders + confirmedOrders,
                          )}%,
                          #8b5cf6 ${statusPercent(
                            pendingOrders + confirmedOrders,
                          )}% ${statusPercent(
                            pendingOrders + confirmedOrders + shippedOrders,
                          )}%,
                          #10b981 ${statusPercent(
                            pendingOrders + confirmedOrders + shippedOrders,
                          )}% ${statusPercent(
                            pendingOrders +
                              confirmedOrders +
                              shippedOrders +
                              deliveredOrders,
                          )}%,
                          #f43f5e ${statusPercent(
                            pendingOrders +
                              confirmedOrders +
                              shippedOrders +
                              deliveredOrders,
                          )}% 100%
                        )`
                        : "#e2e8f0",
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-black text-slate-950">
                      {totalOrders}
                    </span>

                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Orders
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2">
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
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />

                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-sm font-black text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Shortcuts
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Quick actions
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Manage Orders",
                  text: "Review and update orders",
                  href: "/admin/orders",
                  icon: "bag" as IconName,
                  bg: "bg-blue-50",
                  color: "text-blue-600",
                },
                {
                  title: "Add Product",
                  text: "Create a new product",
                  href: "/admin/products",
                  icon: "plus" as IconName,
                  bg: "bg-emerald-50",
                  color: "text-emerald-600",
                },
                {
                  title: "Categories",
                  text: "Organize your catalog",
                  href: "/admin/categories",
                  icon: "tag" as IconName,
                  bg: "bg-orange-50",
                  color: "text-orange-600",
                },
                {
                  title: "Customers",
                  text: "Manage customer accounts",
                  href: "/admin/users",
                  icon: "users" as IconName,
                  bg: "bg-violet-50",
                  color: "text-violet-600",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                  >
                    <Icon name={item.icon} size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    <Icon name="arrow" size={14} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ORDERS + INVENTORY */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
            {/* RECENT ORDERS */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Latest activity
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Recent orders
                  </h2>
                </div>

                <Link
                  href="/admin/orders"
                  className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  View all
                  <Icon name="arrow" size={13} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Order
                      </th>

                      <th className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Customer
                      </th>

                      <th className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Amount
                      </th>

                      <th className="px-6 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-slate-100 hover:bg-slate-50 last:border-0"
                        >
                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-700">
                              #{order.id}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-black text-indigo-600">
                                {(order.user?.name || "C")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="max-w-[180px]">
                                <p className="truncate text-xs font-black text-slate-800">
                                  {order.user?.name || "Customer"}
                                </p>

                                <p className="truncate text-[9px] text-slate-400">
                                  {order.user?.email || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Icon name="calendar" size={12} />
                              {formatShortDate(order.createdAt)}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm font-black text-slate-900">
                              {formatCurrency(Number(order.total || 0))}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black ${getStatusStyle(
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
                        <td colSpan={5} className="px-6 py-14 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Icon name="bag" size={20} />
                          </div>

                          <p className="mt-3 text-sm font-black text-slate-700">
                            No orders yet
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Customer orders will appear here.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INVENTORY */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Inventory
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      Stock health
                    </h2>
                  </div>

                  <Link
                    href="/admin/products"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <Icon name="arrow" size={14} />
                  </Link>
                </div>

                <div className="mt-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-slate-950">
                        {inventoryHealth}%
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Products currently in stock
                      </p>
                    </div>

                    <Icon name="box" size={25} />
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: `${inventoryHealth}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                <div className="px-3 py-4 text-center">
                  <p className="text-lg font-black text-emerald-600">
                    {inStockProducts}
                  </p>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    In stock
                  </p>
                </div>

                <div className="px-3 py-4 text-center">
                  <p className="text-lg font-black text-amber-600">
                    {lowStockProducts}
                  </p>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    Low stock
                  </p>
                </div>

                <div className="px-3 py-4 text-center">
                  <p className="text-lg font-black text-rose-500">
                    {outOfStockProducts}
                  </p>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    Out
                  </p>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="warning" size={15} />

                    <p className="text-xs font-black text-slate-700">
                      Inventory alerts
                    </p>
                  </div>

                  {lowStockProducts > 0 && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-600">
                      {lowStockProducts} alerts
                    </span>
                  )}
                </div>

                {lowStockList.length > 0 ? (
                  <div className="space-y-2">
                    {lowStockList.map((product) => (
                      <Link
                        key={product.id}
                        href="/admin/products"
                        className="group flex items-center gap-3 rounded-xl bg-slate-50 p-3 hover:bg-slate-100"
                      >
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <Icon name="box" size={15} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-slate-800">
                            {product.name}
                          </p>

                          <p className="mt-1 text-[9px] text-slate-400">
                            Product #{product.id}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm font-black ${
                              product.stock <= 0
                                ? "text-rose-500"
                                : "text-amber-600"
                            }`}
                          >
                            {product.stock}
                          </p>

                          <p className="text-[8px] text-slate-400">units</p>
                        </div>

                        <Icon name="chevron" size={13} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 p-5 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600">
                      <Icon name="check" size={17} />
                    </div>

                    <p className="mt-3 text-xs font-black text-emerald-700">
                      Inventory looks good
                    </p>

                    <p className="mt-1 text-[10px] text-emerald-600/70">
                      No low-stock products detected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ORDER SUMMARY */}
          <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Icon name="clock" size={19} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">
                    Pending orders
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-950">
                    {pendingOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="check" size={19} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">Confirmed</p>

                  <p className="mt-1 text-xl font-black text-slate-950">
                    {confirmedOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon name="truck" size={19} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">Shipped</p>

                  <p className="mt-1 text-xl font-black text-slate-950">
                    {shippedOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="check" size={19} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400">Delivered</p>

                  <p className="mt-1 text-xl font-black text-slate-950">
                    {deliveredOrders}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}
