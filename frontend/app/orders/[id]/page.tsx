"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../Components/Navbar";

type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: Product;
};

type Order = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const orderId = params.id;

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Please login to view this order.");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load order.");
        setLoading(false);
        return;
      }

      setOrder(data);
    } catch (err) {
      console.error("Order details error:", err);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      const token = localStorage.getItem("accessToken");

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
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to cancel order.");
        return;
      }

      setOrder((currentOrder) =>
        currentOrder
          ? {
              ...currentOrder,
              status: "CANCELLED",
            }
          : null,
      );
    } catch (err) {
      console.error("Cancel order error:", err);
      setError("Could not connect to the server.");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>

            <p className="text-gray-600 font-medium">
              Loading order details...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (error && !order) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center">
              <div className="text-6xl mb-5">⚠️</div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Unable to Load Order
              </h1>

              <p className="text-red-600 mb-7">{error}</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={fetchOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
                >
                  Try Again
                </button>

                <Link
                  href="/orders"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-xl transition"
                >
                  Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-7 transition"
          >
            ← Back to My Orders
          </Link>

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Number</p>

                  <h1 className="text-3xl font-bold text-gray-900">
                    #{order.id}
                  </h1>

                  <p className="text-gray-500 mt-2">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <span
                  className={`self-start md:self-center px-5 py-2.5 rounded-full border text-sm font-bold ${getStatusStyle(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Order Items</h2>

                <p className="text-sm text-gray-500 mt-1">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"} in this order
                </p>
              </div>

              <div className="p-6 space-y-5">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 pb-5 border-b border-gray-100 last:border-b-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🛍️
                        </div>
                      )}
                    </div>

                    {/* Product Information */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.product.name}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        Quantity:{" "}
                        <span className="font-semibold text-gray-700">
                          {item.quantity}
                        </span>
                      </p>

                      <p className="text-gray-500 mt-1">
                        Price:{" "}
                        <span className="font-semibold text-gray-700">
                          ${item.price.toFixed(2)}
                        </span>
                      </p>
                    </div>

                    {/* Item Total */}
                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500">Item Total</p>

                      <p className="text-xl font-bold text-gray-900 mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  Order Summary
                </h2>

                <div className="flex justify-between text-gray-600 mb-3">
                  <span>Items</span>
                  <span>{order.items.length}</span>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total</span>

                    <span className="text-2xl font-bold text-blue-600">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancel Order */}
              {order.status === "PENDING" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-2">
                    Need to cancel?
                  </h2>

                  <p className="text-sm text-gray-500 mb-5">
                    You can cancel this order while it is still pending.
                  </p>

                  <button
                    onClick={cancelOrder}
                    disabled={cancelling}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 rounded-xl transition"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                </div>
              )}

              {order.status === "CANCELLED" && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="text-3xl mb-3">❌</div>

                  <h2 className="font-bold text-red-800">Order Cancelled</h2>

                  <p className="text-sm text-red-600 mt-1">
                    This order has been cancelled successfully.
                  </p>
                </div>
              )}

              {order.status === "DELIVERED" && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="text-3xl mb-3">🎉</div>

                  <h2 className="font-bold text-green-800">Order Delivered</h2>

                  <p className="text-sm text-green-600 mt-1">
                    Your order has been delivered successfully.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/orders"
              className="flex-1 text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold py-3.5 rounded-xl transition"
            >
              ← My Orders
            </Link>

            <Link
              href="/"
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
