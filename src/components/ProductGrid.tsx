import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import api from "../api";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";
import AIFittingBanner from "./AIFittingBanner";
import { useWishlist } from "@/hooks/use-wishlist";

/* ---------------- TYPES ---------------- */
interface Category {
  category_id: number;
  name: string;
  description?: string;
  image_url: string;
}

/* ---------------- CATEGORY SECTION ---------------- */
const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories/latest");

        const categoriesWithDescription = res.data.map((cat: any) => {
          const lowerName = cat.name.toLowerCase().trim();
          let description = "";

          if (/^women/.test(lowerName)) description = "Trendy collections for women";
          else if (/^men/.test(lowerName)) description = "Stylish Outfits for every man";
          else if (/^sale/.test(lowerName)) description = "Grab your favourites";

          return { ...cat, description };
        });

        setCategories(categoriesWithDescription);
      } catch (err) {
        console.error("Category fetch error:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleShopNow = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase().trim();
    let slug = "";

    if (/^women/.test(lowerName)) slug = "women";
    else if (/^men/.test(lowerName)) slug = "men";
    else if (/^sale/.test(lowerName)) slug = "sale";

    if (slug) navigate(`/${slug}`);
  };

  return (
    <section className="py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            Browse By
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mt-2">
            Shop Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.category_id}
              className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-card hover:shadow-hover transition-all duration-500 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <img
                src={category.image_url}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="font-heading text-2xl md:text-3xl text-primary-foreground font-medium mt-1">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-primary-foreground/70 mt-2">
                    {category.description}
                  </p>
                )}

                <div
                  onClick={() => handleShopNow(category.name)}
                  className="cursor-pointer flex items-center gap-2 text-gold-light mt-4 transition-all duration-300 group-hover:gap-4"
                >
                  <span className="font-medium group-hover:text-blue-600">
                    Shop Now
                  </span>
                  <ArrowRight className="h-5 w-5 group-hover:text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- PRODUCT GRID ---------------- */
const ProductGrid = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");

  const brandsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { wishlistItems, addItem, removeItem } = useWishlist();

  /* FETCH DATA */
  useEffect(() => {
    const fetchData = async () => {
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
          originalPrice: p.original_price
            ? Number(p.original_price)
            : undefined,
          image_url: p.image_url,
          inStock: Number(p.stock) > 0,
          category_id: p.category_id,
          brand_name: p.brand_name,
        }));

        setProducts(fixedProducts);
        setBrands(brandRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  /* BRAND SCROLL */
  useEffect(() => {
    if (!brandsRef.current || brands.length === 0) return;

    const container = brandsRef.current;
    const logos = Array.from(container.children) as HTMLElement[];
    logos.forEach((logo) => container.appendChild(logo.cloneNode(true)));

    const totalWidth = Array.from(container.children).reduce(
      (acc, el) => acc + (el as HTMLElement).offsetWidth + 80,
      0
    );

    gsap.to(container, {
      x: `-${totalWidth / 2}px`,
      duration: 30,
      ease: "linear",
      repeat: -1,
    });
  }, [brands]);

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category_id === activeFilter);

  const toggleWishlist = (product: any) => {
    const exists = wishlistItems.find((i) => i.id === product.id);
    exists ? removeItem(product.id) : addItem(product);
  };

  return (
    <div>
      <AIFittingBanner />
      <CategorySection />

      <section className="py-28 bg-background">
        <div className="max-w-[1800px] mx-auto px-10">
          <div className="text-center mb-8">
            <span className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
              Our Collection
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mt-2">
              Trending Fashion
            </h2>
          </div>

          <div className="mb-16 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveFilter("all")}
              className="px-8 py-3 rounded-full text-sm font-semibold bg-gray-200 hover:bg-gray-300"
            >
              All
            </button>

            {categories.map((cat: any) => (
              <button
                key={cat.category_id}
                onClick={() => setActiveFilter(cat.category_id)}
                className="px-8 py-3 rounded-full text-sm font-semibold bg-gray-200 hover:bg-gray-300"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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

          {/* BRANDS */}
          <section className="mt-40 text-center overflow-hidden">
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
                  className="h-20 object-contain opacity-80 hover:opacity-100 transition"
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default ProductGrid;
