import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


import { Toaster } from "@/components/ui/toaster";

const Layout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global header */}
      <Header />

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global footer */}
      <Footer />

      {/* Global cart + toasters */}
      {/* <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} /> */}
      <Toaster />
    </div>
  );
};

export default Layout;
