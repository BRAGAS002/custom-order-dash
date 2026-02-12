import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Store, Package, DollarSign,
  AlertCircle, QrCode, Loader2, ShieldCheck,
  Flag, Settings, Search, Save, Plus
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import {
  useAdminStats, useAdminShops, useAdminOrders, useAdminUsers,
  useAdminUserRoles, useAdminReports, useSystemSettings,
  useUpdateShopVerification, useUpdateShopStatus, useUpdateOrderStatus as useAdminUpdateOrderStatus,
  useUpdateSystemSetting, useResolveReport,
} from "@/hooks/useAdminData";

const DEFAULT_SETTINGS = [
  { key: "platform_name", value: "UniPrint", description: "Platform display name" },
  { key: "platform_tagline", value: "Your Local Printing Marketplace", description: "Platform tagline" },
  { key: "tax_rate", value: 0, description: "Tax rate percentage (e.g., 12 for 12%)" },
  { key: "order_auto_complete_days", value: 7, description: "Days after which completed orders auto-close" },
  { key: "order_overdue_cancel_days", value: 30, description: "Days after which overdue orders are auto-cancelled" },
];

export default function AdminDashboard() {
  const [shopSearch, setShopSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [settingValue, setSettingValue] = useState("");
  const [showAddSetting, setShowAddSetting] = useState(false);
  const [newSettingKey, setNewSettingKey] = useState("");
  const [newSettingValue, setNewSettingValue] = useState("");
  const [newSettingDesc, setNewSettingDesc] = useState("");

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: shops, isLoading: shopsLoading } = useAdminShops();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: userRoles } = useAdminUserRoles();
  const { data: reports } = useAdminReports();
  const { data: settings } = useSystemSettings();

  const verifyShop = useUpdateShopVerification();
  const toggleShopStatus = useUpdateShopStatus();
  const updateOrderStatus = useAdminUpdateOrderStatus();
  const updateSetting = useUpdateSystemSetting();
  const resolveReport = useResolveReport();

  const getRoleForUser = (userId: string) =>
    userRoles?.find((r) => r.user_id === userId)?.role ?? "customer";

  const filteredShops = shops?.filter((s) =>
    s.name.toLowerCase().includes(shopSearch.toLowerCase()) || (s.address ?? "").toLowerCase().includes(shopSearch.toLowerCase())
  );
  const filteredOrders = orders?.filter((o) =>
    o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer_name.toLowerCase().includes(orderSearch.toLowerCase())
  );
  const filteredUsers = users?.filter((u) =>
    (u.full_name ?? "").toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const pendingReports = reports?.filter((r) => r.status === "pending") ?? [];

  // Merge DB settings with defaults
  const allSettings = DEFAULT_SETTINGS.map((def) => {
    const existing = settings?.find((s) => s.key === def.key);
    return existing || { ...def, id: def.key };
  });
  const extraSettings = settings?.filter((s) => !DEFAULT_SETTINGS.find((d) => d.key === s.key)) ?? [];

  const handleSaveSetting = (key: string, description?: string) => {
    let parsed: any;
    try {
      parsed = JSON.parse(settingValue);
    } catch {
      parsed = settingValue;
    }
    updateSetting.mutate({ key, value: parsed, description }, {
      onSuccess: () => { toast.success("Setting updated"); setEditingSetting(null); },
    });
  };

  const handleAddSetting = () => {
    if (!newSettingKey.trim()) { toast.error("Key is required"); return; }
    let parsed: any;
    try { parsed = JSON.parse(newSettingValue); } catch { parsed = newSettingValue; }
    updateSetting.mutate({ key: newSettingKey.trim(), value: parsed, description: newSettingDesc || undefined }, {
      onSuccess: () => {
        toast.success("Setting added");
        setShowAddSetting(false);
        setNewSettingKey(""); setNewSettingValue(""); setNewSettingDesc("");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {statsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { title: "Total Shops", icon: Store, value: stats?.totalShops, sub: `${stats?.activeShops} active` },
              { title: "Total Orders", icon: Package, value: stats?.totalOrders.toLocaleString(), sub: `${stats?.pendingOrders} pending` },
              { title: "Revenue", icon: DollarSign, value: `₱${(stats?.monthlyRevenue ?? 0).toLocaleString()}`, sub: "" },
              { title: "Users", icon: Users, value: stats?.activeUsers.toLocaleString(), sub: "" },
            ].map((s) => (
              <Card key={s.title} className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value}</div>
                  {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs defaultValue="shops" className="space-y-4">
          <TabsList>
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">
              Reports {pendingReports.length > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{pendingReports.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Shops */}
          <TabsContent value="shops">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Shop Management</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search shops..." value={shopSearch} onChange={(e) => setShopSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {shopsLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Shop Name</TableHead><TableHead>Address</TableHead><TableHead>Status</TableHead>
                      <TableHead>Verification</TableHead><TableHead>Orders</TableHead><TableHead>Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filteredShops?.map((shop) => (
                        <TableRow key={shop.id}>
                          <TableCell className="font-medium">{shop.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{shop.address ?? "—"}</TableCell>
                          <TableCell><Badge variant={shop.status === "active" ? "default" : "secondary"}>{shop.status}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={shop.verification_status === "verified" ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                              {shop.verification_status === "verified" ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              {shop.verification_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{shop.total_orders ?? 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {shop.verification_status !== "verified" && (
                                <Button size="sm" variant="outline" onClick={() => verifyShop.mutate({ shopId: shop.id, status: "verified" }, { onSuccess: () => toast.success("Shop verified") })}>
                                  <ShieldCheck className="h-3 w-3 mr-1" />Verify
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => {
                                const ns = shop.status === "active" ? "inactive" : "active";
                                toggleShopStatus.mutate({ shopId: shop.id, status: ns }, { onSuccess: () => toast.success(`Shop ${ns}`) });
                              }}>{shop.status === "active" ? "Deactivate" : "Activate"}</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredShops?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No shops found</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Oversight</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search orders..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Order #</TableHead><TableHead>Customer</TableHead><TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filteredOrders?.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{order.product_name}</TableCell>
                          <TableCell className="font-medium">₱{Number(order.total_amount).toLocaleString()}</TableCell>
                          <TableCell><Badge variant={order.order_status === "completed" ? "default" : "secondary"}>{order.order_status}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Select onValueChange={(status) => updateOrderStatus.mutate({ orderId: order.id, status }, { onSuccess: () => toast.success("Status updated") })}>
                                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Update" /></SelectTrigger>
                                <SelectContent>
                                  {["pending","confirmed","processing","ready","completed","cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Dialog>
                                <DialogTrigger asChild><Button variant="outline" size="sm"><QrCode className="h-3 w-3" /></Button></DialogTrigger>
                                <DialogContent>
                                  <DialogHeader><DialogTitle>QR — {order.order_number}</DialogTitle></DialogHeader>
                                  <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="bg-white p-4 rounded-lg">
                                      <QRCode value={JSON.stringify({ orderNumber: order.order_number, id: order.id, amount: order.total_amount, status: order.order_status })} size={200} />
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredOrders?.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No orders found</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>City</TableHead><TableHead>Joined</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {filteredUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{getRoleForUser(user.id)}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.city ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports">
            <Card className="shadow-card">
              <CardHeader><CardTitle>User Reports</CardTitle></CardHeader>
              <CardContent>
                {reports && reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Flag className="h-4 w-4 text-destructive" />
                              <span className="font-semibold capitalize">{report.reported_type} Report</span>
                              <Badge variant={report.status === "resolved" ? "default" : "destructive"}>{report.status}</Badge>
                            </div>
                            <p className="text-sm font-medium">{report.reason}</p>
                            {report.description && <p className="text-sm text-muted-foreground mt-1">{report.description}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">{report.created_at ? new Date(report.created_at).toLocaleDateString() : ""}</span>
                        </div>
                        {report.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Textarea placeholder="Admin notes..." value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} className="text-sm" rows={2} />
                            <Button size="sm" onClick={() => resolveReport.mutate({ reportId: report.id, notes: resolveNotes }, { onSuccess: () => { toast.success("Report resolved"); setResolveNotes(""); } })}>Resolve</Button>
                          </div>
                        )}
                        {report.admin_notes && <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">Admin: {report.admin_notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No reports</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />System Settings</CardTitle>
                  <Dialog open={showAddSetting} onOpenChange={setShowAddSetting}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Setting</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add System Setting</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2"><Label>Key *</Label><Input value={newSettingKey} onChange={(e) => setNewSettingKey(e.target.value)} placeholder="e.g. max_upload_size" /></div>
                        <div className="space-y-2"><Label>Value *</Label><Input value={newSettingValue} onChange={(e) => setNewSettingValue(e.target.value)} placeholder="e.g. 10" /></div>
                        <div className="space-y-2"><Label>Description</Label><Input value={newSettingDesc} onChange={(e) => setNewSettingDesc(e.target.value)} /></div>
                        <Button className="w-full" onClick={handleAddSetting}>Add Setting</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...allSettings, ...extraSettings].map((setting: any) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{setting.key}</p>
                        {setting.description && <p className="text-sm text-muted-foreground">{setting.description}</p>}
                      </div>
                      {editingSetting === setting.key ? (
                        <div className="flex items-center gap-2 ml-4">
                          <Input value={settingValue} onChange={(e) => setSettingValue(e.target.value)} className="w-48" />
                          <Button size="sm" onClick={() => handleSaveSetting(setting.key, setting.description)}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingSetting(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 ml-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">{JSON.stringify(setting.value)}</code>
                          <Button size="sm" variant="outline" onClick={() => { setEditingSetting(setting.key); setSettingValue(JSON.stringify(setting.value)); }}>Edit</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
