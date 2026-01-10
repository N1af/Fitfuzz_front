import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Lock, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Naflan");
  const [email, setEmail] = useState("example@email.com");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex gap-2 border-b">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-1">
              <Lock className="w-4 h-4" /> Password
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>

                <Button className="mt-2">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <Button className="mt-2">Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={() =>
                      setNotifications((prev) => ({ ...prev, email: !prev.email }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={() =>
                      setNotifications((prev) => ({ ...prev, sms: !prev.sms }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={() =>
                      setNotifications((prev) => ({ ...prev, push: !prev.push }))
                    }
                  />
                </div>

                <Button className="mt-2">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountSettings;
