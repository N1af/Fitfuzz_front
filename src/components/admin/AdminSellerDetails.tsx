import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AdminSellerDetails = () => {
  const { sellerId } = useParams();

  // Mock data (replace with backend fetch later)
  const seller = {
    id: sellerId,
    name: "Fashion Store",
    email: "fashion@store.com",
    phone: "+94 77 123 4567",
    accountNumber: "1234567890",
    address: "No. 21, Main Street, Kandy, Sri Lanka",
    joinDate: "2024-01-10",
    verified: true,
    status: "active",
    banner: "/assets/sellers/fashion-banner.jpg",
    products: [
      { id: 1, name: "Men’s Shirt", price: "$25", stock: 20 },
      { id: 2, name: "Women’s Dress", price: "$45", stock: 10 },
    ],
    orders: [
      { id: 101, customer: "Ali", total: "$50", date: "2025-01-21", status: "Completed" },
      { id: 102, customer: "Sami", total: "$30", date: "2025-02-10", status: "Pending" },
    ],
    customers: [
      { id: 1, name: "Ali", email: "ali@gmail.com" },
      { id: 2, name: "Sami", email: "sami@gmail.com" },
    ],
  };

  const handleSuspend = () => toast.error(`Seller ${seller.name} suspended`);
  const handleVerify = () => toast.success(`Seller ${seller.name} verified`);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">{seller.name}</CardTitle>
              <CardDescription>{seller.email}</CardDescription>
            </div>
            <div className="flex gap-2 mt-3 md:mt-0">
              <Badge variant={seller.verified ? "default" : "secondary"}>
                {seller.verified ? "Verified" : "Pending"}
              </Badge>
              <Badge variant={seller.status === "active" ? "default" : "destructive"}>
                {seller.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <p><strong>Phone:</strong> {seller.phone}</p>
            <p><strong>Account Number:</strong> {seller.accountNumber}</p>
            <p><strong>Address:</strong> {seller.address}</p>
            <p><strong>Join Date:</strong> {seller.joinDate}</p>

            <div className="flex gap-3">
              <Button onClick={handleVerify}>Verify Seller</Button>
              <Button variant="destructive" onClick={handleSuspend}>
                Suspend Seller
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seller Banner */}
        {seller.banner && (
          <Card>
            <CardHeader>
              <CardTitle>Seller Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={seller.banner}
                alt="Seller banner"
                className="w-full h-48 object-cover rounded-lg border"
              />
            </CardContent>
          </Card>
        )}

        {/* Tabs for Products, Orders, Customers */}
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                {seller.products.map((p) => (
                  <div key={p.id} className="flex justify-between border-b py-2">
                    <span>{p.name}</span>
                    <span>{p.price}</span>
                    <span>Stock: {p.stock}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {seller.orders.map((o) => (
                  <div key={o.id} className="flex justify-between border-b py-2">
                    <span>#{o.id}</span>
                    <span>{o.customer}</span>
                    <span>{o.total}</span>
                    <span>{o.status}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
              </CardHeader>
              <CardContent>
                {seller.customers.map((c) => (
                  <div key={c.id} className="flex justify-between border-b py-2">
                    <span>{c.name}</span>
                    <span>{c.email}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSellerDetails;
