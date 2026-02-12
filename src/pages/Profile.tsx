import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit,
  LogOut,
  Package,
  Settings,
  Store,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    memberSince: new Date().getFullYear(),
  });

  // Fetch user info
  useEffect(() => {
    if (user) {
      fetchUser();
      fetchUserStats();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const res = await api.get(`/api/users/${user.id}`);
      setUserData(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch user statistics
      const ordersRes = await api.get(`/api/users/${user.id}/stats`);
      setStats(ordersRes.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  const data = userData || user;
  const memberSince = new Date(data?.created_at || Date.now()).getFullYear();

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with gradient */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl opacity-90"></div>
          <div className="relative py-8 px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              My Profile
            </h1>
            <p className="text-blue-100 text-lg">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="absolute -bottom-16 left-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-white to-gray-100 shadow-xl flex items-center justify-center">
                      {data?.name ? (
                        <span className="text-4xl font-bold text-gray-700">
                          {data.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-20 h-20 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-20 px-8 pb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {data?.name || data?.email?.split("@")[0]}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${data?.role === "seller" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {data?.role === "seller"
                          ? "🎯 Seller Account"
                          : "👤 Customer Account"}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate("/account-settings")}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="text-blue-600">
                      <ShoppingBag className="w-6 h-6 mb-2" />
                    </div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="text-green-600">
                      <TrendingUp className="w-6 h-6 mb-2" />
                    </div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-800">
                      LKR {Number(stats.totalSpent).toLocaleString("en-LK")}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div className="text-purple-600">
                      <Calendar className="w-6 h-6 mb-2" />
                    </div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {memberSince}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium text-gray-800">
                          {data?.email}
                        </p>
                      </div>
                    </div>
                    {data?.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium text-gray-800">
                            {data.phone}
                          </p>
                        </div>
                      </div>
                    )}
                    {data?.address && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl md:col-span-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-800">
                            {data.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Info Section */}
                {data?.role === "seller" && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Seller Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Your store details and statistics
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Store Name</p>
                        <p className="font-semibold text-gray-800">
                          {data.storeName}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Unique Code</p>
                        <p className="font-semibold text-gray-800 font-mono">
                          {data.uniqueCode}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Total Products</p>
                        <p className="font-semibold text-gray-800">
                          {data.totalProducts || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        Manage Store
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                        onClick={() => navigate("/seller/dashboard")}
                      >
                        View Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  onClick={() => navigate("/my-orders")}
                >
                  <Package className="w-5 h-5 mr-3" />
                  My Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  onClick={() => navigate("/account-settings")}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Account Settings
                </Button>
                {data?.role === "seller" && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                      onClick={() => navigate("/seller/products")}
                    >
                      <ShoppingBag className="w-5 h-5 mr-3" />
                      Manage Products
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                      onClick={() => navigate("/seller/orders")}
                    >
                      <Package className="w-5 h-5 mr-3" />
                      Seller Orders
                    </Button>
                  </>
                )}
                {data?.role !== "seller" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 text-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                    onClick={() => navigate("/seller-login")}
                  >
                    <Store className="w-5 h-5 mr-3" />
                    Become a Seller
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Completion */}
            {/* <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Profile Details</h3>
                  <p className="text-sm text-gray-500">Complete your profile</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-bold text-blue-600">75%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Basic Information ✓</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">Add Phone Number</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">Add Address</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => navigate("/account-settings")}
              >
                Complete Profile
              </Button>
            </div> */}

            {/* Logout Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Account Session
                  </h3>
                  <p className="text-sm text-gray-500">
                    Manage your login session
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout from Account
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="text-lg font-bold text-gray-800">{memberSince}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Successful Orders</p>
                <p className="text-lg font-bold text-gray-800">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="text-lg font-bold text-gray-800">
                  {data?.role === "seller" ? "Seller" : "Customer"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
