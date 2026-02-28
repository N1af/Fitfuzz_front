import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Compass,
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  Star,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string;
  images: string[];
  brand_name: string;
  rating: number;
  review_count: number;
  category_id: number;
  subcategory_id: number;
  sizes: any[];
  colors: any[];
  category_name?: string;
}

interface Category {
  category_id: number;
  name: string;
}

const Explore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, wishlistItems } = useWishlist();
  const { user } = useAuth();

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/categories`
        );
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products`
        );
        
        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
          setFilteredProducts(response.data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    if (!products.length) return;

    let result = [...products];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.brand_name && p.brand_name.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category_id === parseInt(selectedCategory)
      );
    }

    // Apply price filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        result.sort((a, b) => b.id - a.id);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, sortBy, selectedCategory, priceRange]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate("/login");
      return;
    }

    // If product has variations, go to product page
    if ((product.sizes && product.sizes.length > 0) || 
        (product.colors && product.colors.length > 0)) {
      navigate(`/product/${product.id}`);
      return;
    }

    // Simple product, add directly
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || (product.images && product.images[0]) || "",
      quantity: 1,
    });
  };

  const handleWishlistToggle = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlistItems.some(item => item.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || (product.images && product.images[0]) || "",
        brand_name: product.brand_name,
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 100000]);
    setSortBy("newest");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-4 animate-pulse"
              >
                <div className="w-full aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
            <Compass className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Compass className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            Explore Products
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Discover amazing products from our collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 md:pl-10 h-10 md:h-11 text-sm md:text-base"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 lg:w-48 h-10 md:h-11 text-sm md:text-base">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle - Hidden on mobile */}
            <div className="hidden md:flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={`h-11 w-11 ${viewMode === "grid" ? "bg-blue-600" : ""}`}
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={`h-11 w-11 ${viewMode === "list" ? "bg-blue-600" : ""}`}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              className="md:hidden h-10"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* Filters */}
          <div
            className={`mt-4 flex flex-col md:flex-row gap-3 md:gap-4 ${
              showFilters ? "block" : "hidden md:flex"
            }`}
          >
            {/* Category Filter - Now from Database */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-40 lg:w-48 h-10 md:h-11 text-sm md:text-base">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.category_id} value={category.category_id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select
              value={`${priceRange[0]}-${priceRange[1]}`}
              onValueChange={(value) => {
                const [min, max] = value.split("-").map(Number);
                setPriceRange([min, max]);
              }}
            >
              <SelectTrigger className="w-full md:w-40 lg:w-48 h-10 md:h-11 text-sm md:text-base">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1000">Under Rs. 1,000</SelectItem>
                <SelectItem value="1000-3000">Rs. 1,000 - 3,000</SelectItem>
                <SelectItem value="3000-5000">Rs. 3,000 - 5,000</SelectItem>
                <SelectItem value="5000-10000">Rs. 5,000 - 10,000</SelectItem>
                <SelectItem value="10000-100000">Above Rs. 10,000</SelectItem>
              </SelectContent>
            </Select>

            {/* Results count */}
            <div className="flex-1 text-right text-xs md:text-sm text-gray-600 self-center">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
            <Search className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              No products found
            </h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={clearAllFilters}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                : "space-y-4"
            }
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={
                  viewMode === "grid"
                    ? "bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    : "bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row group"
                }
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.image_url || (product.images && product.images[0]) || "https://via.placeholder.com/400"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/400";
                        }}
                      />
                      {product.original_price && product.original_price > product.price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      <p className="text-xs md:text-sm text-gray-600 mb-1 truncate">
                        {product.brand_name || "Fitfuzz"}
                      </p>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm md:text-base">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                          <span className="text-xs md:text-sm text-gray-700 ml-1">
                            {product.rating ? product.rating.toFixed(1) : "New"}
                          </span>
                        </div>
                        {product.review_count > 0 && (
                          <span className="text-xs text-gray-500">
                            ({product.review_count})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base md:text-lg lg:text-xl font-bold text-red-600">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="ml-2 text-xs text-gray-400 line-through">
                              Rs. {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs md:text-sm h-8 md:h-9"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 md:h-9 ${
                            wishlistItems.some(item => item.id === product.id)
                              ? "text-red-500 border-red-200 bg-red-50"
                              : ""
                          }`}
                          onClick={(e) => handleWishlistToggle(product, e)}
                        >
                          <Heart
                            className={`h-3 w-3 md:h-4 md:w-4 ${
                              wishlistItems.some(item => item.id === product.id) ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    <div className="sm:w-48 h-48 flex-shrink-0 bg-gray-100">
                      <img
                        src={product.image_url || (product.images && product.images[0]) || "https://via.placeholder.com/400"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/400";
                        }}
                      />
                    </div>
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            {product.brand_name || "Fitfuzz"}
                          </p>
                          <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description || "No description available"}
                          </p>
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            Sale
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 fill-current" />
                          <span className="text-sm md:text-base text-gray-700 ml-1">
                            {product.rating ? product.rating.toFixed(1) : "New"}
                          </span>
                        </div>
                        {product.review_count > 0 && (
                          <span className="text-sm text-gray-500">
                            {product.review_count} reviews
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-xl md:text-2xl font-bold text-red-600">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              Rs. {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            onClick={(e) => handleAddToCart(product, e)}
                          >
                            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            className={`${
                              wishlistItems.some(item => item.id === product.id)
                                ? "text-red-500 border-red-200 bg-red-50"
                                : ""
                            }`}
                            onClick={(e) => handleWishlistToggle(product, e)}
                          >
                            <Heart
                              className={`h-4 w-4 md:h-5 md:w-5 ${
                                wishlistItems.some(item => item.id === product.id) ? "fill-current" : ""
                              }`}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;