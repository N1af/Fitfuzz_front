import { useEffect, useState } from "react";
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
import { Ban, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import api from "../../api"; // because AddProductForm is in src/components/seller/


interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  orders: number;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🚫 Suspend / Reactivate user
  const handleSuspend = async (userId: number, name: string) => {
    try {
      const res = await api.patch(
        `/api/admin/users/${userId}/suspend`
      );
      toast.success(res.data.message);

      // 🔄 Update status in UI immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: res.data.user.status } : u
        )
      );
    } catch {
      toast.error(`Failed to update ${name}'s status`);
    }
  };

  // 🗑️ Delete user
  const handleDelete = async (userId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await api.delete(
        `/api/admin/users/${userId}`
      );
      toast.success(res.data.message);

      // Remove deleted user from UI
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      toast.error(`Failed to delete ${name}`);
    }
  };

  // 👁️ View user details (placeholder)
  const handleView = (userId: number) => {
    toast.info(`Viewing details for user ID: ${userId}`);
  };

  if (loading) return <p className="p-4 text-center">Loading users...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Accounts</CardTitle>
        <CardDescription>Manage customer accounts and activities</CardDescription>
      </CardHeader>

      <CardContent>
        {users.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No customers found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <Badge variant={user.role === "admin" ? "secondary" : "default"}>
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={user.status === "active" ? "outline" : "destructive"}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(user.joinDate).toLocaleDateString()}
                  </TableCell>

                  <TableCell>{user.orders}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(user.id)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSuspend(user.id, user.name)}
                        title={
                          user.status === "active"
                            ? "Suspend User"
                            : "Reactivate User"
                        }
                      >
                        <Ban className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id, user.name)}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageUsers;
