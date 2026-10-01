"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Category = {
  id: number;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  products?: {
    id: number;
    name: string;
  }[];
  _count?: {
    products: number;
  };
};

// --------------------------------------------------
// Category fallback images
// --------------------------------------------------
const categoryFallbackImages: Record<string, string> = {
  electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&auto=format&fit=crop",

  accessories:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop",

  cameras:
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop",

  audio:
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&auto=format&fit=crop",

  gaming:
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=900&auto=format&fit=crop",

  fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&auto=format&fit=crop",

  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop",

  beauty:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&auto=format&fit=crop",

  sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop",
};

const defaultCategoryImage =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop";

// --------------------------------------------------
// Get category image
// --------------------------------------------------
function getCategoryImage(category: Category) {
  // Use database image if it exists and is not an example.com placeholder
  if (category.image && !category.image.includes("example.com")) {
    return category.image;
  }

  const categoryName = category.name.toLowerCase().trim();

  // Exact match first
  if (categoryFallbackImages[categoryName]) {
    return categoryFallbackImages[categoryName];
  }

  // Keyword matching
  const matchingCategory = Object.keys(categoryFallbackImages).find((key) =>
    categoryName.includes(key),
  );

  if (matchingCategory) {
    return categoryFallbackImages[matchingCategory];
  }

  return defaultCategoryImage;
}

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // Admin protection
  // --------------------------------------------------
  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== "ADMIN") {
        router.replace("/");
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      router.replace("/login");
    }
  }, [router]);

  // --------------------------------------------------
  // Fetch categories
  // --------------------------------------------------
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/categories`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load categories.");
      }

      const data = await response.json();

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch categories error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const filteredCategories = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(value),
    );
  }, [categories, search]);

  // --------------------------------------------------
  // Open Add Modal
  // --------------------------------------------------
  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setImage("");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------
  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setImage(category.image || "");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // Close Modal
  // --------------------------------------------------
  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingCategory(null);
    setName("");
    setImage("");
    setError("");
    setSuccess("");
  };

  // --------------------------------------------------
  // Save Category
  // --------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedImage = image.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Category name must contain at least 2 characters.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingCategory
        ? `${API_URL}/categories/${editingCategory.id}`
        : `${API_URL}/categories`;

      const method = editingCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          ...(trimmedImage ? { image: trimmedImage } : {}),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const serverMessage =
          typeof data?.message === "string"
            ? data.message
            : Array.isArray(data?.message)
              ? data.message.join(", ")
              : "";

        if (
          serverMessage.toLowerCase().includes("unique") ||
          serverMessage.toLowerCase().includes("p2002") ||
          serverMessage.toLowerCase().includes("already exists")
        ) {
          throw new Error("A category with this name already exists.");
        }

        throw new Error(serverMessage || "Failed to save category.");
      }

      await fetchCategories();

      setSuccess(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully.",
      );

      setTimeout(() => {
        setShowModal(false);
        setEditingCategory(null);
        setName("");
        setImage("");
        setError("");
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error("Save category error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the category.",
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete Category
  // --------------------------------------------------
  const handleDelete = async (category: Category) => {
    const productCount =
      category._count?.products ?? category.products?.length ?? 0;

    if (productCount > 0) {
      alert(
        `Cannot delete "${category.name}" because it contains ${productCount} product${
          productCount === 1 ? "" : "s"
        }.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/categories/${category.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const serverMessage =
          typeof data?.message === "string"
            ? data.message
            : Array.isArray(data?.message)
              ? data.message.join(", ")
              : "";

        throw new Error(serverMessage || "Failed to delete category.");
      }

      await fetchCategories();

      setSuccess("Category deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Delete category error:", err);

      setError(
        err instanceof Error ? err.message : "Failed to delete category.",
      );
    }
  };

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------
  const totalCategories = categories.length;

  const totalProducts = categories.reduce(
    (total, category) =>
      total + (category._count?.products ?? category.products?.length ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =========================================================
          SIDEBAR
      ========================================================== */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-slate-200 px-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Shop<span className="text-blue-600">Ease</span>
              </h1>

              <p className="text-xs font-medium text-slate-400">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span>📊</span>
              Dashboard
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span>📦</span>
              Orders
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span>🛍️</span>
              Products
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600"
            >
              <span>🏷️</span>
              Categories
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span>👥</span>
              Customers
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span>🏠</span>
              View Store
            </Link>
          </nav>

          {/* Bottom Card */}
          <div className="border-t border-slate-200 p-4">
            <div className="rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 p-4 text-white">
              <p className="text-xs font-medium text-blue-100">ShopEase</p>

              <p className="mt-1 text-sm font-bold">Manage your store</p>

              <Link
                href="/"
                className="mt-3 inline-block text-xs font-semibold underline underline-offset-2"
              >
                Visit store →
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN
      ========================================================== */}
      <main className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Store Management
              </p>

              <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                Categories
              </h2>
            </div>

            <button
              onClick={openAddModal}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
            >
              + Add Category
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* =====================================================
              MESSAGES
          ====================================================== */}
          {error && !showModal && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              <span>{error}</span>

              <button
                onClick={() => setError("")}
                className="shrink-0 text-red-400 transition hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}

          {success && !showModal && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-600">
              <span>{success}</span>

              <button
                onClick={() => setSuccess("")}
                className="shrink-0 text-green-400 transition hover:text-green-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* =====================================================
              STATS
          ====================================================== */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Total Categories */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Categories
                  </p>

                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {totalCategories}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🏷️
                </div>
              </div>
            </div>

            {/* Products Assigned */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Products Assigned
                  </p>

                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {totalProducts}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-2xl">
                  🛍️
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SEARCH
          ====================================================== */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* =====================================================
              CATEGORY LIST
          ====================================================== */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="text-5xl">🏷️</div>

              <h3 className="mt-4 text-xl font-black">No categories found</h3>

              <p className="mt-2 text-sm text-slate-500">
                {search.trim()
                  ? "Try another search term."
                  : "Create your first category to get started."}
              </p>

              {search.trim() ? (
                <button
                  onClick={() => setSearch("")}
                  className="mt-6 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={openAddModal}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  + Create Category
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((category) => {
                const productCount =
                  category._count?.products ?? category.products?.length ?? 0;

                return (
                  <div
                    key={category.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-linear-to-br from-blue-50 to-cyan-50">
                      <img
                        src={getCategoryImage(category)}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = defaultCategoryImage;
                        }}
                      />

                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
                        #{category.id}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black text-slate-900">
                            {category.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {productCount}{" "}
                            {productCount === 1 ? "product" : "products"}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-lg">
                          🏷️
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => openEditModal(category)}
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => handleDelete(category)}
                          disabled={productCount > 0}
                          title={
                            productCount > 0
                              ? "Remove all products from this category before deleting it."
                              : "Delete category"
                          }
                          className="flex-1 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* =========================================================
          ADD / EDIT MODAL
      ========================================================== */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Category Management
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Modal Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              {/* Modal Success */}
              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-600">
                  {success}
                </div>
              )}

              {/* Category Name */}
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Category Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Fashion"
                  disabled={saving}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Image URL */}
              <div>
                <label
                  htmlFor="category-image"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Image URL
                </label>

                <input
                  id="category-image"
                  type="url"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setError("");
                  }}
                  placeholder="https://example.com/image.jpg"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Leave empty to automatically use the category image.
                </p>
              </div>

              {/* Preview */}
              {image.trim() && (
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-700">
                    Preview
                  </p>

                  <div className="h-40 overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={image.trim()}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultCategoryImage;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
