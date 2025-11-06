import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp?: number;           // MRP (Maximum Retail Price) for showing crossed out price
  image: string;
  quantity: number;
  category: string;
  size: string;           // size selected in cart
  shippingPrice?: number; // optional shipping price per item
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity" | "size">, size?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSize: (id: string, size: string, newPrice?: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getShippingTotal: () => number;
  getProductQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to cart
  const addToCart = (product: Omit<CartItem, "quantity" | "size">, size: string = "") => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, size: size || item.size }
            : item
        );
      }
      return [...prev, { ...product, id: String(product.id), quantity: 1, size }];
    });
  };

  // Remove product
  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Update quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  // Update size (and optionally price)
  const updateSize = (id: string, size: string, newPrice?: number) => {
    const totalFromSize = size
      .match(/\d+/g)
      ?.map(Number)
      .reduce((sum, num) => sum + num, 0) || 0;

    if (!size.trim() || totalFromSize <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, size, quantity: totalFromSize, price: newPrice ?? item.price }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => setCartItems([]);

  // Get total price
  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Get total quantity
  const getCartCount = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get total shipping
  const getShippingTotal = () =>
  cartItems.reduce(
    (total, item) =>
      total + (item.shippingPrice ? item.shippingPrice : 0) * item.quantity,
    0
  );
  // Get quantity of a specific product
  const getProductQuantity = (id: string) => {
    const item = cartItems.find(p => p.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        clearCart,
        getCartTotal,
        getCartCount,
        getShippingTotal,
        getProductQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
