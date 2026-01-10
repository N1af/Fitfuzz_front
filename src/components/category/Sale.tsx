import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Star,
  SlidersHorizontal,
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

const Sale = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | "All">("All");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLDivElement | null>(null);

  /* ------------------ GSAP Banner ------------------ */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".banner-track-sale", {
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
    const fetchData = async () => {
      try {
        const [bRes, cRes, pRes] = await Promise.all([
          axios.get("http://localhost:5000/api/sale/brands"),
          axios.get("http://localhost:5000/api/sale/subcategories"),
          axios.get("http://localhost:5000/api/sale/products"),
        ]);

        setBrands(bRes.data);
        setCategories(cRes.data);
        setProducts(pRes.data);
      } catch (err) {
        console.error("❌ Sale fetch error:", err);
      }
    };

    fetchData();
  }, []);

  /* ------------------ Filter Products ------------------ */
  const filteredProducts = products.filter(
    (p) =>
      (selectedBrand === "All" || p.brand_id === selectedBrand) &&
      (selectedCategories.length === 0 || selectedCategories.includes(p.subcategory_id))
  );

  /* ------------------ Sidebar ------------------ */
  const FilterSidebar = () => (
    <div className="space-y-6 p-4 border border-gray-200 rounded-md bg-white">
      <div>
        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2 text-blue-700 cursor-pointer">
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
      <div ref={bannerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg">
        <div className="flex banner-track-sale">
          {["/Sale1.jpg", "/Sale2.jpg", "/Sale3.jpg"].map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full h-[400px] md:h-[500px] relative">
              <img src={src} alt={`Sale Banner ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-10 -mt-24 relative z-20">
        <div className="bg-white rounded-t-[32px] shadow-sm px-6 py-8 flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <FilterSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Brand Filter */}
            <div className="flex flex-wrap gap-3 mb-4">
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
                    <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} />
                    <Button
                      className="absolute bottom-2 left-2 right-2 h-7 text-xs"
                      onClick={() => addItem({ ...p, quantity: 1 })}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>

                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground mb-1">
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

export default Sale;
