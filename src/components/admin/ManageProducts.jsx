import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);

  // 🧠 Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin-products");
      setProducts(res.data.products || []); // ✅ extract only the array
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      toast({ title: "Failed to fetch products", variant: "destructive" });
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Approve product
  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin-products/${id}/approve`);
      toast({ title: "✅ Product approved" });
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast({ title: "Error approving product", variant: "destructive" });
    }
  };

  // ❌ Reject product
  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin-products/${id}/reject`);
      toast({ title: "❌ Product rejected" });
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast({ title: "Error rejecting product", variant: "destructive" });
    }
  };

  return (
    <section className="p-6">
      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle>Manage Seller Products</CardTitle>
        </CardHeader>

        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-500">No products available</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="border rounded-lg p-4 shadow-sm">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-600">{p.description}</p>
                  <p className="text-sm mt-1">
                    Seller: <strong>{p.seller_name || "Unknown"}</strong>
                  </p>
                  <p className="text-sm mt-1">
                    Price: <strong>${p.price}</strong>
                  </p>
                  <p
                    className={`text-sm font-medium mt-1 ${
                      p.status === "pending"
                        ? "text-yellow-600"
                        : p.status === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Status: {p.status}
                  </p>

                  {p.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => handleApprove(p.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(p.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default ManageProducts;
