import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, MapPin, CreditCard, Calendar } from "lucide-react";
import QRCode from "react-qr-code";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Mock order data - replace with actual data fetch
  const order = {
    id: orderId,
    orderNumber: `ORD-${orderId?.padStart(6, '0')}`,
    status: "processing",
    date: "2024-03-15",
    total: 1250.00,
    items: [
      {
        id: "1",
        name: "Business Cards",
        quantity: 500,
        price: 750.00,
        options: "Premium Paper, Glossy Finish"
      },
      {
        id: "2",
        name: "Flyers",
        quantity: 100,
        price: 500.00,
        options: "A5 Size, Full Color"
      }
    ],
    customer: {
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      phone: "+63 912 345 6789"
    },
    delivery: {
      address: "123 Main St, Quezon City, Metro Manila",
      method: "Standard Delivery",
      estimatedDate: "2024-03-20"
    },
    payment: {
      method: "GCash",
      status: "paid"
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/orders")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order {order.orderNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start border-b pb-4 last:border-0">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.options}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₱{item.price.toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">₱{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">{order.delivery.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Delivery Method</p>
                  <p className="text-sm text-muted-foreground">{order.delivery.method}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Estimated Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.delivery.estimatedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">{order.payment.method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Status</p>
                  <Badge variant={order.payment.status === "paid" ? "default" : "secondary"}>
                    {order.payment.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={order.orderNumber} size={200} />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Scan this code for quick order tracking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Track Order
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetail;
