import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/hooks/use-wishlist";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <WishlistProvider>
      <App />
    </WishlistProvider>
  </AuthProvider>
);
