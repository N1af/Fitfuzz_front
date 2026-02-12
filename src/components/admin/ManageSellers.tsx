import { useEffect, useState } from "react";
import api from "../../api"; // because AddProductForm is in src/components/seller/

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ban, Trash2, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Seller {
  id: number;
  name: string;
  email: string;
  phone?: string;
  store_name?: string;
  verified?: boolean;
  status?: string;
  products?: number;
  total_sales?: number;
  joinDate?: string;
}

const ManageSellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const navigate = useNavigate();
  const API_URL = "/api/admin-sellers";

  // Fetch all sellers
  const fetchSellers = async () => {
    try {
      const res = await api.get(API_URL);
      setSellers(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("❌ Failed to fetch sellers");
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Handle verify
  const handleVerify = async (id: number, name: string) => {
    try {
      await api.put(`${API_URL}/${id}/verify`);
      toast.success(`✅ Seller ${name} verified successfully`);
      fetchSellers();
    } catch {
      toast.error("❌ Failed to verify seller");
    }
  };

  // Handle suspend/unsuspend
  const handleSuspend = async (id: number, name: string) => {
    try {
      await api.put(`${API_URL}/${id}/suspend`);
      toast.warning(`⚠️ Seller ${name} status updated`);
      fetchSellers();
    } catch {
      toast.error("❌ Failed to update seller status");
    }
  };

  // Handle delete
  const handleDelete = async (id: number, name: string) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      toast.success(`🗑️ Seller ${name} deleted`);
      fetchSellers();
    } catch {
      toast.error("❌ Failed to delete seller");
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Seller Accounts</CardTitle>
        <CardDescription>
          Manage and monitor all registered sellers
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sellers.length > 0 ? (
                sellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {seller.name}
                        {seller.verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{seller.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          seller.status === "active"
                            ? "default"
                            : seller.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {seller.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{seller.products ?? 0}</TableCell>
                    <TableCell>{`$${seller.total_sales ?? 0}`}</TableCell>
                    <TableCell>
                      {seller.joinDate
                        ? new Date(seller.joinDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/admin-seller-details/${seller.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {!seller.verified && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleVerify(seller.id, seller.name)
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleSuspend(seller.id, seller.name)
                          }
                        >
                          <Ban className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(seller.id, seller.name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-6"
                  >
                    No sellers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageSellers;
