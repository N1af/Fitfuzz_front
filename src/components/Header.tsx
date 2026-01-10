import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, Menu, X, User, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/* ---------------- ANNOUNCEMENTS ---------------- */
const announcements = [
  "Free Delivery Across Sri Lanka",
  "Premium Quality Fashion",
  "Secure Payments",
  "Trusted Local Sellers",
  "24/7 Customer Support",
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  const { items, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { user, logout, seller, sellerLogout } = useAuth();

  /* ---------------- SCROLL EFFECT ---------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------- OUTSIDE CLICK CLOSE ---------------- */
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setIsAccountsOpen(false);
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) setIsCartOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${searchQuery}`);
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* ================= ANNOUNCEMENT BAR ================= */}
      <section className="fixed top-0 w-full z-[60] bg-white border-b border-gray-200 py-2 overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...announcements, ...announcements].map((text, i) => (
            <span
              key={i}
              className="flex items-center gap-3 px-6 text-sm font-medium text-gray-800"
            >
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              {text}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-[40px] w-full z-50 bg-white transition-all ${
          scrolled ? "py-3 shadow-md" : "py-4 shadow-sm"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="text-2xl md:text-3xl font-bold tracking-tight text-blue-600 cursor-pointer"
          >
            Fitfuzz
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/")} className={navLink}>Home</button>
            <button onClick={() => navigate("/men")} className={navLink}>Men</button>
            <button onClick={() => navigate("/women")} className={navLink}>Women</button>
            <button onClick={() => navigate("/sale")} className={navLink}>Sale</button>

            {!seller && (
              <button
                onClick={() => navigate("/seller-login")}
                className="border border-gray-300 px-3 py-1 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Become a Seller
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <Button variant="ghost" size="icon" className={iconBtn} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <Search className="h-5 w-5" />
              </Button>

              {isSearchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow p-2 flex gap-2 z-50"
                >
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-sm outline-none"
                    placeholder="Search products..."
                  />
                  <Button size="sm">Search</Button>
                </form>
              )}
            </div>

            {/* Cart */}
            <div ref={cartRef}>
              <Button
                variant="ghost"
                size="icon"
                className={`${iconBtn} relative`}
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              {isCartOpen && (
                <CartDrawer
                  items={items}
                  removeItem={removeItem}
                  clearCart={clearCart}
                  totalItems={totalItems}
                  onClose={() => setIsCartOpen(false)}
                  navigate={navigate}
                />
              )}
            </div>

            {/* Account */}
            <div ref={accountRef} className="relative">
              <Button variant="ghost" size="icon" className={iconBtn} onClick={() => setIsAccountsOpen(!isAccountsOpen)}>
                <User className="h-5 w-5" />
                <ChevronDown className={`ml-1 h-4 w-4 transition ${isAccountsOpen ? "rotate-180" : ""}`} />
              </Button>

              {isAccountsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow z-50">
                  {seller ? (
                    <>
                      <button className={dropdownItem} onClick={() => navigate("/seller-dashboard")}>Seller Dashboard</button>
                      <button className={dropdownItem} onClick={sellerLogout}>Logout</button>
                    </>
                  ) : user ? (
                    <>
                      <button className={dropdownItem} onClick={() => navigate("/profile")}>Profile</button>
                      <button className={dropdownItem} onClick={logout}>Logout</button>
                    </>
                  ) : (
                    <>
                      <button className={dropdownItem} onClick={() => navigate("/login")}>Login</button>
                      <button className={dropdownItem} onClick={() => navigate("/create-account")}>Create Account</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      <div className="h-[112px]" />
    </>
  );
};

export default Header;

/* ---------------- STYLES ---------------- */
const navLink = "text-gray-700 hover:text-blue-600 transition";
const dropdownItem = "w-full text-left px-4 py-2 text-sm hover:bg-gray-100";
const iconBtn = "text-gray-700 hover:bg-gray-100";

/* ---------------- CART DRAWER (UNCHANGED SIZE) ---------------- */
const CartDrawer = ({ items, removeItem, clearCart, totalItems, onClose, navigate }) => (
  <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col">
    <div className="p-4 border-b flex justify-between">
      <h2 className="font-semibold">Your Cart</h2>
      <X className="cursor-pointer" onClick={onClose} />
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {items.length === 0 ? (
        <p className="text-center text-gray-500">Cart is empty</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex gap-3 border-b pb-3">
            <img src={item.image_url} className="w-16 h-16 rounded object-cover" />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              <p className="text-red-600 font-semibold">Rs. {item.price}</p>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm">
              Remove
            </button>
          </div>
        ))
      )}
    </div>

    {items.length > 0 && (
      <div className="border-t p-4 space-y-2">
        <p>Total Items: {totalItems}</p>
        <p className="font-semibold text-red-600">
          Rs. {items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}
        </p>

        <Button className="w-full bg-blue-600" onClick={() => navigate("/checkout")}>
          Checkout
        </Button>
        <Button variant="outline" className="w-full" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>
    )}
  </div>
);
