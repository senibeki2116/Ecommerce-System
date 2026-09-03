"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "../Context/CartContext";
import Navbar from "../Components/Navbar";

type BackendProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Product = BackendProduct & {
  oldPrice: number;
  rating: number;
  reviews: number;
  category: string;
};

const catalogInfo: Record<
  string,
  {
    oldPrice: number;
    rating: number;
    reviews: number;
    category: string;
  }
> = {
  "Premium Laptop": {
    oldPrice: 899,
    rating: 4.8,
    reviews: 124,
    category: "Electronics",
  },

  "Smartphone Pro": {
    oldPrice: 599,
    rating: 4.7,
    reviews: 98,
    category: "Electronics",
  },

  "Wireless Headphones": {
    oldPrice: 129,
    rating: 4.9,
    reviews: 215,
    category: "Audio",
  },

  "Smart Watch": {
    oldPrice: 199,
    rating: 4.6,
    reviews: 87,
    category: "Wearables",
  },

  "Modern Camera": {
    oldPrice: 799,
    rating: 4.8,
    reviews: 76,
    category: "Photography",
  },

  "Gaming Keyboard": {
    oldPrice: 99,
    rating: 4.7,
    reviews: 154,
    category: "Gaming",
  },

  "Wireless Speaker": {
    oldPrice: 159,
    rating: 4.6,
    reviews: 63,
    category: "Audio",
  },

  "Gaming Mouse": {
    oldPrice: 69,
    rating: 4.8,
    reviews: 201,
    category: "Gaming",
  },

  "Dell Laptop": {
    oldPrice: 60000,
    rating: 4.5,
    reviews: 40,
    category: "Electronics",
  },

  "Samsung Galaxy S25": {
    oldPrice: 40000,
    rating: 4.7,
    reviews: 55,
    category: "Electronics",
  },
};

const categories = [
  "All",
  "Electronics",
  "Gaming",
  "Audio",
  "Wearables",
  "Photography",
];

export default function ProductsPage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const [wishlist, setWishlist] = useState<number[]>([]);
  const [addedProduct, setAddedProduct] = useState<number | null>(null);

  // ==========================================
  // LOAD PRODUCTS FROM BACKEND
  // ==========================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch("http://localhost:3001/products");

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const backendProducts: BackendProduct[] = await response.json();

        const formattedProducts: Product[] = backendProducts.map((product) => {
          const info = catalogInfo[product.name];

          return {
            ...product,

            oldPrice: info?.oldPrice ?? product.price,

            rating: info?.rating ?? 4.5,

            reviews: info?.reviews ?? 0,

            category: info?.category ?? "Electronics",
          };
        });

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // ==========================================
  // WISHLIST
  // ==========================================

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id],
    );
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = async (product: Product) => {
    try {
      console.log("Adding product to cart:", product);

      await addToCart(product);

      setAddedProduct(product.id);

      setTimeout(() => {
        setAddedProduct(null);
      }, 1500);
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  // ==========================================
  // SEARCH + FILTER + SORT
  // ==========================================

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, search, sortBy]);

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Loading Products...
            </h2>

            <p className="mt-2 text-gray-500">
              Please wait while we load our products.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              ✨ Explore Our Collection
            </div>

            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Find Products
              <span className="block text-blue-200">You&apos;ll Love.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              Discover high-quality electronics, gaming accessories, audio
              products and more at amazing prices.
            </p>

            {/* Search */}

            <div className="mt-8 max-w-2xl">
              <div className="flex items-center overflow-hidden rounded-2xl bg-white p-2 shadow-2xl">
                <span className="px-3 text-xl text-gray-400">🔎</span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent px-2 py-3 text-gray-900 outline-none"
                />

                <button
                  type="button"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}

      <main className="mx-auto max-w-7xl px-6 py-14">
        {/* Heading */}

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Shop Now
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
                Popular Products
              </h2>

              <p className="mt-2 text-gray-500">
                Discover our best-selling products.
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              {filteredProducts.length} Products
            </div>
          </div>
        </div>

        {/* Filters */}

        <div className="mb-10 flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* ================= PRODUCT GRID ================= */}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const discount =
                product.oldPrice > product.price
                  ? Math.round(
                      ((product.oldPrice - product.price) / product.oldPrice) *
                        100,
                    )
                  : 0;

              const isFavorite = wishlist.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  {/* Product Image */}

                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        📦
                      </div>
                    )}

                    {/* Discount */}

                    {discount > 0 && (
                      <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                        -{discount}%
                      </div>
                    )}

                    {/* Wishlist */}

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={`${
                        isFavorite ? "Remove" : "Add"
                      } ${product.name} ${isFavorite ? "from" : "to"} wishlist`}
                      className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl shadow-md backdrop-blur transition hover:scale-110 ${
                        isFavorite ? "text-red-500" : "text-gray-600"
                      }`}
                    >
                      {isFavorite ? "♥" : "♡"}
                    </button>

                    {/* Quick View */}

                    <div className="absolute bottom-4 left-4 right-4 translate-y-16 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <button
                        type="button"
                        className="w-full rounded-xl bg-white/95 py-3 text-sm font-bold text-gray-900 shadow-lg backdrop-blur transition hover:bg-white"
                      >
                        👁 Quick View
                      </button>
                    </div>
                  </div>

                  {/* Product Information */}

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                      {product.category}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-gray-900">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {product.description}
                    </p>

                    {/* Rating */}

                    <div className="mt-4 flex items-center gap-2">
                      <div className="text-sm tracking-wide text-yellow-400">
                        ★★★★★
                      </div>

                      <span className="text-sm font-semibold text-gray-700">
                        {product.rating}
                      </span>

                      <span className="text-xs text-gray-400">
                        ({product.reviews})
                      </span>
                    </div>

                    {/* Stock */}

                    <div className="mt-3 text-xs font-semibold">
                      {product.stock > 0 ? (
                        <span className="text-green-600">
                          ✓ {product.stock} in stock
                        </span>
                      ) : (
                        <span className="text-red-500">Out of stock</span>
                      )}
                    </div>

                    {/* Price */}

                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-2xl font-extrabold text-gray-900">
                        ${product.price}
                      </span>

                      {product.oldPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.oldPrice}
                        </span>
                      )}
                    </div>

                    {/* Add To Cart */}

                    <button
                      type="button"
                      disabled={
                        product.stock <= 0 || addedProduct === product.id
                      }
                      onClick={() => handleAddToCart(product)}
                      className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white transition duration-300 active:scale-95 ${
                        addedProduct === product.id
                          ? "bg-green-600"
                          : product.stock <= 0
                            ? "cursor-not-allowed bg-gray-400"
                            : "bg-gray-900 hover:bg-blue-600"
                      }`}
                    >
                      <span>{addedProduct === product.id ? "✓" : "🛒"}</span>

                      {addedProduct === product.id
                        ? "Added to Cart!"
                        : product.stock <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* No Results */

          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="text-6xl">🔎</div>

            <h3 className="mt-5 text-2xl font-bold text-gray-900">
              No products found
            </h3>

            <p className="mt-2 text-gray-500">
              Try another search or select a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Show All Products
            </button>
          </div>
        )}

        {/* Bottom Banner */}

        <section className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white shadow-xl md:px-14">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
                Special Offer
              </p>

              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
                Save More. Shop More.
              </h2>

              <p className="mt-3 text-blue-100">
                Enjoy amazing deals on selected products.
              </p>
            </div>

            <button
              type="button"
              className="whitespace-nowrap rounded-xl bg-white px-7 py-3.5 font-bold text-blue-700 shadow-lg transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Explore Deals →
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xl font-extrabold text-gray-900">
            Shop<span className="text-blue-600">Ease</span>
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Quality products. Great prices. Easy shopping.
          </p>

          <p className="mt-4 text-xs text-gray-400">
            © 2026 ShopEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
