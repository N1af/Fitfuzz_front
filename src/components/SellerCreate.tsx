import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "@/components/ui/use-toast";

const CreateSellerAccount = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeDescription: "",
    storeAddress: "",
    phone: "",
    uniqueCode: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords do not match!", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/seller/register", form);
      toast({ title: "Seller Account Created Successfully!" });
      navigate("/seller-login");
    } catch (err) {
      console.error("Registration error:", err);
      alert("Server error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-background min-h-screen flex items-center justify-center">
      <div className="container px-6 max-w-3xl">
        <Card className="shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">
              Become a Fitfuzz Seller
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Create your seller account and start selling on Fitfuzz Marketplace
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <Input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                <Input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
              </div>

              <Input name="storeName" placeholder="Store Name" value={form.storeName} onChange={handleChange} required />
              <Textarea name="storeDescription" placeholder="Store Description" value={form.storeDescription} onChange={handleChange} />
              <Input name="storeAddress" placeholder="Store Address" value={form.storeAddress} onChange={handleChange} />
              <Input name="phone" type="tel" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange} />
              <Input name="uniqueCode" placeholder="Enter Seller Unique Code" value={form.uniqueCode} onChange={handleChange} required />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Register as Seller"}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-3">
                Already have a seller account?{" "}
                <span
                  onClick={() => navigate("/seller-login")}
                  className="text-accent font-medium hover:underline cursor-pointer"
                >
                  Login here
                </span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CreateSellerAccount;
