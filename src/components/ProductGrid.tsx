import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import api from "../api";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";
import menImage from "@/assets/dress-1.jpg";
import womenImage from "@/assets/dress-3.jpg";
import saleImage from "@/assets/dress-4.jpg";
import AIFittingBanner from "./AIFittingBanner";

// ---------------- CATEGORIES DATA ----------------
const categoriesData = [
  {
    name: "Men",
    description: "Stylish outfits for every man",
    image: menImage,
    count: 120,
  },
  {
    name: "Women",
    description: "Trendy collections for women",
    image: womenImage,
    count: 150,
  },
  {
    name: "Sale",
    description: "Grab your favorites",
    image: saleImage,
    count: 75,
  },
];

// ---------------- CATEGORY SECTION ----------------
const CategorySection = () => (
  <section className="py-20 gradient-subtle">
    <div className="container mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
          Browse By
        </span>
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mt-2">
          Shop Categories
        </h2>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categoriesData.map((category, index) => (
          <Link
            key={category.name}
            to={`/${category.name.toLowerCase()}`}
            className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-card hover:shadow-hover transition-all duration-500 animate-fade-in"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Background Image */}
            <img
              src={category.image}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary/40 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className="text-gold-light text-sm tracking-wide">
                {category.count} items
              </span>
              <h3 className="font-heading text-2xl md:text-3xl text-primary-foreground font-medium mt-1">
                {category.name}
              </h3>
              <p className="text-primary-foreground/70 mt-2">
                {category.description}
              </p>

              {/* SHOP NOW BUTTON */}
              <div className="flex items-center gap-2 text-gold-light mt-4 transition-all duration-300 group-hover:gap-4">
                <span className="font-medium transition-colors duration-300 group-hover:text-blue-600">
                  Shop Now
                </span>
                <ArrowRight className="h-5 w-5 transition-colors duration-300 group-hover:text-blue-600" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// ---------------- PRODUCT GRID ----------------
const ProductGrid = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const brandsRef = useRef<HTMLDivElement | null>(null);

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
          rating: p.rating || 4,
          reviewCount: p.review_count || 10,
          inStock: Number(p.stock) > 0,
          category_id: p.category_id,
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

  const filteredProducts = products.filter(
    (p) => activeFilter === "all" || p.category_id === activeFilter
  );

  return (
    <div>
      {/* AI Fitting Banner */}
      <AIFittingBanner />
      {/* CATEGORY SECTION */}
      <CategorySection />

      {/* TRENDING FASHION */}
      <section className="py-28 bg-background">
        <div className="max-w-[1800px] mx-auto px-10">
          {/* HEADER */}
          <div className="text-center mb-8">
            <span className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
              Our Collection
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mt-2">
              Trending Fashion
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Premium streetwear & modern essentials
            </p>
          </div>

          {/* FILTERS */}
          <div className="mb-16 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-8 py-3 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition`}
            >
              All
            </button>

            {categories.map((cat: any) => (
              <button
                key={cat.category_id}
                onClick={() => setActiveFilter(cat.category_id)}
                className="px-8 py-3 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <ProductCard
                  product={product}
                  buttonClass="bg-black text-white hover:bg-blue-600"
                />
              </Link>
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
