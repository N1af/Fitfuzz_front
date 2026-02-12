import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../../api"; //

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Order {
  id: number;
  productName: string;
  customer: string;
  price: string;
  date: string;
  status: string;
  total?: string;
  trackingId?: string;
  address?: string; 
  phone?: string; 
  color?: string;   
  size?: string; 
}

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");

  const billRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/seller-orders/order/${orderId}`);

        const o = res.data.order;

        const mappedOrder: Order = {
          id: o.order_item_id,
          productName: o.product_name,
          customer: o.customer_name ?? "Customer",
          price: o.item_price,
          date: new Date(o.created_at).toLocaleDateString(),
          status: o.item_status,
          total: o.order_total,
          trackingId: o.tracking_id,
          address: o.customer_address,
          phone: o.customer_phone,
          color: o.color_name,
          size: o.size_name,
        };

        setOrder(mappedOrder);
        setStatus(o.item_status);
      } catch (err) {
        console.error("❌ Error fetching order:", err);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      await api.put(`/api/seller-orders/${order.id}/status`, {
        status: newStatus,
      });

      setStatus(newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error("❌ Error updating status:", err);
    }
  };

  const handlePrintBill = () => {
    if (!billRef.current) return;
    const printContents = billRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p>Order not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-2xl space-y-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Button>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              <strong>Order Item ID:</strong> #{order.id}
            </p>
            <p>
              <strong>Product:</strong> {order.productName}
            </p>
            <p>
              <strong>Customer:</strong> {order.customer}
            </p>
            <p>
              <strong>Phone:</strong> {order.phone}
            </p>
            <p>
              <strong>Address:</strong> {order.address}
            </p>
            <p>
              <strong>Color:</strong> {order.color}
            </p>
            <p>
              <strong>Size:</strong> {order.size}
            </p>

            <p>
              <strong>Price:</strong> Rs. {Number(order.price).toLocaleString()}
            </p>
            <p>
              <strong>Date:</strong> {order.date}
            </p>
            <p>
              <strong>Tracking ID:</strong> {order.trackingId}
            </p>
            <p>
              <strong>Total Amount:</strong> Rs.{" "}
              {Number(order.total).toLocaleString()}
            </p>

            <div>
              <strong>Status:</strong>
              <div className="flex gap-2 mt-2 flex-wrap">
                {["Accepted", "Processing", "Shipped", "Delivered"].map((s) => (
                  <Button
                    key={s}
                    variant={status === s ? "default" : "outline"}
                    className={`text-sm ${
                      status === s ? "bg-primary text-white" : "text-gray-700"
                    }`}
                    onClick={() => handleStatusChange(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-2">
                Current status: <span className="font-semibold">{status}</span>
              </p>
            </div>

            {/* =========================
               🔹 Printable Bill
            ========================= */}
            <div className="mt-6">
              <Button className="bg-black text-white" onClick={handlePrintBill}>
                Download / Print Bill
              </Button>
            </div>

            <div
              ref={billRef}
              className="hidden bg-white p-6 border border-gray-200 mt-4"
            >
              <h2 className="text-2xl font-bold text-center mb-4">
                Order Invoice
              </h2>
              <p>
                <strong>Tracking ID:</strong> {order.trackingId}
              </p>
              <p>
                <strong>Customer:</strong> {order.customer}
              </p>
              <p>
                <strong>Phone:</strong> {order.phone}
              </p>
              <p>
                <strong>Address:</strong> {order.address}
              </p>
              <p>
                <strong>Date:</strong> {order.date}
              </p>
              <hr className="my-2" />
              <p>
                <strong>Product:</strong> {order.productName}
              </p>
              <p>
                <strong>Price:</strong> Rs.{" "}
                {Number(order.price).toLocaleString()}
              </p>
              <hr className="my-2" />
              <p className="text-lg font-semibold">
                Total Amount: Rs. {Number(order.total).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetails;
