import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Truck,
  Clock,
  CheckCircle,
  MapPin,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ================= TYPES ================= */

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  status: string;
  seller_name: string;
  image_url?: string;
}

interface Order {
  order_id: number;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
  tracking_id: string;
  delivery: {
    province: string;
    district: string;
    village: string;
    phone: string;
    delivery_charge: number;
  };
  items: OrderItem[];
}

/* ================= COMPONENT ================= */

export default function MyOrders() {
  const userId = localStorage.getItem("userId");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders/my-orders/${userId}`
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error("❌ Fetch orders failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  /* ================= SEARCH ================= */

  const filteredOrders = orders.filter((order) =>
    search.trim() === ""
      ? true
      : order.items.some((item) =>
          item.product_id.toString().includes(search)
        )
  );

  /* ================= STATUS ICON ================= */

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "processing":
        return <Clock className="text-yellow-500 w-4 h-4" />;
      case "accepted":
      case "shipped":
        return <Truck className="text-blue-500 w-4 h-4" />;
      case "delivered":
      case "completed":
        return <CheckCircle className="text-green-600 w-4 h-4" />;
      default:
        return null;
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">My Orders</h1>
          <div className="flex items-center gap-2 mt-3 md:mt-0">
            <Input
              placeholder="Search by Product ID..."
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </Card>
          ))
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const previewImage =
              order.items[0]?.image_url ||
              "https://via.placeholder.com/100";

            return (
              <Card
                key={order.order_id}
                className="flex flex-col md:flex-row items-center gap-4 p-4 hover:shadow-lg transition"
              >
                {/* IMAGE */}
                <img
                  src={previewImage}
                  alt="Product"
                  className="w-24 h-24 object-cover rounded border"
                />

                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h2 className="font-semibold text-lg">
                    Order #{order.order_id}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-medium text-gray-800">
                    Rs. {order.total}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {getStatusIcon(order.status)}
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                </div>

                <Button
                  className="w-full md:w-auto"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </Button>
              </Card>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-10">
            No orders found.
          </p>
        )}
      </div>

      {/* ================= ORDER DETAILS DIALOG ================= */}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Items */}
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="border rounded p-3 space-y-1">
                  <p className="font-medium">
                    Product ID: {item.product_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Seller: {item.seller_name || "N/A"}
                  </p>
                  <p className="text-sm">
                    Rs. {item.price} × {item.quantity}
                  </p>
                  <Badge variant="secondary">{item.status}</Badge>
                </div>
              ))}

              {/* Meta */}
              <div className="border-t pt-3 text-sm space-y-2">
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Ordered:{" "}
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Tracking ID: {selectedOrder.tracking_id || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedOrder.delivery.village},{" "}
                  {selectedOrder.delivery.district},{" "}
                  {selectedOrder.delivery.province}
                </p>
                <p className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment: {selectedOrder.payment_method}
                </p>
                <p className="text-gray-500">
                  Phone: {selectedOrder.delivery.phone} | Delivery: Rs.{" "}
                  {selectedOrder.delivery.delivery_charge}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
