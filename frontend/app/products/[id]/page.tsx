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

type Review = {
  id: number;
  rating: number;
  comment: string;
  userId: number;
  productId: number;
  user: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

type ReviewResponse = {
  productId: number;
  totalReviews: number;
  averageRating: number;
  reviews: Review[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Review form
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Edit/Delete review state
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const id = params.id as string;

  // =========================
  // FETCH PRODUCT
  // =========================

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

  // =========================
  // FETCH REVIEWS
  // =========================

  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await fetch(`${API_URL}/reviews/product/${id}`);

        if (!response.ok) {
          throw new Error("Unable to load reviews");
        }

        const data: ReviewResponse = await response.json();

        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      } catch (error) {
        console.error("Review error:", error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // =========================
  // QUANTITY
  // =========================

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

  // =========================
  // ADD TO CART
  // =========================

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

  // =========================
  // BUY NOW
  // =========================

  const buyNow = () => {
    if (!product || product.stock <= 0) return;

    setBuying(true);

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    router.push("/checkout");
  };

  // =========================
  // CURRENT USER
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setCurrentUserId(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = Number(payload.sub ?? payload.userId ?? payload.id);
      setCurrentUserId(Number.isFinite(userId) ? userId : null);
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      setCurrentUserId(null);
    }
  }, []);

  // =========================
  // REFRESH REVIEWS
  // =========================

  const refreshReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews/product/${id}`);
      if (!response.ok) throw new Error("Unable to refresh reviews");

      const data: ReviewResponse = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error) {
      console.error("Review refresh error:", error);
    }
  };

  // =========================
  // EDIT REVIEW
  // =========================

  const startEditingReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setReviewError("");
    setReviewMessage("");
  };

  const cancelEditingReview = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
  };

  const saveEditedReview = async (reviewId: number) => {
    setReviewError("");
    setReviewMessage("");

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setReviewError("Please login to edit your review.");
      return;
    }

    if (editRating === 0) {
      setReviewError("Please select a rating.");
      return;
    }

    if (!editComment.trim()) {
      setReviewError("Please write a review.");
      return;
    }

    try {
      setReviewActionLoading(true);

      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update review.");
      }

      await refreshReviews();
      cancelEditingReview();
      setReviewMessage("Your review was updated successfully! ⭐");
    } catch (error) {
      console.error("Update review error:", error);
      setReviewError(
        error instanceof Error ? error.message : "Unable to update review.",
      );
    } finally {
      setReviewActionLoading(false);
    }
  };

  // =========================
  // DELETE REVIEW
  // =========================

  const deleteReview = async (reviewId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your review? This action cannot be undone.",
    );

    if (!confirmed) return;

    setReviewError("");
    setReviewMessage("");

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setReviewError("Please login to delete your review.");
      return;
    }

    try {
      setReviewActionLoading(true);

      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to delete review.");
      }

      if (editingReviewId === reviewId) {
        cancelEditingReview();
      }

      await refreshReviews();
      setReviewMessage("Your review was deleted successfully.");
    } catch (error) {
      console.error("Delete review error:", error);
      setReviewError(
        error instanceof Error ? error.message : "Unable to delete review.",
      );
    } finally {
      setReviewActionLoading(false);
    }
  };

  // =========================
  // SUBMIT REVIEW
  // =========================

  const submitReview = async () => {
    setReviewMessage("");
    setReviewError("");

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setReviewError("Please login to write a review.");
      return;
    }

    if (selectedRating === 0) {
      setReviewError("Please select a rating.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please write a review.");
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await fetch(`${API_URL}/reviews/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: selectedRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setReviewError(
            data.message || "You have already reviewed this product.",
          );
          return;
        }

        throw new Error(data.message || "Unable to submit review.");
      }

      setReviewMessage("Review submitted successfully! ⭐");

      setSelectedRating(0);
      setReviewComment("");

      await refreshReviews();
    } catch (error) {
      console.error(error);

      setReviewError(
        error instanceof Error ? error.message : "Unable to submit review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // =========================
  // STAR DISPLAY
  // =========================

  const renderStars = (rating: number, size = "text-lg") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${size} ${
              star <= Math.round(rating) ? "text-yellow-400" : "text-slate-200"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // =========================
  // IMAGE
  // =========================

  const getImage = () => {
    if (product?.image && product.image.trim() !== "") {
      return product.image;
    }

    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80";
  };

  // =========================
  // LOADING
  // =========================

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

  // =========================
  // ERROR
  // =========================

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

          <span className="max-w-55 truncate font-semibold text-slate-800">
            {product.name}
          </span>
        </div>

        {/* ========================= */}
        {/* PRODUCT */}
        {/* ========================= */}

        <section className="overflow-hidden rounded-4xl bg-white shadow-xl shadow-slate-200/60">
          <div className="grid lg:grid-cols-2">
            {/* IMAGE */}
            <div className="relative min-h-105 bg-linear-to-br from-slate-100 via-white to-blue-50 p-6 sm:p-10 lg:min-h-162.5">
              <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-purple-100/50 blur-3xl" />

              <Link
                href="/products"
                className="relative z-10 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-200 hover:text-blue-600"
              >
                ← Back
              </Link>

              <div className="relative z-10 flex h-97.5 items-center justify-center sm:h-120 lg:h-135">
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

            {/* DETAILS */}
            <div className="flex flex-col p-6 sm:p-10 lg:p-14">
              <div className="mb-5">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-600">
                  Premium Product
                </span>
              </div>

              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              {/* REAL RATING */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {reviewsLoading ? (
                  <span className="text-sm text-slate-400">
                    Loading ratings...
                  </span>
                ) : totalReviews > 0 ? (
                  <>
                    {renderStars(averageRating)}

                    <span className="text-sm font-black text-slate-700">
                      {averageRating.toFixed(1)}
                    </span>

                    <span className="text-sm text-slate-400">
                      • {totalReviews}{" "}
                      {totalReviews === 1 ? "review" : "reviews"}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-lg text-slate-200">
                          ★
                        </span>
                      ))}
                    </div>

                    <span className="text-sm font-semibold text-slate-400">
                      No reviews yet
                    </span>
                  </>
                )}
              </div>

              {/* PRICE */}
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

              <div className="my-8 h-px bg-slate-100" />

              {/* DESCRIPTION */}
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Product Description
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {product.description ||
                    "This premium product is designed to provide excellent quality, reliability, and value. Shop with confidence and enjoy a great shopping experience."}
                </p>
              </div>

              {/* FEATURES */}
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

              {/* QUANTITY */}
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

              {/* TOTAL */}
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-blue-50 px-5 py-4">
                <span className="text-sm font-bold text-slate-600">Total</span>

                <span className="text-2xl font-black text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* BUTTONS */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={addProductToCart}
                  disabled={isOutOfStock}
                  className={`flex min-h-13.5 items-center justify-center gap-2 rounded-xl px-5 font-black transition ${
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
                  className={`flex min-h-13.5 items-center justify-center rounded-xl px-5 font-black text-white shadow-lg transition ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-slate-300 shadow-none"
                      : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30"
                  }`}
                >
                  {buying ? "Processing..." : "Buy Now →"}
                </button>
              </div>

              {/* CART */}
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

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                <span>🔒</span>
                Secure checkout • Your information is protected
              </div>
            </div>
          </div>
        </section>

        {/* ========================= */}
        {/* REVIEWS SECTION */}
        {/* ========================= */}

        <section className="mt-8 rounded-4xl bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* RATING SUMMARY */}
            <div className="lg:w-80 lg:border-r lg:border-slate-100 lg:pr-10">
              <div className="text-center lg:text-left">
                <p className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Customer Reviews
                </p>

                <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
                  <span className="text-5xl font-black text-slate-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                  </span>

                  <div>
                    {renderStars(averageRating, "text-xl")}

                    <p className="mt-1 text-sm text-slate-400">
                      {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating bars */}
              <div className="mt-8 space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(
                    (review) => review.rating === star,
                  ).length;

                  const percentage =
                    totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-6 text-sm font-bold text-slate-500">
                        {star}★
                      </span>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span className="w-5 text-right text-xs font-bold text-slate-400">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REVIEW FORM + REVIEWS */}
            <div className="flex-1">
              {/* WRITE REVIEW */}
              <div className="rounded-3xl bg-linear-to-br from-blue-50 to-slate-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Write a Review
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Share your experience with this product.
                    </p>
                  </div>

                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm sm:flex">
                    ⭐
                  </div>
                </div>

                {/* STAR SELECTOR */}
                <div className="mt-6">
                  <p className="mb-3 text-sm font-black text-slate-700">
                    Your Rating
                  </p>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="text-3xl transition hover:scale-110"
                        aria-label={`${star} star`}
                      >
                        <span
                          className={
                            star <= selectedRating
                              ? "text-yellow-400"
                              : "text-slate-300"
                          }
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* COMMENT */}
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Your Review
                  </label>

                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    rows={4}
                    placeholder="Tell us what you think about this product..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* MESSAGES */}
                {reviewError && (
                  <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {reviewError}
                  </div>
                )}

                {reviewMessage && (
                  <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">
                    {reviewMessage}
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="mt-5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingReview ? "Submitting..." : "Submit Review ⭐"}
                </button>
              </div>

              {/* REVIEWS LIST */}
              <div className="mt-10">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">
                    Customer Reviews
                  </h2>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                    {totalReviews}
                  </span>
                </div>

                {reviewsLoading ? (
                  <div className="rounded-2xl bg-slate-50 p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="mt-3 text-sm text-slate-400">
                      Loading reviews...
                    </p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                    <div className="text-4xl">💬</div>

                    <h3 className="mt-4 text-lg font-black text-slate-800">
                      No reviews yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Be the first customer to review this product.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-3xl border border-slate-100 bg-white p-5 transition hover:border-blue-100 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 font-black text-white">
                              {(review.user?.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-black text-slate-900">
                                  {review.user?.name || "Customer"}
                                </h3>

                                {currentUserId === review.userId && (
                                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600">
                                    Your review
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-400">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                                {review.updatedAt !== review.createdAt &&
                                  " • Edited"}
                              </p>
                            </div>
                          </div>

                          {!editingReviewId || editingReviewId !== review.id ? (
                            <div className="shrink-0">
                              {renderStars(review.rating)}
                            </div>
                          ) : null}
                        </div>

                        {editingReviewId === review.id ? (
                          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                            <p className="mb-3 text-sm font-black text-slate-700">
                              Edit your rating
                            </p>

                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditRating(star)}
                                  disabled={reviewActionLoading}
                                  className="text-3xl transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                                  aria-label={`${star} star`}
                                >
                                  <span
                                    className={
                                      star <= editRating
                                        ? "text-yellow-400"
                                        : "text-slate-300"
                                    }
                                  >
                                    ★
                                  </span>
                                </button>
                              ))}
                            </div>

                            <textarea
                              value={editComment}
                              onChange={(event) =>
                                setEditComment(event.target.value)
                              }
                              rows={4}
                              disabled={reviewActionLoading}
                              className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                              placeholder="Update your review..."
                            />

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => saveEditedReview(review.id)}
                                disabled={reviewActionLoading}
                                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {reviewActionLoading
                                  ? "Saving..."
                                  : "✓ Save Changes"}
                              </button>

                              <button
                                type="button"
                                onClick={cancelEditingReview}
                                disabled={reviewActionLoading}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="mt-4 leading-7 text-slate-600">
                              {review.comment}
                            </p>

                            {currentUserId === review.userId && (
                              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                <button
                                  type="button"
                                  onClick={() => startEditingReview(review)}
                                  disabled={reviewActionLoading}
                                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteReview(review.id)}
                                  disabled={reviewActionLoading}
                                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM INFORMATION */}
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

        {/* CONTINUE SHOPPING */}
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
