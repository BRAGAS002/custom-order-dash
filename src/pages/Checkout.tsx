import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Building2, Wallet, Banknote, Loader2, Tag, Truck, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getCartItems, getCartItemTotal, getCartTotal, clearCart, type CartItem } from "@/lib/cart";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [fulfillmentType, setFulfillmentType] = useState("pickup");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Contact fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Baguio City");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setCartItems(getCartItems());
    if (user?.email) setEmail(user.email);
  }, [user]);

  const subtotal = getCartTotal(cartItems);
  const total = Math.max(0, subtotal - discountAmount);

  // Group items by shop for creating separate orders
  const shopGroups = cartItems.reduce<Record<string, CartItem[]>>((groups, item) => {
    if (!groups[item.shopId]) groups[item.shopId] = [];
    groups[item.shopId].push(item);
    return groups;
  }, {});

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);

    try {
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", discountCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Invalid discount code");
        setApplyingDiscount(false);
        return;
      }

      // Check min order amount
      if (data.min_order_amount && subtotal < Number(data.min_order_amount)) {
        toast.error(`Minimum order ₱${Number(data.min_order_amount).toLocaleString()} required`);
        setApplyingDiscount(false);
        return;
      }

      // Check max uses
      if (data.max_uses && (data.used_count ?? 0) >= data.max_uses) {
        toast.error("This discount code has been fully redeemed");
        setApplyingDiscount(false);
        return;
      }

      let amount = 0;
      if (data.discount_type === "percentage") {
        amount = subtotal * (Number(data.discount_value) / 100);
      } else {
        amount = Number(data.discount_value);
      }

      setDiscountAmount(Math.min(amount, subtotal));
      setDiscountApplied(true);
      toast.success(`Discount applied: -₱${Math.min(amount, subtotal).toLocaleString()}`);
    } catch {
      toast.error("Failed to apply discount code");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill in your contact information");
      return;
    }
    if (fulfillmentType === "delivery" && !address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create one order per shop
      for (const [shopId, items] of Object.entries(shopGroups)) {
        const shopTotal = items.reduce((s, item) => s + getCartItemTotal(item), 0);
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            shop_id: shopId,
            customer_id: user.id,
            customer_name: `${firstName} ${lastName}`.trim(),
            customer_email: email,
            customer_phone: phone || null,
            delivery_address: fulfillmentType === "delivery" ? `${address}, ${city}` : "Store Pickup",
            product_name: items.map((i) => i.productName).join(", "),
            product_id: items[0].productId,
            quantity: items.reduce((s, i) => s + i.quantity, 0),
            total_amount: shopTotal,
            payment_method: paymentMethod,
            fulfillment_type: fulfillmentType,
            discount_amount: discountAmount > 0 ? discountAmount : 0,
            notes: notes || null,
            order_status: "pending",
            payment_status: paymentMethod === "cash" ? "pending" : "pending",
          })
          .select("id")
          .single();

        if (orderError) throw orderError;

        // Create order items
        for (const item of items) {
          const { data: orderItem, error: itemError } = await supabase
            .from("order_items")
            .insert({
              order_id: order.id,
              product_id: item.productId,
              product_name: item.productName,
              quantity: item.quantity,
              unit_price: item.basePrice,
              total_price: getCartItemTotal(item),
              notes: item.notes || null,
            })
            .select("id")
            .single();

          if (itemError) throw itemError;

          // Create customizations
          if (item.customizations.length > 0 && orderItem) {
            const customizations = item.customizations.map((c) => ({
              order_item_id: orderItem.id,
              customization_group: c.groupName,
              selected_option: c.optionName,
              price_modifier: c.priceModifier,
            }));

            const { error: custError } = await supabase
              .from("order_item_customizations")
              .insert(customizations);
            if (custError) throw custError;
          }
        }
      }

      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-lg py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
          <Button onClick={() => navigate("/enterprises")}>Browse Services</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <Card className="shadow-card">
                <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="09XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              {/* Fulfillment */}
              <Card className="shadow-card">
                <CardHeader><CardTitle>Fulfillment</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={fulfillmentType} onValueChange={setFulfillmentType}>
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-smooth ${fulfillmentType === "pickup" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Store className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Store Pickup</p>
                          <p className="text-sm text-muted-foreground">Pick up at the shop — free</p>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-smooth ${fulfillmentType === "delivery" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Truck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Delivery</p>
                          <p className="text-sm text-muted-foreground">We'll deliver to your address</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {fulfillmentType === "delivery" && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address *</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card className="shadow-card">
                <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                    {[
                      { value: "gcash", icon: Smartphone, label: "GCash", desc: "Pay via GCash e-wallet" },
                      { value: "maya", icon: Smartphone, label: "Maya (PayMaya)", desc: "Pay via Maya e-wallet" },
                      { value: "bank_transfer", icon: Building2, label: "Online Banking", desc: "BPI, BDO, Metrobank, etc." },
                      { value: "grabpay", icon: Wallet, label: "GrabPay", desc: "Pay via GrabPay wallet" },
                      { value: "cash", icon: Banknote, label: fulfillmentType === "delivery" ? "Cash on Delivery" : "Cash on Pickup", desc: fulfillmentType === "delivery" ? "Pay when you receive your order" : "Pay when you pick up your order" },
                    ].map((method) => (
                      <div
                        key={method.value}
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-smooth ${
                          paymentMethod === method.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                      >
                        <RadioGroupItem value={method.value} id={method.value} />
                        <Label htmlFor={method.value} className="flex items-center gap-3 cursor-pointer flex-1">
                          <method.icon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{method.label}</p>
                            <p className="text-sm text-muted-foreground">{method.desc}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="shadow-card sticky top-24">
                <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div className="min-w-0 mr-2">
                          <span className="truncate block">{item.productName}</span>
                          <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                        </div>
                        <span className="shrink-0">₱{getCartItemTotal(item).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Discount code */}
                  <div className="space-y-2">
                    <Label className="text-sm">Discount Code</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        disabled={discountApplied}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleApplyDiscount}
                        disabled={applyingDiscount || discountApplied}
                      >
                        {applyingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                      </Button>
                    </div>
                    {discountApplied && (
                      <p className="text-xs text-success flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Discount applied: -₱{discountAmount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₱{subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Discount</span>
                        <span>-₱{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fulfillment</span>
                      <span className="text-success">
                        {fulfillmentType === "pickup" ? "Free" : "Free"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₱{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
