"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  reviews?: number;
  category?: string;
  image?: string | null;
  stock?: number;
};

type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  increaseQuantity: (productId: number) => Promise<void>;
  decreaseQuantity: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_URL = "http://localhost:3001";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Get JWT token
  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("accessToken");
  };

  const clearInvalidSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setCart([]);
  };

  // Load cart from backend
  const refreshCart = async () => {
    const token = getToken();

    if (!token) {
      setCart([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          clearInvalidSession();
          return;
        }

        throw new Error(data.message || "Failed to load cart");
      }

      const formattedCart: CartItem[] = (data.items || []).map((item: any) => ({
        ...item.product,
        quantity: item.quantity,
      }));

      setCart(formattedCart);
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  // Load cart when application starts
  useEffect(() => {
    refreshCart();
  }, []);

  // Add product to cart
  const addToCart = async (product: Product) => {
    const token = getToken();

    if (!token) {
      alert("Please login first to add products to your cart.");
      return;
    }

    console.log("=================================");
    console.log("ADDING PRODUCT TO CART");
    console.log("PRODUCT:", product);
    console.log("PRODUCT ID:", product.id);
    console.log("TOKEN EXISTS:", !!token);
    console.log("=================================");

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: Number(product.id),
          quantity: 1,
        }),
      });

      const data = await response.json();

      console.log("CART RESPONSE STATUS:", response.status);
      console.log("CART RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      await refreshCart();

      alert(`${product.name} added to cart successfully!`);
    } catch (error) {
      console.error("Add to cart error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to add product to cart",
      );
    } finally {
      setLoading(false);
    }
  };

  // Increase quantity
  const increaseQuantity = async (productId: number) => {
    const token = getToken();

    if (!token) {
      alert("Please login first.");
      return;
    }

    const item = cart.find((product) => product.id === productId);

    if (!item) {
      return;
    }

    if (typeof item.stock === "number" && item.quantity >= item.stock) {
      alert(`Not enough stock available. Only ${item.stock} available.`);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: item.quantity + 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to increase quantity");
      }

      await refreshCart();
    } catch (error) {
      console.error("Increase quantity error:", error);

      alert(
        error instanceof Error ? error.message : "Failed to increase quantity",
      );
    } finally {
      setLoading(false);
    }
  };

  // Decrease quantity
  const decreaseQuantity = async (productId: number) => {
    const token = getToken();

    if (!token) {
      alert("Please login first.");
      return;
    }

    const item = cart.find((product) => product.id === productId);

    if (!item) {
      return;
    }

    // If quantity is 1, remove the product
    if (item.quantity === 1) {
      await removeFromCart(productId);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: item.quantity - 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to decrease quantity");
      }

      await refreshCart();
    } catch (error) {
      console.error("Decrease quantity error:", error);

      alert(
        error instanceof Error ? error.message : "Failed to decrease quantity",
      );
    } finally {
      setLoading(false);
    }
  };

  // Remove product
  const removeFromCart = async (productId: number) => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove product");
      }

      await refreshCart();
    } catch (error) {
      console.error("Remove from cart error:", error);

      alert(
        error instanceof Error ? error.message : "Failed to remove product",
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    const token = getToken();

    if (!token) {
      setCart([]);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear cart");
      }

      setCart([]);
    } catch (error) {
      console.error("Clear cart error:", error);

      alert(error instanceof Error ? error.message : "Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  // Total number of products
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Total price
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
