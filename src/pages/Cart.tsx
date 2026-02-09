import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getCartItems,
  removeFromCart,
  updateCartQuantity,
  getCartItemTotal,
  getCartTotal,
  saveCartItems,
  type CartItem,
} from "@/lib/cart";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(getCartItems());
  }, []);

  const handleUpdateQuantity = (index: number, change: number) => {
    updateCartQuantity(index, cartItems[index].quantity + change);
    setCartItems(getCartItems());
  };

  const handleRemove = (index: number) => {
    removeFromCart(index);
    setCartItems(getCartItems());
  };

  const subtotal = getCartTotal(cartItems);

  // Group items by shop
  const shopGroups = cartItems.reduce<Record<string, { shopName: string; items: (CartItem & { index: number })[] }>>(
    (groups, item, index) => {
      if (!groups[item.shopId]) {
        groups[item.shopId] = { shopName: item.shopName, items: [] };
      }
      groups[item.shopId].items.push({ ...item, index });
      return groups;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Browse our marketplace to find printing services</p>
              <Button onClick={() => navigate("/enterprises")}>Browse Printing Shops</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(shopGroups).map(([shopId, group]) => (
                <div key={shopId}>
                  <h3 className="font-semibold text-lg mb-3">{group.shopName}</h3>
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <Card key={item.index} className="shadow-card">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-20 h-20 rounded-lg object-cover" />
                            ) : (
                              <div className="w-20 h-20 rounded-lg gradient-accent opacity-80 shrink-0" />
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h4 className="font-semibold">{item.productName}</h4>
                                  {item.customizations.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.customizations.map((c, ci) => (
                                        <Badge key={ci} variant="outline" className="text-xs">
                                          {c.optionName}
                                          {c.priceModifier > 0 && ` (+₱${c.priceModifier})`}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  {item.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 truncate">{item.notes}</p>
                                  )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemove(item.index)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>

                              <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.index, -1)}>
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.index, 1)}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="font-semibold text-lg text-primary">
                                  ₱{getCartItemTotal(item).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-card sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                      <span>₱{subtotal.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₱{subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/enterprises")}>
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
