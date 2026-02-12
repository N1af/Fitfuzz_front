import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Store, Package, DollarSign } from "lucide-react";
import api from "../api";

import ManageUsers from "@/components/admin/ManageUsers";
import ManageSellers from "@/components/admin/ManageSellers";

import SellerCodes from "@/components/admin/SellerCodes";
import ManageProducts from "@/components/admin/ManageProducts";
import Brand from "@/components/admin/Brand";
import Posters from "@/components/admin/Posters";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { title: "Total Users", value: "0", change: "+0%", icon: Users, color: "#3B82F6" },
    { title: "Active Sellers", value: "0", change: "+0%", icon: Store, color: "#16A34A" },
    { title: "Total Products", value: "0", change: "+0%", icon: Package, color: "#FBBF24" },
    { title: "Total Brands", value: "0", change: "+0%", icon: DollarSign, color: "#8B5CF6" },
  ]);

  // Fetch totals from backend
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const res = await api.get("/api/admin/totals");
        const data = res.data;

        setStats([
          { title: "Total Users", value: data.totalUsers, change: data.usersChange, icon: Users, color: "#3B82F6" },
          { title: "Active Sellers", value: data.totalSellers, change: data.sellersChange, icon: Store, color: "#16A34A" },
          { title: "Total Products", value: data.totalProducts, change: data.productsChange, icon: Package, color: "#FBBF24" },
          { title: "Total Brands", value: data.totalBrands, change: data.brandsChange, icon: DollarSign, color: "#8B5CF6" },
        ]);
      } catch (err) {
        console.error("Error fetching totals:", err);
      }
    };

    fetchTotals();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Platform overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm font-medium" style={{ color: stat.color }}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white border border-gray-200 rounded-md">
            
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sellers">Sellers</TabsTrigger>
            <TabsTrigger value="seller-codes">Seller Codes</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="posters">Posters</TabsTrigger>
          </TabsList>

         
          <TabsContent value="users"><ManageUsers /></TabsContent>
          <TabsContent value="sellers"><ManageSellers /></TabsContent>
          <TabsContent value="seller-codes"><SellerCodes /></TabsContent>
          <TabsContent value="products"><ManageProducts /></TabsContent>
          
          <TabsContent value="brands"><Brand /></TabsContent>
          <TabsContent value="posters"><Posters /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
