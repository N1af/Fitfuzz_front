import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Upload,
  CheckCircle,
  Package,
  Clock,
  TrendingUp,
  MessageSquare,
  ChevronLeft,
  ChevronDown,
  X,
} from "lucide-react";
import api from "../api";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/hooks/use-cart";
import ChatBox from "./ChatBox";
import LocationForm, { LocationData } from "./LocationForm";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/context/AuthContext";

interface Color {
  id: number | string;
  name: string;
}

interface Size {
  id: number | string;
  name: string;
}

/* ================= TYPES ================= */

interface Product {
  id: string;
  name: string;
  seller_id: number;
  image_url: string;
  images?: string[];
  price: number;
  original_price?: number;
  category: string;
  description: string;
  rating: number;
  review_count: number;
  brand: string;
  sizes?: number[];
  colors?: number[];
}

interface Feedback {
  id: number;
  user_id: number;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
  user_name?: string;
}

interface UserLocation extends LocationData {
  id: number;
  delivery_charge: number;
}

/* ================= COMPONENT ================= */

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const userIdStr = localStorage.getItem("userId");
  const userId = userIdStr ? Number(userIdStr) : null;

  const [isWishlisted, setIsWishlisted] = useState(false);

  const { user, loading } = useAuth();
  const {
    wishlistItems,
    addItem: addWishlist,
    removeItem: removeWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  const [quantity, setQuantity] = useState(1);

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [latestLocation, setLatestLocation] = useState<UserLocation | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);

  const [selectedColorId, setSelectedColorId] = useState<string | number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | number | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const allImages = product
    ? Array.from(new Set([product.image_url, ...(product.images || [])]))
    : [];
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!user || !product || !wishlistItems) {
      setIsWishlisted(false);
      return;
    }
    setIsWishlisted(
      wishlistItems.some((i) => String(i.id) === String(product.id)),
    );
  }, [user, product, wishlistItems]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch product
        const productRes = await api.get(`/api/products/${id}`);
        const productData = productRes.data;
        setProduct(productData);
        setActiveImage(productData.image_url);

        // Fetch sizes with better error handling
        let sizesData: Size[] = [];
        try {
          const sizesRes = await api.get(`/api/product_sizes/${id}`);
          
          // Handle different response formats
          if (Array.isArray(sizesRes.data)) {
            sizesData = sizesRes.data.map((item: any, index: number) => {
              // If item is a string (just the name)
              if (typeof item === 'string') {
                return { id: index + 1, name: item };
              }
              // If item is an object but missing id
              else if (item && typeof item === 'object') {
                return {
                  id: item.id || item.size_id || item.name || index + 1,
                  name: item.name || item.size_name || item
                };
              }
              // Fallback
              return { id: index + 1, name: String(item) };
            });
          }
        } catch (error) {
          console.error("Error fetching sizes:", error);
          // Create default sizes from product data if available
          if (productData.sizes && Array.isArray(productData.sizes)) {
            sizesData = productData.sizes.map((item: any, index: number) => ({
              id: index + 1,
              name: typeof item === 'string' ? item : `Size ${index + 1}`
            }));
          }
        }

        // Fetch colors with better error handling
        let colorsData: Color[] = [];
        try {
          const colorsRes = await api.get(`/api/product_colors/${id}`);
          
          // Handle different response formats
          if (Array.isArray(colorsRes.data)) {
            colorsData = colorsRes.data.map((item: any, index: number) => {
              // If item is a string (just the name)
              if (typeof item === 'string') {
                return { id: index + 1, name: item };
              }
              // If item is an object but missing id
              else if (item && typeof item === 'object') {
                return {
                  id: item.id || item.color_id || item.name || index + 1,
                  name: item.name || item.color_name || item
                };
              }
              // Fallback
              return { id: index + 1, name: String(item) };
            });
          }
        } catch (error) {
          console.error("Error fetching colors:", error);
          // Create default colors from product data if available
          if (productData.colors && Array.isArray(productData.colors)) {
            colorsData = productData.colors.map((item: any, index: number) => ({
              id: index + 1,
              name: typeof item === 'string' ? item : `Color ${index + 1}`
            }));
          }
        }

        setSizes(sizesData);
        setColors(colorsData);
        
        // Set defaults if we have data
        if (sizesData.length > 0 && selectedSizeId === null) {
          setSelectedSizeId(sizesData[0].id);
        }
        
        if (colorsData.length > 0 && selectedColorId === null) {
          setSelectedColorId(colorsData[0].id);
        }

        // Fetch feedbacks (this gives us averageRating and reviewCount)
        const feedbackRes = await api.get(`/api/feedback/product/${id}`);
        setFeedbacks(feedbackRes.data.feedbacks || []);
        setAverageRating(feedbackRes.data.averageRating || 0);
        setReviewCount(feedbackRes.data.reviewCount || 0);

        // Fetch latest user location
        if (userId) {
          const locationRes = await api.get(`/api/locations/latest/${userId}`);
          setLatestLocation(locationRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  /* ================= HANDLERS ================= */

  // FIXED: Authentication check with redirect path saving
  const checkAuthAndRedirect = (destination: string) => {
    if (!user) {
      // Save the intended destination before redirecting to login
      localStorage.setItem('redirectAfterLogin', destination);
      navigate('/login');
      return false;
    }
    return true;
  };

  const addToCart = () => {
    if (!product) return;

    // Check authentication first
    if (!checkAuthAndRedirect('/cart')) return;

    if (selectedColorId === null || selectedColorId === undefined) {
      alert("Please select a color");
      return;
    }

    if (selectedSizeId === null || selectedSizeId === undefined) {
      alert("Please select a size");
      return;
    }

    const selectedColor = colors.find((c) => c.id === selectedColorId);
    const selectedSize = sizes.find((s) => s.id === selectedSizeId);

    if (!selectedColor || !selectedSize) {
      alert("Selected option not available");
      return;
    }

    // Create a unique ID for this variant
    const cartItemId = `${product.id}-${selectedColorId}-${selectedSizeId}`;

    addItem({
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      seller_id: String(product.seller_id),
      quantity,
      selectedColorId,
      selectedColorName: selectedColor.name,
      selectedSizeId,
      selectedSizeName: selectedSize.name,
    });
    
    alert(`Added ${quantity} × ${selectedColor.name} ${selectedSize.name} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Check authentication first
    if (!checkAuthAndRedirect('/checkout')) return;

    if (selectedColorId === null || selectedColorId === undefined) {
      alert("Please select a color");
      return;
    }

    if (selectedSizeId === null || selectedSizeId === undefined) {
      alert("Please select a size");
      return;
    }

    const selectedColor = colors.find((c) => c.id === selectedColorId);
    const selectedSize = sizes.find((s) => s.id === selectedSizeId);

    if (!selectedColor || !selectedSize) {
      alert("Selected option not available");
      return;
    }

    // Create a unique ID for this variant
    const cartItemId = `${product.id}-${selectedColorId}-${selectedSizeId}`;

    addItem({
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      seller_id: String(product.seller_id),
      quantity,
      selectedColorId,
      selectedColorName: selectedColor.name,
      selectedSizeId,
      selectedSizeName: selectedSize.name,
    });
    
    navigate("/checkout");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    // Check authentication first
    if (!checkAuthAndRedirect(window.location.pathname)) return;

    if (!product) return;

    if (isWishlisted) {
      removeWishlist(product.id);
      setIsWishlisted(false);
    } else {
      addWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
      setIsWishlisted(true);
    }
  };

  const handleChatWithSeller = () => {
    if (!checkAuthAndRedirect(window.location.pathname)) return;
    setShowChat(true);
  };

  /* ===== SUBMIT REVIEW ===== */
  const submitReview = async () => {
    if (!checkAuthAndRedirect(window.location.pathname)) return;
    
    if (!reviewComment.trim()) return alert("Please write a review");

    let imageUrls: string[] = [];

    if (reviewImages.length > 0) {
      const uploadRes = await api.post("/api/s3/generate-upload-urls", {
        files: reviewImages.map((f) => ({
          fileName: f.name,
          fileType: f.type,
        })),
      });

      const urls = uploadRes.data.urls;

      for (let i = 0; i < urls.length; i++) {
        const { uploadUrl, imageUrl } = urls[i];

        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": reviewImages[i].type },
          body: reviewImages[i],
        });

        imageUrls.push(imageUrl);
      }
    }

    await api.post("/api/feedback", {
      product_id: product!.id,
      user_id: userId,
      rating: reviewRating,
      comment: reviewComment,
      images: imageUrls,
    });

    const res = await api.get(`/api/feedback/product/${id}`);
    setFeedbacks(res.data.feedbacks || []);
    setAverageRating(res.data.averageRating || 0);
    setReviewCount(res.data.reviewCount || 0);

    const productRes = await api.get(`/api/products/${id}`);
    setProduct(productRes.data);

    setShowReviewForm(false);
    setReviewImages([]);
    setReviewComment("");
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!checkAuthAndRedirect(window.location.pathname)) return;

    const confirmDelete = window.confirm("Delete this review?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/feedback/${reviewId}`, {
        data: { user_id: userId },
      });

      setFeedbacks((prev) => prev.filter((review) => review.id !== reviewId));

      const productRes = await api.get(`/api/products/${id}`);
      setProduct(productRes.data);
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const saveLocation = async (data: LocationData) => {
    if (!checkAuthAndRedirect(window.location.pathname)) return;
    
    try {
      const res = await api.post("/api/locations", {
        ...data,
        user_id: userId,
      });
      setLatestLocation(res.data.location);
      setShowLocationForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper function to render stars based on rating
  const renderStars = (rating: number, size = "md") => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const starSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

    return (
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${starSize} fill-yellow-400 text-yellow-400`}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${starSize} text-gray-300`} />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${starSize} text-gray-300`}
          />
        ))}
      </div>
    );
  };

  const toggleReviewExpand = (reviewId: number) => {
    setExpandedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setReviewImages(prev => [...prev, ...newFiles].slice(0, 3)); // Limit to 3 images
  };

  const removeReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Package className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">Product Not Found</h1>
        <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
          Continue Shopping
        </Button>
      </div>
    );
  }

  const selectedColor = colors.find(c => c.id === selectedColorId);
  const selectedSize = sizes.find(s => s.id === selectedSizeId);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link to="/products" className="text-gray-500 hover:text-blue-600 transition-colors">
              Products
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE - Product Images */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Image - BIGGER SIZE */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-lg">
                  <img
                    src={activeImage || product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 transition-all duration-500 hover:scale-110"
                  />
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlist}
                    className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all"
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        isWishlisted
                          ? "fill-red-500 text-red-500 animate-pulse"
                          : "text-gray-600 hover:text-red-500"
                      } transition-colors`}
                    />
                  </button>

                  {/* Navigation Buttons */}
                  <button
                    onClick={() => {
                      const idx = allImages.indexOf(activeImage || allImages[0]);
                      setActiveImage(allImages[(idx - 1 + allImages.length) % allImages.length]);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      const idx = allImages.indexOf(activeImage || allImages[0]);
                      setActiveImage(allImages[(idx + 1) % allImages.length]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Thumbnails - BIGGER SIZE */}
                {allImages.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === img
                            ? "border-blue-600 shadow-md scale-105"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Category & Rating */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {renderStars(averageRating)}
                    <span className="text-sm text-gray-600">
                      ({reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Brand */}
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium text-gray-900">{product.brand}</span>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.original_price && (
                      <>
                        <span className="text-xl line-through text-gray-400">
                          Rs. {product.original_price.toLocaleString()}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                          Save Rs. {(product.original_price - product.price).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Inclusive of all taxes</p>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Color</label>
                    {selectedColor && (
                      <span className="text-sm text-blue-600">
                        Selected: <span className="font-medium">{selectedColor.name}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.length === 0 ? (
                      <p className="text-sm text-gray-500">No colors available</p>
                    ) : (
                      colors.map((c) => {
                        const isSelected = selectedColorId === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setSelectedColorId(c.id)}
                            className={`px-4 py-2.5 rounded-lg border transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 text-blue-700 font-medium shadow-sm"
                                : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                          >
                            {c.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Size</label>
                    {selectedSize && (
                      <span className="text-sm text-blue-600">
                        Selected: <span className="font-medium">{selectedSize.name}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.length === 0 ? (
                      <p className="text-sm text-gray-500">No sizes available</p>
                    ) : (
                      sizes.map((s) => {
                        const isSelected = selectedSizeId === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSizeId(s.id)}
                            className={`w-14 h-14 rounded-lg border flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white shadow-md"
                                : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                            }`}
                          >
                            <span className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                              {s.name}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded-xl w-fit overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Selection Summary */}
                {(selectedColor || selectedSize) && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-2">Selection Summary</h3>
                    <div className="space-y-2 text-sm">
                      {selectedColor && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-gray-700">Color:</span>
                          <span className="font-medium">{selectedColor.name}</span>
                        </div>
                      )}
                      {selectedSize && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-gray-700">Size:</span>
                          <span className="font-medium">{selectedSize.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-gray-700">Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                  <Button
                    onClick={addToCart}
                    disabled={!selectedColorId || !selectedSizeId}
                    className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <ShoppingBag className="mr-3 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!selectedColorId || !selectedSizeId}
                    className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center p-3">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                      <Truck className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">Free Shipping</p>
                    <p className="text-xs text-gray-500">Over Rs. 5000</p>
                  </div>
                  <div className="text-center p-3">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-2">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">Easy Returns</p>
                    <p className="text-xs text-gray-500">30 Day Returns</p>
                  </div>
                  <div className="text-center p-3">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
                      <Shield className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% Protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details & Reviews Tabs */}
            <div className="mt-12">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="details" className="text-base font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Product Details
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="text-base font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Reviews & Ratings
                  </TabsTrigger>
                </TabsList>

                {/* Product Details Tab */}
                <TabsContent value="details" className="mt-0">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Additional Details Section */}
                    <div className="mt-8 pt-8 border-t">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Premium Quality</p>
                            <p className="text-sm text-gray-600">Made with high-quality materials for durability</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Long Lasting</p>
                            <p className="text-sm text-gray-600">Designed for extended use and performance</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Top Brand</p>
                            <p className="text-sm text-gray-600">From {product.brand}, a trusted manufacturer</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Package className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-800">Complete Package</p>
                            <p className="text-sm text-gray-600">Everything you need included in the box</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-0">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    {/* Reviews Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center">
                            {renderStars(averageRating, "lg")}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            {averageRating.toFixed(1)} out of 5
                          </span>
                          <span className="text-gray-500">({reviewCount} reviews)</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          if (!checkAuthAndRedirect(window.location.pathname)) return;
                          setShowReviewForm(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Write a Review
                      </Button>
                    </div>

                    {/* Review Form Modal */}
                    {showReviewForm && (
                      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Write Your Review</h4>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {/* Rating Stars */}
                        <div className="mb-6">
                          <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setReviewRating(n)}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    n <= reviewRating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300 hover:text-yellow-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Review Comment */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review
                          </label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            rows={4}
                          />
                        </div>

                        {/* Image Upload */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Photos (Optional)
                          </label>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 flex-wrap">
                              {reviewImages.map((file, index) => (
                                <div key={index} className="relative">
                                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeReviewImage(index)}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              {reviewImages.length < 3 && (
                                <label className="cursor-pointer">
                                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Upload</span>
                                  </div>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Upload up to 3 images (JPEG, PNG, GIF)
                            </p>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                          <Button
                            onClick={submitReview}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            disabled={!reviewComment.trim()}
                          >
                            Submit Review
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowReviewForm(false);
                              setReviewImages([]);
                              setReviewComment("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {feedbacks.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h4 className="text-xl font-medium text-gray-700 mb-2">No Reviews Yet</h4>
                          <p className="text-gray-500">Be the first to share your thoughts about this product!</p>
                        </div>
                      ) : (
                        feedbacks.map((review) => {
                          const isExpanded = expandedReviews.includes(review.id);
                          const commentWords = review.comment.split(' ');
                          const isLongComment = commentWords.length > 50;

                          return (
                            <div
                              key={review.id}
                              className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition-all"
                            >
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                  {/* Review Header */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                      <span className="font-semibold text-lg text-blue-700">
                                        {review.user_name?.[0]?.toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {renderStars(review.rating)}
                                        <span className="text-sm text-gray-500">
                                          {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-base font-medium text-gray-700 mt-1">
                                        {review.user_name || 'Anonymous User'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Review Comment */}
                                  <div className="mt-3">
                                    <p className={`text-gray-700 text-base ${!isExpanded && isLongComment ? 'line-clamp-3' : ''}`}>
                                      {review.comment}
                                    </p>
                                    {isLongComment && (
                                      <button
                                        onClick={() => toggleReviewExpand(review.id)}
                                        className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                      >
                                        {isExpanded ? 'Show less' : 'Read more'}
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                      </button>
                                    )}
                                  </div>

                                  {/* Review Images */}
                                  {review.images && review.images.length > 0 && (
                                    <div className="mt-6">
                                      <div className="flex gap-4 overflow-x-auto pb-2">
                                        {review.images.map((img, index) => (
                                          <div
                                            key={index}
                                            className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border border-gray-300"
                                          >
                                            <img
                                              src={img}
                                              alt={`Review image ${index + 1}`}
                                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                                              onClick={() => window.open(img, '_blank')}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Delete Button (if owner) */}
                                {review.user_id === userId && (
                                  <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors self-start"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* RIGHT SIDE - Delivery & Seller Info */}
          <div className="space-y-6">
            {/* Delivery Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery Options</h3>
              </div>

              {latestLocation ? (
                <div className="space-y-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Province</p>
                        <p className="font-medium">{latestLocation.province}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">District</p>
                        <p className="font-medium">{latestLocation.district}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Village</p>
                        <p className="font-medium">{latestLocation.village}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{latestLocation.phone}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Delivery Charge:</span>
                        <span className="text-lg font-bold text-blue-600">
                          Rs. {latestLocation.delivery_charge}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500 text-sm">No saved location found.</p>
                </div>
              )}

              <Button
                onClick={() => {
                  if (!checkAuthAndRedirect(window.location.pathname)) return;
                  setShowLocationForm(true);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {latestLocation ? "Update Location" : "Add Delivery Location"}
              </Button>

              {showLocationForm && (
                <LocationForm
                  defaultValues={latestLocation || undefined}
                  onClose={() => setShowLocationForm(false)}
                  onSave={saveLocation}
                />
              )}
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sold by</h3>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl mb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-purple-700">
                    {product.brand?.[0]?.toUpperCase() || 'S'}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900">{product.brand}</h4>
                <p className="text-sm text-gray-500 mt-1">Verified Seller</p>
              </div>

              <Button
                onClick={handleChatWithSeller}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with Seller
              </Button>

              {showChat && product?.seller_id && (
                <ChatBox
                  sellerId={product.seller_id}
                  onClose={() => setShowChat(false)}
                />
              )}
            </div>

            {/* Return Policy Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Return Policy</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>30 days easy return policy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Free return shipping on defective items</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Full refund within 7 business days</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;