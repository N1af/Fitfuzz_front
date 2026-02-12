import { useEffect, useState } from "react";
import api from "../../api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Seller {
  seller_id: number;
  email: string;
}

interface SellerSettingsProps {
  sellerId: number | null;
}

const SellerSettings = ({ sellerId }: SellerSettingsProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ==========================
     Fetch Seller Email
  ========================== */
  useEffect(() => {
    if (!sellerId) return;

    const fetchSellerEmail = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/api/seller-details/${sellerId}`);
        setEmail(res.data.seller.email);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load email");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerEmail();
  }, [sellerId]);

  /* ==========================
     Forgot Password
  ========================== */
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Email not found");
      return;
    }

    try {
      await api.post("/api/seller-details/reset-password", { email });
      alert("Password reset link sent to your email.");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to send reset email.");
    }
  };

  if (!sellerId)
    return <p className="p-6 text-center text-red-600">Seller not found.</p>;

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  /* ==========================
     Render
  ========================== */
  return (
    <Card className="max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your login credentials</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input value={email} disabled className="mt-1 bg-gray-100" />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleForgotPassword}
        >
          Forgot Password
        </Button>
      </CardContent>
    </Card>
  );
};

export default SellerSettings;
