import { useEffect, useState } from "react";
import api from "../../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, Clock, XCircle, Eye, User } from "lucide-react";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin-products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      toast({ 
        title: "Failed to fetch products", 
        description: "Please try again later",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format price to display in Rupees
  const formatPrice = (price) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return "Rs 0.00";
    
    // Format with Indian Rupees symbol and Indian number formatting
    return `Rs ${numericPrice.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Seller Products
            </CardTitle>
            <CardDescription>Loading products...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="p-6">
      <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                Seller Products Management
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Review and manage all products from sellers
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-4 py-2 bg-white">
              Total: {products.length} products
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No products available</h3>
              <p className="text-gray-500">Sellers haven't added any products yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M50 30L35 45H25V55H35L50 70L65 55H75V45H65L50 30Z' fill='%239ca3af'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%239ca3af' stroke-width='2'/%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <Package className="h-16 w-16 text-gray-400 mb-3" />
                        <span className="text-gray-500 text-sm">No image available</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute top-3 right-3 px-3 py-1.5 flex items-center gap-1.5 ${getStatusColor(product.status)} border`}
                    >
                      {getStatusIcon(product.status)}
                      {formatStatus(product.status)}
                    </Badge>
                  </div>

                  <CardContent className="p-5">
                    {/* Product Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg truncate mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Seller: <span className="font-medium">{product.seller_name || "Unknown"}</span>
                        </span>
                      </div>

                      {/* Product Details Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Stock</p>
                          <div className="flex items-center">
                            <span className={`text-lg font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock}
                            </span>
                            {product.stock === 0 && (
                              <span className="text-xs text-red-500 ml-2">Out of stock</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {product.category || "Uncategorized"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default ManageProducts;