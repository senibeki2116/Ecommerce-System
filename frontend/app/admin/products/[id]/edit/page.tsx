"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/* =========================================================
   TYPES
========================================================= */

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
};

/* =========================================================
   ICON
========================================================= */

function Icon({
  name,
  size = 20,
  strokeWidth = 2,
}: {
  name: string;
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
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="m7 16 4-5 3 3 6-8" />
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
          <path d="M20.59 13.41 13.4 20.6a2 2 0 0 1-2.83 0L3.4 13.41a2 2 0 0 1 0-2.82L10.6 3.4A2 2 0 0 1 12 2.83H19a2 2 0 0 1 2 2v7a2 2 0 0 1-.41 1.58Z" />
          <circle cx="16.5" cy="7.5" r="1" />
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
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );

    case "arrow-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
          <path d="M9 12h12" />
        </svg>
      );

    case "save":
      return (
        <svg {...common}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
          <path d="M17 21v-8H7v8" />
          <path d="M7 3v5h8" />
        </svg>
      );

    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );

    case "alert":
      return (
        <svg {...common}>
          <path d="M10.3 3.9 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
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

    case "chevron":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M14 3h7v7" />
          <path d="M10 14 21 3" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  /* =======================================================
     STATE
  ======================================================= */

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =======================================================
     FETCH PRODUCT + CATEGORIES
  ======================================================= */

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        if (!token) {
          setError("You are not authenticated. Please log in again.");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [productResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_URL}/products/${productId}`, {
            headers,
          }),
          fetch(`${API_URL}/categories`, {
            headers,
          }),
        ]);

        /* ===================================================
           PRODUCT RESPONSE
        =================================================== */

        if (!productResponse.ok) {
          let message = "Failed to load product.";

          try {
            const data = await productResponse.json();

            if (Array.isArray(data?.message)) {
              message = data.message.join(", ");
            } else if (data?.message) {
              message = data.message;
            }
          } catch {
            // Ignore invalid JSON response
          }

          throw new Error(message);
        }

        const productData = await productResponse.json();

        const loadedProduct: Product =
          productData?.product ?? productData?.data ?? productData;

        if (!loadedProduct || !loadedProduct.id) {
          throw new Error("Product data was not found.");
        }

        setProduct(loadedProduct);

        setName(loadedProduct.name ?? "");
        setDescription(loadedProduct.description ?? "");
        setPrice(
          loadedProduct.price !== undefined ? String(loadedProduct.price) : "",
        );
        setStock(
          loadedProduct.stock !== undefined ? String(loadedProduct.stock) : "",
        );
        setImage(loadedProduct.image ?? "");

        if (loadedProduct.categoryId !== undefined) {
          setCategoryId(String(loadedProduct.categoryId));
        }

        /* ===================================================
           CATEGORY RESPONSE
        =================================================== */

        if (categoriesResponse.ok) {
          const categoryData = await categoriesResponse.json();

          const categoryList: Category[] = Array.isArray(categoryData)
            ? categoryData
            : Array.isArray(categoryData?.categories)
              ? categoryData.categories
              : Array.isArray(categoryData?.data)
                ? categoryData.data
                : [];

          setCategories(categoryList);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the product.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* =====================================================
       VALIDATION
    ===================================================== */

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Product name is required.");
      return;
    }

    if (!trimmedDescription) {
      setError("Product description is required.");
      return;
    }

    if (price.trim() === "") {
      setError("Product price is required.");
      return;
    }

    if (stock.trim() === "") {
      setError("Product stock is required.");
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Price must be a valid number greater than or equal to 0.");
      return;
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Stock must be a whole number greater than or equal to 0.");
      return;
    }

    try {
      setSaving(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (!token) {
        setError("You are not authenticated. Please log in again.");
        setSaving(false);
        return;
      }

      const body = {
        name: trimmedName,
        description: trimmedDescription,
        price: numericPrice,
        stock: numericStock,
        image: image.trim() || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      };

      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let message = "Failed to update product.";

        if (Array.isArray(data?.message)) {
          message = data.message.join(", ");
        } else if (data?.message) {
          message = data.message;
        }

        throw new Error(message);
      }

      setSuccess("Product updated successfully.");

      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the product.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     IMAGE ERROR HANDLER
  ======================================================= */

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = "none";
  };

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          {/* Sidebar Skeleton */}
          <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
            <div className="p-6">
              <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
            </div>

            <div className="space-y-3 px-4 pt-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-11 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
            </div>

            <div className="mx-auto max-w-6xl p-6">
              <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="h-125 animate-pulse rounded-2xl bg-white shadow-sm lg:col-span-2" />
                <div className="h-125 animate-pulse rounded-2xl bg-white shadow-sm" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR / PRODUCT NOT FOUND
  ======================================================= */

  if (!product && error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
            <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                <Icon name="box" size={21} />
              </div>

              <div>
                <h1 className="text-lg font-bold text-slate-900">E-Shop</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>

            <nav className="space-y-1 p-4">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon name="grid" size={19} />
                Dashboard
              </Link>

              <Link
                href="/admin/analytics"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon name="chart" size={19} />
                Analytics
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon name="bag" size={19} />
                Orders
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700"
              >
                <Icon name="box" size={19} />
                Products
              </Link>

              <Link
                href="/admin/categories"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon name="tag" size={19} />
                Categories
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Icon name="users" size={19} />
                Users
              </Link>
            </nav>
          </aside>

          <main className="flex-1">
            <header className="flex h-20 items-center border-b border-slate-200 bg-white px-5 lg:px-8">
              <button
                onClick={() => router.push("/admin/products")}
                className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Back"
              >
                <Icon name="arrow-left" size={21} />
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Admin / Products
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Product
                </h2>
              </div>
            </header>

            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
              <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Icon name="alert" size={25} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Unable to load product
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

                <Link
                  href="/admin/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Icon name="arrow-left" size={17} />
                  Back to Products
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================
          MOBILE SIDEBAR OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:block lg:w-64 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
            <Link
              href="/admin"
              className="flex items-center gap-3"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                <Icon name="box" size={21} />
              </div>

              <div>
                <h1 className="text-lg font-bold text-slate-900">E-Shop</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 p-4">
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="grid" size={19} />
              Dashboard
            </Link>

            <Link
              href="/admin/analytics"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="chart" size={19} />
              Analytics
            </Link>

            <Link
              href="/admin/orders"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="bag" size={19} />
              Orders
            </Link>

            {/* Active Products */}
            <Link
              href="/admin/products"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700"
            >
              <Icon name="box" size={19} />
              Products
            </Link>

            <Link
              href="/admin/categories"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="tag" size={19} />
              Categories
            </Link>

            <Link
              href="/admin/users"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon name="users" size={19} />
              Users
            </Link>
          </nav>

          {/* Bottom Sidebar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-4">
            <div className="rounded-2xl bg-linear-to-br from-indigo-50 to-violet-50 p-4">
              <p className="text-xs font-semibold text-indigo-700">
                Product Management
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Update your store inventory and product information.
              </p>
            </div>
          </div>
        </aside>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="min-w-0 flex-1">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden"
                aria-label="Open sidebar"
              >
                <Icon name="menu" size={21} />
              </button>

              <div>
                <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
                  <Link href="/admin" className="hover:text-indigo-600">
                    Admin
                  </Link>

                  <span>/</span>

                  <Link
                    href="/admin/products"
                    className="hover:text-indigo-600"
                  >
                    Products
                  </Link>

                  <span>/</span>

                  <span>Edit</span>
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Edit Product
                </h2>
              </div>
            </div>

            <Link
              href="/admin/products"
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
            >
              <Icon name="arrow-left" size={17} />
              Back to Products
            </Link>
          </header>

          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          <div className="mx-auto max-w-7xl p-5 lg:p-8">
            {/* Page Intro */}
            <div className="mb-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    <Icon name="box" size={14} />
                    Product #{product?.id}
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Edit Product
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Update the product information, pricing, inventory,
                    category, and image.
                  </p>
                </div>

                <Link
                  href="/admin/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:hidden"
                >
                  <Icon name="arrow-left" size={17} />
                  Back
                </Link>
              </div>
            </div>

            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <div className="mt-0.5 shrink-0">
                  <Icon name="alert" size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Unable to update product
                  </p>

                  <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-auto rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
                >
                  <Icon name="x" size={17} />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                <div className="mt-0.5 shrink-0">
                  <Icon name="check" size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Product updated successfully
                  </p>

                  <p className="mt-1 text-sm text-emerald-600">
                    Redirecting you back to Products...
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* =================================================
                    LEFT / MAIN FORM
                ================================================= */}

                <div className="space-y-6 lg:col-span-2">
                  {/* Basic Information */}
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Icon name="box" size={20} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Basic Information
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Main product details shown to customers.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 p-6">
                      {/* Product Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Product Name
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Enter product name"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                          disabled={saving}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="description"
                            className="block text-sm font-semibold text-slate-700"
                          >
                            Description
                            <span className="ml-1 text-red-500">*</span>
                          </label>

                          <span className="text-xs text-slate-400">
                            {description.length} characters
                          </span>
                        </div>

                        <textarea
                          id="description"
                          value={description}
                          onChange={(event) =>
                            setDescription(event.target.value)
                          }
                          placeholder="Describe your product..."
                          rows={6}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Pricing & Inventory */}
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <span className="text-lg font-bold">$</span>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Pricing & Inventory
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Manage product price and available stock.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 p-6 sm:grid-cols-2">
                      {/* Price */}
                      <div>
                        <label
                          htmlFor="price"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Price
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                            $
                          </span>

                          <input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                            disabled={saving}
                          />
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          Enter the selling price in USD.
                        </p>
                      </div>

                      {/* Stock */}
                      <div>
                        <label
                          htmlFor="stock"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Stock Quantity
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          id="stock"
                          type="number"
                          min="0"
                          step="1"
                          value={stock}
                          onChange={(event) => setStock(event.target.value)}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                          disabled={saving}
                        />

                        <p className="mt-2 text-xs text-slate-400">
                          Number of units currently available.
                        </p>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mx-6 mb-6 rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Current Inventory
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {stock || "0"} units
                          </p>
                        </div>

                        <div>
                          {Number(stock) === 0 ? (
                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                              Out of Stock
                            </span>
                          ) : Number(stock) <= 5 ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Category & Image */}
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Icon name="tag" size={20} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Category & Image
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Organize the product and add its image.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 p-6">
                      {/* Category */}
                      <div>
                        <label
                          htmlFor="category"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Category
                        </label>

                        <div className="relative">
                          <select
                            id="category"
                            value={categoryId}
                            onChange={(event) =>
                              setCategoryId(event.target.value)
                            }
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                            disabled={saving}
                          >
                            <option value="">No category</option>

                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>

                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Icon name="chevron" size={17} />
                          </div>
                        </div>
                      </div>

                      {/* Image URL */}
                      <div>
                        <label
                          htmlFor="image"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Product Image URL
                        </label>

                        <input
                          id="image"
                          type="url"
                          value={image}
                          onChange={(event) => setImage(event.target.value)}
                          placeholder="https://example.com/product-image.jpg"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                          disabled={saving}
                        />

                        <p className="mt-2 text-xs text-slate-400">
                          Paste a public image URL for this product.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* =================================================
                    RIGHT / PREVIEW
                ================================================= */}

                <div className="space-y-6">
                  {/* Product Preview */}
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                      <h3 className="font-bold text-slate-900">
                        Product Preview
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Preview how your product information looks.
                      </p>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {image.trim() ? (
                        <img
                          src={image.trim()}
                          alt={name || "Product preview"}
                          onError={handleImageError}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-slate-400">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <Icon name="image" size={28} />
                          </div>

                          <p className="mt-3 text-sm font-medium">No image</p>

                          <p className="mt-1 text-xs">Add an image URL</p>
                        </div>
                      )}

                      {/* Stock badge */}
                      <div className="absolute left-4 top-4">
                        {Number(stock) === 0 ? (
                          <span className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                            Out of Stock
                          </span>
                        ) : Number(stock) <= 5 ? (
                          <span className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5">
                      <p className="text-xs font-medium text-indigo-600">
                        {categoryId
                          ? categories.find(
                              (category) => String(category.id) === categoryId,
                            )?.name || "Category"
                          : "Uncategorized"}
                      </p>

                      <h4 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900">
                        {name || "Product Name"}
                      </h4>

                      <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-500">
                        {description ||
                          "Your product description will appear here."}
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Price</p>

                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            $
                            {Number(price || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-400">Stock</p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {stock || "0"} units
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Product ID Card */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Product ID
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          #{product?.id}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <Icon name="box" size={19} />
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xs leading-5 text-slate-400">
                        This ID is assigned automatically by the system and
                        cannot be changed.
                      </p>
                    </div>
                  </section>

                  {/* Help Card */}
                  <section className="rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-200">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Icon name="check" size={20} />
                    </div>

                    <h3 className="mt-4 font-bold">
                      Keep product information accurate
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-indigo-100">
                      Make sure the price, stock quantity, and product details
                      are correct before saving.
                    </p>
                  </section>
                </div>
              </div>

              {/* =================================================
                  ACTION BAR
              ================================================= */}

              <div className="mt-8 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <Link
                  href="/admin/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Icon name="arrow-left" size={17} />
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving || Boolean(success)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-30"
                        />

                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Icon name="save" size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
