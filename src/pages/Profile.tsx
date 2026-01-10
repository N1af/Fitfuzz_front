import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Edit, LogOut, Package, Settings, Heart } from "lucide-react";


const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-32 w-full"></div>
          
          <div className="relative -mt-16 flex flex-col items-center text-center px-6 pb-6">
            {/* Avatar */}
            <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center border-4 border-white shadow-md text-4xl font-bold text-gray-700">
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-16 h-16" />}
            </div>

            {/* Name & Type */}
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">{user.name || user.email.split("@")[0]}</h2>
            <p className="text-sm text-gray-500">{user.type === "seller" ? "Seller Account" : "Customer Account"}</p>

            {/* Stats */}
            <div className="flex mt-6 gap-6 text-center">
              <div>
                <p className="text-lg font-bold text-gray-800">{user.totalOrders || 0}</p>
                <p className="text-xs text-gray-400">Orders</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{user.totalSpent ? `$${user.totalSpent}` : "$0"}</p>
                <p className="text-xs text-gray-400">Spent</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{user.wishlistCount || 0}</p>
                <p className="text-xs text-gray-400">Wishlist</p>
              </div>
            </div>

            {/* Seller Info */}
            {user.type === "seller" && (
              <div className="bg-purple-50 mt-6 p-4 rounded-xl w-full text-left shadow-sm">
                <p><strong>Store Name:</strong> {user.storeName || "Demo Store"}</p>
                <p><strong>Unique Code:</strong> {user.uniqueCode || "Demo123"}</p>
                <p><strong>Total Products:</strong> {user.totalProducts || 0}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-gray-50 mt-6 p-4 rounded-xl w-full text-left shadow-sm space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "Not Provided"}</p>
              <p><strong>Address:</strong> {user.address || "Not Provided"}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="secondary"
                className="flex items-center gap-2 hover:scale-105 transition-transform"
                onClick={() => navigate("/my-orders")}
              >
                <Package className="w-4 h-6" /> My Orders
              </Button>

             

              <Button
                variant="secondary"
                className="flex items-center gap-2 hover:scale-105 transition-transform"
                onClick={() => navigate("/account-settings")}
              >
                <Settings className="w-4 h-4" /> Account Settings
              </Button>

              <Button
                variant="destructive"
                className="flex items-center gap-2 hover:scale-105 transition-transform"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>

            {/* Edit Profile Link */}
            <p className="text-xs text-gray-400 mt-4">
              Want to update your profile?{" "}
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => navigate("/account-settings")}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit Profile
              </Button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
