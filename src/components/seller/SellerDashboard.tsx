import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  CheckCircle,
  LogOut,
  MessagesSquare,
  Truck,
  RefreshCw,
} from "lucide-react";

import AddProductForm from "./AddProductForm";
import { useAuth } from "@/context/AuthContext";
import SellerMessages from "./SellerMessages";
import SellerDetails from "./SellerDetails";
import SellerSettings from "./SellerSettings";

/* ==========================
   🔹 Types
========================== */
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image_url?: string;
  status: "pending" | "approved" | "rejected";
  seller_id?: number;
}

interface Order {
  order_item_id: number;
  productName: string;
  customer: string;
  price: string;
  date: string;
  status: string;
  isReturned?: boolean;
  returnReason?: string;
  returnComments?: string;
  returnStatus?: string;
}

interface Poster {
  id: number;
  image: string;
  category: "men" | "women" | "sale";
}

interface SellerTotals {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  messages: number;
}

/* ==========================
   🧩 Seller Dashboard Component
========================== */
const SellerDashboard = () => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddPosterOpen, setIsAddPosterOpen] = useState(false);
  const [posterCategory, setPosterCategory] =
    useState<Poster["category"]>("men");
  const [posterFiles, setPosterFiles] = useState<File[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [returnedOrders, setReturnedOrders] = useState<Order[]>([]);
  const [sellerTotals, setSellerTotals] = useState<SellerTotals>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    messages: 0,
  });
  const { currentSeller, sellerLogout } = useAuth();
  const navigate = useNavigate();

  const openEditProduct = async (product: Product) => {
    try {
      const res = await api.get(`/api/products/${product.id}`);
      setEditingProduct(res.data);
      setIsAddProductOpen(true);
    } catch (err) {
      console.error("❌ Failed to fetch product details:", err);
      alert("Failed to load product details for editing");
    }
  };

  const sellerId =
    currentSeller?.seller_id ||
    (localStorage.getItem("seller_id")
      ? parseInt(localStorage.getItem("seller_id")!)
      : null);

  /* ==========================
     🔹 Fetch Products
  ========================== */
  const fetchProducts = async () => {
    if (!sellerId) return;
    try {
      const res = await api.get(`/api/seller-products/seller/${sellerId}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  /* ==========================
     🔹 Fetch All Orders (including return status)
  ========================== */
  /* ==========================
   🔹 Fetch All Orders (including return status)
=========================== */
  const fetchOrders = async () => {
    if (!sellerId) return;

    try {
      // Use the simple endpoint
      const res = await api.get(`/api/seller-orders/simple/${sellerId}`);

      // Separate orders based on status and return status
      const allOrders: Order[] = (res.data.orders || []).map((o: any) => ({
        order_item_id: o.order_item_id,
        productName: o.product_name,
        customer: o.customer_name || "Customer",
        price: o.item_price,
        date: new Date(o.created_at).toLocaleDateString(),
        status: o.item_status,
        isReturned: o.is_returned || false,
        returnReason: o.return_reason,
        returnComments: o.return_comments,
        returnStatus: o.return_status,
      }));

      // Filter delivered orders (status = 'Delivered' and not returned)
      const delivered = allOrders.filter(
        (order) => order.status === "Delivered" && !order.isReturned,
      );

      // Filter returned orders (isReturned = true)
      const returned = allOrders.filter((order) => order.isReturned === true);

      setOrders(allOrders);
      setDeliveredOrders(delivered);
      setReturnedOrders(returned);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    }
  };

  const fetchSellerTotals = async () => {
    if (!sellerId) return;
    try {
      const res = await api.get(`/api/seller-totals/${sellerId}`);
      setSellerTotals(res.data);
    } catch (err) {
      console.error("❌ Error fetching seller totals:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSellerTotals();
  }, [sellerId]);

  const handleAddProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.some((p) => p.id === updatedProduct.id)
        ? prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        : [updatedProduct, ...prev],
    );
    setIsAddProductOpen(false);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!sellerId) return;

    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/api/seller-products/${productId}/${sellerId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert("Product deleted successfully.");
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      alert("Failed to delete product. Try again later.");
    }
  };

  const stats = [
    {
      title: "Total Sales",
      value: `Rs ${sellerTotals.totalSales.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: sellerTotals.totalOrders.toString(),
      icon: Package,
    },
    {
      title: "Total Products",
      value: sellerTotals.totalProducts.toString(),
      icon: Users,
    },
    {
      title: "Messages",
      value: sellerTotals.messages.toString(),
      icon: MessagesSquare,
    },
  ];

  const handleLogout = () => {
    sellerLogout();
    localStorage.removeItem("seller_id");
    localStorage.removeItem("seller_name");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your products, inventory, and sales
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setEditingProduct(null);
                setIsAddProductOpen(true);
              }}
            >
              <Plus className="w-4 h-4" /> Add Product
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-all px-5 py-3"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="overflow-hidden shadow-sm">
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="seller-details">Seller Details</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="delivered">Delivered Orders</TabsTrigger>
            <TabsTrigger value="returns">Return Orders</TabsTrigger>
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {isAddProductOpen && (
            <AddProductForm
              product={editingProduct || undefined}
              onClose={() => setIsAddProductOpen(false)}
              onAddProduct={handleAddProduct}
            />
          )}

          {/* SELLER DETAILS TAB */}
          <TabsContent value="seller-details">
            <SellerDetails sellerId={sellerId} />
          </TabsContent>

          {/* ALL ORDERS TAB */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>
                  All customer orders from your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2">Order ID</th>
                        <th className="px-4 py-2">Product</th>
                        <th className="px-4 py-2">Customer</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.order_item_id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/seller-order-details/${order.order_item_id}`,
                            )
                          }
                        >
                          <td className="px-4 py-2">#{order.order_item_id}</td>
                          <td className="px-4 py-2">{order.productName}</td>
                          <td className="px-4 py-2">{order.customer}</td>
                          <td className="px-4 py-2">
                            Rs {Number(order.price).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">{order.date}</td>
                          <td className="px-4 py-2">
                            {order.isReturned ? (
                              <span className="text-red-600 font-semibold">
                                Returned ({order.returnStatus})
                              </span>
                            ) : (
                              <span
                                className={`font-semibold ${
                                  order.status === "Delivered"
                                    ? "text-green-600"
                                    : order.status === "Processing"
                                      ? "text-blue-600"
                                      : order.status === "Shipped"
                                        ? "text-purple-600"
                                        : "text-yellow-600"
                                }`}
                              >
                                {order.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DELIVERED ORDERS TAB */}
          <TabsContent value="delivered">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  Delivered Orders
                </CardTitle>
                <CardDescription>
                  Orders that have been successfully delivered
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deliveredOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No delivered orders found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-4 py-2">Order ID</th>
                          <th className="px-4 py-2">Product</th>
                          <th className="px-4 py-2">Customer</th>
                          <th className="px-4 py-2">Price</th>
                          <th className="px-4 py-2">Delivery Date</th>
                          <th className="px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveredOrders.map((order) => (
                          <tr
                            key={order.order_item_id}
                            className="border-b hover:bg-green-50 cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/seller-order-details/${order.order_item_id}`,
                              )
                            }
                          >
                            <td className="px-4 py-2">
                              #{order.order_item_id}
                            </td>
                            <td className="px-4 py-2">{order.productName}</td>
                            <td className="px-4 py-2">{order.customer}</td>
                            <td className="px-4 py-2">
                              Rs {Number(order.price).toLocaleString()}
                            </td>
                            <td className="px-4 py-2">{order.date}</td>
                            <td className="px-4 py-2">
                              <span className="text-green-600 font-semibold flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Delivered
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RETURN ORDERS TAB */}
          <TabsContent value="returns">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-red-600" />
                  Return Orders
                </CardTitle>
                <CardDescription>
                  Orders that have been returned by customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {returnedOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No return orders found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-2">Order ID</th>
                          <th className="px-4 py-2">Product</th>
                          <th className="px-4 py-2">Customer</th>
                          <th className="px-4 py-2">Price</th>
                          <th className="px-4 py-2">Return Date</th>
                          <th className="px-4 py-2">Reason</th>
                          <th className="px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnedOrders.map((order) => (
                          <tr
                            key={order.order_item_id}
                            className="border-b hover:bg-red-50 cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/seller-order-details/${order.order_item_id}`,
                              )
                            }
                          >
                            <td className="px-4 py-2">
                              #{order.order_item_id}
                            </td>
                            <td className="px-4 py-2">{order.productName}</td>
                            <td className="px-4 py-2">{order.customer}</td>
                            <td className="px-4 py-2">
                              Rs {Number(order.price).toLocaleString()}
                            </td>
                            <td className="px-4 py-2">{order.date}</td>
                            <td className="px-4 py-2">
                              <span className="text-red-700 font-medium">
                                {order.returnReason || "No reason provided"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-red-600 font-semibold">
                                {order.returnStatus || "Return Requested"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>My Products</CardTitle>
                <CardDescription>View your uploaded products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => {
                    const stockNumber = parseInt(product.stock);
                    const isOutOfStock = stockNumber === 0;
                    const isApproved = product.status === "approved";

                    return (
                      <Card
                        key={product.id}
                        className="overflow-hidden border rounded-lg hover:shadow-md transition-all"
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-32 object-contain bg-gray-100 p-1"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No Image
                          </span>
                        )}

                        <CardContent className="p-3 space-y-1">
                          <h3 className="text-sm font-semibold truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>

                          <div className="text-xs text-gray-600">
                            <p
                              className={`font-medium ${isOutOfStock ? "text-red-600" : "text-gray-600"}`}
                            >
                              Stock: {product.stock}
                            </p>
                            <p>Category: {product.category}</p>
                            <p
                              className={`font-medium ${isOutOfStock ? "text-red-600" : isApproved ? "text-green-600" : "text-yellow-600"}`}
                            >
                              {isOutOfStock
                                ? "Out of Stock"
                                : isApproved
                                  ? "Available"
                                  : product.status.charAt(0).toUpperCase() +
                                    product.status.slice(1)}
                            </p>
                          </div>

                          <p className="text-sm font-bold mt-1">
                            Rs {Number(product.price).toLocaleString()}
                          </p>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs flex items-center justify-center gap-1"
                              onClick={() => openEditProduct(product)}
                            >
                              ✏️ Edit
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full h-8 text-xs flex items-center justify-center gap-1"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages">
            <SellerMessages sellerId={sellerId} />
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            {sellerId ? (
              <SellerSettings sellerId={sellerId} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-red-500">
                  Seller not found. Please login again.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;
