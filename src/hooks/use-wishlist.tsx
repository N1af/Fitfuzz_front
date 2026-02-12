import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export interface WishlistItem {
  id: number | string;
  name: string;
  price: number;
  image_url: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number | string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [localLoaded, setLocalLoaded] = useState(false);

  /* ===============================
     Load wishlist AFTER login
  ================================= */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setWishlistItems([]);
      setLocalLoaded(true);
      return;
    }

    const stored = localStorage.getItem(`wishlist_${user.id}`);
    const parsed = stored ? JSON.parse(stored) : [];
    setWishlistItems(parsed);
    setLocalLoaded(true);

    // ✅ handle pending wishlist item
    const pending = sessionStorage.getItem("pending_wishlist");
    if (pending) {
      const item: WishlistItem = JSON.parse(pending);
      setWishlistItems(prev =>
        prev.some(i => i.id === item.id) ? prev : [...prev, item]
      );
      sessionStorage.removeItem("pending_wishlist");
    }
  }, [user, authLoading]);

  /* ===============================
     Persist wishlist
  ================================= */
  useEffect(() => {
    if (user && localLoaded) {
      localStorage.setItem(
        `wishlist_${user.id}`,
        JSON.stringify(wishlistItems)
      );
    }
  }, [wishlistItems, user, localLoaded]);

  /* ===============================
     Actions
  ================================= */

  const addItem = (item: WishlistItem) => {
    if (!user) {
      // 🔥 Save intent & force login
      sessionStorage.setItem("pending_wishlist", JSON.stringify(item));
      window.location.href = "/login";
      return;
    }

    setWishlistItems(prev =>
      prev.some(i => i.id === item.id) ? prev : [...prev, item]
    );
  };

  const removeItem = (id: number | string) => {
    setWishlistItems(prev => prev.filter(i => i.id !== id));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    if (user) localStorage.removeItem(`wishlist_${user.id}`);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, addItem, removeItem, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
};
