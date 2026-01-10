import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin-dashboard");
      else navigate("/profile");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
  if (!email || !password) {
    alert("Please enter your email and password");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Invalid email or password");
      return;
    }

    // ✅ SAVE USER ID (THIS FIXES YOUR BUG)
    localStorage.setItem("userId", String(data.user.id));
    localStorage.setItem("role", data.user.role);

    // ✅ Save to AuthContext
    login(data.user);

    // ✅ Redirect
    if (data.user.role === "admin") navigate("/admin-dashboard");
    else navigate("/profile");

  } catch (err) {
    console.error("Login error:", err);
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
              Login to Your Account
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Access your dashboard and manage your account
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
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
                onClick={handleLogin}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <p className="text-sm text-center text-muted-foreground mt-3">
                Don’t have an account?{" "}
                <span
                  onClick={() => navigate("/create-account")}
                  className="text-accent font-medium hover:underline cursor-pointer"
                >
                  Create one
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LoginPage;
