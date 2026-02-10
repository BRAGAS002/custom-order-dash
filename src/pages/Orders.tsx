import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle2, Truck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusConfig: Record<string, { icon: any; color: string }> = {
  pending: { icon: Clock, color: "bg-warning/10 text-warning" },
  confirmed: { icon: Package, color: "bg-primary/10 text-primary" },
  processing: { icon: Package, color: "bg-primary/10 text-primary" },
  ready: { icon: Truck, color: "bg-accent/10 text-accent" },
  completed: { icon: CheckCircle2, color: "bg-success/10 text-success" },
  cancelled: { icon: Clock, color: "bg-destructive/10 text-destructive" },
};

export default function Orders() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Print Jobs</h1>
          <p className="text-muted-foreground">Track your printing orders with real-time status updates</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.order_status ?? "pending"] ?? statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <Card key={order.id} className="shadow-card hover:shadow-card-hover transition-smooth">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg mb-1">{order.order_number}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{order.product_name}</span>
                          <span>•</span>
                          <span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="font-medium capitalize">{order.order_status}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Qty: {order.quantity}</span>
                        <span>Payment: <Badge variant="outline" className="capitalize">{order.payment_status}</Badge></span>
                        <span className="capitalize">{order.fulfillment_type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-primary">₱{Number(order.total_amount).toLocaleString()}</span>
                        <Button variant="default" size="sm" asChild>
                          <Link to={`/orders/${order.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No print jobs yet</h3>
              <p className="text-muted-foreground mb-6">Start browsing printing shops to place your first order</p>
              <Button asChild>
                <Link to="/enterprises">Browse Printing Shops</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
