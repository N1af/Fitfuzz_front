import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ShippingSettings = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const handleSave = () => {
    alert("Shipping settings saved!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-md border border-border">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Shipping Settings</CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)}>← Back</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Full Shipping Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <Button onClick={handleSave} className="w-full">Save Shipping Details</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingSettings;
