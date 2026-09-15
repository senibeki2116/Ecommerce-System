"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../Components/Navbar";
import { useCart } from "../../Context/CartContext";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
};

const API_URL = "http://localhost:3001";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const { addToCart, cartCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products/${id}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const increaseQuantity = () => {
    if (!product) return;

    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const addProductToCart = () => {
    if (!product || product.stock <= 0) return;

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  const buyNow = () => {
    if (!product || product.stock <= 0) return;

    setBuying(true);

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    router.push("/checkout");
  };

  const getImage = () => {
    if (product?.image && product.image.trim() !== "") {
      return product.image;
    }

    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h2 className="mt-6 text-xl font-bold text-slate-800">
              Loading product...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we get the product details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-6">
          <div className="w-full rounded-3xl bg-white p-10 text-center shadow-xl shadow-slate-200/60">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <span className="text-4xl">😕</span>
            </div>

            <h1 className="mt-6 text-3xl font-black text-slate-900">
              Product Not Found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              Sorry, we could not find the product you are looking for.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Top spacing */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className="font-medium text-slate-500 transition hover:text-blue-600"
          >
            Home
          </Link>

          <span className="text-slate-300">/</span>

          <Link
            href="/products"
            className="font-medium text-slate-500 transition hover:text-blue-600"
          >
            Products
          </Link>

          <span className="text-slate-300">/</span>

          <span className="max-w-[220px] truncate font-semibold text-slate-800">
            {product.name}
          </span>
        </div>

        {/* Main Product Section */}
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/60">
          <div className="grid lg:grid-cols-2">
            {/* IMAGE SIDE */}
            <div className="relative min-h-[420px] bg-gradient-to-br from-slate-100 via-white to-blue-50 p-6 sm:p-10 lg:min-h-[650px]">
              {/* Decorative circles */}
              <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-purple-100/50 blur-3xl" />

              {/* Back button */}
              <Link
                href="/products"
                className="relative z-10 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-200 hover:text-blue-600"
              >
                ← Back
              </Link>

              {/* Product image */}
              <div className="relative z-10 flex h-[390px] items-center justify-center sm:h-[480px] lg:h-[540px]">
                <img
                  src={getImage()}
                  alt={product.name}
                  className="max-h-full max-w-full rounded-3xl object-contain drop-shadow-2xl transition duration-500 hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.src =
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";
                  }}
                />
              </div>

              {/* Stock badge */}
              <div className="absolute bottom-6 left-6 z-20 sm:bottom-10 sm:left-10">
                {isOutOfStock ? (
                  <div className="rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-700 shadow-sm">
                    Out of Stock
                  </div>
                ) : product.stock <= 5 ? (
                  <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700 shadow-sm">
                    Only {product.stock} left
                  </div>
                ) : (
                  <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">
                    ✓ In Stock
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS SIDE */}
            <div className="flex flex-col p-6 sm:p-10 lg:p-14">
              {/* Small category */}
              <div className="mb-5">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-600">
                  Premium Product
                </span>
              </div>

              {/* Product title */}
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-lg text-yellow-400">★</span>
                  <span className="text-lg text-yellow-400">★</span>
                  <span className="text-lg text-yellow-400">★</span>
                  <span className="text-lg text-yellow-400">★</span>
                  <span className="text-lg text-yellow-400">★</span>
                </div>

                <span className="text-sm font-bold text-slate-700">4.9</span>

                <span className="text-sm text-slate-400">• 120+ reviews</span>
              </div>

              {/* Price */}
              <div className="mt-8">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-black text-blue-600 sm:text-5xl">
                    ${product.price.toFixed(2)}
                  </span>

                  <span className="pb-1 text-lg text-slate-400 line-through">
                    ${(product.price * 1.15).toFixed(2)}
                  </span>

                  <span className="mb-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                    15% OFF
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Free shipping on orders over $100
                </p>
              </div>

              {/* Divider */}
              <div className="my-8 h-px bg-slate-100" />

              {/* Description */}
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Product Description
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {product.description ||
                    "This premium product is designed to provide excellent quality, reliability, and value. Shop with confidence and enjoy a great shopping experience."}
                </p>
              </div>

              {/* Features */}
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xl">🚚</div>
                  <p className="mt-2 text-xs font-black text-slate-800">
                    Fast Delivery
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Quick & secure
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xl">🛡️</div>
                  <p className="mt-2 text-xs font-black text-slate-800">
                    Secure Payment
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    100% protected
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xl">↩️</div>
                  <p className="mt-2 text-xs font-black text-slate-800">
                    Easy Returns
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Shop with confidence
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-800">
                    Quantity
                  </span>

                  <span className="text-xs font-semibold text-slate-400">
                    {product.stock} available
                  </span>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="flex h-12 w-12 items-center justify-center rounded-l-xl border border-slate-200 bg-slate-50 text-xl font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <div className="flex h-12 w-16 items-center justify-center border-y border-slate-200 bg-white text-lg font-black text-slate-900">
                    {quantity}
                  </div>

                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="flex h-12 w-12 items-center justify-center rounded-r-xl border border-slate-200 bg-slate-50 text-xl font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-blue-50 px-5 py-4">
                <span className="text-sm font-bold text-slate-600">Total</span>

                <span className="text-2xl font-black text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Buttons */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={addProductToCart}
                  disabled={isOutOfStock}
                  className={`flex min-h-[54px] items-center justify-center gap-2 rounded-xl px-5 font-black transition ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-slate-200 text-slate-400"
                      : added
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {isOutOfStock ? (
                    "Out of Stock"
                  ) : added ? (
                    <>✓ Added to Cart</>
                  ) : (
                    <>🛒 Add to Cart</>
                  )}
                </button>

                <button
                  onClick={buyNow}
                  disabled={isOutOfStock || buying}
                  className={`flex min-h-[54px] items-center justify-center rounded-xl px-5 font-black text-white shadow-lg transition ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-slate-300 shadow-none"
                      : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30"
                  }`}
                >
                  {buying ? "Processing..." : "Buy Now →"}
                </button>
              </div>

              {/* Cart link */}
              <Link
                href="/cart"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                🛍️ View Cart
                {cartCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-black text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Secure checkout message */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                <span>🔒</span>
                Secure checkout • Your information is protected
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Information */}
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              🚚
            </div>

            <h3 className="mt-4 font-black text-slate-900">
              Fast & Reliable Delivery
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              We make sure your order reaches you safely and as quickly as
              possible.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
              ✓
            </div>

            <h3 className="mt-4 font-black text-slate-900">
              Quality Guaranteed
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Carefully selected products with quality and customer satisfaction
              in mind.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
              💬
            </div>

            <h3 className="mt-4 font-black text-slate-900">Customer Support</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Need help? Our support team is ready to help you with your
              shopping experience.
            </p>
          </div>
        </section>

        {/* Continue Shopping */}
        <div className="mt-10 flex justify-center pb-8">
          <Link
            href="/products"
            className="rounded-xl bg-slate-900 px-7 py-3.5 font-black text-white transition hover:bg-slate-800"
          >
            ← Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
