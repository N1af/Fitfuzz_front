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
} from "lucide-react";
import api from "../api";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/hooks/use-cart";
import ChatBox from "./ChatBox";
import LocationForm, { LocationData } from "./LocationForm";

/* ================= TYPES ================= */

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  original_price?: number;
  category: string;
  description: string;
  rating: number;
  review_count: number;
  brand: string;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
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
  const userId = localStorage.getItem("userId");

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState({ rating: 0, comment: "" });
  const [latestLocation, setLatestLocation] = useState<UserLocation | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);

  /* UI STATES */
  const sizes = ["XS", "S", "M", "L", "XL"];
  const colors = ["Blue", "Black", "Red"];
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    api.get(`http://localhost:5000/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    api.get(`http://localhost:5000/api/feedback/product/${id}`)
      .then(res => setFeedbacks(res.data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!userId) return;
    api.get(`http://localhost:5000/api/locations/latest/${userId}`)
      .then(res => setLatestLocation(res.data))
      .catch(console.error);
  }, [userId]);

  /* ================= HANDLERS ================= */

  const addToCart = () => {
    if (!product) return;
    addItem({ ...product, quantity });
  };

  const saveLocation = async (data: LocationData) => {
    if (!userId) return;
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

  if (!product) {
    return <div className="py-20 text-center text-muted-foreground">Loading...</div>;
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-4 right-4 p-3 rounded-full bg-background/80"
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground">
                    {product.category}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({product.review_count})
                    </span>
                  </div>
                </div>

                <h1 className="font-heading text-4xl font-semibold">{product.name}</h1>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-blue-600">Rs. {product.price}</span>
                  {product.original_price && (
                    <span className="line-through text-muted-foreground">Rs. {product.original_price}</span>
                  )}
                </div>

               

                {/* Color */}
                <div>
                  <p className="text-sm font-medium mb-2">Color</p>
                  <div className="flex gap-3">
                    {colors.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 rounded-lg border ${selectedColor === c ? "border-blue-600 bg-blue-50 text-blue-600" : "border-border"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <p className="text-sm font-medium mb-2">Size</p>
                  <div className="flex gap-3">
                    {sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-12 h-12 rounded-xl border ${selectedSize === s ? "bg-blue-600 text-white border-blue-600" : "border-border"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <p className="text-sm font-medium mb-2">Quantity</p>
                  <div className="flex items-center border rounded-xl w-fit">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button size="lg" className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-lg" onClick={addToCart}>
                    <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                  <Button size="lg" className="flex-1 h-14 bg-yellow-500 hover:bg-yellow-600 text-lg text-black" onClick={() => { addToCart(); navigate("/checkout"); }}>
                    Buy Now
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                  <Feature icon={<Truck />} title="Free Shipping" desc="On all orders" />
                  <Feature icon={<RotateCcw />} title="Easy Returns" desc="7 Days Return" />
                  <Feature icon={<Shield />} title="Secure Payment" desc="100% Protected" />
                </div>

              </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 py-12">
              <Tabs defaultValue="details">
                <TabsList className="border-b">
                  <TabsTrigger value="details">Product Details</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>

                {/* Product Details */}
                <TabsContent value="details">
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </TabsContent>

                {/* Reviews */}
                <TabsContent value="reviews">
                  {feedbacks.map(f => (
                    <div key={f.id} className="border-b py-4">
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < f.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                      <p>{f.comment}</p>
                    </div>
                  ))}
                </TabsContent>

                {/* Delivery */}
                <TabsContent value="delivery">
                  {latestLocation ? (
                    <p>Delivery Charge: Rs. {latestLocation.delivery_charge}</p>
                  ) : (
                    <p>No delivery location added.</p>
                  )}
                  <Button className="mt-4" onClick={() => setShowLocationForm(true)}>Set Delivery Location</Button>

                  {showLocationForm && (
                    <LocationForm
                      defaultValues={latestLocation || undefined}
                      onClose={() => setShowLocationForm(false)}
                      onSave={saveLocation}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="space-y-4 text-xs">

            {/* Delivery Options Card */}
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Delivery Options</h3>

              {latestLocation ? (
                <div className="text-gray-600 text-sm border p-2 rounded mb-2">
                  <p>Province: {latestLocation.province}</p>
                  <p>District: {latestLocation.district}</p>
                  <p>Village: {latestLocation.village}</p>
                  <p>Phone: {latestLocation.phone}</p>
                  <p>Delivery Charge: Rs. {latestLocation.delivery_charge}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No saved location found.</p>
              )}

              <Button
                className="mt-2 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                onClick={() => setShowLocationForm(true)}
              >
                {latestLocation ? "Change Delivery Location" : "Add Delivery Location"}
              </Button>

              {showLocationForm && (
                <LocationForm
                  defaultValues={latestLocation || undefined}
                  onClose={() => setShowLocationForm(false)}
                  onSave={saveLocation}
                />
              )}
            </div>

            {/* Return & Warranty */}
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              <h3 className="font-semibold mb-1">Return & Warranty</h3>
              <p className="text-gray-600">14 days easy return</p>
            </div>

            {/* Seller Card */}
            <div className="bg-white border rounded-lg p-3 shadow-sm flex flex-col items-center">
              <h3 className="font-semibold mb-1">Sold by</h3>
              <p className="font-medium mb-1">{product.brand}</p>
              <Button
                className="mt-1 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                onClick={() => setShowChat(true)}
              >
                Chat Now
              </Button>
              {showChat && <ChatBox onClose={() => setShowChat(false)} />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ================= FEATURE COMPONENT ================= */
const Feature = ({ icon, title, desc }: any) => (
  <div className="text-center space-y-1">
    <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
      {icon}
    </div>
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xs text-muted-foreground">{desc}</p>
  </div>
);

export default ProductDetails;
