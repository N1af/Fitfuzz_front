import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Filter,
  XCircle,
  ChevronDown,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  Star,
  Clock,
  TrendingUp,
  Heart,
} from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import ProductCard from "@/components/ProductCard";
import api from "@/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  inStock: boolean;
  category_id: number;
  category_name: string;
  brand_name: string;
  brand_id?: number;
  rating?: number;
  review_count?: number;
  description?: string;
  colors?: any[];
  sizes?: any[];
}

interface FilterState {
  category: string;
  priceRange: string;
  brand: string;
  sort: string;
  inStock: boolean;
}

interface Brand {
  brand_id: number;
  name: string;
  logo_url?: string;
}

interface Category {
  category_id: number;
  name: string;
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Filter states from URL params
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get("category") || "all",
    priceRange: searchParams.get("price") || "all",
    brand: searchParams.get("brand") || "all",
    sort: searchParams.get("sort") || "relevance",
    inStock: searchParams.get("inStock") === "true",
  });

  // Search query from URL
  const searchQuery = searchParams.get("q") || "";

  const { wishlistItems, addItem, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();

  // Filter options
  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-1000", label: "Under Rs. 1,000" },
    { value: "1000-5000", label: "Rs. 1,000 - 5,000" },
    { value: "5000-10000", label: "Rs. 5,000 - 10,000" },
    { value: "10000-20000", label: "Rs. 10,000 - 20,000" },
    { value: "20000+", label: "Above Rs. 20,000" },
  ];

  const sortOptions = [
    {
      value: "relevance",
      label: "Relevance",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      value: "price-low",
      label: "Price: Low to High",
      icon: <SortAsc className="h-4 w-4" />,
    },
    {
      value: "price-high",
      label: "Price: High to Low",
      icon: <SortDesc className="h-4 w-4" />,
    },
    {
      value: "newest",
      label: "Newest First",
      icon: <Clock className="h-4 w-4" />,
    },
    { value: "rating", label: "Top Rated", icon: <Star className="h-4 w-4" /> },
  ];

  // Fetch products when component mounts or search query changes
  useEffect(() => {
    if (searchQuery) {
      fetchProducts();
      fetchFilters();
    }
  }, [searchQuery]); // Only re-fetch when search query changes

  // Apply filters when any filter changes
  useEffect(() => {
    if (searchQuery && isFilterApplied) {
      fetchProducts();
    }
  }, [filters.category, filters.priceRange, filters.brand, filters.inStock]);

  // Apply local sorting when sort filter changes
  useEffect(() => {
    if (products.length > 0) {
      applyLocalSorting();
    }
  }, [filters.sort, products]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== false) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    // Ensure search query is always in URL
    if (searchQuery) {
      params.set("q", searchQuery);
    }

    setSearchParams(params);
  }, [filters, searchQuery]);

  const fetchProducts = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Build query params for backend
      const params = new URLSearchParams();
      params.append("q", searchQuery);

      // Only append filters that are not 'all'
      if (filters.category !== "all") {
        params.append("category", filters.category);
      }

      if (filters.brand !== "all") {
        // Use the exact brand name from the brands list
        const selectedBrand = brands.find(b => b.name === filters.brand);
        if (selectedBrand) {
          params.append("brand", selectedBrand.name);
        } else {
          params.append("brand", filters.brand);
        }
      }

      if (filters.priceRange !== "all") {
        params.append("price", filters.priceRange);
      }

      if (filters.inStock) {
        params.append("inStock", "true");
      }

      // Append sort for backend sorting (if needed)
      if (filters.sort !== "relevance") {
        params.append("sort", filters.sort);
      }

      console.log("Fetching with params:", params.toString());

      // Use the search endpoint
      const response = await api.get(`/api/search?${params.toString()}`);

      console.log("Search results:", response.data);

      const fetchedProducts = response.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        image_url: p.image_url,
        inStock: Number(p.stock) > 0,
        category_id: p.category_id,
        category_name: p.category_name || "",
        brand_name: p.brand_name || "",
        brand_id: p.brand_id,
        rating: p.rating || 0,
        review_count: p.review_count || 0,
        description: p.description,
        colors: p.colors,
        sizes: p.sizes,
      }));

      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      setTotalResults(fetchedProducts.length);
      setCurrentPage(1); // Reset to first page on new search
      setIsFilterApplied(true);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setFilteredProducts([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get("/api/categories"),
        api.get("/api/brands"),
      ]);

      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  // Apply local sorting only
  const applyLocalSorting = () => {
    let sorted = [...products];

    switch (filters.sort) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "relevance":
      default:
        // Keep original order from backend
        sorted = [...products];
        break;
    }

    setFilteredProducts(sorted);
    setTotalResults(sorted.length);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "all",
      priceRange: "all",
      brand: "all",
      sort: "relevance",
      inStock: false,
    });
  };

  const clearFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "inStock" ? false : "all",
    }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.priceRange !== "all") count++;
    if (filters.brand !== "all") count++;
    if (filters.sort !== "relevance") count++;
    if (filters.inStock) count++;
    return count;
  };

  const toggleWishlist = (product: Product) => {
    const exists = wishlistItems.find((i) => i.id === product.id);
    if (exists) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
    }
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (!searchQuery) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Search Query
          </h1>
          <p className="text-gray-600 mb-8">
            Please enter a search term to find products
          </p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Search Results for "{searchQuery}"
          </h1>
          <p className="text-gray-600 mt-2">
            {isLoading ? "Searching..." : `${totalResults} products found`}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant="outline"
            className="w-full flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </span>
            <div className="flex items-center gap-2">
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </div>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence mode="wait">
            {(isFilterOpen || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`
                  ${isFilterOpen ? "fixed inset-0 z-50 bg-white p-4 overflow-y-auto" : ""}
                  lg:relative lg:block lg:w-64 lg:flex-shrink-0
                `}
              >
                <div className="lg:sticky lg:top-24">
                  {/* Mobile Close Button */}
                  {isFilterOpen && (
                    <div className="flex justify-between items-center mb-4 lg:hidden">
                      <h2 className="text-lg font-bold">Filters</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  {/* Filter Content */}
                  <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Filters</h3>
                      {getActiveFilterCount() > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="text-xs text-blue-600"
                        >
                          Reset All
                        </Button>
                      )}
                    </div>

                    {/* Categories */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Category
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value="all"
                            checked={filters.category === "all"}
                            onChange={(e) =>
                              handleFilterChange("category", e.target.value)
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">All Categories</span>
                        </label>
                        {categories.map((cat) => (
                          <label
                            key={cat.category_id}
                            className="flex items-center"
                          >
                            <input
                              type="radio"
                              name="category"
                              value={cat.name.toLowerCase()}
                              checked={
                                filters.category === cat.name.toLowerCase()
                              }
                              onChange={(e) => {
                                handleFilterChange(
                                  "category",
                                  cat.name.toLowerCase(),
                                );
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Brands */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Brand
                      </h4>
                      <select
                        value={filters.brand}
                        onChange={(e) =>
                          handleFilterChange("brand", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="all">All Brands</option>
                        {brands.map((brand) => (
                          <option key={brand.brand_id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Price Range
                      </h4>
                      <select
                        value={filters.priceRange}
                        onChange={(e) =>
                          handleFilterChange("priceRange", e.target.value)
                        }
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        {priceRanges.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* In Stock */}
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) =>
                            handleFilterChange("inStock", e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm">In Stock Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Sort by:
                </span>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="p-2 border rounded-lg text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="hidden sm:flex"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="hidden sm:flex"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category !== "all" && (
                  <FilterBadge
                    label={`Category: ${filters.category}`}
                    onClear={() => clearFilter("category")}
                  />
                )}
                {filters.brand !== "all" && (
                  <FilterBadge
                    label={`Brand: ${filters.brand}`}
                    onClear={() => clearFilter("brand")}
                  />
                )}
                {filters.priceRange !== "all" && (
                  <FilterBadge
                    label={`Price: ${priceRanges.find((r) => r.value === filters.priceRange)?.label}`}
                    onClear={() => clearFilter("priceRange")}
                  />
                )}
                {filters.sort !== "relevance" && (
                  <FilterBadge
                    label={`Sort: ${sortOptions.find((s) => s.value === filters.sort)?.label}`}
                    onClear={() => clearFilter("sort")}
                  />
                )}
                {filters.inStock && (
                  <FilterBadge
                    label="In Stock Only"
                    onClear={() => clearFilter("inStock")}
                  />
                )}
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={resetFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className={
                        viewMode === "list"
                          ? "flex bg-white rounded-xl shadow-sm overflow-hidden"
                          : ""
                      }
                    >
                      {viewMode === "list" ? (
                        <ListProductCard
                          product={product}
                          isWishlisted={wishlistItems.some(
                            (i) => i.id === product.id,
                          )}
                          onToggleWishlist={() => toggleWishlist(product)}
                          onAddToCart={() => addToCart(product)}
                        />
                      ) : (
                        <ProductCard
                          product={product}
                          isWishlisted={wishlistItems.some(
                            (i) => i.id === product.id,
                          )}
                          onToggleWishlist={() => toggleWishlist(product)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const FilterBadge = ({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
    {label}
    <button onClick={onClear} className="hover:text-blue-900">
      <XCircle className="h-4 w-4" />
    </button>
  </span>
);

const ListProductCard = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: any) => (
  <div className="flex flex-col sm:flex-row w-full">
    <div className="sm:w-48 h-48 sm:h-auto">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex-1 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{product.brand_name}</p>
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">
                  {product.rating}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                ({product.review_count || 0} reviews)
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">
            Rs. {product.price.toLocaleString()}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-sm text-gray-400 line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {product.description && (
        <p className="text-sm text-gray-600 mt-4 line-clamp-2">
          {product.description}
        </p>
      )}

      <div className="flex gap-2 mt-6">
        <Button
          onClick={onAddToCart}
          disabled={!product.inStock}
          className="flex-1"
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
        <Button
          variant="outline"
          onClick={onToggleWishlist}
          className={isWishlisted ? "text-red-500" : ""}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  </div>
);

export default SearchPage;