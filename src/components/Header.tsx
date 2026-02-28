import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Heart,
  ShoppingBag,
  Compass,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { items, removeItem, clearCart } = useCart();
  const {
    wishlistItems,
    removeItem: removeWishlistItem,
    clearWishlist,
  } = useWishlist();

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, seller, sellerLogout } = useAuth();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWishlist = user ? wishlistItems.length : 0;

  // Check if current page is home page
  const isHomePage = location.pathname === "/";

  /* CLOSE WISHLIST ON LOGOUT */
  useEffect(() => {
    if (!user) setIsWishlistOpen(false);
  }, [user]);

  /* SCROLL EFFECT */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* SEARCH FUNCTION */
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchQuery.trim()) {
      setIsSearchOpen(false);
      return;
    }

    try {
      setIsSearching(true);

      // Build search params
      const params = new URLSearchParams();
      params.append("q", searchQuery);

      // Navigate to search page
      navigate(`/search?${params.toString()}`);

      // Close panels and reset
      setSearchQuery("");
      setIsSearchOpen(false);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  /* SEARCH ON ENTER */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /* FOCUS SEARCH INPUT WHEN OPENED */
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  /* OUTSIDE CLICK CLOSE */
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setIsSearchOpen(false);

      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setIsAccountsOpen(false);

      if (cartRef.current && !cartRef.current.contains(e.target as Node))
        setIsCartOpen(false);

      if (
        wishlistRef.current &&
        !wishlistRef.current.contains(e.target as Node)
      )
        setIsWishlistOpen(false);

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("#mobile-menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Determine header styles based on page and scroll position
  const getHeaderClasses = () => {
    if (isHomePage && !scrolled) {
      // Home page, not scrolled - transparent with white text
      return "fixed top-0 w-full z-50 transition-all py-4 bg-transparent";
    } else {
      // Other pages OR scrolled - white background with blue text
      return `fixed top-0 w-full z-50 transition-all ${
        scrolled ? "py-3 shadow-lg" : "py-4 shadow-md"
      } bg-white`;
    }
  };

  // Determine text color for links and icons
  const getTextColor = (baseClass: string) => {
    if (isHomePage && !scrolled) {
      return `${baseClass} text-white hover:bg-white/20`;
    } else {
      return `${baseClass} text-gray-700 hover:text-blue-600 hover:bg-blue-50`;
    }
  };

  // Determine logo color
  const getLogoColor = () => {
    if (isHomePage && !scrolled) {
      return "text-white cursor-pointer hover:opacity-80 transition-colors";
    } else {
      return "text-blue-600 cursor-pointer hover:text-blue-700 transition-colors";
    }
  };

  // Determine search input styles
  const getSearchInputClasses = () => {
    if (isHomePage && !scrolled) {
      return "w-48 lg:w-64 xl:w-80 pl-9 pr-4 py-2 text-sm border border-white/30 bg-white/10 text-white placeholder:text-white/70 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
    } else {
      return "w-48 lg:w-64 xl:w-80 pl-9 pr-4 py-2 text-sm border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
    }
  };

  // Determine search icon color
  const getSearchIconColor = () => {
    return isHomePage && !scrolled ? "text-white/70" : "text-gray-400";
  };

  return (
    <>
      {/* HEADER */}
      <header className={getHeaderClasses()}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight whitespace-nowrap ${getLogoColor()}`}
          >
            Fitfuzz
          </div>

          {/* Desktop Nav - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <button 
              onClick={() => navigate("/")} 
              className={getTextColor(navLink)}
            >
              Home
            </button>
            <button 
              onClick={() => navigate("/explore")} 
              className={getTextColor(navLink)}
            >
              <Compass className="h-4 w-4 inline mr-1" />
              Explore
            </button>
            <button 
              onClick={() => navigate("/men")} 
              className={getTextColor(navLink)}
            >
              Men
            </button>
            <button 
              onClick={() => navigate("/women")} 
              className={getTextColor(navLink)}
            >
              Women
            </button>
            <button 
              onClick={() => navigate("/sale")} 
              className={getTextColor(navLink)}
            >
              Sale
            </button>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {/* SEARCH - Desktop */}
            <div ref={searchRef} className="hidden md:block relative">
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={getSearchInputClasses()}
                    placeholder="Search products..."
                  />
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${getSearchIconColor()}`} />
                </form>
              </div>
            </div>

            {/* SEARCH - Mobile Icon */}
            <Button
              variant="ghost"
              size="icon"
              className={`${iconBtn} md:hidden ${
                isHomePage && !scrolled ? "text-white hover:bg-white/20" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
              }`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Search Panel */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 p-4 md:hidden"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 relative">
                      <form onSubmit={handleSearch}>
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          ref={searchInputRef}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search products..."
                          autoFocus
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </form>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Search Suggestions */}
                  {searchQuery && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        Suggestions
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("men clothing");
                          handleSearch();
                        }}
                        className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded w-full text-left"
                      >
                        Search "men clothing"
                      </button>
                      <button
                        onClick={() => {
                          setSearchQuery("women dress");
                          handleSearch();
                        }}
                        className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded w-full text-left"
                      >
                        Search "women dress"
                      </button>
                      <button
                        onClick={() => {
                          setSearchQuery("sale");
                          handleSearch();
                        }}
                        className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded w-full text-left"
                      >
                        Search "sale"
                      </button>
                    </motion.div>
                  )}

                  {/* Search Button */}
                  <div className="mt-4">
                    <Button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || isSearching}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WISHLIST */}
            <div ref={wishlistRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`${iconBtn} relative ${
                  isHomePage && !scrolled ? "text-white hover:bg-white/20" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  setIsWishlistOpen(!isWishlistOpen);
                }}
              >
                <Heart className="h-5 w-5" />
                {totalWishlist > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium shadow-sm">
                    {totalWishlist}
                  </span>
                )}
              </Button>

              {isWishlistOpen && user && (
                <WishlistDrawer
                  items={wishlistItems}
                  removeItem={removeWishlistItem}
                  clearWishlist={clearWishlist}
                  onClose={() => setIsWishlistOpen(false)}
                  navigate={navigate}
                />
              )}
            </div>

            {/* CART */}
            <div ref={cartRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`${iconBtn} relative ${
                  isHomePage && !scrolled ? "text-white hover:bg-white/20" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium shadow-sm">
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
                  user={user}
                />
              )}
            </div>

            {/* ACCOUNT */}
            <div ref={accountRef} className="relative hidden sm:block">
              <Button
                variant="ghost"
                className={`${iconBtn} px-2 lg:px-3 ${
                  isHomePage && !scrolled ? "text-white hover:bg-white/20" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={() => setIsAccountsOpen(!isAccountsOpen)}
              >
                <User className="h-5 w-5 sm:mr-1" />
                <ChevronDown className={`hidden sm:inline ml-1 h-4 w-4 transition ${
                  isHomePage && !scrolled ? "text-white" : "text-gray-700"
                }`} />
              </Button>

              {isAccountsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {seller ? (
                    <>
                      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <p className="text-sm font-medium text-gray-900">
                          Seller Account
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          Welcome back!
                        </p>
                      </div>
                      <button
                        className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                        onClick={() => {
                          navigate("/seller-dashboard");
                          setIsAccountsOpen(false);
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Seller Dashboard
                      </button>
                      <button
                        className={`${dropdownItem} hover:bg-red-50 hover:text-red-600`}
                        onClick={() => {
                          sellerLogout();
                          setIsAccountsOpen(false);
                        }}
                      >
                        Logout Seller
                      </button>
                    </>
                  ) : user ? (
                    <>
                      <div className="p-3 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                        <p className="text-sm font-medium text-gray-900">
                          My Account
                        </p>
                        <p className="text-xs text-gray-600">
                          Welcome, {user.name || user.email}
                        </p>
                      </div>
                      <button
                        className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                        onClick={() => {
                          navigate("/profile");
                          setIsAccountsOpen(false);
                        }}
                      >
                        Profile
                      </button>
                      <button
                        className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                        onClick={() => {
                          navigate("/my-orders");
                          setIsAccountsOpen(false);
                        }}
                      >
                        My Orders
                      </button>
                      <button
                        className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                        onClick={() => {
                          navigate("/wishlist");
                          setIsAccountsOpen(false);
                        }}
                      >
                        Wishlist
                      </button>
                      <div className="border-t">
                        <button
                          className={`${dropdownItem} hover:bg-red-50 hover:text-red-600`}
                          onClick={() => {
                            logout();
                            setIsAccountsOpen(false);
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                        onClick={() => {
                          navigate("/login");
                          setIsAccountsOpen(false);
                        }}
                      >
                        Login
                      </button>
                      <button
                        className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                        onClick={() => {
                          navigate("/create-account");
                          setIsAccountsOpen(false);
                        }}
                      >
                        Create Account
                      </button>
                      <div className="border-t">
                        <button
                          className={`${dropdownItem} hover:bg-gray-50`}
                          onClick={() => {
                            navigate("/seller-login");
                            setIsAccountsOpen(false);
                          }}
                        >
                          Seller Login
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* MOBILE MENU */}
            <div className="md:hidden relative" ref={mobileMenuRef}>
              <Button
                id="mobile-menu-button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${iconBtn} ${
                  isHomePage && !scrolled ? "text-white hover:bg-white/20" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>

              {isMenuOpen && (
                <div className="absolute top-full right-0 w-64 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                    <p className="font-medium text-gray-900">Menu</p>
                  </div>
                  <Link
                    to="/"
                    className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/explore"
                    className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    Explore
                  </Link>
                  <Link
                    to="/men"
                    className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Men
                  </Link>
                  <Link
                    to="/women"
                    className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Women
                  </Link>
                  <Link
                    to="/sale"
                    className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sale
                  </Link>
                  {!seller && (
                    <div className="border-t mt-2 pt-2">
                      <Link
                        to="/seller-login"
                        className={`${dropdownItem} hover:bg-gray-50`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Become a Seller
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer - ONLY on non-home pages to prevent content from hiding under fixed header */}
      {!isHomePage && <div className="h-[72px] md:h-[88px]" />}
    </>
  );
};

export default Header;

const navLink =
  "transition-colors font-medium px-2 py-1 rounded-lg flex items-center gap-1 text-sm lg:text-base";
const dropdownItem =
  "w-full text-left px-4 py-3 text-sm transition-colors flex items-center";
const iconBtn =
  "transition-colors rounded-full";

/* ---------------- CART DRAWER ---------------- */
const CartDrawer = ({
  items,
  removeItem,
  clearCart,
  totalItems,
  onClose,
  navigate,
  user,
}) => {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Function to handle navigating to product details and removing incomplete item
  const handleSelectOptions = (item) => {
    // Get the unique key for this item
    const itemKey = `${item.id}_${item.selectedColorId || "no-color"}_${item.selectedSizeId || "no-size"}`;

    // Remove the incomplete item from cart
    removeItem(itemKey);

    // Navigate to product page
    navigate(`/product/${item.id}`);
    onClose();
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      onClose();
      return;
    }

    // Check if any item is missing color or size selection
    const incompleteItems = items.filter(
      (item) => !item.selectedColorId || !item.selectedSizeId,
    );

    if (incompleteItems.length > 0) {
      // If there are items without color/size, go to the first incomplete item's product page
      const firstIncomplete = incompleteItems[0];
      handleSelectOptions(firstIncomplete);
      return;
    }

    // All items have color and size, proceed to checkout
    navigate("/checkout");
    onClose();
  };

  // Check if all items have color and size selected
  const isCheckoutReady = items.every(
    (item) => item.selectedColorId && item.selectedSizeId,
  );

  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right-5 duration-300">
      <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          <p className="text-sm text-gray-600">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">Add some items to get started</p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => {
                navigate("/");
                onClose();
              }}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          items.map((item) => {
            const itemKey = `${item.id}_${item.selectedColorId || "no-color"}_${item.selectedSizeId || "no-size"}`;
            const isIncomplete = !item.selectedColorId || !item.selectedSizeId;

            return (
              <div
                key={itemKey}
                className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>

                  <div className="mt-1 space-y-1">
                    {item.selectedColorName && item.selectedColorId ? (
                      <p className="text-xs text-gray-600">
                        Color:{" "}
                        <span className="font-medium">
                          {item.selectedColorName}
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-red-500">
                        ⚠️ Color not selected
                      </p>
                    )}

                    {item.selectedSizeName && item.selectedSizeId ? (
                      <p className="text-xs text-gray-600">
                        Size:{" "}
                        <span className="font-medium">
                          {item.selectedSizeName}
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-red-500">
                        ⚠️ Size not selected
                      </p>
                    )}

                    <p className="text-xs text-gray-600">
                      Qty: <span className="font-medium">{item.quantity}</span>
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-red-600 font-bold">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${isIncomplete ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50" : "text-green-500 hover:text-green-700 hover:bg-green-50"}`}
                        onClick={() => {
                          if (isIncomplete) {
                            // For incomplete items, remove and go to product page
                            handleSelectOptions(item);
                          } else {
                            // For complete items, just view product
                            navigate(`/product/${item.id}`);
                            onClose();
                          }
                        }}
                      >
                        {isIncomplete ? "Select Options" : "View"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeItem(itemKey)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t bg-gradient-to-r from-gray-50 to-white p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-red-600">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Warning message for incomplete items */}
            {!isCheckoutReady && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 flex items-center gap-2">
                  <span className="font-medium">⚠️ Attention:</span>
                  Some items need color/size selection
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Clicking "Select Options" will remove the item from cart.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              onClick={handleCheckout}
              disabled={items.length === 0}
            >
              {!user
                ? "Login to Checkout"
                : !isCheckoutReady
                  ? "Complete Item Selection"
                  : "Proceed to Checkout"}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={clearCart}
            >
              Clear Cart
            </Button>

            <Button
              variant="ghost"
              className="w-full h-12"
              onClick={() => {
                navigate("/");
                onClose();
              }}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- WISHLIST DRAWER ---------------- */
const WishlistDrawer = ({
  items,
  removeItem,
  clearWishlist,
  onClose,
  navigate,
}) => {
  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right-5 duration-300">
      <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-pink-50 to-rose-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Wishlist</h2>
          <p className="text-sm text-gray-600">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6">Save items you love for later</p>
            <Button
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              onClick={() => {
                navigate("/");
                onClose();
              }}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate mb-2">
                  {item.name}
                </h3>

                <p className="text-red-600 font-bold mb-4">
                  Rs. {item.price.toLocaleString()}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      navigate(`/product/${item.id}`);
                      onClose();
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t bg-gradient-to-r from-gray-50 to-white p-6 space-y-4">
          <Button
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            onClick={() => {
              navigate("/wishlist");
              onClose();
            }}
          >
            Go to Wishlist
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={clearWishlist}
          >
            Clear All Items
          </Button>
        </div>
      )}
    </div>
  );
};