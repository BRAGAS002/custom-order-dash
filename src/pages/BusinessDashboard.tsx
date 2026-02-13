import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Package, TrendingUp, DollarSign, CheckCircle2,
  Plus, Edit, Settings, QrCode, Loader2, Store, Save, UserPlus, Sliders
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  useMyShop, useMyShopServices, useMyShopOrders, useMyShopStats,
  useUpdateOrderStatus, useCreateService, useToggleServiceStatus, useUpdateShop,
} from "@/hooks/useBusinessData";
import { useQueryClient } from "@tanstack/react-query";
import { CustomizationManager } from "@/components/business/CustomizationManager";
import { DocumentUpload } from "@/components/business/DocumentUpload";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "ready", "completed", "cancelled"];

export default function BusinessDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [orderFilter, setOrderFilter] = useState("all");
  const [showCreateService, setShowCreateService] = useState(false);
  const [editingShop, setEditingShop] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [customizingService, setCustomizingService] = useState<{ id: string; name: string } | null>(null);

  const [newService, setNewService] = useState({
    name: "", description: "", base_price: 0, category: "",
    estimated_days: 3, min_order_quantity: 1, max_order_quantity: 0,
    rush_support: false, file_upload_required: false, fulfillment_type: "both",
  });

  const [shopEdits, setShopEdits] = useState<Record<string, any>>({});

  // Walk-in order state
  const [walkIn, setWalkIn] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    product_name: "", quantity: 1, total_amount: 0, notes: "",
  });

  const { data: shop, isLoading: shopLoading } = useMyShop();
  const { data: services, isLoading: servicesLoading } = useMyShopServices(shop?.id);
  const { data: orders, isLoading: ordersLoading } = useMyShopOrders(shop?.id, orderFilter);
  const { data: stats } = useMyShopStats(shop?.id);

  const updateOrderStatus = useUpdateOrderStatus();
  const createService = useCreateService();
  const toggleServiceStatus = useToggleServiceStatus();
  const updateShop = useUpdateShop();

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Shop Found</h2>
          <p className="text-muted-foreground mb-6">You haven't registered a shop yet.</p>
          <Button onClick={() => navigate("/business/onboarding")}>Register Your Shop</Button>
        </main>
      </div>
    );
  }

  const handleCreateService = () => {
    if (!newService.name.trim() || newService.base_price <= 0) {
      toast.error("Name and price are required"); return;
    }
    createService.mutate(
      { ...newService, shop_id: shop.id, max_order_quantity: newService.max_order_quantity || undefined, category: newService.category || undefined, description: newService.description || undefined },
      {
        onSuccess: () => {
          toast.success("Service created!");
          setShowCreateService(false);
          setNewService({ name: "", description: "", base_price: 0, category: "", estimated_days: 3, min_order_quantity: 1, max_order_quantity: 0, rush_support: false, file_upload_required: false, fulfillment_type: "both" });
        },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  const handleSaveShop = () => {
    updateShop.mutate(
      { id: shop.id, ...shopEdits },
      { onSuccess: () => { toast.success("Shop updated!"); setEditingShop(false); }, onError: (err: any) => toast.error(err.message) }
    );
  };

  const handleWalkInOrder = async () => {
    if (!walkIn.customer_name.trim() || !walkIn.product_name.trim() || walkIn.total_amount <= 0) {
      toast.error("Customer name, service, and amount are required"); return;
    }
    setWalkInSubmitting(true);
    try {
      const orderNumber = `WLK-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const { error } = await supabase.from("orders").insert({
        order_number: orderNumber,
        shop_id: shop.id,
        customer_name: walkIn.customer_name,
        customer_email: walkIn.customer_email || `walkin-${Date.now()}@temp.local`,
        customer_phone: walkIn.customer_phone || null,
        delivery_address: "Walk-in",
        product_name: walkIn.product_name,
        quantity: walkIn.quantity,
        total_amount: walkIn.total_amount,
        payment_method: "cash",
        fulfillment_type: "pickup",
        order_status: "confirmed",
        payment_status: "paid",
        notes: walkIn.notes || "Walk-in order",
      });
      if (error) throw error;
      toast.success(`Walk-in order ${orderNumber} created!`);
      setShowWalkIn(false);
      setWalkIn({ customer_name: "", customer_email: "", customer_phone: "", product_name: "", quantity: 1, total_amount: 0, notes: "" });
      queryClient.invalidateQueries({ queryKey: ["my-shop-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-shop-stats"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create walk-in order");
    } finally {
      setWalkInSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            <Badge variant={shop.verification_status === "verified" ? "default" : "secondary"}>{shop.verification_status}</Badge>
          </div>
          <p className="text-muted-foreground">Business Dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { title: "Today's Orders", icon: Package, value: stats?.todayOrders ?? 0, sub: `${stats?.pendingOrders ?? 0} pending` },
            { title: "Completed", icon: CheckCircle2, value: stats?.completedOrders ?? 0, sub: "", valueClass: "text-success" },
            { title: "Today's Revenue", icon: DollarSign, value: `₱${(stats?.todayRevenue ?? 0).toLocaleString()}`, sub: "" },
            { title: "Monthly Revenue", icon: TrendingUp, value: `₱${(stats?.monthlyRevenue ?? 0).toLocaleString()}`, sub: "" },
          ].map((s) => (
            <Card key={s.title} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${s.valueClass || ""}`}>{s.value}</div>
                {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="settings">Shop Settings</TabsTrigger>
          </TabsList>

          {/* Orders */}
          <TabsContent value="orders">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Orders</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={showWalkIn} onOpenChange={setShowWalkIn}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><UserPlus className="h-4 w-4 mr-2" />Walk-in Order</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Create Walk-in Order</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Customer Name *</Label><Input value={walkIn.customer_name} onChange={(e) => setWalkIn({ ...walkIn, customer_name: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={walkIn.customer_phone} onChange={(e) => setWalkIn({ ...walkIn, customer_phone: e.target.value })} /></div>
                          </div>
                          <div className="space-y-2"><Label>Email (optional)</Label><Input value={walkIn.customer_email} onChange={(e) => setWalkIn({ ...walkIn, customer_email: e.target.value })} /></div>
                          <div className="space-y-2"><Label>Service / Product Name *</Label>
                            <Select onValueChange={(v) => {
                              const svc = services?.find((s) => s.id === v);
                              if (svc) setWalkIn({ ...walkIn, product_name: svc.name, total_amount: Number(svc.base_price) * walkIn.quantity });
                            }}>
                              <SelectTrigger><SelectValue placeholder="Select a service or type below" /></SelectTrigger>
                              <SelectContent>
                                {services?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — ₱{Number(s.base_price).toLocaleString()}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input value={walkIn.product_name} onChange={(e) => setWalkIn({ ...walkIn, product_name: e.target.value })} placeholder="Or type custom service name" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Quantity</Label><Input type="number" min={1} value={walkIn.quantity} onChange={(e) => setWalkIn({ ...walkIn, quantity: Number(e.target.value) })} /></div>
                            <div className="space-y-2"><Label>Total Amount (₱) *</Label><Input type="number" value={walkIn.total_amount} onChange={(e) => setWalkIn({ ...walkIn, total_amount: Number(e.target.value) })} /></div>
                          </div>
                          <div className="space-y-2"><Label>Notes</Label><Textarea value={walkIn.notes} onChange={(e) => setWalkIn({ ...walkIn, notes: e.target.value })} rows={2} /></div>
                          <Button className="w-full" onClick={handleWalkInOrder} disabled={walkInSubmitting}>
                            {walkInSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                            Create Walk-in Order
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Select value={orderFilter} onValueChange={setOrderFilter}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : orders && orders.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Order #</TableHead><TableHead>Customer</TableHead><TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{order.product_name}</TableCell>
                          <TableCell className="font-medium">₱{Number(order.total_amount).toLocaleString()}</TableCell>
                          <TableCell><Badge variant={order.order_status === "completed" ? "default" : "secondary"} className="capitalize">{order.order_status}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Select onValueChange={(status) => {
                                if (!user) return;
                                updateOrderStatus.mutate({ orderId: order.id, status, changedBy: user.id }, { onSuccess: () => toast.success("Status updated") });
                              }}>
                                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Update" /></SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Dialog>
                                <DialogTrigger asChild><Button variant="outline" size="sm"><QrCode className="h-3 w-3" /></Button></DialogTrigger>
                                <DialogContent>
                                  <DialogHeader><DialogTitle>QR — {order.order_number}</DialogTitle></DialogHeader>
                                  <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="bg-white p-4 rounded-lg">
                                      <QRCode value={JSON.stringify({ orderNumber: order.order_number, customer: order.customer_name, amount: order.total_amount })} size={200} />
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-center text-muted-foreground py-8">No orders found</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Services</CardTitle>
                  <Dialog open={showCreateService} onOpenChange={setShowCreateService}>
                    <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Service</Button></DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>Create New Service</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2"><Label>Service Name *</Label><Input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="e.g. Business Cards" /></div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={2} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Base Price (₱) *</Label><Input type="number" value={newService.base_price} onChange={(e) => setNewService({ ...newService, base_price: Number(e.target.value) })} /></div>
                          <div className="space-y-2"><Label>Category</Label><Input value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} placeholder="e.g. Cards" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2"><Label>Est. Days</Label><Input type="number" value={newService.estimated_days} onChange={(e) => setNewService({ ...newService, estimated_days: Number(e.target.value) })} /></div>
                          <div className="space-y-2"><Label>Min Qty</Label><Input type="number" value={newService.min_order_quantity} onChange={(e) => setNewService({ ...newService, min_order_quantity: Number(e.target.value) })} /></div>
                          <div className="space-y-2"><Label>Max Qty</Label><Input type="number" value={newService.max_order_quantity} onChange={(e) => setNewService({ ...newService, max_order_quantity: Number(e.target.value) })} placeholder="0 = no limit" /></div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2"><Switch checked={newService.rush_support} onCheckedChange={(v) => setNewService({ ...newService, rush_support: v })} /><Label>Rush Support</Label></div>
                          <div className="flex items-center gap-2"><Switch checked={newService.file_upload_required} onCheckedChange={(v) => setNewService({ ...newService, file_upload_required: v })} /><Label>File Required</Label></div>
                        </div>
                        <div className="space-y-2"><Label>Fulfillment</Label>
                          <Select value={newService.fulfillment_type} onValueChange={(v) => setNewService({ ...newService, fulfillment_type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="both">Pickup & Delivery</SelectItem>
                              <SelectItem value="pickup">Pickup Only</SelectItem>
                              <SelectItem value="delivery">Delivery Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={handleCreateService} disabled={createService.isPending}>
                          {createService.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          Create Service
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {servicesLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : services && services.length > 0 ? (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-smooth">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{service.name}</h4>
                            <Badge variant={service.is_active ? "default" : "secondary"}>{service.is_active ? "Active" : "Inactive"}</Badge>
                            {service.category && <Badge variant="outline">{service.category}</Badge>}
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>₱{Number(service.base_price).toLocaleString()}</span>
                            <span>{service.total_orders ?? 0} orders</span>
                            {service.estimated_days && <span>{service.estimated_days}d turnaround</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setCustomizingService({ id: service.id, name: service.name })}>
                            <Sliders className="h-3 w-3 mr-1" />Options
                          </Button>
                          <Switch checked={service.is_active ?? true} onCheckedChange={(checked) => toggleServiceStatus.mutate({ id: service.id, is_active: checked }, { onSuccess: () => toast.success(checked ? "Service activated" : "Service deactivated") })} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-muted-foreground py-8">No services yet. Add your first service to start receiving orders!</p>}
              </CardContent>
            </Card>

            {/* Customization Manager Dialog */}
            {customizingService && (
              <Card className="shadow-card mt-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Sliders className="h-5 w-5" />Manage Options</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setCustomizingService(null)}>Close</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CustomizationManager serviceId={customizingService.id} serviceName={customizingService.name} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Shop Settings</CardTitle>
                  {!editingShop ? (
                    <Button variant="outline" size="sm" onClick={() => { setShopEdits({ name: shop.name, description: shop.description ?? "", address: shop.address ?? "", phone: shop.phone ?? "", email: shop.email ?? "", gcash_number: shop.gcash_number ?? "", gcash_name: shop.gcash_name ?? "" }); setEditingShop(true); }}>
                      <Edit className="h-4 w-4 mr-2" />Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingShop(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveShop} disabled={updateShop.isPending}><Save className="h-4 w-4 mr-2" />Save</Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingShop ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Shop Name</Label><Input value={shopEdits.name} onChange={(e) => setShopEdits({ ...shopEdits, name: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Email</Label><Input value={shopEdits.email} onChange={(e) => setShopEdits({ ...shopEdits, email: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Phone</Label><Input value={shopEdits.phone} onChange={(e) => setShopEdits({ ...shopEdits, phone: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Address</Label><Input value={shopEdits.address} onChange={(e) => setShopEdits({ ...shopEdits, address: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={shopEdits.description} onChange={(e) => setShopEdits({ ...shopEdits, description: e.target.value })} rows={3} /></div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>GCash Number</Label><Input value={shopEdits.gcash_number} onChange={(e) => setShopEdits({ ...shopEdits, gcash_number: e.target.value })} /></div>
                      <div className="space-y-2"><Label>GCash Name</Label><Input value={shopEdits.gcash_name} onChange={(e) => setShopEdits({ ...shopEdits, gcash_name: e.target.value })} /></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: "Shop Name", value: shop.name },
                        { label: "Email", value: shop.email },
                        { label: "Phone", value: shop.phone },
                        { label: "Address", value: shop.address },
                        { label: "GCash Number", value: shop.gcash_number },
                        { label: "GCash Name", value: shop.gcash_name },
                        { label: "Payment Methods", value: shop.allowed_payment_methods?.join(", ") },
                        { label: "Fulfillment", value: shop.supported_fulfillment?.join(", ") },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                    {shop.description && (
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground mt-1">{shop.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Verification */}
            <DocumentUpload
              shopId={shop.id}
              currentDocuments={shop.business_documents}
              verificationStatus={shop.verification_status}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ["my-shop"] })}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
