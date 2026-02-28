import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import api from "../api";
import ProductCard from "./ProductCard";
import AIFittingBanner from "./AIFittingBanner";
import { useWishlist } from "@/hooks/use-wishlist";

/* ---------------- TYPES ---------------- */
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  inStock: boolean;
  category_id: number;
  brand_name: string;
  rating?: number;
  review_count?: number;
  created_at?: string;
}

/* ---------------- PRODUCT GRID ---------------- */
const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [weeklyDrops, setWeeklyDrops] = useState<Product[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  const brandsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { wishlistItems, addItem, removeItem } = useWishlist();

  /* FETCH DATA */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productRes, brandRes, categoryRes] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/brands"),
          api.get("/api/categories"),
        ]);

        const fixedProducts = productRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          image_url: p.image_url,
          inStock: Number(p.stock) > 0,
          category_id: p.category_id,
          brand_name: p.brand_name,
          rating: p.rating || 0,
          review_count: p.review_count || 0,
          created_at: p.created_at,
        }));

        setProducts(fixedProducts);
        
        // BEST SELLERS - Products with highest review count
        const bestSellersList = [...fixedProducts]
          .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
          .slice(0, 4);
        setBestSellers(bestSellersList);

        // TOP RATED - Products with highest rating (4+ stars) that are NOT in best sellers
        const bestSellerIds = bestSellersList.map(p => p.id);
        const topRatedList = [...fixedProducts]
          .filter(p => (p.rating || 0) >= 4 && !bestSellerIds.includes(p.id))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
        
        // If not enough top rated products, get any high rated products
        if (topRatedList.length < 4) {
          const additionalTopRated = [...fixedProducts]
            .filter(p => (p.rating || 0) >= 3.5 && !bestSellerIds.includes(p.id) && !topRatedList.some(t => t.id === p.id))
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4 - topRatedList.length);
          setTopRated([...topRatedList, ...additionalTopRated]);
        } else {
          setTopRated(topRatedList);
        }

        // WEEKLY DROPS - Products added in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const weeklyDropsList = [...fixedProducts]
          .filter((p: Product) => p.created_at && new Date(p.created_at) >= thirtyDaysAgo)
          .sort((a, b) => {
            if (!a.created_at || !b.created_at) return 0;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
          .slice(0, 4);
        
        // If no products from last 30 days, show most recent 4 products
        if (weeklyDropsList.length === 0) {
          const recentProducts = [...fixedProducts]
            .sort((a, b) => {
              if (!a.created_at || !b.created_at) return 0;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
            .slice(0, 4);
          setWeeklyDrops(recentProducts);
        } else {
          setWeeklyDrops(weeklyDropsList);
        }

        setBrands(brandRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* BRAND SCROLL */
  useEffect(() => {
    if (!brandsRef.current || brands.length === 0 || isLoading) return;

    const container = brandsRef.current;
    const logos = Array.from(container.children) as HTMLElement[];
    
    // Clear any existing animations
    gsap.killTweensOf(container);
    
    // Clone logos for infinite scroll
    logos.forEach((logo) => container.appendChild(logo.cloneNode(true)));

    const totalWidth = Array.from(container.children).reduce(
      (acc, el) => acc + (el as HTMLElement).offsetWidth + 80,
      0
    );

    gsap.to(container, {
      x: `-${totalWidth / 2}px`,
      duration: 40,
      ease: "none",
      repeat: -1,
    });
  }, [brands, isLoading]);

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category_id === activeFilter);

  const toggleWishlist = (product: any) => {
    const exists = wishlistItems.find((i) => i.id === product.id);
    exists ? removeItem(product.id) : addItem(product);
  };

  const renderProductSection = (title: string, subtitle: string, products: Product[], bgColor: string = "bg-background") => {
    if (products.length === 0) return null;
    
    return (
      <section className={`py-16 ${bgColor}`}>
        <div className="max-w-[1800px] mx-auto px-10">
          <div className="text-center mb-10">
            <span className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
              {subtitle}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mt-2">
              {title}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <ProductCard
                  product={product}
                  isWishlisted={wishlistItems.some((i) => i.id === product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AIFittingBanner />

      {/* TRENDING FASHION SECTION */}
      <section className="py-16 bg-background">
        <div className="max-w-[1800px] mx-auto px-10">
          <div className="text-center mb-10">
            <span className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
              Hot Right Now
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mt-2">
              For You
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Discover what's popular this season with our curated collection of trending styles
            </p>
          </div>

          {/* Category Filters */}
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              All
            </button>

            {categories.map((cat: any) => (
              <button
                key={cat.category_id}
                onClick={() => setActiveFilter(cat.category_id)}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeFilter === cat.category_id 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Trending Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <div
                key={product.id}
                className="cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <ProductCard
                  product={product}
                  isWishlisted={wishlistItems.some((i) => i.id === product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS SECTION */}
      {renderProductSection(
        "Best Sellers", 
        "Customer Favorites",
        bestSellers,
        "bg-gray-50"
      )}

      {/* TOP RATED SECTION */}
      {renderProductSection(
        "Top Rated", 
        "Highest Quality",
        topRated,
        "bg-background"
      )}

      {/* WEEKLY DROPS SECTION */}
      {renderProductSection(
        "Weekly Drops", 
        "Fresh Arrivals",
        weeklyDrops,
        "bg-gray-50"
      )}

      {/* BRANDS SECTION */}
      <section className="py-16 bg-background text-center overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-10">
          <span className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            BRANDS
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mt-2">
            Our Brands
          </h2>

          <div
            ref={brandsRef}
            className="flex items-center gap-10 w-max mx-auto mt-8"
          >
            {brands.map((brand: any) => (
              <img
                key={brand.brand_id}
                src={brand.logo_url}
                alt={brand.name}
                className="h-16 md:h-20 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductGrid;