import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle2, Truck, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";

// Mock order data for print jobs
const mockOrders = [
  {
    orderNumber: "ORD-2025-0001",
    id: 1,
    enterpriseName: "Baguio Print Express",
    orderDate: "2025-01-15 14:30",
    totalAmount: 850.00,
    currentStatus: "In Progress",
    items: [
      { name: "Business Cards (500pcs) - Premium 350gsm, Glossy", quantity: 1, subtotal: 850.00 },
    ],
    statusHistory: [
      { status: "Order Placed", timestamp: "2025-01-15 14:30" },
      { status: "Payment Confirmed", timestamp: "2025-01-15 14:31" },
      { status: "Design Review", timestamp: "2025-01-15 14:45" },
      { status: "Printing Started", timestamp: "2025-01-15 15:00" },
    ],
  },
  {
    orderNumber: "ORD-2025-0002",
    id: 2,
    enterpriseName: "City Printing Services",
    orderDate: "2025-01-14 10:15",
    totalAmount: 2500.00,
    currentStatus: "Complete",
    items: [
      { name: "Tarpaulin Banner (6x4ft) - Full Color", quantity: 2, subtotal: 2000.00 },
      { name: "Flyers (A5, 1000pcs)", quantity: 1, subtotal: 500.00 },
    ],
    statusHistory: [
      { status: "Order Placed", timestamp: "2025-01-14 10:15" },
      { status: "Design Approved", timestamp: "2025-01-14 10:30" },
      { status: "Printing Complete", timestamp: "2025-01-14 14:00" },
      { status: "Ready for Pickup", timestamp: "2025-01-14 15:30" },
      { status: "Complete", timestamp: "2025-01-14 16:45" },
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
          <h1 className="mb-2">My Print Jobs</h1>
          <p className="text-muted-foreground">Track your printing orders with real-time status updates</p>
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

                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      Order QR Code
                    </h4>
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <QRCode 
                        value={JSON.stringify({
                          orderNumber: order.orderNumber,
                          id: order.id,
                          enterpriseName: order.enterpriseName,
                          totalAmount: order.totalAmount,
                          status: order.currentStatus
                        })}
                        size={128}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Scan this QR code for quick order verification
                    </p>
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
              <h3 className="text-xl font-bold mb-2">No print jobs yet</h3>
              <p className="text-muted-foreground mb-6">Start browsing printing shops to place your first order</p>
              <Button variant="hero" asChild>
                <Link to="/enterprises">Browse Printing Shops</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
