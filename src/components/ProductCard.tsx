import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image_url: string;
    inStock: boolean;
    brand_name: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { wishlistItems, addItem: addWishlist, removeItem: removeWishlist } =
    useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted =
    user !== null && wishlistItems.some((i) => i.id === product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (isWishlisted) {
      removeWishlist(product.id);
    } else {
      addWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
    }
  };

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* WISHLIST */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white transition"
        >
          <Heart
            className={`h-5 w-5 ${
              isWishlisted ? "fill-blue-600 text-blue-600" : "text-gray-600"
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
              e.stopPropagation();
              addItem(product);
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>

      {/* INFO */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <h3 className="font-heading text-lg font-medium line-clamp-1">
          {product.name}
        </h3>

        <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mt-1">
          {product.brand_name}
        </div>

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
