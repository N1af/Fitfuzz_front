/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";

/* ===============================
   Types
================================= */

interface CartItem {
  image_url: string;
  id: string;
  name: string;
  price: number;
  quantity: number;
  seller_id: string;
  selectedColorId?: number | null;
  selectedColorName?: string | null; // ✅ ADDED
  selectedSizeId?: number | null;
  selectedSizeName?: string | null; // ✅ ADDED
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => Promise<void>;

  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ===============================
   Helpers
================================= */

const getUserId = (): string | null => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    const parsed = JSON.parse(user);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
};

const getCartKey = (userId: string) => `cart_${userId}`;

const getItemKey = (item: {
  id: string;
  selectedColorId?: number | null;
  selectedSizeId?: number | null;
}) =>
  `${item.id}_${item.selectedColorId ?? "no-color"}_${
    item.selectedSizeId ?? "no-size"
  }`;

/* ===============================
   Provider
================================= */

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(getUserId());

  /* Detect login / logout */
  useEffect(() => {
    const handleStorage = () => {
      setUserId(getUserId());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /* Load cart after login */
  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }

    const saved = localStorage.getItem(getCartKey(userId));
    if (!saved) {
      setItems([]);
      return;
    }

    try {
      setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    }
  }, [userId]);

  /* Save cart */
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(getCartKey(userId), JSON.stringify(items));
  }, [items, userId]);

  /* ===============================
     Cart Actions
  ================================= */

  const addItem: CartContextType["addItem"] = async (newItem) => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    return new Promise((resolve) => {
      setItems((prev) => {
        const key = getItemKey(newItem);

        const index = prev.findIndex((item) => getItemKey(item) === key);

        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            quantity: updated[index].quantity + (newItem.quantity ?? 1),
          };
          return updated;
        }

        return [
          ...prev,
          {
            ...newItem,
            quantity: newItem.quantity ?? 1,
          },
        ];
      });

      setTimeout(() => resolve(), 50);
    });
  };

  const removeItem = (key: string) => {
    if (!userId) return;
    setItems((prev) => prev.filter((item) => getItemKey(item) !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (!userId) return;

    if (quantity <= 0) {
      removeItem(key);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        getItemKey(item) === key ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    if (!userId) return;
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ===============================
   Hook
================================= */

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
