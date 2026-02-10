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
  Package, TrendingUp, DollarSign, Clock, CheckCircle2,
  Plus, Edit, Settings, QrCode, Loader2, Store, Save
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  useMyShop, useMyShopServices, useMyShopOrders, useMyShopStats,
  useUpdateOrderStatus, useCreateService, useUpdateService, useToggleServiceStatus, useUpdateShop,
} from "@/hooks/useBusinessData";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "ready", "completed", "cancelled"];

export default function BusinessDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderFilter, setOrderFilter] = useState("all");
  const [showCreateService, setShowCreateService] = useState(false);
  const [editingShop, setEditingShop] = useState(false);

  // New service form state
  const [newService, setNewService] = useState({
    name: "", description: "", base_price: 0, category: "",
    estimated_days: 3, min_order_quantity: 1, max_order_quantity: 0,
    rush_support: false, file_upload_required: false, fulfillment_type: "both",
  });

  // Shop edit state
  const [shopEdits, setShopEdits] = useState<Record<string, any>>({});

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
      toast.error("Name and price are required");
      return;
    }
    createService.mutate(
      {
        ...newService,
        shop_id: shop.id,
        max_order_quantity: newService.max_order_quantity || undefined,
        category: newService.category || undefined,
        description: newService.description || undefined,
      },
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
      {
        onSuccess: () => { toast.success("Shop updated!"); setEditingShop(false); },
        onError: (err: any) => toast.error(err.message),
      }
    );
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

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayOrders ?? 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.pendingOrders ?? 0} pending</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats?.completedOrders ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{(stats?.todayRevenue ?? 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{(stats?.monthlyRevenue ?? 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="settings">Shop Settings</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Orders</CardTitle>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : orders && orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{order.product_name}</TableCell>
                          <TableCell className="font-medium">₱{Number(order.total_amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={order.order_status === "completed" ? "default" : "secondary"} className="capitalize">{order.order_status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Select onValueChange={(status) => {
                                if (!user) return;
                                updateOrderStatus.mutate({ orderId: order.id, status, changedBy: user.id }, {
                                  onSuccess: () => toast.success("Status updated"),
                                });
                              }}>
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                  <SelectValue placeholder="Update" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm"><QrCode className="h-3 w-3" /></Button>
                                </DialogTrigger>
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
                ) : (
                  <p className="text-center text-muted-foreground py-8">No orders found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Services</CardTitle>
                  <Dialog open={showCreateService} onOpenChange={setShowCreateService}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Service</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>Create New Service</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label>Service Name *</Label>
                          <Input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="e.g. Business Cards" />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Base Price (₱) *</Label>
                            <Input type="number" value={newService.base_price} onChange={(e) => setNewService({ ...newService, base_price: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Input value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} placeholder="e.g. Cards" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Est. Days</Label>
                            <Input type="number" value={newService.estimated_days} onChange={(e) => setNewService({ ...newService, estimated_days: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Min Qty</Label>
                            <Input type="number" value={newService.min_order_quantity} onChange={(e) => setNewService({ ...newService, min_order_quantity: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Qty</Label>
                            <Input type="number" value={newService.max_order_quantity} onChange={(e) => setNewService({ ...newService, max_order_quantity: Number(e.target.value) })} placeholder="0 = no limit" />
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch checked={newService.rush_support} onCheckedChange={(v) => setNewService({ ...newService, rush_support: v })} />
                            <Label>Rush Support</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={newService.file_upload_required} onCheckedChange={(v) => setNewService({ ...newService, file_upload_required: v })} />
                            <Label>File Required</Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Fulfillment</Label>
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
                {servicesLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : services && services.length > 0 ? (
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
                        <div className="flex gap-2">
                          <Switch
                            checked={service.is_active ?? true}
                            onCheckedChange={(checked) => {
                              toggleServiceStatus.mutate({ id: service.id, is_active: checked }, {
                                onSuccess: () => toast.success(checked ? "Service activated" : "Service deactivated"),
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No services yet. Add your first service to start receiving orders!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
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
                      <Button size="sm" onClick={handleSaveShop} disabled={updateShop.isPending}>
                        <Save className="h-4 w-4 mr-2" />Save
                      </Button>
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
