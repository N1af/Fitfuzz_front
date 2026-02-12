import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Mail,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "@/context/AuthContext";

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const userId = user?.id;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Messages
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchUserData();
  }, [userId, navigate]);

  const fetchUserData = async () => {
    try {
      const res = await api.get(`/api/users/${userId}`);
      const userData = res.data.user;
      
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || ""
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setMessage({
        type: "error",
        text: "Failed to load user data. Please try again."
      });
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ---------------- PROFILE UPDATE ---------------- */
  const handleProfileUpdate = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setMessage({
        type: "error",
        text: "Name and email are required"
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const res = await api.put(`/api/users/${userId}/profile`, profileData);
      
      // Update auth context
      updateUser(res.data.user);
      
      setMessage({
        type: "success",
        text: "Profile updated successfully!"
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Profile update failed"
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PASSWORD UPDATE ---------------- */
  const handlePasswordUpdate = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({
        type: "error",
        text: "All password fields are required"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "New passwords do not match"
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters"
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      await api.put(`/api/users/${userId}/change-password`, {
        currentPassword,
        newPassword
      });

      setMessage({
        type: "success",
        text: "Password updated successfully!"
      });

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Password update failed"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-800"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
              <p className="text-gray-600">Manage your account information and security</p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-2 w-full max-w-md bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              <Lock className="w-4 h-4" />
              Password
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <Input
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      className="h-12 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email address"
                      className="h-12 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <Input
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                      className="h-12 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    <Input
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      placeholder="Enter your address"
                      className="h-12 rounded-lg"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PASSWORD TAB */}
          <TabsContent value="password">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Shield className="w-5 h-5" />
                  Security & Password
                </CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <Input
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      className="h-12 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <Input
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      className="h-12 rounded-lg"
                    />
                    <p className="text-xs text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      className="h-12 rounded-lg"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Should not match your current password</li>
                    <li>• Use a combination of letters and numbers</li>
                  </ul>
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg"
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Tips */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Security Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Strong Password</p>
                <p className="text-sm text-gray-600">Use a unique password for your account</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Regular Updates</p>
                <p className="text-sm text-gray-600">Change your password periodically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;