import { useEffect } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Star, Heart, Trash2 } from "lucide-react";

interface WishlistPageProps {}

const Wishlist: React.FC<WishlistPageProps> = () => {
  const { wishlistItems, removeItem: removeWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Force re-render when wishlistItems change
  useEffect(() => {
    // No extra logic needed, just ensures component updates when context changes
  }, [wishlistItems]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 px-4 md:px-8 lg:px-16 pb-16">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 rounded-full">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                My Wishlist
              </h1>
            </div>
            <p className="text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-6 py-2 h-auto"
              onClick={clearWishlist}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Save items you love by clicking the heart icon. They'll appear here for easy access.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {wishlistItems.map((product) => (
                <Card
                  key={product.id}
                  className="group relative overflow-hidden border border-gray-200 rounded-xl bg-white hover:shadow-xl transition-all duration-300"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeWishlist(product.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>

                  {/* Product Image */}
                  <div 
                    className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Info */}
                  <CardContent className="p-4 md:p-5">
                    <h3
                      className="font-semibold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>

                    {/* Rating */}
                    {product.rating !== undefined && (
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">
                          {product.rating}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-blue-700">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-gray-400 line-through">
                          Rs. {product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 transition-all duration-300 transform hover:-translate-y-0.5"
                      onClick={() => addItem({ ...product, quantity: 1 })}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Stats Bar */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600">Total items in wishlist</p>
                  <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6"
                    onClick={() => navigate('/')}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                    onClick={() => navigate('/cart')}
                  >
                    View Cart
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;