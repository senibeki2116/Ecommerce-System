"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../Context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    checkLogin();

    // Listen for login/logout changes from another tab
    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, [pathname]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");

    setIsLoggedIn(false);

    router.push("/login");
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
        >
          E-Shop
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          {/* Home */}
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 transition font-medium"
          >
            Home
          </Link>

          {/* Products */}
          <Link
            href="/products"
            className="text-gray-700 hover:text-blue-600 transition font-medium"
          >
            Products
          </Link>

          {/* Orders - only when logged in */}
          {isLoggedIn && (
            <Link
              href="/orders"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Orders
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-blue-600 transition"
            aria-label="Shopping cart"
          >
            <span className="text-2xl">🛒</span>

            {/* Cart count */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login / Logout */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
