"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:3001/products");

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setImage(product.image || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Please login as an admin first.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const productData = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        image: image || null,
      };

      const url = editingProduct
        ? `http://localhost:3001/products/${editingProduct.id}`
        : "http://localhost:3001/products";

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
      const response = await fetch(`http://localhost:3001/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err: any) {
      setError(err.message || "Could not delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white lg:block">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-xl font-bold">ShopHub</h1>
          <p className="mt-1 text-sm text-slate-400">Admin Panel</p>
        </div>

        <nav className="space-y-2 p-4">
          <Link
            href="/admin"
            className="block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            📦 Orders
          </Link>

          <Link
            href="/admin/products"
            className="block rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            🛍️ Products
          </Link>

          <Link
            href="/admin/users"
            className="block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            👥 Customers
          </Link>

          <Link
            href="/"
            className="mt-6 block rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            🏠 View Store
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur md:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">Admin Panel</p>
              <h2 className="text-2xl font-bold md:text-3xl">
                Product Management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add, edit and manage your store products.
              </p>
            </div>

            <button
              onClick={openAddForm}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              + Add Product
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Products</p>
              <p className="mt-2 text-3xl font-bold">{products.length}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">In Stock</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {products.filter((p) => p.stock > 0).length}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Out of Stock</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {products.filter((p) => p.stock === 0).length}
              </p>
            </div>
          </div>

          {/* Product Form */}
          {showForm && (
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Fill in the product information below.
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Product Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Gaming Mouse"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Image URL
                  </label>
                  <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe the product..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="49.99"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    placeholder="10"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products */}
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h3 className="text-xl font-bold">All Products</h3>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-5xl">📦</div>
                <h4 className="mt-4 text-lg font-bold">No products found</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Add your first product to your store.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="bg-slate-50 text-left text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Stock</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                                📦
                              </div>
                            )}

                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          ${product.price.toFixed(2)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={
                              product.stock === 0
                                ? "font-semibold text-red-600"
                                : "font-semibold text-slate-700"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {product.stock > 0 ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              In Stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditForm(product)}
                              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(product.id)}
                              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
