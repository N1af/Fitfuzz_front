import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
} from "lucide-react";

import AddProductForm from "./AddProductForm";
import { useAuth } from "@/context/AuthContext";
import SellerDetails from "./SellerDetails";

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
}

interface Poster {
  id: number;
  image: string;
  category: "men" | "women" | "sale";
}

/* ==========================
   🧩 Seller Dashboard Component
========================== */
const SellerDashboard = () => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddPosterOpen, setIsAddPosterOpen] = useState(false);
  const [posterCategory, setPosterCategory] =
    useState<Poster["category"]>("men");
  const [posterFiles, setPosterFiles] = useState<File[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const { currentSeller, sellerLogout } = useAuth();
  const navigate = useNavigate();

  /* ==========================
     🔹 Reliable Seller ID
  ========================== */
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
      const res = await axios.get(
        `http://localhost:5000/api/seller-products/seller/${sellerId}`
      );
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  /* ==========================
     🔹 Fetch Orders (REAL seller orders)
  ========================== */
  const fetchOrders = async () => {
    if (!sellerId) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/seller-orders/${sellerId}`
      );

      const mappedOrders: Order[] = (res.data.orders || []).map((o: any) => ({
        order_item_id: o.order_item_id,
        productName: o.product_name,
        customer: o.customer_name ?? "Customer",
        price: o.item_price,
        date: new Date(o.created_at).toLocaleDateString(),
        status: o.item_status,
      }));

      setOrders(mappedOrders);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [sellerId]);

  /* ==========================
     🔹 Add Product
  ========================== */
  const handleAddProduct = async (
    newProduct: Omit<Product, "id" | "status">
  ) => {
    if (!sellerId) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/seller-products",
        {
          ...newProduct,
          seller_id: sellerId,
        }
      );
      setProducts((prev) => [res.data.product, ...prev]);
      setIsAddProductOpen(false);
    } catch (err) {
      console.error("❌ Error adding product:", err);
    }
  };

  /* ==========================
     🔹 Delete Product
  ========================== */
  const handleDeleteProduct = async (productId: number) => {
    if (!sellerId) return;

    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/seller-products/${productId}/${sellerId}`
      );
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert("Product deleted successfully.");
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      alert("Failed to delete product. Try again later.");
    }
  };

  /* ==========================
     🔹 Complete Sale
     ❗ Seller does NOT create orders
     ❗ Orders come from buyer checkout
  ========================== */
  const handleCompleteSale = async (_product: Product) => {
    alert(
      "Orders are created by customers at checkout.\nYou can manage status from Orders tab."
    );
  };

  /* ==========================
     🔹 Poster Handlers
  ========================== */
  const handlePosterFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPosterFiles(Array.from(e.target.files));
  };

  const handleAddPosters = () => {
    const newPosters = posterFiles.map((file) => ({
      id: Date.now() + Math.random(),
      image: URL.createObjectURL(file),
      category: posterCategory,
    }));
    setPosters((prev) => [...prev, ...newPosters]);
    setPosterFiles([]);
    setPosterCategory("men");
    setIsAddPosterOpen(false);
  };

  /* ==========================
     🔹 Logout
  ========================== */
  const handleLogout = () => {
    sellerLogout();
    localStorage.removeItem("seller_id");
    localStorage.removeItem("seller_name");
    navigate("/");
  };

  /* ==========================
     🔹 Stats
  ========================== */
  const stats = [
    { title: "Total Sales", value: "$12,345", change: "+12.5%", icon: DollarSign },
    { title: "Total Orders", value: "156", change: "+8.2%", icon: Package },
    { title: "Shop Visitors", value: "2,459", change: "+23.1%", icon: Users },
    { title: "Conversion Rate", value: "6.3%", change: "+2.4%", icon: TrendingUp },
  ];
  /* ==========================
     🧾 Render
  ========================== */
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
              onClick={() => setIsAddProductOpen(true)}
              className="gap-2 bg-primary text-white hover:bg-primary/90 transition-all px-6 py-3"
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
                <p className="text-xs text-green-600">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="seller-details">Seller Details</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* SELLER DETAILS TAB */}
          <TabsContent value="seller-details">
            <SellerDetails sellerId={sellerId} />
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>My Products</CardTitle>
                <CardDescription>
                  View your uploaded products and approval status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden border rounded-lg hover:shadow-md transition-all"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-32 object-cover"
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
                          <p>Stock: {product.stock}</p>
                          <p>Category: {product.category}</p>
                          <p>
                            Status:
                            <span
                              className={`ml-1 font-medium ${
                                product.status === "approved"
                                  ? "text-green-600"
                                  : product.status === "pending"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {product.status}
                            </span>
                          </p>
                        </div>

                        <p className="text-sm font-bold mt-1">
                          ${product.price}
                        </p>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={product.status !== "approved"}
                            className="w-full h-8 text-xs flex items-center gap-1"
                            onClick={() => handleCompleteSale(product)}
                          >
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Complete Sale
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full h-8 text-xs flex items-center gap-1"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Click to view order details</CardDescription>
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
                              `/seller-order-details/${order.order_item_id}`
                            )
                          }
                        >
                          <td className="px-4 py-2">#{order.order_item_id}</td>
                          <td className="px-4 py-2">{order.productName}</td>
                          <td className="px-4 py-2">{order.customer}</td>
                          <td className="px-4 py-2">${order.price}</td>
                          <td className="px-4 py-2">{order.date}</td>
                          <td
                            className={`px-4 py-2 font-semibold ${
                              order.status === "Completed"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {order.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Seller Settings</CardTitle>
                <CardDescription>Manage your shop preferences</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <AddProductForm
          onClose={() => setIsAddProductOpen(false)}
          onAddProduct={handleAddProduct}
        />
      )}

      {/* Add Poster Modal */}
      {isAddPosterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4">
            <h2 className="text-lg font-bold">Add Poster</h2>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePosterFilesChange}
              className="w-full border px-3 py-2 rounded"
            />
            <select
              value={posterCategory}
              onChange={(e) =>
                setPosterCategory(e.target.value as Poster["category"])
              }
              className="w-full border px-3 py-2 rounded"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="sale">Sale</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddPosterOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPosters}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
