import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleSave = () => {
    alert("Notification preferences saved!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-md border border-border">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Notification Settings</CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)}>← Back</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>SMS Notifications</Label>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
          <Button onClick={handleSave} className="w-full">Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
