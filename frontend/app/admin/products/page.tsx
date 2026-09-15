"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
};

const API_URL = "http://localhost:3001";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
            ? data.data
            : [];

      setProducts(productList);
    } catch (err) {
      console.error(err);
      setError("Could not load products. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.description.toLowerCase().includes(value),
    );
  }, [products, search]);

  const totalProducts = products.length;

  const inStock = products.filter((product) => product.stock > 0).length;

  const outOfStock = products.filter((product) => product.stock === 0).length;

  const totalInventoryValue = products.reduce(
    (total, product) => total + product.price * product.stock,
    0,
  );

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImage("");
    setEditingProduct(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);

    setTimeout(() => {
      document.getElementById("product-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setImage(product.image || "");
    setShowForm(true);

    setTimeout(() => {
      document.getElementById("product-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Please login as an admin first.");
      return;
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      setError("Price and stock cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        image: image.trim() || null,
      };

      const url = editingProduct
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save product");
      }

      await fetchProducts();
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Please login as an admin first.");
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete product");
      }

      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white lg:block">
        <div className="border-b border-slate-800 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl">
              S
            </div>

            <div>
              <h1 className="text-xl font-bold">ShopEase</h1>
              <p className="text-xs text-slate-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            📊
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            📦
            <span>Orders</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-900/20"
          >
            🛍️
            <span>Products</span>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            👥
            <span>Customers</span>
          </Link>

          <div className="my-5 border-t border-slate-800" />

          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            🏠
            <span>View Store</span>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <span>Admin</span>
                <span className="text-slate-300">/</span>
                <span>Products</span>
              </div>

              <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                Product Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your store inventory and products.
              </p>
            </div>

            <button
              onClick={openAddForm}
              className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              + Add Product
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <div>
                <p className="font-bold">Something went wrong</p>
                <p className="mt-1">{error}</p>
              </div>

              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Products
                  </p>
                  <p className="mt-2 text-3xl font-black">{totalProducts}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  🛍️
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">In Stock</p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {inStock}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                  ✓
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Out of Stock
                  </p>
                  <p className="mt-2 text-3xl font-black text-red-600">
                    {outOfStock}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
                  !
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Inventory Value
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    ${totalInventoryValue.toFixed(0)}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-xl">
                  $
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div
              id="product-form"
              className="mb-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-5 md:px-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">
                      Product
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h3>
                  </div>

                  <button
                    onClick={resetForm}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 md:p-8"
              >
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Product Name
                  </label>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Gaming Mouse"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Image URL
                  </label>

                  <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {image && (
                  <div className="md:col-span-2">
                    <p className="mb-2 text-sm font-bold">Image Preview</p>

                    <div className="flex h-40 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      <img
                        src={image}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe the product..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">Price</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="49.99"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">Stock</label>

                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    placeholder="10"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-blue-600 px-7 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingProduct
                        ? "Update Product"
                        : "Add Product"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-slate-200 px-7 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product List */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
              <div>
                <h3 className="text-xl font-black">All Products</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1 ? "s" : ""} displayed
                </p>
              </div>

              <div className="relative w-full md:max-w-sm">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-14 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-14 text-center">
                <div className="text-5xl">📦</div>

                <h4 className="mt-4 text-lg font-black">
                  {search ? "No products found" : "No products yet"}
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try another search."
                    : "Add your first product to your store."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-left text-sm text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-bold">Product</th>
                        <th className="px-6 py-4 font-bold">Price</th>
                        <th className="px-6 py-4 font-bold">Stock</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 text-right font-bold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      e.currentTarget.parentElement?.classList.add(
                                        "flex",
                                        "items-center",
                                        "justify-center",
                                      );
                                      if (e.currentTarget.parentElement) {
                                        e.currentTarget.parentElement.innerText =
                                          "📦";
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-2xl">
                                    📦
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold">{product.name}</p>

                                <p className="mt-1 max-w-sm truncate text-sm text-slate-500">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 font-bold">
                            ${Number(product.price).toFixed(2)}
                          </td>

                          <td className="px-6 py-5 font-semibold">
                            {product.stock}
                          </td>

                          <td className="px-6 py-5">
                            {product.stock > 0 ? (
                              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                In Stock
                              </span>
                            ) : (
                              <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                                Out of Stock
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(product)}
                                className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                {deletingId === product.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="grid gap-4 p-4 md:hidden">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-slate-100 p-4"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">
                              📦
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold">{product.name}</h4>

                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {product.description}
                          </p>

                          <p className="mt-2 font-black">
                            ${Number(product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">Stock</p>
                          <p className="font-bold">{product.stock}</p>
                        </div>

                        {product.stock > 0 ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            In Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          className="flex-1 rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-blue-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-bold text-red-600"
                        >
                          {deletingId === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
