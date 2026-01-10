import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSettings = () => {
  const navigate = useNavigate();
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  const handleSave = () => {
    alert("Payment settings saved successfully!");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-md border border-border">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Payment Settings</CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)}>← Back</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Account Holder Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          <Input
            placeholder="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <Input
            placeholder="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <Button onClick={handleSave} className="w-full">Save Payment Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
