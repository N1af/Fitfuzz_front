import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const StoreInfo = () => {
  const navigate = useNavigate();

  return (
    <section className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Store Name" />
          <Input placeholder="Store Address" />
          <Input placeholder="Contact Number" />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => navigate("/seller-dashboard")}>
              ← Back
            </Button>
            <Button className="bg-primary text-white">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default StoreInfo;
