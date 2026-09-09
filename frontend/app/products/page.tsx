"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "../Context/CartContext";

type BackendProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  createdAt?: string;
  updatedAt?: string;
};

type Product = BackendProduct & {
  oldPrice?: number;
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
    oldPrice: 999,
    rating: 4.8,
    reviews: 124,
    category: "Electronics",
  },

  "Smartphone Pro": {
    oldPrice: 799,
    rating: 4.7,
    reviews: 98,
    category: "Electronics",
  },

  "Wireless Headphones": {
    oldPrice: 149,
    rating: 4.6,
    reviews: 86,
    category: "Audio",
  },

  "Smart Watch": {
    oldPrice: 229,
    rating: 4.8,
    reviews: 73,
    category: "Wearables",
  },

  "Modern Camera": {
    oldPrice: 699,
    rating: 4.7,
    reviews: 61,
    category: "Photography",
  },

  "Gaming Keyboard": {
    oldPrice: 129,
    rating: 4.6,
    reviews: 54,
    category: "Gaming",
  },

  "Wireless Speaker": {
    oldPrice: 119,
    rating: 4.5,
    reviews: 45,
    category: "Audio",
  },

  "Gaming Mouse": {
    oldPrice: 89,
    rating: 4.7,
    reviews: 39,
    category: "Gaming",
  },

  "Dell Laptop": {
    oldPrice: 949,
    rating: 4.7,
    reviews: 82,
    category: "Electronics",
  },

  "Samsung Galaxy S25": {
    oldPrice: 899,
    rating: 4.9,
    reviews: 113,
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

  // What the user is typing
  const [search, setSearch] = useState("");

  // Search only becomes active after clicking Search or pressing Enter
  const [searchSubmitted, setSearchSubmitted] = useState("");

  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const [wishlist, setWishlist] = useState<number[]>([]);
  const [addedProduct, setAddedProduct] = useState<number | null>(null);

  /*
  ============================================================
  LOAD PRODUCTS
  ============================================================
  */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("http://localhost:3001/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: BackendProduct[] = await response.json();

        const enhancedProducts: Product[] = data.map((product) => ({
          ...product,
          oldPrice: catalogInfo[product.name]?.oldPrice,
          rating: catalogInfo[product.name]?.rating ?? 4.5,
          reviews: catalogInfo[product.name]?.reviews ?? 20,
          category: catalogInfo[product.name]?.category ?? "Electronics",
        }));

        setProducts(enhancedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadProducts();
  }, []);

  /*
  ============================================================
  SEARCH
  ============================================================
  */

  const handleSearch = () => {
    setSearchSubmitted(search.trim());

    // Scroll to products after searching
    setTimeout(() => {
      document.getElementById("product-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchSubmitted("");
  };

  /*
  ============================================================
  FILTER + SORT
  ============================================================
  */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchSubmitted.trim()) {
      const keyword = searchSubmitted.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(keyword) ||
          product.description.toLowerCase().includes(keyword) ||
          product.category.toLowerCase().includes(keyword),
      );
    }

    // Category
    if (category !== "All") {
      result = result.filter((product) => product.category === category);
    }

    // Sorting
    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "newest") {
      result.reverse();
    }

    return result;
  }, [products, searchSubmitted, category, sort]);

  /*
  ============================================================
  WISHLIST
  ============================================================
  */

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  /*
  ============================================================
  ADD TO CART
  ============================================================
  */

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    });

    setAddedProduct(product.id);

    setTimeout(() => {
      setAddedProduct(null);
    }, 1500);
  };

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}

          <a href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-violet-600 text-xl shadow-lg shadow-blue-500/20 transition duration-300 group-hover:scale-105">
              🛍️
            </div>

            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900">
                E-Shop
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                Smart Shopping
              </div>
            </div>
          </a>

          {/* Navigation */}

          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="/"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="/products"
              className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600"
            >
              Products
            </a>

            <a
              href="/orders"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            >
              Orders
            </a>

            <a
              href="/cart"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            >
              Cart
            </a>
          </nav>

          {/* Right side */}

          <div className="flex items-center gap-3">
            {/* Cart icon */}

            <a
              href="/cart"
              className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 sm:flex"
            >
              🛒
            </a>

            {/* Login */}

            <a
              href="/login"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-blue-600"
            >
              Login
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-white">
        {/* Background decorations */}

        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            {/* =================================================
                HERO LEFT
            ================================================== */}

            <div>
              {/* Badge */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                New collection is here
              </div>

              {/* Heading */}

              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Discover products
                <span className="block bg-linear-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  made for you.
                </span>
              </h1>

              {/* Description */}

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                Explore our latest collection of technology, gaming gear, audio
                devices and everyday essentials— all in one beautiful shopping
                experience.
              </p>

              {/* =================================================
                  SEARCH BOX
              ================================================== */}

              <div className="mt-8 flex max-w-2xl items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60">
                {/* Search icon */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  🔍
                </div>

                {/* Input */}

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Search for products..."
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
                />

                {/* Clear button */}

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                  >
                    ×
                  </button>
                )}

                {/* Search button */}

                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-xl bg-linear-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-xl"
                >
                  Search
                </button>
              </div>

              {/* Search status */}

              {searchSubmitted && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <span>
                    Showing results for{" "}
                    <strong className="text-slate-900">
                      "{searchSubmitted}"
                    </strong>
                  </span>

                  <button
                    type="button"
                    onClick={clearSearch}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* =================================================
                  STATS
              ================================================== */}

              <div className="mt-8 flex flex-wrap gap-7">
                <div>
                  <div className="text-2xl font-black text-slate-900">100+</div>

                  <div className="text-xs font-medium text-slate-400">
                    Quality Products
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-200" />

                <div>
                  <div className="text-2xl font-black text-slate-900">
                    4.8/5
                  </div>

                  <div className="text-xs font-medium text-slate-400">
                    Customer Rating
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-200" />

                <div>
                  <div className="text-2xl font-black text-slate-900">Fast</div>

                  <div className="text-xs font-medium text-slate-400">
                    Secure Delivery
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                HERO RIGHT
            ================================================== */}

            <div className="relative hidden min-h-107.5 lg:block">
              {/* Main product card */}

              <div className="absolute right-5 top-10 w-90 rotate-2 rounded-4xl border border-white bg-white p-5 shadow-2xl shadow-slate-300/50">
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-50 via-indigo-50 to-violet-100 p-8">
                  {/* Trending badge */}

                  <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-600 shadow-sm">
                    TRENDING
                  </div>

                  {/* Product image */}

                  <div className="flex h-64 items-center justify-center">
                    {products[0]?.image ? (
                      <img
                        src={products[0].image}
                        alt={products[0].name}
                        className="h-full w-full object-contain drop-shadow-2xl"
                      />
                    ) : (
                      <div className="text-8xl">💻</div>
                    )}
                  </div>
                </div>

                {/* Product information */}

                <div className="px-2 pb-1 pt-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Featured Product
                  </div>

                  <div className="mt-1 text-xl font-extrabold text-slate-900">
                    {products[0]?.name || "Premium Technology"}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-black text-slate-900">
                      ${products[0]?.price ?? "899"}
                    </span>

                    <span className="text-sm text-amber-500">★ 4.8</span>
                  </div>
                </div>
              </div>

              {/* Floating security card */}

              <div className="absolute bottom-8 left-0 flex items-center gap-3 rounded-2xl border border-white bg-white p-4 shadow-xl shadow-slate-300/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  ✓
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Secure Shopping
                  </div>

                  <div className="text-xs text-slate-400">
                    Safe & trusted checkout
                  </div>
                </div>
              </div>

              {/* Floating circle */}

              <div className="absolute right-0 top-0 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-blue-600 text-3xl shadow-xl shadow-violet-300/40">
                ✨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTER AREA
      ====================================================== */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Title */}

            <div>
              <p className="text-sm font-semibold text-blue-600">
                Our collection
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Explore our products
              </h2>
            </div>

            {/* Filters */}

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Categories */}

              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      category === item
                        ? "bg-slate-900 text-white shadow-lg"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Sort */}

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-blue-500"
              >
                <option value="featured">Featured</option>

                <option value="newest">Newest</option>

                <option value="rating">Top Rated</option>

                <option value="price-low">Price: Low to High</option>

                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT RESULTS
      ====================================================== */}

      <section
        id="product-results"
        className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        {/* Result count */}

        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            <span className="font-bold text-slate-900">
              {filteredProducts.length}
            </span>{" "}
            products found
          </div>

          {searchSubmitted && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Product grid */}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image */}

              <div className="relative h-64 bg-slate-100">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}

                {/* Wishlist */}

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg shadow-lg transition hover:scale-110"
                >
                  {wishlist.includes(product.id) ? "❤️" : "♡"}
                </button>
              </div>

              {/* Information */}

              <div className="p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {product.category}
                </div>

                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {product.name}
                </h3>

                <div className="mt-2 text-sm text-amber-500">
                  ★ {product.rating}{" "}
                  <span className="text-slate-400">({product.reviews})</span>
                </div>

                {/* Price */}

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900">
                    ${product.price}
                  </span>

                  {product.oldPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      ${product.oldPrice}
                    </span>
                  )}
                </div>

                {/* Add to cart */}

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-blue-600"
                >
                  {addedProduct === product.id
                    ? "✓ Added to Cart"
                    : "Add to Cart"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* No products */}

        {filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <div className="text-5xl">🔎</div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No products found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              We couldn't find anything matching your search.
            </p>

            <button
              type="button"
              onClick={() => {
                clearSearch();
                setCategory("All");
              }}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              View All Products
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
