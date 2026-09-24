"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = "http://localhost:3001";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  categoryId?: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
};

type IconName =
  | "grid"
  | "chart"
  | "bag"
  | "box"
  | "users"
  | "tag"
  | "menu"
  | "x"
  | "search"
  | "bell"
  | "refresh"
  | "plus"
  | "edit"
  | "trash"
  | "eye"
  | "filter"
  | "chevron"
  | "alert"
  | "check"
  | "dollar"
  | "external"
  | "more";

function Icon({
  name,
  size = 20,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
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

    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 4-4 3 2 5-6" />
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
          <path d="m21 8-9 5-9-5 9-5 9 5Z" />
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
          <path d="M20.59 13.41 11 3.83A2.83 2.83 0 0 0 9 3H4a1 1 0 0 0-1 1v5a2.83 2.83 0 0 0 .83 2l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z" />
          <circle cx="7.5" cy="7.5" r="1" />
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

    case "x":
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" />
          <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 15H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );

    case "filter":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case "alert":
      return (
        <svg {...common}>
          <path d="M10.3 3.3 2.2 17a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "dollar":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6v12" />
          <path d="M15 9.5c-.7-.7-1.7-1.1-3-1.1-1.7 0-3 1-3 2.3s1.2 2 3 2.3 3 1 3 2.3-1.3 2.3-3 2.3c-1.3 0-2.3-.4-3-1.1" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="M10 14 20 4" />
          <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
        </svg>
      );

    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      );

    default:
      return null;
  }
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "grid" as IconName },
  { label: "Analytics", href: "/admin/analytics", icon: "chart" as IconName },
  { label: "Orders", href: "/admin/orders", icon: "bag" as IconName },
  { label: "Products", href: "/admin/products", icon: "box" as IconName },
  { label: "Categories", href: "/admin/categories", icon: "tag" as IconName },
  { label: "Users", href: "/admin/users", icon: "users" as IconName },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getImage(product: Product) {
  return (
    product.image ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
  );
}

function getStockStatus(stock: number) {
  if (stock <= 0) {
    return {
      label: "Out of stock",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      dot: "bg-rose-500",
    };
  }

  if (stock <= 5) {
    return {
      label: "Low stock",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    };
  }

  return {
    label: "In stock",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_URL}/products`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/categories`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (!productsResponse.ok) {
        throw new Error("Unable to load products.");
      }

      const productsData = await productsResponse.json();

      let categoriesData: unknown = [];

      if (categoriesResponse.ok) {
        categoriesData = await categoriesResponse.json();
      }

      const normalizedProducts = Array.isArray(productsData)
        ? productsData
        : Array.isArray(productsData?.products)
          ? productsData.products
          : Array.isArray(productsData?.data)
            ? productsData.data
            : [];

      const normalizedCategories = Array.isArray(categoriesData)
        ? categoriesData
        : Array.isArray(
              (categoriesData as { categories?: unknown })?.categories,
            )
          ? (categoriesData as { categories: Category[] }).categories
          : Array.isArray((categoriesData as { data?: unknown })?.data)
            ? (categoriesData as { data: Category[] }).data
            : [];

      setProducts(normalizedProducts);
      setCategories(normalizedCategories);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const category = product.category?.name?.toLowerCase() || "";
        const id = String(product.id);

        return (
          name.includes(query) ||
          description.includes(query) ||
          category.includes(query) ||
          id.includes(query)
        );
      });
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (product) =>
          String(product.categoryId) === categoryFilter ||
          String(product.category?.id) === categoryFilter,
      );
    }

    if (stockFilter === "in-stock") {
      result = result.filter((product) => product.stock > 5);
    }

    if (stockFilter === "low-stock") {
      result = result.filter(
        (product) => product.stock > 0 && product.stock <= 5,
      );
    }

    if (stockFilter === "out-of-stock") {
      result = result.filter((product) => product.stock <= 0);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);

        case "price-low":
          return Number(a.price) - Number(b.price);

        case "price-high":
          return Number(b.price) - Number(a.price);

        case "stock-low":
          return Number(a.stock) - Number(b.stock);

        case "stock-high":
          return Number(b.stock) - Number(a.stock);

        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

    return result;
  }, [products, search, categoryFilter, stockFilter, sortBy]);

  const statistics = useMemo(() => {
    const totalUnits = products.reduce(
      (sum, product) => sum + Number(product.stock || 0),
      0,
    );

    const lowStock = products.filter(
      (product) => product.stock > 0 && product.stock <= 5,
    ).length;

    const outOfStock = products.filter((product) => product.stock <= 0).length;

    const inStock = products.filter((product) => product.stock > 5).length;

    const inventoryValue = products.reduce(
      (sum, product) =>
        sum + Number(product.price || 0) * Number(product.stock || 0),
      0,
    );

    return {
      totalProducts: products.length,
      totalUnits,
      lowStock,
      outOfStock,
      inStock,
      inventoryValue,
    };
  }, [products]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter("all");
    setSortBy("newest");
  };

  const deleteSelectedProduct = async () => {
    if (!deleteProduct) return;

    try {
      setDeleting(true);
      setDeleteMessage("");

      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}/products/${deleteProduct.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Unable to delete this product.");
      }

      setProducts((current) =>
        current.filter((product) => product.id !== deleteProduct.id),
      );

      setDeleteMessage("Product deleted successfully.");

      setTimeout(() => {
        setDeleteProduct(null);
        setDeleteMessage("");
      }, 900);
    } catch (error) {
      setDeleteMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* BRAND */}
        <div className="flex h-[76px] items-center border-b border-slate-200 px-5">
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <Icon name="box" size={20} strokeWidth={2.2} />
            </div>

            <div>
              <p className="text-[17px] font-black tracking-tight text-slate-950">
                ShopEase
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Administration
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Navigation
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = item.href === "/admin/products";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={
                      active
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-700"
                    }
                  >
                    <Icon name={item.icon} size={18} />
                  </span>

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="my-6 border-t border-slate-100" />

          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Store
          </p>

          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="text-slate-400 group-hover:text-indigo-600">
              <Icon name="external" size={17} />
            </span>
            View storefront
          </Link>
        </div>

        {/* SYSTEM */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />

              <span className="text-xs font-bold text-emerald-800">
                System online
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-emerald-700/70">
              Product management system is operating normally.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="min-h-screen lg:pl-64">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
          <div className="flex min-h-[76px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 lg:hidden"
              aria-label="Open navigation"
            >
              <Icon name="menu" size={19} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
                <span>Admin</span>
                <span>/</span>
                <span>Catalog</span>
                <span>/</span>
                <span className="font-semibold text-indigo-600">Products</span>
              </div>

              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Products
              </h1>
            </div>

            {/* DESKTOP SEARCH */}
            <div className="hidden w-[280px] lg:block xl:w-[340px]">
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="search" size={17} />
                </div>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <Icon name="x" size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* REFRESH */}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
              title="Refresh products"
            >
              <span className={refreshing ? "animate-spin" : ""}>
                <Icon name="refresh" size={17} />
              </span>
            </button>

            {/* ORDERS */}
            <Link
              href="/admin/orders"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              title="Orders"
            >
              <Icon name="bell" size={17} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </Link>
          </div>

          {/* MOBILE SEARCH */}
          <div className="border-t border-slate-100 px-4 py-3 lg:hidden">
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name="search" size={17} />
              </div>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          {/* HERO / PAGE INTRO */}
          <section className="relative mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-r from-indigo-50 via-white to-violet-50 p-5 shadow-sm sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-indigo-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Catalog management
                </div>

                <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Manage your products
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Manage your product catalog, pricing, inventory levels and
                  availability from one clean workspace.
                </p>
              </div>

              <Link
                href="/admin/products/new"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
              >
                <Icon name="plus" size={18} />
                Add Product
              </Link>
            </div>
          </section>

          {/* STATISTICS */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {/* PRODUCTS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Products
                  </p>

                  <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    {loading ? "—" : statistics.totalProducts}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                  <Icon name="box" size={19} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">Total catalog items</p>
            </div>

            {/* UNITS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Stock units
                  </p>

                  <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    {loading ? "—" : statistics.totalUnits.toLocaleString()}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">
                  <Icon name="box" size={19} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Available inventory units
              </p>
            </div>

            {/* LOW STOCK */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Low stock
                  </p>

                  <p className="mt-2 text-2xl font-black tracking-tight text-amber-600">
                    {loading ? "—" : statistics.lowStock}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                  <Icon name="alert" size={19} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">1–5 units remaining</p>
            </div>

            {/* INVENTORY VALUE */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Inventory value
                  </p>

                  <p className="mt-2 truncate text-2xl font-black tracking-tight text-slate-950">
                    {loading ? "—" : formatPrice(statistics.inventoryValue)}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                  <Icon name="dollar" size={19} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Current stock × price
              </p>
            </div>
          </section>

          {/* INVENTORY STATUS */}
          <section className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="check" size={17} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Healthy stock
                  </p>

                  <p className="mt-0.5 text-xl font-black text-slate-900">
                    {statistics.inStock}
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  Good
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Icon name="alert" size={17} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Need restock
                  </p>

                  <p className="mt-0.5 text-xl font-black text-slate-900">
                    {statistics.lowStock}
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                  Attention
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon name="alert" size={17} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Out of stock
                  </p>

                  <p className="mt-0.5 text-xl font-black text-slate-900">
                    {statistics.outOfStock}
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                  Urgent
                </span>
              </div>
            </div>
          </section>

          {/* FILTER BAR */}
          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name="filter" size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Product filters
                    </h3>

                    <p className="text-xs text-slate-400">
                      Showing {filteredProducts.length} of {products.length}{" "}
                      products
                    </p>
                  </div>
                </div>

                {(search ||
                  categoryFilter !== "all" ||
                  stockFilter !== "all" ||
                  sortBy !== "newest") && (
                  <button
                    onClick={clearFilters}
                    className="w-fit rounded-lg px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* CATEGORY */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  Category
                </label>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="all">All categories</option>

                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="chevron" size={15} />
                  </span>
                </div>
              </div>

              {/* STOCK */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  Stock status
                </label>

                <div className="relative">
                  <select
                    value={stockFilter}
                    onChange={(event) => setStockFilter(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="all">All stock</option>
                    <option value="in-stock">Healthy stock</option>
                    <option value="low-stock">Low stock</option>
                    <option value="out-of-stock">Out of stock</option>
                  </select>

                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="chevron" size={15} />
                  </span>
                </div>
              </div>

              {/* SORT */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  Sort by
                </label>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="newest">Newest first</option>
                    <option value="name">Name A–Z</option>
                    <option value="price-low">Price low to high</option>
                    <option value="price-high">Price high to low</option>
                    <option value="stock-low">Stock low to high</option>
                    <option value="stock-high">Stock high to low</option>
                  </select>

                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="chevron" size={15} />
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* PRODUCTS */}
          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-950">
                    All products
                  </h3>

                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                    Catalog
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Product inventory and catalog management
                </p>
              </div>

              <span className="w-fit rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                {filteredProducts.length} results
              </span>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Product
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Stock
                    </th>

                    <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array.from({ length: 7 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td colSpan={6} className="px-5 py-5">
                          <div className="flex animate-pulse items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-100" />

                            <div className="space-y-2">
                              <div className="h-3.5 w-52 rounded bg-slate-100" />
                              <div className="h-3 w-32 rounded bg-slate-100" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-20 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                            <Icon name="box" size={27} />
                          </div>

                          <h3 className="mt-5 text-base font-bold text-slate-900">
                            No products found
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            No products match your current search or filters.
                          </p>

                          <button
                            onClick={clearFilters}
                            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const stock = getStockStatus(Number(product.stock || 0));

                      return (
                        <tr
                          key={product.id}
                          className="group border-b border-slate-100 transition last:border-0 hover:bg-indigo-50/30"
                        >
                          {/* PRODUCT */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                                <img
                                  src={getImage(product)}
                                  alt={product.name}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[300px] truncate text-sm font-bold text-slate-900">
                                  {product.name}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-400">
                                  Product ID #{product.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY */}
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                              {product.category?.name || "Uncategorized"}
                            </span>
                          </td>

                          {/* PRICE */}
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-slate-900">
                              {formatPrice(Number(product.price || 0))}
                            </span>
                          </td>

                          {/* STOCK */}
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {Number(product.stock || 0).toLocaleString()}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                units available
                              </p>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold ${stock.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${stock.dot}`}
                              />

                              {stock.label}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                title="View product"
                              >
                                <Icon name="eye" size={15} />
                              </button>

                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                title="Edit product"
                              >
                                <Icon name="edit" size={15} />
                              </Link>

                              <button
                                onClick={() => setDeleteProduct(product)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                                title="Delete product"
                              >
                                <Icon name="trash" size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="grid gap-3 p-3 lg:hidden">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded-xl bg-slate-100" />

                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-2/3 rounded bg-slate-100" />
                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400">
                    <Icon name="box" size={25} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    No products found
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Try changing your filters.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const stock = getStockStatus(Number(product.stock || 0));

                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex gap-3">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          <img
                            src={getImage(product)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-slate-900">
                                {product.name}
                              </h3>

                              <p className="mt-1 text-xs text-slate-400">
                                #{product.id} •{" "}
                                {product.category?.name || "Uncategorized"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${stock.className}`}
                            >
                              {stock.label}
                            </span>
                          </div>

                          <div className="mt-4 flex items-end justify-between gap-3">
                            <div>
                              <p className="text-base font-black text-slate-950">
                                {formatPrice(Number(product.price || 0))}
                              </p>

                              <p className="mt-1 text-xs font-medium text-slate-400">
                                {Number(product.stock || 0)} units
                              </p>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600"
                                title="View"
                              >
                                <Icon name="eye" size={15} />
                              </button>

                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600"
                                title="Edit"
                              >
                                <Icon name="edit" size={15} />
                              </Link>

                              <button
                                onClick={() => setDeleteProduct(product)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                                title="Delete"
                              >
                                <Icon name="trash" size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* INVENTORY WARNING */}
          {(statistics.lowStock > 0 || statistics.outOfStock > 0) && (
            <section className="mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 shadow-sm">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                    <Icon name="alert" size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Inventory attention required
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {statistics.outOfStock > 0 &&
                        `${statistics.outOfStock} out of stock`}
                      {statistics.outOfStock > 0 &&
                        statistics.lowStock > 0 &&
                        " and "}
                      {statistics.lowStock > 0 &&
                        `${statistics.lowStock} low stock`}
                      .
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setStockFilter("low-stock")}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Review inventory
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* VIEW PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />

                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                    Product details
                  </p>
                </div>

                <h2 className="mt-1 text-lg font-black text-slate-950">
                  {selectedProduct.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
              >
                <Icon name="x" size={17} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                {/* IMAGE */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                  <img
                    src={getImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="aspect-square h-full w-full object-cover"
                  />
                </div>

                {/* DETAILS */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                      {selectedProduct.category?.name || "Uncategorized"}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                        getStockStatus(selectedProduct.stock).className
                      }`}
                    >
                      {getStockStatus(selectedProduct.stock).label}
                    </span>
                  </div>

                  <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    {selectedProduct.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {selectedProduct.description ||
                      "No product description available."}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-400">
                        Price
                      </p>

                      <p className="mt-1 text-lg font-black text-slate-950">
                        {formatPrice(Number(selectedProduct.price || 0))}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-400">
                        Stock
                      </p>

                      <p className="mt-1 text-lg font-black text-slate-950">
                        {Number(selectedProduct.stock || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-400">
                      Product ID
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-950">
                      #{selectedProduct.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5">
                <Link
                  href={`/admin/products/${selectedProduct.id}/edit`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Icon name="edit" size={16} />
                  Edit product
                </Link>

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Icon name="trash" size={20} />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Delete product
                </h2>

                <p className="text-xs text-slate-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                You are deleting:
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <img
                    src={getImage(deleteProduct)}
                    alt={deleteProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {deleteProduct.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Product #{deleteProduct.id}
                  </p>
                </div>
              </div>
            </div>

            {deleteMessage && (
              <div
                className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
                  deleteMessage.includes("successfully")
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {deleteMessage}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  if (!deleting) {
                    setDeleteProduct(null);
                    setDeleteMessage("");
                  }
                }}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={deleteSelectedProduct}
                disabled={deleting}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
