import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image_url: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* WISHLIST */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white transition"
        >
          <Heart
            className={`h-5 w-5 ${
              isWishlisted
                ? "fill-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          />
        </button>

        {/* QUICK ADD */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            className="w-full bg-black hover:bg-blue-600 text-white"
            size="lg"
            disabled={!product.inStock}
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>

      {/* INFO */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-medium text-card-foreground mt-1 line-clamp-1">
          {product.name}
        </h3>

        {/* RATING */}
        <div className="flex items-center gap-1 mt-1 text-sm">
          <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
          <span>{product.rating}</span>
          <span className="text-gray-400">({product.reviewCount})</span>
        </div>

        {/* PRICE */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-semibold text-blue-600">
            Rs. {product.price.toFixed(2)}
          </span>

          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              Rs. {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
