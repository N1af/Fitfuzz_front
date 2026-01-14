import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import api from "../../api"; // because AddProductForm is in src/components/seller/

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

  useEffect(() => {
    if (!sellerId) return; // Only fetch if sellerId exists

    let isMounted = true; // prevent state update if component unmounts

    const fetchSellerDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/api/seller/${sellerId}`);
        if (isMounted) {
          setSellerDetails(res.data.seller);
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
      isMounted = false; // cleanup to prevent memory leaks
    };
  }, [sellerId]);

  if (!sellerId) return <p className="p-6 text-center text-red-600 font-semibold">Seller ID not found.</p>;
  if (loading) return <p className="p-6 text-center text-gray-600 font-semibold">Loading seller details...</p>;
  if (error) return <p className="p-6 text-center text-red-600 font-semibold">{error}</p>;
  if (!sellerDetails) return <p className="p-6 text-center text-red-600 font-semibold">Seller details not found.</p>;

  const seller = sellerDetails;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Seller Profile</h1>

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
                  <CardTitle className="text-2xl font-bold text-gray-900">{seller.store_name}</CardTitle>
                  <CardDescription className="text-gray-600">{seller.full_name}</CardDescription>
                  <div className="flex gap-2 mt-1">
                    {seller.verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                    <Badge className="bg-blue-100 text-blue-800 capitalize">{seller.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 md:gap-4">
                <Button className="bg-primary text-white hover:bg-primary/90 transition-all px-6 py-2 rounded-lg">
                  Edit Profile
                </Button>
                <Button variant="outline" className="px-6 py-2 rounded-lg hover:bg-gray-100">
                  Message
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p><span className="font-semibold">Email:</span> {seller.email}</p>
              <p><span className="font-semibold">Phone:</span> {seller.phone}</p>
              <p><span className="font-semibold">Store Address:</span> {seller.store_address}</p>
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
