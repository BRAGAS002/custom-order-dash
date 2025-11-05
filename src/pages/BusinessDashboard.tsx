import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Package, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Settings,
  QrCode
} from "lucide-react";
import QRCode from "react-qr-code";

// Mock data for business dashboard
const businessStats = {
  shopName: "Baguio Print Express",
  todayOrders: 12,
  pendingOrders: 5,
  completedOrders: 7,
  todayRevenue: 8500,
  monthlyRevenue: 125000
};

const recentOrders = [
  { 
    id: 1,
    orderNumber: "ORD-2025-0001",
    customer: "Juan Cruz", 
    product: "Business Cards (500pcs)", 
    amount: 850, 
    status: "In Progress",
    date: "2025-01-15 14:30"
  },
  { 
    id: 2,
    orderNumber: "ORD-2025-0002",
    customer: "Maria Santos", 
    product: "Tarpaulin Banner (6x4ft)", 
    amount: 2000, 
    status: "Pending",
    date: "2025-01-15 13:15"
  },
  { 
    id: 3,
    orderNumber: "ORD-2025-0003",
    customer: "Pedro Reyes", 
    product: "Flyers (A5, 1000pcs)", 
    amount: 650, 
    status: "Complete",
    date: "2025-01-15 10:45"
  },
  { 
    id: 4,
    orderNumber: "ORD-2025-0004",
    customer: "Ana Garcia", 
    product: "Brochures (A4, 500pcs)", 
    amount: 1200, 
    status: "In Progress",
    date: "2025-01-15 09:30"
  },
];

const products = [
  { id: 1, name: "Business Cards", basePrice: 500, orders: 245, isAvailable: true },
  { id: 2, name: "Tarpaulin Banners", basePrice: 1000, orders: 189, isAvailable: true },
  { id: 3, name: "Flyers", basePrice: 450, orders: 312, isAvailable: true },
  { id: 4, name: "Brochures", basePrice: 800, orders: 156, isAvailable: false },
];

const statusConfig = {
  "Pending": { icon: Clock, variant: "secondary" as const },
  "In Progress": { icon: Package, variant: "default" as const },
  "Complete": { icon: CheckCircle2, variant: "default" as const },
};

export default function BusinessDashboard() {
  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    console.log(`Updating order ${orderId} to ${newStatus}`);
    // Will be implemented with database
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2">{businessStats.shopName}</h1>
          <p className="text-muted-foreground">Business Dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businessStats.todayOrders}</div>
              <p className="text-xs text-muted-foreground">
                {businessStats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{businessStats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                58% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{businessStats.todayRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Average: ₱{Math.round(businessStats.todayRevenue / businessStats.todayOrders)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{businessStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-success">
                +15.2% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Pending ({businessStats.pendingOrders})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => {
                    const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || AlertCircle;
                    const statusVariant = statusConfig[order.status as keyof typeof statusConfig]?.variant || "secondary";
                    
                    return (
                      <div key={order.id} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-smooth">
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{order.orderNumber}</h4>
                              <Badge variant={statusVariant}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{order.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">₱{order.amount}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Customer: </span>
                            <span className="font-medium">{order.customer}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Product: </span>
                            <span>{order.product}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
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
                                      customer: order.customer,
                                      product: order.product,
                                      amount: order.amount,
                                      status: order.status,
                                      date: order.date
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
                          <Button variant="default" size="sm">
                            View Details
                          </Button>
                          {order.status !== "Complete" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, "In Progress")}
                            >
                              Update Status
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Products</CardTitle>
                  <Button variant="default" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-smooth">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{product.name}</h4>
                          {product.isAvailable ? (
                            <Badge variant="default">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Base Price: ₱{product.basePrice}</span>
                          <span>•</span>
                          <span>{product.orders} total orders</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Shop Information
                    </h4>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">Shop Name</label>
                          <div className="text-sm text-muted-foreground mt-1">{businessStats.shopName}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <div className="text-sm text-muted-foreground mt-1">Digital Printing</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Address</label>
                          <div className="text-sm text-muted-foreground mt-1">Session Road, Baguio City</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Contact Email</label>
                          <div className="text-sm text-muted-foreground mt-1">contact@printexpress.com</div>
                        </div>
                      </div>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Information
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h4 className="font-semibold mb-4">Order Notifications</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Email notifications for new orders
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        SMS alerts for urgent orders
                      </label>
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
