import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CreateAccountPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create account");
        setLoading(false);
        return;
      }

      alert("Account created successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      alert("Server error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-background min-h-screen flex items-center justify-center">
      <div className="container px-6 max-w-md">
        <Card className="shadow-xl border border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Create Your Account
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Join Fitfuzz and start shopping today!
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3"
            />

            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3"
            />

            <Button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-sm text-center text-muted-foreground mt-3">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-accent font-medium hover:underline cursor-pointer"
              >
                Login
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CreateAccountPage;
