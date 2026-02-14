import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ScrollToTop from "./components/ScrollToTop";
// Layout
import Layout from "@/components/Layout";

// Pages
import Profile from "./pages/Profile";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/components/Login";
import SellerLogin from "@/components/SellerLogin";
import AdminDashboard from "@/components/AdminDashboard";
import CreateAccountPage from "./components/Createaccount";
import ProductDetails from "@/components/ProductDetails";
import AboutFitfuzz from "@/components/AboutFitfuzz";
import CheckoutPage from "@/components/CheckoutPage";
import MyOrders from "./components/MyOrders";
import AccountSettings from "./pages/Accountsetting";
import { AuthProvider } from "@/context/AuthContext";
import SellerCodes from "./components/admin/SellerCodes";
import AdminSellerDetails from "./components/admin/AdminSellerDetails";

// Seller Components
import CreateSellerAccount from "@/components/SellerCreate";
import SellerDashboard from "@/components/seller/SellerDashboard";
import SellerDetails from "@/components/seller/SellerDetails";
import Men from "@/components/category/Men";
import Women from "@/components/category/Women";
import Sale from "@/components/category/Sale";
// import NotificationSettings from "./components/seller/SellerSettings/NotificationSettings";
// import StoreInfo from "@/components/seller/SellerSettings/StoreInfo";
// import ProfileSettings from "@/components/seller/SellerSettings/ProfileSettings"; 
// import ShippingSettings from "./components/seller/SellerSettings/ShippingSettings";
// import PaymentSettings from "./components/seller/SellerSettings/PaymentSettings";
import OrderDetails from "./components/seller/OrderDetails";
import Wishlist from "./components/Wishlist";

// PrivateRoute
import PrivateRoute from "./routes/PrivateRoute";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* Wrap your entire app here */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* Public Layout */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="create-account" element={<CreateAccountPage />} />
                    <Route path="seller-login" element={<SellerLogin />} />
                    <Route path="about-fitfuzz" element={<AboutFitfuzz />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="men" element={<Men />} />
                    <Route path="women" element={<Women />} />
                    <Route path="sale" element={<Sale />} />

                    {/* Protected User Routes */}
                    <Route path="checkout" element={
                      <PrivateRoute>
                        <CheckoutPage />
                      </PrivateRoute>
                    } />
                    <Route path="my-orders" element={
                      <PrivateRoute>
                        <MyOrders />
                      </PrivateRoute>
                    } />
                    <Route path="account-settings" element={
                      <PrivateRoute>
                        <AccountSettings />
                      </PrivateRoute>
                    } />
                    <Route path="profile" element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } />
                    <Route path="wishlist" element={
                      <PrivateRoute>
                        <Wishlist />
                      </PrivateRoute>
                    } />

                    {/* Seller Pages */}
                    <Route path="seller-create" element={<CreateSellerAccount />} />
                    <Route path="seller-dashboard" element={<SellerDashboard />} />
                    <Route path="seller-details" element={<SellerDetails sellerId={0} />} />
                    {/* <Route path="seller-settings/profile-settings" element={<ProfileSettings />} /> */}
                    {/* <Route path="seller-settings/store-info" element={<StoreInfo />} />
                    <Route path="seller-settings/shipping-settings" element={<ShippingSettings />} />
                    <Route path="seller-settings/payment-settings" element={<PaymentSettings />} />   
                    <Route path="seller-settings/notification-settings" element={<NotificationSettings />} /> */}
                    <Route path="seller-order-details/:orderId" element={<OrderDetails />} />
                    <Route path="seller-code" element={<SellerCodes />} />
                    <Route path="admin-seller-details/:sellerId" element={<AdminSellerDetails />} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Admin Route */}
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
