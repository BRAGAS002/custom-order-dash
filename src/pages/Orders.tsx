import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle2, Truck } from "lucide-react";
import { Link } from "react-router-dom";

// Mock order data
const mockOrders = [
  {
    id: 1,
    enterpriseName: "Bella Italia Pizzeria",
    orderDate: "2025-01-15 14:30",
    totalAmount: 32.47,
    currentStatus: "In Progress",
    items: [
      { name: "Margherita Pizza", quantity: 2, subtotal: 29.98 },
    ],
    statusHistory: [
      { status: "Order Placed", timestamp: "2025-01-15 14:30" },
      { status: "Payment Confirmed", timestamp: "2025-01-15 14:31" },
      { status: "Kitchen Started", timestamp: "2025-01-15 14:35" },
    ],
  },
  {
    id: 2,
    enterpriseName: "Fresh Bites Cafe",
    orderDate: "2025-01-14 12:15",
    totalAmount: 18.50,
    currentStatus: "Complete",
    items: [
      { name: "Avocado Toast", quantity: 1, subtotal: 12.00 },
      { name: "Latte", quantity: 1, subtotal: 6.50 },
    ],
    statusHistory: [
      { status: "Order Placed", timestamp: "2025-01-14 12:15" },
      { status: "Preparing", timestamp: "2025-01-14 12:20" },
      { status: "Ready for Pickup", timestamp: "2025-01-14 12:35" },
      { status: "Complete", timestamp: "2025-01-14 12:45" },
    ],
  },
];

const statusConfig = {
  "Pending": { icon: Clock, color: "bg-warning/10 text-warning" },
  "In Progress": { icon: Package, color: "bg-primary/10 text-primary" },
  "Shipped": { icon: Truck, color: "bg-accent/10 text-accent" },
  "Complete": { icon: CheckCircle2, color: "bg-success/10 text-success" },
};

export default function Orders() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your order history</p>
        </div>

        <div className="space-y-6">
          {mockOrders.map((order) => {
            const StatusIcon = statusConfig[order.currentStatus as keyof typeof statusConfig]?.icon || Package;
            const statusColor = statusConfig[order.currentStatus as keyof typeof statusConfig]?.color || "";

            return (
              <Card key={order.id} className="shadow-card hover:shadow-card-hover transition-smooth">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl mb-2">{order.enterpriseName}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Order #{order.id}</span>
                        <span>{order.orderDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusColor}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="font-medium">{order.currentStatus}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Order Progress</h4>
                    <div className="space-y-3">
                      {order.statusHistory.map((status, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mt-1">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{status.status}</div>
                            <div className="text-sm text-muted-foreground">{status.timestamp}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="default" asChild>
                      <Link to={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                    {order.currentStatus === "Complete" && (
                      <Button variant="outline">Reorder</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {mockOrders.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start browsing businesses to place your first order</p>
              <Button variant="hero" asChild>
                <Link to="/enterprises">Browse Businesses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
