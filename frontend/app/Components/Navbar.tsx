"use client";

import Link from "next/link";
import { useCart } from "../Context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      {" "}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}{" "}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          E-Shop{" "}
        </Link>
        {/* Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Products
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-blue-600 transition"
          >
            <span className="text-2xl">🛒</span>

            {/* Cart count */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
