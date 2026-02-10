import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Phone, Mail, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "gcash", label: "GCash" },
  { id: "maya", label: "Maya" },
  { id: "bank_transfer", label: "Online Banking" },
];

const FULFILLMENT_OPTIONS = [
  { id: "pickup", label: "Store Pickup" },
  { id: "delivery", label: "Delivery" },
];

export default function BusinessOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [gcashName, setGcashName] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["cash"]);
  const [fulfillment, setFulfillment] = useState<string[]>(["pickup"]);

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const toggleFulfillment = (option: string) => {
    setFulfillment((prev) =>
      prev.includes(option) ? prev.filter((f) => f !== option) : [...prev, option]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    if (!shopName.trim() || !address.trim()) {
      toast.error("Shop name and address are required");
      return;
    }
    if (paymentMethods.includes("gcash") && !gcashNumber.trim()) {
      toast.error("Please enter your GCash number");
      return;
    }
    if (paymentMethods.length === 0) {
      toast.error("Please select at least one payment method");
      return;
    }
    if (fulfillment.length === 0) {
      toast.error("Please select at least one fulfillment option");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("shops").insert({
        name: shopName.trim(),
        description: description.trim() || null,
        address: address.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        gcash_number: gcashNumber.trim() || null,
        gcash_name: gcashName.trim() || null,
        owner_id: user.id,
        allowed_payment_methods: paymentMethods,
        supported_fulfillment: fulfillment,
        verification_status: "pending",
        status: "active",
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Shop registered! It will be reviewed for verification.");
    } catch (err: any) {
      toast.error(err.message || "Failed to register shop");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-lg py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Shop Registered!</h1>
          <p className="text-muted-foreground mb-6">
            Your shop has been submitted for verification. You'll be notified once it's approved. In the meantime, you can start adding services from your dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/business")}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Register Your Print Shop</h1>
          <p className="text-muted-foreground">Set up your shop and start receiving orders</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-8 bg-primary" : s < step ? "w-8 bg-primary/50" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
              <CardDescription>Tell us about your printing business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name *</Label>
                <Input id="shopName" placeholder="e.g. Baguio Print Express" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Tell customers what you specialize in..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="address" className="pl-9" placeholder="Full shop address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" className="pl-9" placeholder="09XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="shopEmail" className="pl-9" type="email" placeholder="shop@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => {
                  if (!shopName.trim() || !address.trim()) {
                    toast.error("Shop name and address are required");
                    return;
                  }
                  setStep(2);
                }}>
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment & Fulfillment */}
        {step === 2 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Payment & Fulfillment</CardTitle>
              <CardDescription>Configure how you accept payments and deliver orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Accepted Payment Methods *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-smooth ${
                        paymentMethods.includes(method.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => togglePaymentMethod(method.id)}
                    >
                      <Checkbox checked={paymentMethods.includes(method.id)} onCheckedChange={() => togglePaymentMethod(method.id)} />
                      <span className="text-sm font-medium">{method.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {paymentMethods.includes("gcash") && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <Label className="text-base font-semibold">GCash Details</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="gcashNumber">GCash Number *</Label>
                      <Input id="gcashNumber" placeholder="09XX XXX XXXX" value={gcashNumber} onChange={(e) => setGcashNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gcashName">Account Name *</Label>
                      <Input id="gcashName" placeholder="Full name on GCash" value={gcashName} onChange={(e) => setGcashName(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label>Fulfillment Options *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {FULFILLMENT_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-smooth ${
                        fulfillment.includes(option.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleFulfillment(option.id)}
                    >
                      <Checkbox checked={fulfillment.includes(option.id)} onCheckedChange={() => toggleFulfillment(option.id)} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Make sure everything looks correct before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Shop Name</span>
                  <span className="font-medium">{shopName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-right max-w-[60%]">{address}</span>
                </div>
                {phone && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{email}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Payment Methods</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {paymentMethods.map((m) => (
                      <Badge key={m} variant="secondary" className="capitalize">{m.replace("_", " ")}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Fulfillment</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {fulfillment.map((f) => (
                      <Badge key={f} variant="secondary" className="capitalize">{f}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="text-muted-foreground">
                  After submission, your shop will be reviewed by our team. You'll receive a notification once verified. You can start adding services immediately.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
