import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useNavigate, Link } from "react-router-dom";
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
  const { user, logout, seller, sellerLogout } = useAuth();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWishlist = user ? wishlistItems.length : 0;

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

  /* SEARCH FUNCTION - FIXED */
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      setIsSearchOpen(false);
      return;
    }
    
    try {
      setIsSearching(true);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  return (
    <>
      {/* HEADER - REMOVED ANNOUNCEMENT BAR */}
      <header
        className={`fixed top-0 w-full z-50 bg-white transition-all ${scrolled ? "py-3 shadow-lg" : "py-4 shadow-md"}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="text-2xl md:text-3xl font-bold tracking-tight text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
          >
            Fitfuzz
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/")} className={navLink}>
              Home
            </button>
            <button onClick={() => navigate("/men")} className={navLink}>
              Men
            </button>
            <button onClick={() => navigate("/women")} className={navLink}>
              Women
            </button>
            <button onClick={() => navigate("/sale")} className={navLink}>
              Sale
            </button>

            {!seller && (
              <button
                onClick={() => navigate("/seller-login")}
                className="border border-gray-300 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Become a Seller
              </button>
            )}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4">
            {/* SEARCH - FIXED */}
            <div ref={searchRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`${iconBtn} md:hidden`}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Desktop Search - FIXED */}
              <div className="hidden md:block relative">
                <form
                  onSubmit={handleSearch}
                  className="relative"
                >
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-48 lg:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Search products..."
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </form>
              </div>

              {/* Mobile Search Panel - FIXED */}
              {isSearchOpen && (
                <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 p-4 md:hidden">
                  <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} className="flex-1">
                      <div className="relative">
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
                      </div>
                    </form>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Search Suggestions - FIXED */}
                  {searchQuery && (
                    <div className="mt-4">
                      <div className="space-y-2">
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
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WISHLIST */}
            <div ref={wishlistRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`${iconBtn} relative`}
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
                className={`${iconBtn} relative`}
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
            <div ref={accountRef} className="relative">
              <Button
                variant="ghost"
                className={`${iconBtn} px-3`}
                onClick={() => setIsAccountsOpen(!isAccountsOpen)}
              >
                <User className="h-5 w-5 mr-1" />
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition ${isAccountsOpen ? "rotate-180" : ""}`}
                />
              </Button>

              {isAccountsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {seller ? (
                    <>
                      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <p className="text-sm font-medium text-gray-900">Seller Account</p>
                        <p className="text-xs text-gray-600 truncate">Welcome back!</p>
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
                        <p className="text-sm font-medium text-gray-900">My Account</p>
                        <p className="text-xs text-gray-600">Welcome, {user.name || user.email}</p>
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
                className={iconBtn}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>

              {isMenuOpen && (
                <div className="absolute top-full right-0 w-64 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                    <p className="font-medium text-gray-900">Menu</p>
                  </div>
                  <Link to="/" className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`} onClick={() => setIsMenuOpen(false)}>
                    Home
                  </Link>
                  <Link to="/men" className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`} onClick={() => setIsMenuOpen(false)}>
                    Men
                  </Link>
                  <Link to="/women" className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`} onClick={() => setIsMenuOpen(false)}>
                    Women
                  </Link>
                  <Link to="/sale" className={`${dropdownItem} hover:bg-blue-50 hover:text-blue-600`} onClick={() => setIsMenuOpen(false)}>
                    Sale
                  </Link>
                  {!seller && (
                    <>
                      <div className="border-t mt-2 pt-2">
                        <Link to="/seller-login" className={`${dropdownItem} hover:bg-gray-50`} onClick={() => setIsMenuOpen(false)}>
                          Become a Seller
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="h-[88px]" /> {/* Reduced height since announcement bar is removed */}
    </>
  );
};

export default Header;

const navLink = "text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-blue-50";
const dropdownItem = "w-full text-left px-4 py-3 text-sm transition-colors flex items-center";
const iconBtn = "text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors rounded-full";

/* ---------------- CART DRAWER - FIXED WITH AUTO REMOVAL ---------------- */
const CartDrawer = ({
  items,
  removeItem,
  clearCart,
  totalItems,
  onClose,
  navigate,
  user,
}) => {
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
    const incompleteItems = items.filter(item => 
      !item.selectedColorId || !item.selectedSizeId
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
  const isCheckoutReady = items.every(item => 
    item.selectedColorId && item.selectedSizeId
  );

  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right-5 duration-300">
      <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          <p className="text-sm text-gray-600">{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</p>
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
            <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
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
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  
                  <div className="mt-1 space-y-1">
                    {item.selectedColorName && item.selectedColorId ? (
                      <p className="text-xs text-gray-600">
                        Color: <span className="font-medium">{item.selectedColorName}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-red-500">
                        ⚠️ Color not selected
                      </p>
                    )}
                    
                    {item.selectedSizeName && item.selectedSizeId ? (
                      <p className="text-xs text-gray-600">
                        Size: <span className="font-medium">{item.selectedSizeName}</span>
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
              <span className="font-medium">Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-red-600">Rs. {totalPrice.toLocaleString()}</span>
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
                  You can add it back with selected options on the product page.
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
              {!user ? "Login to Checkout" : 
               !isCheckoutReady ? "Complete Item Selection" : 
               "Proceed to Checkout"}
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
          <p className="text-sm text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
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
            <h3 className="text-lg font-medium text-gray-700 mb-2">Your wishlist is empty</h3>
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
                <h3 className="font-medium text-gray-900 truncate mb-2">{item.name}</h3>
                
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