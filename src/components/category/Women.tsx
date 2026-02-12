import { useState, useEffect, useRef } from "react";
import api from "../../api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, ShoppingCart, Heart, ChevronRight, Filter } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

/* ------------------ Types ------------------ */
interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  rating: number;
  review_count: number;
  image_url: string;
  discount: number;
  brand_id: number;
  brand_name: string;
  subcategory_id: number;
  subcategory_name: string;
}

interface Poster {
  id: number;
  title: string;
  image_url: string;
}

interface Brand {
  brand_id: number;
  name: string;
}

interface Subcategory {
  subcategory_id: number;
  name: string;
}

const Women = () => {
  const [selectedBrand, setSelectedBrand] = useState<number | "All">("All");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Subcategory[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { addItem } = useCart();
  const { wishlistItems, addItem: addWishlist, removeItem: removeWishlist } =
    useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLDivElement | null>(null);

  /* ------------------ Posters ------------------ */
  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const res = await api.get("/api/women/posters");
        setPosters(res.data);
      } catch (err) {
        console.error("❌ Women poster fetch error:", err);
      }
    };
    fetchPosters();
  }, []);

  /* ------------------ GSAP ------------------ */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".banner-track-women", {
        xPercent: -100,
        duration: 40,
        ease: "linear",
        repeat: -1,
      });
    }, bannerRef);
    return () => ctx.revert();
  }, []);

  /* ------------------ Fetch Brands + Categories ------------------ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          api.get("/api/women/brands"),
          api.get("/api/women/subcategories"),
        ]);
        setBrands(bRes.data);
        setCategories(cRes.data);
      } catch (err) {
        console.error("❌ Women data fetch error:", err);
      }
    };
    fetchData();
  }, []);

  /* ------------------ Fetch Products ------------------ */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params: any = {};
        if (selectedBrand !== "All") params.brand = selectedBrand;
        if (selectedCategories.length > 0)
          params.subcategories = selectedCategories.join(",");

        const res = await api.get("/api/women/products", { params });
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Women product fetch error:", err);
      }
    };
    fetchProducts();
  }, [selectedBrand, selectedCategories]);

  /* ------------------ Modern Sidebar ------------------ */
  const FilterSidebar = () => (
    <div className="space-y-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedCategories([]);
            setSelectedBrand("All");
          }}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Clear all
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-4 text-sm flex items-center gap-2 text-gray-900">
            <SlidersHorizontal className="w-4 h-4" />
            Categories
          </h4>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.subcategory_id}
                className="flex items-center space-x-3 group cursor-pointer"
                onClick={() => {
                  setSelectedCategories((prev) =>
                    prev.includes(cat.subcategory_id)
                      ? prev.filter((id) => id !== cat.subcategory_id)
                      : [...prev, cat.subcategory_id]
                  );
                }}
              >
                <div className="relative">
                  <Checkbox
                    checked={selectedCategories.includes(cat.subcategory_id)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {cat.name}
                </span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ------------------ Wishlist ------------------ */
  const toggleWishlist = (product: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isWishlisted = wishlistItems.some((w) => w.id === product.id);
    if (isWishlisted) removeWishlist(product.id);
    else
      addWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modern Banner */}
      <div ref={bannerRef} className="relative w-full overflow-hidden h-[280px] md:h-[500px] rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />
        <div className="flex banner-track-women">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className="flex-shrink-0 w-full h-[280px] md:h-[500px] relative"
            >
              <img
                src={poster.image_url}
                alt={poster.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 -mt-16 md:-mt-24 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl px-4 md:px-8 py-8 md:py-10 flex flex-col md:flex-row gap-8 backdrop-blur-sm bg-white/95">
          {/* Sidebar */}
          <div className="md:w-1/4">
            {/* Mobile filter header */}
            <div className="md:hidden mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Filters & Categories</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="rounded-full border-gray-300"
                >
                  {isFiltersOpen ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            {/* Sidebar content */}
            <div className={`${isFiltersOpen ? "block" : "hidden"} md:block animate-in fade-in duration-300`}>
              <FilterSidebar />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Modern Brand Filter */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Women's Collection</h2>
                <span className="text-sm text-gray-500">{products.length} items</span>
              </div>
              
              <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
                <button
                  onClick={() => setSelectedBrand("All")}
                  className={`px-5 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedBrand === "All"
                      ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  All Brands
                </button>

                {brands.map((b) => (
                  <button
                    key={b.brand_id}
                    onClick={() => setSelectedBrand(b.brand_id)}
                    className={`px-5 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedBrand === b.brand_id
                        ? "bg-gradient-to-r from-gray-900 to-black text-white shadow-lg"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => {
                const isWishlisted = user
                  ? wishlistItems.some((w) => w.id === p.id)
                  : false;

                return (
                  <Card 
                    key={p.id} 
                    className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-1 bg-white cursor-pointer"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
                      {/* Discount badge */}
                      {p.discount > 0 && (
                        <div className="absolute top-3 left-3 z-10">
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            -{p.discount}%
                          </div>
                        </div>
                      )}

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p);
                        }}
                        className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Heart
                          className={`w-5 h-5 transition-all duration-300 ${
                            isWishlisted
                              ? "fill-red-500 text-red-500 scale-110"
                              : "text-gray-600 hover:text-red-500"
                          }`}
                        />
                      </button>

                      {/* Product image */}
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Add to cart button */}
                      <Button
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] h-11 bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({ ...p, quantity: 1 });
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>

                    <CardContent className="p-5">
                      {/* Category & Brand */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                          {p.subcategory_name}
                        </span>
                        <span className="text-xs text-gray-500">{p.brand_name}</span>
                      </div>

                      {/* Product name */}
                      <h3 className="text-sm font-semibold mb-3 text-gray-900 line-clamp-2 hover:text-pink-600 transition-colors">
                        {p.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">
                          Rs. {p.price ? p.price.toLocaleString() : 0}
                        </span>
                        {p.original_price && (
                          <span className="text-sm line-through text-gray-400">
                            Rs. {p.original_price ? p.original_price.toLocaleString() : 0}
                          </span>
                        )}
                        {p.discount > 0 && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Save {p.discount}%
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty state */}
            {products.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters to find what you're looking for
                </p>
                <Button
                  onClick={() => {
                    setSelectedBrand("All");
                    setSelectedCategories([]);
                  }}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Women;