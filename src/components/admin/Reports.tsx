import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Reports = () => {
  // Mock data for charts
  const revenueData = [
    { month: "Jan", platform: 4500, sellers: 35500 },
    { month: "Feb", platform: 3800, sellers: 30200 },
    { month: "Mar", platform: 5200, sellers: 41800 },
    { month: "Apr", platform: 4800, sellers: 38200 },
    { month: "May", platform: 6300, sellers: 50700 },
    { month: "Jun", platform: 7200, sellers: 57800 },
  ];

  const categoryData = [
    { name: "Casual", value: 35 },
    { name: "Evening", value: 28 },
    { name: "Party", value: 22 },
    { name: "Wedding", value: 15 },
  ];

  const COLORS = [
    "hsl(var(--stat-card-blue))",
    "hsl(var(--stat-card-purple))",
    "hsl(var(--stat-card-orange))",
    "hsl(var(--stat-card-green))",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Platform Revenue */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Platform commission vs seller earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar dataKey="platform" fill="hsl(var(--primary))" name="Platform Commission" radius={[8, 8, 0, 0]} />
              <Bar dataKey="sellers" fill="hsl(var(--stat-card-green))" name="Seller Earnings" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
          <CardDescription>Monthly sales growth</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sellers" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>Distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;