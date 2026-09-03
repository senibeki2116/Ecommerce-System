import Link from "next/link";
import Navbar from "./Components/Navbar";

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Electronics",
    price: "$89.99",
    oldPrice: "$119.99",
    discount: "25% OFF",
    rating: "4.8",
    reviews: "124",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Classic Smart Watch",
    category: "Accessories",
    price: "$69.99",
    oldPrice: "$99.99",
    discount: "30% OFF",
    rating: "4.7",
    reviews: "98",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Modern Running Shoes",
    category: "Fashion",
    price: "$79.99",
    oldPrice: "$109.99",
    discount: "27% OFF",
    rating: "4.9",
    reviews: "215",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Premium Leather Backpack",
    category: "Bags",
    price: "$59.99",
    oldPrice: "$79.99",
    discount: "25% OFF",
    rating: "4.6",
    reviews: "76",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 left-20 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-6 py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              ✨ New Collection Available
            </div>

            <h1 className="text-5xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
              Everything You Need,
              <span className="block text-blue-200">All in One Place.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100 md:text-xl">
              Discover quality products at amazing prices. Shop smarter, faster,
              and more securely with ShopEase.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-xl bg-white px-7 py-3.5 font-bold text-blue-700 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-blue-50"
              >
                Shop Now →
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-white/50 bg-white/10 px-7 py-3.5 font-bold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-blue-700"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 text-sm text-blue-100">
              <div>
                <p className="text-2xl font-bold text-white">10K+</p>
                <p>Happy Customers</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p>Products</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">4.9/5</p>
                <p>Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                🚚
              </div>

              <h2 className="text-xl font-bold text-gray-900">Fast Delivery</h2>

              <p className="mt-3 leading-7 text-gray-600">
                Get your orders delivered quickly and safely right to your
                doorstep.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                🔒
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Secure Shopping
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Your account, payments, and orders are protected with secure
                authentication.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                ⭐
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Quality Products
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Shop carefully selected products at competitive and affordable
                prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                Our Collection
              </p>

              <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
                Featured Products
              </h2>

              <p className="mt-3 max-w-xl text-gray-600">
                Discover some of our most popular products, selected just for
                you.
              </p>
            </div>

            <Link
              href="/products"
              className="font-semibold text-blue-600 transition hover:text-blue-800"
            >
              View All Products →
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  {/* Discount */}
                  <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow">
                    {product.discount}
                  </div>

                  {/* Wishlist */}
                  <button
                    type="button"
                    aria-label={`Add ${product.name} to wishlist`}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-md backdrop-blur transition hover:scale-110 hover:bg-white"
                  >
                    ♡
                  </button>

                  {/* Quick View */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-16 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Link
                      href="/products"
                      className="block rounded-xl bg-white/95 py-3 text-center text-sm font-bold text-gray-900 shadow-lg backdrop-blur hover:bg-white"
                    >
                      Quick View
                    </Link>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {product.category}
                  </p>

                  <h3 className="mt-2 min-h-[52px] text-lg font-bold leading-6 text-gray-900">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex text-sm text-yellow-400">★★★★★</div>

                    <span className="text-sm font-medium text-gray-600">
                      {product.rating}
                    </span>

                    <span className="text-xs text-gray-400">
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {product.price}
                    </span>

                    <span className="text-sm text-gray-400 line-through">
                      {product.oldPrice}
                    </span>
                  </div>

                  {/* Add to Cart */}
                  <button
                    type="button"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition duration-300 hover:bg-blue-600"
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-12 text-white shadow-xl md:px-14">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-200">
                Special Offer
              </p>

              <h2 className="text-3xl font-extrabold md:text-4xl">
                Get up to 30% OFF
              </h2>

              <p className="mt-3 text-indigo-100">
                Don't miss our latest deals and exclusive products.
              </p>
            </div>

            <Link
              href="/products"
              className="whitespace-nowrap rounded-xl bg-white px-7 py-3.5 font-bold text-indigo-700 shadow-lg transition hover:-translate-y-1 hover:bg-indigo-50"
            >
              Shop Deals →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-5 text-5xl">🛍️</div>

          <h2 className="text-3xl font-extrabold md:text-4xl">
            Ready to Start Shopping?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-300">
            Explore our collection and discover products you'll love. Your next
            favorite item is just one click away.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 font-bold shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
          >
            Explore Products →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <p className="text-xl font-extrabold text-gray-900">
                Shop<span className="text-blue-600">Ease</span>
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Your trusted online shopping destination.
              </p>
            </div>

            <p className="text-sm text-gray-500">
              © 2026 ShopEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
