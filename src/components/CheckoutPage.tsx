import React, { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "../api";

const Checkout = () => {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [latestLocation, setLatestLocation] = useState<{
    id: number;
    delivery_charge: number;
  } | null>(null);

  const [step, setStep] = useState<"summary" | "payment">("summary");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");

  const totalItemsPrice = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryFee = Number(latestLocation?.delivery_charge || 0);
  const grandTotal = Number(totalItemsPrice) + Number(deliveryFee);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchLatestLocation = async () => {
      try {
        const res = await api.get(
          `/api/locations/latest/${user.id}`
        );
        if (res.data) setLatestLocation(res.data);
      } catch (err) {
        console.error("❌ Fetch latest location failed", err);
      }
    };

    fetchLatestLocation();
  }, [user]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return alert("Your cart is empty!");
    if (!latestLocation) return alert("Please select a delivery location first!");

    try {
      const itemsWithSeller = items.map((item) => ({
        id: item.id,
        quantity: Number(item.quantity),
        price: Number(item.price),
        seller_id: item.seller_id, // ✅ Ensure seller_id is included
      }));

      const response = await api.post("/api/checkout", {
        user_id: user.id,
        location_id: latestLocation.id,
        items: itemsWithSeller,
        total: Number(grandTotal),
        payment_method: paymentMethod,
      });

      if (response.data.success) {
        alert(
          `✅ Order placed successfully! Tracking ID: ${response.data.tracking_id}`
        );
        clearCart();
        navigate("/");
      } else {
        alert("❌ Failed to place order");
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      alert("❌ Error placing order");
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
            <Button onClick={() => navigate("/")} className="bg-black text-white px-6">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            <motion.div
              className="md:col-span-2 bg-white shadow-lg rounded-3xl p-8 border border-gray-100"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Your Order</h2>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-24 h-24 rounded-2xl object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-700">
                          Rs. {Number(item.price).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          Seller ID: {item.seller_id}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">
                      Rs. {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

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
                        <p className="text-gray-700">
                          Delivery Charge: Rs. {deliveryFee.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 mb-6">
                        No delivery location selected.
                      </p>
                    )}

                    <h3 className="text-lg font-medium mb-3 text-gray-900">
                      Order Summary
                    </h3>

                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between text-sm">
                        <span>Items Total</span>
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
                      className="w-full mt-8 bg-black text-white text-lg py-4 rounded-xl"
                      onClick={() => setStep("payment")}
                    >
                      Proceed to Pay
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

                    <div className="space-y-3 mb-6">
                      <label className="flex items-center gap-3 text-sm">
                        <input
                          type="radio"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                        />
                        Cash on Delivery
                      </label>

                      <label className="flex items-center gap-3 text-sm">
                        <input
                          type="radio"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                        />
                        Credit / Debit Card
                      </label>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <Button
                        variant="outline"
                        className="w-1/2"
                        onClick={() => setStep("summary")}
                      >
                        Back
                      </Button>
                      <Button
                        className="w-1/2 bg-black text-white text-lg py-4 rounded-xl"
                        onClick={handlePlaceOrder}
                      >
                        Place Order
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
