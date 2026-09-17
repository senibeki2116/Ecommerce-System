"use client";

import Link from "next/link";
import { useCart } from "../Context/CartContext";

export default function CartPage() {
  const {
    cart,
    cartTotal,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const shipping = cartTotal >= 100 ? 0 : 10;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartProducts = cart.filter((item) => item.quantity > 0);

  const progress = Math.min((cartTotal / 100) * 100, 100);

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-900">
      {/* Header */}
      <div className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            Shop<span className="text-blue-600">Ease</span>
          </Link>

          <Link
            href="/products"
            className="rounded-full border border-sky-200 bg-sky-50 px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {/* Light Blue Hero */}
      <section className="bg-linear-to-br from-sky-100 via-blue-50 to-indigo-100">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">
            Shopping Cart
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Your cart,
            <br />
            ready when you are.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Review your selected products, adjust quantities, and continue
            securely to checkout.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {cartProducts.length === 0 ? (
          <div className="rounded-4xl border border-sky-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-5xl">
              🛒
            </div>

            <h2 className="mt-7 text-3xl font-black text-slate-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              You haven't added anything to your cart yet. Explore our products
              and find something you love.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-indigo-600"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            {/* Free Shipping */}
            <div className="mb-8 overflow-hidden rounded-3xl bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 p-6 text-white shadow-xl shadow-blue-100">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-50">
                    {shipping === 0
                      ? "Free shipping unlocked"
                      : "Free shipping"}
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    {shipping === 0
                      ? "You're getting free delivery!"
                      : `Add $${Math.max(0, 100 - cartTotal).toFixed(
                          2,
                        )} more to unlock free shipping`}
                  </h2>
                </div>

                <div className="w-full sm:w-64">
                  <div className="mb-2 flex justify-between text-xs font-bold text-blue-50">
                    <span>${cartTotal.toFixed(2)}</span>
                    <span>$100</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
              {/* Cart Items */}
              <section>
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-600">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      Shopping bag
                    </h2>
                  </div>

                  <button
                    onClick={clearCart}
                    className="text-sm font-semibold text-slate-400 transition hover:text-red-500"
                  >
                    Clear cart
                  </button>
                </div>

                <div className="space-y-4">
                  {cartProducts.map((item) => {
                    const product = item;
                    const quantity = item.quantity || 1;

                    const image = product.image || "/placeholder.png";

                    const name = product.name || "Product";
                    const price = Number(product.price || 0);

                    return (
                      <div
                        key={item.id}
                        className="group rounded-3xl border border-sky-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-100 sm:p-5"
                      >
                        <div className="flex gap-4 sm:gap-6">
                          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-sky-50 sm:h-36 sm:w-36">
                            <img
                              src={image}
                              alt={name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="flex justify-between gap-3">
                              <div>
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-500">
                                  ShopEase Product
                                </p>

                                <h3 className="line-clamp-2 text-lg font-black text-slate-900 sm:text-xl">
                                  {name}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                  ${price.toFixed(2)} each
                                </p>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                aria-label="Remove item"
                              >
                                ×
                              </button>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center rounded-full border border-sky-100 bg-sky-50 p-1">
                                <button
                                  onClick={() => decreaseQuantity(item.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-slate-600 transition hover:bg-white"
                                >
                                  −
                                </button>

                                <span className="min-w-9 text-center text-sm font-black">
                                  {quantity}
                                </span>

                                <button
                                  onClick={() => increaseQuantity(item.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-slate-600 transition hover:bg-white"
                                >
                                  +
                                </button>
                              </div>

                              <p className="text-lg font-black text-slate-900">
                                ${(price * quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Summary */}
              <aside className="lg:sticky lg:top-6 lg:self-start">
                <div className="overflow-hidden rounded-4xl bg-linear-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-200">
                  <div className="p-7">
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-100">
                      Order summary
                    </p>

                    <h2 className="mt-2 text-2xl font-black">Your total</h2>

                    <div className="my-7 space-y-4">
                      <div className="flex justify-between text-blue-100">
                        <span>Subtotal</span>
                        <span className="font-semibold text-white">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between text-blue-100">
                        <span>Shipping</span>
                        <span className="font-semibold text-white">
                          {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>

                      <div className="flex justify-between text-blue-100">
                        <span>Estimated tax</span>
                        <span className="font-semibold text-white">
                          ${tax.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-6">
                      <div className="flex items-end justify-between">
                        <span className="text-blue-100">Total</span>

                        <span className="text-3xl font-black">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/checkout"
                      className="mt-7 flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 font-black text-blue-700 transition hover:bg-slate-50"
                    >
                      Proceed to Checkout
                      <span className="ml-2">→</span>
                    </Link>

                    <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-blue-100">
                      <div>
                        <div className="mb-1 text-lg">🔒</div>
                        Secure
                      </div>

                      <div>
                        <div className="mb-1 text-lg">↩</div>
                        Easy Returns
                      </div>

                      <div>
                        <div className="mb-1 text-lg">✓</div>
                        Trusted
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-sky-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-5 text-center text-sm text-slate-400 lg:px-8">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
