"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../Context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };

    checkLogin();

    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  const navItems = [
    {
      name: "Products",
      href: "/products",
      icon: "🛍️",
    },
    {
      name: "Orders",
      href: "/orders",
      icon: "📦",
    },
    {
      name: "Wishlist",
      href: "/wishlist",
      icon: "♥",
    },
    {
      name: "Cart",
      href: "/cart",
      icon: "🛒",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
            🛍️
          </div>

          <div>
            <p className="text-lg font-black tracking-tight text-slate-950">
              E-Shop
            </p>

            <p className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:block">
              Shop smarter
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <span className="text-base">{item.icon}</span>

                {item.name}

                {item.name === "Cart" && cartCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* LOGIN / ACCOUNT */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600 sm:flex"
              >
                <span>👤</span>
                Account
              </Link>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  setIsLoggedIn(false);
                  window.location.href = "/";
                }}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              <span>🔐</span>
              Login
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      <div className="border-t border-slate-100 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between overflow-x-auto px-4 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex min-w-fit flex-col items-center gap-1 rounded-xl px-4 py-2 text-[11px] font-bold transition ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:text-blue-600"
                }`}
              >
                <span className="text-lg">{item.icon}</span>

                {item.name}

                {item.name === "Cart" && cartCount > 0 && (
                  <span className="absolute right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}

          {!isLoggedIn && (
            <Link
              href="/login"
              className="flex min-w-fit flex-col items-center gap-1 rounded-xl px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-blue-600"
            >
              <span className="text-lg">🔐</span>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
