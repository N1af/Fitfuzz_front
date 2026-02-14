import React, { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "../api";
import { Link } from "react-router-dom";

// Define types
interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  seller_id: string;
  quantity: number;
  selectedColorId?: number | null;
  selectedColorName?: string | null;
  selectedSizeId?: number | null;
  selectedSizeName?: string | null;
  productId?: string; // Add this if your cart items have productId
}

interface Color {
  id: number;
  name: string;
}

interface Size {
  id: number;
  name: string;
}

interface LocationData {
  id: number;
  delivery_charge: number;
  province?: string;
  district?: string;
  village?: string;
  phone?: string;
}

interface CheckoutItem {
  product_id: number;
  quantity: number;
  price: number;
  seller_id: number;
  color_id?: number | null;
  size_id?: number | null;
}

const Checkout = () => {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [latestLocation, setLatestLocation] = useState<LocationData | null>(
    null,
  );

  const [step, setStep] = useState<"summary" | "payment">("summary");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const totalItemsPrice = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  const deliveryFee = Number(latestLocation?.delivery_charge || 0);
  const grandTotal = Number(totalItemsPrice) + Number(deliveryFee);

  // Fetch colors and sizes
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [colorRes, sizeRes] = await Promise.all([
          api.get("/api/colors"),
          api.get("/api/sizes"),
        ]);

        setColors(colorRes.data || []);
        setSizes(sizeRes.data || []);
      } catch (err) {
        console.error("Master fetch error", err);
      }
    };
    fetchMasters();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fetch latest delivery location
  useEffect(() => {
    if (!user) return;

    const fetchLatestLocation = async () => {
      try {
        const res = await api.get(`/api/locations/latest/${user.id}`);
        if (res.data) {
          setLatestLocation(res.data);
        }
      } catch (err) {
        console.error("❌ Fetch latest location failed", err);
      }
    };

    fetchLatestLocation();
  }, [user]);

  // FIXED: Safe extraction of product ID from cart item
  const extractProductId = (item: CartItem): number => {
    // 1. If item has productId field (from cart)
    if (item.productId) {
      return Number(item.productId);
    }

    // 2. Try to extract from composite ID (format: productId-colorId-sizeId)
    // Check if id is a string before using match
    if (typeof item.id === 'string') {
      const productIdMatch = item.id.match(/^(\d+)/);
      if (productIdMatch) {
        return Number(productIdMatch[1]);
      }
    }

    // 3. Try to convert the entire id to a number
    const numericId = Number(item.id);
    if (!isNaN(numericId)) {
      return numericId;
    }

    // 4. Fallback - log error and return 0
    console.error("Could not extract product ID from item:", item);
    return 0;
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (items.length === 0) return alert("Your cart is empty!");
    if (!latestLocation)
      return alert("Please select a delivery location first!");

    setIsPlacingOrder(true);

    console.log("=== DEBUG: Cart Items Before Processing ===");
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        seller_id: item.seller_id,
        selectedColorId: item.selectedColorId,
        selectedColorName: item.selectedColorName,
        selectedSizeId: item.selectedSizeId,
        selectedSizeName: item.selectedSizeName,
        hasSelectedColorId: item.selectedColorId !== undefined,
        hasSelectedSizeId: item.selectedSizeId !== undefined,
        colorIdType: typeof item.selectedColorId,
        sizeIdType: typeof item.selectedSizeId,
      });
    });

    try {
      // Map items for backend
      const itemsWithSeller = items.map((item: CartItem) => {
        // Extract product ID from cart item
        const productId = extractProductId(item);
        
        // Convert color and size IDs - handle different possible formats
        let colorId = null;
        let sizeId = null;
        
        // Handle color_id - try multiple ways to get it
        if (item.selectedColorId !== undefined && item.selectedColorId !== null) {
          if (typeof item.selectedColorId === 'number') {
            colorId = item.selectedColorId;
          } else if (typeof item.selectedColorId === 'string' && item.selectedColorId.trim() !== '') {
            const parsedColorId = parseInt(item.selectedColorId);
            colorId = isNaN(parsedColorId) ? null : parsedColorId;
          }
        }
        
        // Handle size_id - try multiple ways to get it
        if (item.selectedSizeId !== undefined && item.selectedSizeId !== null) {
          if (typeof item.selectedSizeId === 'number') {
            sizeId = item.selectedSizeId;
          } else if (typeof item.selectedSizeId === 'string' && item.selectedSizeId.trim() !== '') {
            const parsedSizeId = parseInt(item.selectedSizeId);
            sizeId = isNaN(parsedSizeId) ? null : parsedSizeId;
          }
        }
        
        console.log("Processed item for backend:", {
          product_id: productId,
          quantity: item.quantity,
          price: item.price,
          seller_id: item.seller_id,
          color_id: colorId,
          size_id: sizeId,
          originalColorId: item.selectedColorId,
          originalSizeId: item.selectedSizeId,
        });

        return {
          product_id: Number(productId),
          quantity: Number(item.quantity ?? 1),
          price: Number(item.price),
          seller_id: Number(item.seller_id),
          color_id: colorId,
          size_id: sizeId,
        };
      });

      console.log("=== DEBUG: Data being sent to backend ===", {
        user_id: user!.id,
        location_id: latestLocation.id,
        items: itemsWithSeller,
        total: Number(grandTotal),
        payment_method: paymentMethod,
      });

      const response = await api.post("/api/checkout", {
        user_id: user!.id,
        location_id: latestLocation.id,
        items: itemsWithSeller,
        total: Number(grandTotal),
        payment_method: paymentMethod,
      });

      if (response.data.success) {
        alert(
          `✅ Order placed successfully! Tracking ID: ${response.data.tracking_id}\nYou will be redirected to home page.`,
        );
        clearCart();
        navigate("/");
      } else {
        alert("❌ Failed to place order: " + (response.data.error || "Unknown error"));
      }
    } catch (error: any) {
      console.error("❌ Error placing order:", error);
      console.error("Full error details:", error.response?.data);
      
      let errorMessage = "Failed to place order. Please try again.";
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Navigate to product details
  const goToProductDetails = (item: CartItem) => {
    const productId = extractProductId(item);
    if (productId && productId !== 0) {
      navigate(`/product/${productId}`);
    } else {
      console.error("Cannot navigate: Invalid product ID", item);
      alert("Cannot view product details: Invalid product ID");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16">
      <div className="container mx-auto px-6 lg:px-16">
        <motion.h1
          className="text-4xl font-semibold text-center mb-12 tracking-tight text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Checkout
        </motion.h1>

        {items.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4 text-lg">Your cart is empty.</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-black text-white px-6"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            {/* Left side - Order Items */}
            <motion.div
              className="md:col-span-2 bg-white shadow-lg rounded-3xl p-8 border border-gray-100"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                Your Order ({items.length}{" "}
                {items.length === 1 ? "item" : "items"})
              </h2>
              <div className="divide-y divide-gray-100">
                {(items as CartItem[]).map((item, index) => {
                  const itemKey = `${item.id}_${item.selectedColorId ?? "no-color"}_${item.selectedSizeId ?? "no-size"}_${index}`;
                  const productId = extractProductId(item);

                  return (
                    <div
                      key={itemKey}
                      className="py-4 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <button
                          onClick={() => goToProductDetails(item)}
                          className="relative group"
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-24 h-24 rounded-2xl object-cover bg-gray-100 group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-2xl transition-all" />
                        </button>
                        <div>
                          <button
                            onClick={() => goToProductDetails(item)}
                            className="text-left"
                          >
                            <p className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {item.name}
                            </p>
                          </button>
                          {item.selectedColorName && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Color:</span>{" "}
                              {item.selectedColorName}
                              {item.selectedColorId &&
                                ` (ID: ${item.selectedColorId})`}
                            </p>
                          )}
                          {item.selectedSizeName && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Size:</span>{" "}
                              {item.selectedSizeName}
                              {item.selectedSizeId &&
                                ` (ID: ${item.selectedSizeId})`}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Qty:</span>{" "}
                            {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-gray-700">
                            Rs. {Number(item.price).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Product ID: {productId} | Seller ID:{" "}
                            {item.seller_id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-lg">
                          Rs.{" "}
                          {(
                            Number(item.price) * Number(item.quantity)
                          ).toLocaleString()}
                        </p>
                        <button
                          onClick={() => goToProductDetails(item)}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                        >
                          View Product →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  ← Continue Shopping
                </Button>
              </div>
            </motion.div>

            {/* Right side - Payment */}
            <motion.div
              className="bg-white shadow-lg rounded-3xl p-8 border border-gray-100 h-fit sticky top-28"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {step === "summary" && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                      Shipping & Billing
                    </h2>

                    {latestLocation ? (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                        <p className="text-gray-700 mb-2">
                          <span className="font-medium">Delivery to:</span>
                        </p>
                        <p className="text-gray-700">
                          {latestLocation.village || "Address"},{" "}
                          {latestLocation.district || "District"},{" "}
                          {latestLocation.province || "Province"}
                        </p>
                        <p className="text-gray-700 mt-2">
                          <span className="font-medium">Delivery Charge:</span>{" "}
                          Rs. {deliveryFee.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
                        <p className="text-yellow-700">
                          ⚠️ No delivery location selected. Please add a
                          delivery location first.
                        </p>
                        <Button
                          className="mt-2"
                          onClick={() => navigate("/account?tab=locations")}
                        >
                          Add Delivery Location
                        </Button>
                      </div>
                    )}

                    <h3 className="text-lg font-medium mb-3 text-gray-900">
                      Order Summary
                    </h3>

                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between text-sm">
                        <span>Items Total ({items.length} items)</span>
                        <span>Rs. {totalItemsPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee</span>
                        <span>Rs. {deliveryFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-3 mt-3 text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-gray-900">
                          Rs. {grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-8 bg-black text-white text-lg py-4 rounded-xl hover:bg-gray-800"
                      onClick={() => setStep("payment")}
                      disabled={!latestLocation}
                    >
                      {!latestLocation
                        ? "Add Delivery Location First"
                        : "Proceed to Pay"}
                    </Button>
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                      Payment Method
                    </h2>

                    <div className="space-y-4 mb-6">
                      <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">
                            Pay when you receive your order
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">Credit / Debit Card</p>
                          <p className="text-sm text-gray-500">
                            Pay securely with your card
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2 text-gray-900">
                        Order Total
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">
                        Rs. {grandTotal.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <Button
                        variant="outline"
                        className="w-1/2"
                        onClick={() => setStep("summary")}
                      >
                        ← Back
                      </Button>
                      <Button
                        className="w-1/2 bg-black text-white text-lg py-4 rounded-xl hover:bg-gray-800"
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || !latestLocation}
                      >
                        {isPlacingOrder ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Placing Order...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Checkout;