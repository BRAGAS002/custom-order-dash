import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Store, 
  Package, 
  TrendingUp, 
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  QrCode
} from "lucide-react";
import QRCode from "react-qr-code";

// Mock data for admin dashboard
const systemStats = {
  totalShops: 25,
  activeShops: 23,
  totalOrders: 10234,
  monthlyRevenue: 485000,
  activeUsers: 1547,
  pendingOrders: 42
};

const recentShops = [
  { id: 1, name: "Baguio Print Express", status: "active", orders: 1250, revenue: 125000 },
  { id: 2, name: "City Printing Services", status: "active", orders: 980, revenue: 98000 },
  { id: 3, name: "FastPrint Baguio", status: "active", orders: 750, revenue: 75000 },
  { id: 4, name: "Premium Print Solutions", status: "pending", orders: 0, revenue: 0 },
];

const recentOrders = [
  { id: 1, orderNumber: "ORD-2025-0001", shop: "Baguio Print Express", customer: "Juan Cruz", amount: 850, status: "In Progress" },
  { id: 2, orderNumber: "ORD-2025-0002", shop: "City Printing Services", customer: "Maria Santos", amount: 2500, status: "Complete" },
  { id: 3, orderNumber: "ORD-2025-0003", shop: "FastPrint Baguio", customer: "Pedro Reyes", amount: 1200, status: "Pending" },
  { id: 4, orderNumber: "ORD-2025-0004", shop: "Premium Print Solutions", customer: "Ana Garcia", amount: 650, status: "In Progress" },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalShops}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.activeShops} active
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{systemStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-success flex items-center gap-1">
                <Activity className="h-3 w-3" />
                +8.2% this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="shops" className="space-y-4">
          <TabsList>
            <TabsTrigger value="shops">Printing Shops</TabsTrigger>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="shops">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Printing Shops Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentShops.map((shop) => (
                    <div key={shop.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-smooth">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{shop.name}</h4>
                          {shop.status === "active" ? (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{shop.orders} orders</span>
                          <span>₱{shop.revenue.toLocaleString()} revenue</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-smooth">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{order.orderNumber}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{order.shop}</span>
                          <span>•</span>
                          <span>{order.customer}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">₱{order.amount}</div>
                          <Badge variant={order.status === "Complete" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <QrCode className="h-4 w-4 mr-2" />
                              QR Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Order QR Code - {order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 py-4">
                              <div className="bg-white p-4 rounded-lg">
                                <QRCode 
                                  value={JSON.stringify({
                                    orderNumber: order.orderNumber,
                                    id: order.id,
                                    shop: order.shop,
                                    customer: order.customer,
                                    amount: order.amount,
                                    status: order.status
                                  })}
                                  size={200}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground text-center">
                                Scan this QR code for order verification and tracking
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Top Performing Shops</h4>
                    <div className="space-y-2">
                      {recentShops.slice(0, 3).map((shop, index) => (
                        <div key={shop.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{shop.name}</div>
                            <div className="text-sm text-muted-foreground">₱{shop.revenue.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">AI Feature Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AI Design Tool</span>
                        <Badge>2,341 uses</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Smart Chatbot</span>
                        <Badge>5,892 conversations</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
