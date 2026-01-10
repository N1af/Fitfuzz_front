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
  review_count: number;
  image_url: string;
  discount: number;
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

const Men = () => {
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
      gsap.to(".banner-track-men", {
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
        const [bRes, cRes] = await Promise.all([
          axios.get("http://localhost:5000/api/men/brands"),
          axios.get("http://localhost:5000/api/men/subcategories"),
        ]);
        setBrands(bRes.data);
        setCategories(cRes.data);
      } catch (err) {
        console.error("❌ Data fetch error:", err);
      }
    };
    fetchData();
  }, []);

  /* ------------------ Fetch Products (with filters) ------------------ */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params: any = {};
        if (selectedBrand !== "All") params.brand = selectedBrand;
        if (selectedCategories.length > 0)
          params.subcategories = selectedCategories.join(",");

        const res = await axios.get("http://localhost:5000/api/men/products", {
          params,
        });
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Product fetch error:", err);
      }
    };
    fetchProducts();
  }, [selectedBrand, selectedCategories]);

  /* ------------------ Sidebar ------------------ */
  const FilterSidebar = () => (
    <div className="space-y-6 p-4 border border-gray-200 rounded-md bg-white">
      <div>
        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2 text-blue-600">
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
              <span className="text-xs text-blue-600">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div ref={bannerRef} className="relative w-full overflow-hidden h-[500px]">
        <div className="flex banner-track-men">
          {["/R4.jpg", "/R5.jpg", "/R6.jpg"].map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full h-[500px] relative">
              <img src={src} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1500px] mx-auto px-6 -mt-28 relative z-20">
        <div className="bg-white rounded-t-[32px] px-6 py-8 flex gap-8">
          <div className="md:w-1/4">
            <FilterSidebar />
          </div>

          <div className="flex-1">
            {/* Brand Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                className={`text-sm font-semibold ${
                  selectedBrand === "All"
                    ? "bg-blue-900 text-white hover:bg-blue-800"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
                onClick={() => setSelectedBrand("All")}
              >
                All
              </Button>
              {brands.map((b) => (
                <Button
                  key={b.brand_id}
                  className={`text-sm font-semibold ${
                    selectedBrand === b.brand_id
                      ? "bg-blue-900 text-white hover:bg-blue-800"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                  onClick={() => setSelectedBrand(b.brand_id)}
                >
                  {b.name}
                </Button>
              ))}
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <Card key={p.id} className="group relative overflow-hidden">
                  <div className="relative aspect-[3/4]">
                    {p.discount > 0 && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1 rounded z-10">
                        -{p.discount}%
                      </div>
                    )}
                    <img
                      src={p.image_url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Add to Cart appears on hover */}
                    <Button
                      className="absolute bottom-2 left-2 right-2 h-7 text-xs bg-blue-900 text-white hover:bg-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                      onClick={() => addItem({ ...p, quantity: 1 })}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>

                  <CardContent className="p-3">
                    <p className="text-[10px] text-blue-700">
                      {p.subcategory_name} • {p.brand_name}
                    </p>
                    <h3
                      className="text-sm font-medium cursor-pointer text-blue-700"
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-blue-500 text-blue-500" />
                      <span className="text-xs text-blue-600">{p.rating}</span>
                      <span className="text-[10px] text-blue-500">({p.review_count})</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600 font-semibold">
                        Rs. {p.price}
                      </span>
                      {p.original_price && (
                        <span className="line-through text-xs text-blue-300">
                          Rs. {p.original_price}
                        </span>
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

export default Men;
