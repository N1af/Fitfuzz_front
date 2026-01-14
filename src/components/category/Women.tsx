import { useState, useEffect, useRef } from "react";
import api from "../../api"; // because AddProductForm is in src/components/seller/

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Star,
  SlidersHorizontal,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

/* ------------------ Types ------------------ */
interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  rating: number;
  reviews: number;
  image_url: string;
  brand_id: number;
  brand_name: string;
  subcategory_id: number;
  subcategory_name: string;
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

  const { addItem } = useCart();
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLDivElement | null>(null);

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

  /* ------------------ Fetch Data ------------------ */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, bRes, cRes] = await Promise.all([
          api.get("/api/women/products"),
          api.get("/api/women/brands"),
          api.get("/api/women/subcategories"),
        ]);

        setProducts(pRes.data);
        setBrands(bRes.data);
        setCategories(cRes.data);
      } catch (err) {
        console.error("❌ Women data fetch error:", err);
      }
    };

    fetchAll();
  }, []);

  /* ------------------ Filters ------------------ */
  const filteredProducts = products.filter(
    (p) =>
      (selectedBrand === "All" || p.brand_id === selectedBrand) &&
      (selectedCategories.length === 0 ||
        selectedCategories.includes(p.subcategory_id))
  );

  /* ------------------ Sidebar ------------------ */
  const FilterSidebar = () => (
    <div className="space-y-6 p-4 border border-gray-200 rounded-md bg-white">
      <div>
        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2 text-blue-700">
          <SlidersHorizontal className="w-4 h-4" />
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <div key={cat.subcategory_id} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedCategories.includes(cat.subcategory_id)}
                onCheckedChange={(checked) => {
                  setSelectedCategories((prev) =>
                    checked
                      ? [...prev, cat.subcategory_id]
                      : prev.filter((id) => id !== cat.subcategory_id)
                  );
                }}
              />
              <span className="text-xs">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div ref={bannerRef} className="relative w-full overflow-hidden">
        <div className="flex banner-track-women">
          {["/W1.jpg", "/W2.jpg", "/W3.jpg"].map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full h-[400px] relative">
              <img src={src} className="w-full h-full object-cover" alt={`Banner ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1500px] mx-auto px-6 -mt-24 relative z-20">
        <div className="bg-white rounded-t-[32px] px-6 py-8 flex gap-8">
          <div className="md:w-1/4">
            <FilterSidebar />
          </div>

          <div className="flex-1">
            {/* Brand Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                variant={selectedBrand === "All" ? "default" : "outline"}
                onClick={() => setSelectedBrand("All")}
              >
                All
              </Button>
              {brands.map((b) => (
                <Button
                  key={b.brand_id}
                  variant={selectedBrand === b.brand_id ? "default" : "outline"}
                  onClick={() => setSelectedBrand(b.brand_id)}
                >
                  {b.name}
                </Button>
              ))}
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <Card key={p.id} className="group">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={p.image_url}
                      className="w-full h-full object-cover"
                      alt={p.name}
                    />
                    <Button
                      className="absolute bottom-2 left-2 right-2 h-7 text-xs"
                      onClick={() => addItem({ ...p, quantity: 1 })}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>

                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground">
                      {p.subcategory_name} • {p.brand_name}
                    </p>
                    <h3
                      className="text-sm font-medium cursor-pointer"
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-blue-500 text-blue-500" />
                      <span className="text-xs">{p.rating}</span>
                      <span className="text-[10px]">({p.reviews})</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600 font-semibold">Rs. {p.price}</span>
                      {p.original_price && (
                        <span className="line-through text-xs">Rs. {p.original_price}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Women;
