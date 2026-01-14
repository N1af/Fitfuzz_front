import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "../../api"; // because AddProductForm is in src/components/seller/


const SellerCodes = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🧩 Fetch codes on load
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await api.get("/api/seller-codes");
        setCodes(res.data);
      } catch (error) {
        console.error("❌ Error fetching codes:", error);
      }
    };
    fetchCodes();
  }, []);

  // 🧠 Generate and save code
  const generateCode = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/seller-codes/generate");
      setCodes([res.data, ...codes]);
    } catch (error) {
      console.error("❌ Error generating code:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Seller Code Generator</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={generateCode} disabled={loading}>
            {loading ? "Generating..." : "Generate New Code"}
          </Button>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mt-4 mb-2">
            Generated Codes:
          </h3>
          {codes.length > 0 ? (
            <ul className="list-disc list-inside text-gray-600">
              {codes.map((code) => (
                <li key={code.id}>
                  {code.code}{" "}
                  {code.used ? (
                    <span className="text-red-500">(Used)</span>
                  ) : (
                    <span className="text-green-500">(Available)</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No codes generated yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerCodes;
