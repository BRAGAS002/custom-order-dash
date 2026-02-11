import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, CreditCard, MessageSquare, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { OrderChat } from "@/components/chat/OrderChat";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const { data: statusHistory } = useQuery({
    queryKey: ["order-history", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase.from("order_status_history").select("*").eq("order_id", orderId).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  const { data: existingReview } = useQuery({
    queryKey: ["order-review", orderId, user?.id],
    queryFn: async () => {
      if (!orderId || !user) return null;
      const { data } = await supabase.from("reviews").select("id").eq("order_id", orderId).eq("customer_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!orderId && !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">Order not found</p>
          <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { pending: "bg-warning", confirmed: "bg-primary", processing: "bg-primary", ready: "bg-accent", completed: "bg-success", cancelled: "bg-destructive" };
    return colors[status] || "bg-muted-foreground";
  };

  const isCompleted = order.order_status === "completed";
  const canReview = isCompleted && !existingReview && order.customer_id === user?.id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/orders")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Orders
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order {order.order_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.order_status ?? "pending")} text-white capitalize`}>
                    {order.order_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems && orderItems.length > 0 ? (
                    orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start border-b pb-4 last:border-0">
                        <div>
                          <h4 className="font-medium">{item.product_name}</h4>
                          {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₱{Number(item.total_price).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{order.product_name}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {order.quantity}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">₱{Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Delivery Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><p className="text-sm font-medium">Fulfillment</p><p className="text-sm text-muted-foreground capitalize">{order.fulfillment_type}</p></div>
                <div><p className="text-sm font-medium">Address</p><p className="text-sm text-muted-foreground">{order.delivery_address}</p></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div><p className="text-sm font-medium">Method</p><p className="text-sm text-muted-foreground capitalize">{order.payment_method ?? "—"}</p></div>
                  <div><p className="text-sm font-medium">Status</p><Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="capitalize">{order.payment_status}</Badge></div>
                </div>
              </CardContent>
            </Card>

            {statusHistory && statusHistory.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Order Progress</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statusHistory.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium capitalize">{entry.status}</div>
                          <div className="text-sm text-muted-foreground">{new Date(entry.created_at!).toLocaleString()}</div>
                          {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review section */}
            {canReview && (
              <ReviewForm orderId={orderId!} shopId={order.shop_id} productId={order.product_id ?? undefined} />
            )}
            {existingReview && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">✅ You've already reviewed this order</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Order QR Code</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg"><QRCode value={order.order_number} size={200} /></div>
                <p className="text-sm text-center text-muted-foreground">Scan for quick order tracking</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Customer Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><p className="text-sm font-medium">Name</p><p className="text-sm text-muted-foreground">{order.customer_name}</p></div>
                <div><p className="text-sm font-medium">Email</p><p className="text-sm text-muted-foreground">{order.customer_email}</p></div>
                {order.customer_phone && <div><p className="text-sm font-medium">Phone</p><p className="text-sm text-muted-foreground">{order.customer_phone}</p></div>}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Order Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderChat orderId={orderId || ""} userType="customer" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OrderDetail;
