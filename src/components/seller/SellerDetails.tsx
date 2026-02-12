import { useEffect, useState, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import api from "../../api";
import { Badge } from "@/components/ui/badge";

interface Seller {
  seller_id: number;
  full_name: string;
  store_name: string;
  email: string;
  phone: string;
  store_address: string;
  created_at: string;
  verified: boolean;
  status: string;
  profile_image?: string;
}

interface SellerDetailsProps {
  sellerId: number | null;
}

const SellerDetails = ({ sellerId }: SellerDetailsProps) => {
  const [sellerDetails, setSellerDetails] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    store_address: "",
    store_name: "",
  });

  useEffect(() => {
    if (!sellerId) return;

    let isMounted = true;

    const fetchSellerDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/api/seller-details/${sellerId}`);
        if (isMounted) {
          setSellerDetails(res.data.seller);
          setFormData({
            full_name: res.data.seller.full_name,
            phone: res.data.seller.phone,
            store_address: res.data.seller.store_address,
            store_name: res.data.seller.store_name,
          });
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("❌ Error fetching seller details:", err);
          setError(err?.response?.data?.message || "Failed to fetch seller details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSellerDetails();

    return () => {
      isMounted = false;
    };
  }, [sellerId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!sellerId) return;
    try {
      const res = await api.put(`/api/seller-details/${sellerId}`, formData);
      setSellerDetails(res.data.seller);
      setEditing(false);
      alert("Seller details updated successfully!");
    } catch (err: any) {
      console.error("❌ Error updating seller details:", err);
      alert("Failed to update seller details.");
    }
  };

  if (!sellerId) return <p className="p-6 text-center text-red-600 font-semibold">Seller ID not found.</p>;
  if (loading) return <p className="p-6 text-center text-gray-600 font-semibold">Loading seller details...</p>;
  if (error) return <p className="p-6 text-center text-red-600 font-semibold">{error}</p>;
  if (!sellerDetails) return <p className="p-6 text-center text-red-600 font-semibold">Seller details not found.</p>;

  const seller = sellerDetails;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <Card className="shadow-xl border border-gray-200 rounded-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <Avatar className="w-24 h-24 rounded-full shadow-md">
                  {seller.profile_image ? (
                    <AvatarImage src={seller.profile_image} alt={seller.full_name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-white text-3xl">
                      {seller.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="space-y-1">
                  {editing ? (
                    <>
                      <input
                        type="text"
                        name="store_name"
                        value={formData.store_name}
                        onChange={handleInputChange}
                        className="border px-2 py-1 rounded-md w-full"
                        placeholder="Store Name"
                      />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="border px-2 py-1 rounded-md w-full"
                        placeholder="Full Name"
                      />
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-2xl font-bold text-gray-900">{seller.store_name}</CardTitle>
                      <CardDescription className="text-gray-600">{seller.full_name}</CardDescription>
                    </>
                  )}

                  <div className="flex gap-2 mt-1">
                    {seller.verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                    <Badge className="bg-blue-100 text-blue-800 capitalize">{seller.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 md:gap-4">
                {editing ? (
                  <Button className="bg-green-600 text-white px-6 py-2 rounded-lg" onClick={handleSave}>
                    Save
                  </Button>
                ) : (
                  <Button className="bg-primary text-white hover:bg-primary/90 transition-all px-6 py-2 rounded-lg" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
            <div className="space-y-2">
              {editing ? (
                <>
                  <input
                    type="text"
                    name="email"
                    value={formData.email || seller.email}
                    disabled
                    className="border px-2 py-1 rounded-md w-full bg-gray-100 cursor-not-allowed"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border px-2 py-1 rounded-md w-full"
                    placeholder="Phone Number"
                  />
                  <input
                    type="text"
                    name="store_address"
                    value={formData.store_address}
                    onChange={handleInputChange}
                    className="border px-2 py-1 rounded-md w-full"
                    placeholder="Store Address"
                  />
                </>
              ) : (
                <>
                  <p><span className="font-semibold">Email:</span> {seller.email}</p>
                  <p><span className="font-semibold">Phone:</span> {seller.phone}</p>
                  <p><span className="font-semibold">Store Address:</span> {seller.store_address}</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <p>
                <span className="font-semibold">Member Since:</span>{" "}
                {new Date(seller.created_at).toLocaleDateString()}
              </p>
              <p><span className="font-semibold">Seller ID:</span> {seller.seller_id}</p>
              <p><span className="font-semibold">Store Status:</span> {seller.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDetails;
