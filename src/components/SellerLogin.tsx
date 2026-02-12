// ...other imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "../api";

const SellerLogin = () => {
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { sellerLogin } = useAuth();

  const handleSellerLogin = async () => {
    if (!storeName || !email || !password) {
      alert("Please fill all fields before logging in.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/seller/login", {
        storeName,
        email,
        password,
      });

      const seller = res.data.seller;

      if (!seller || !seller.seller_id) {
        alert("Login failed: invalid seller data");
        setLoading(false);
        return;
      }

      // Store seller info in localStorage (optional for persistence)
      localStorage.setItem("seller_id", seller.seller_id.toString());
      localStorage.setItem("seller_name", seller.storeName);
      localStorage.setItem("seller_email", seller.email);

      // ✅ Update global state including seller_id
      sellerLogin({
        seller_id: seller.seller_id,   // <--- added seller_id
        email: seller.email,
        storeName: seller.storeName,
        role: "seller",
      });

      navigate("/seller-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-background min-h-screen flex items-center justify-center">
      <div className="container px-6 max-w-md">
        <Card className="shadow-2xl border border-border rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">
              Seller Login
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Access your seller dashboard and manage your store
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <Input type="text" placeholder="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Button
              onClick={handleSellerLogin}
              className="w-full text-lg py-5 rounded-xl font-semibold transition-all duration-200 bg-accent text-white hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login as Seller"}
            </Button>

            <p className="text-sm text-center text-muted-foreground mt-3">
              Don’t have a seller account?{" "}
              <span
                onClick={() => navigate("/seller-create")}
                className="text-accent font-medium hover:underline cursor-pointer"
              >
                Create one
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SellerLogin;
