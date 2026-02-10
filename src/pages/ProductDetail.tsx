import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, ShoppingCart, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProductById, useProductCustomizations, useProductImages } from "@/hooks/useMarketplace";
import { addToCart } from "@/lib/cart";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const { data: product, isLoading: productLoading } = useProductById(productId);
  const { data: customizations, isLoading: custLoading } = useProductCustomizations(productId);
  const { data: images } = useProductImages(productId);

  const isLoading = productLoading || custLoading;

  const calculateTotal = () => {
    if (!product) return 0;
    let total = product.base_price;

    if (customizations) {
      customizations.forEach((group) => {
        const groupSelected = selectedOptions[group.id] || [];
        group.customization_options?.forEach((option: any) => {
          if (groupSelected.includes(option.id)) {
            total += Number(option.price_modifier ?? 0);
          }
        });
      });
    }

    return total * quantity;
  };

  const handleSingleSelect = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: [optionId] }));
  };

  const handleMultiSelect = (groupId: string, optionId: string, checked: boolean) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      return {
        ...prev,
        [groupId]: checked ? [...current, optionId] : current.filter((id) => id !== optionId),
      };
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate required groups
    const requiredGroups = customizations?.filter((g) => g.is_required) || [];
    const missingRequired = requiredGroups.some((group) => !selectedOptions[group.id]?.length);

    if (missingRequired) {
      toast.error("Please select all required options");
      return;
    }

    // Build customization details for cart
    const cartCustomizations: { groupName: string; optionName: string; priceModifier: number }[] = [];
    customizations?.forEach((group) => {
      const groupSelected = selectedOptions[group.id] || [];
      group.customization_options?.forEach((option: any) => {
        if (groupSelected.includes(option.id)) {
          cartCustomizations.push({
            groupName: group.name,
            optionName: option.name,
            priceModifier: Number(option.price_modifier ?? 0),
          });
        }
      });
    });

    addToCart({
      productId: product.id,
      productName: product.name,
      shopId: product.shop_id,
      shopName: (product as any).shops?.name ?? "Unknown Shop",
      basePrice: product.base_price,
      quantity,
      customizations: cartCustomizations,
      notes,
      imageUrl: product.image_url ?? undefined,
    });

    toast.success("Added to cart!");
    navigate("/cart");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">Service not found</p>
          <Button onClick={() => navigate("/enterprises")}>Browse Services</Button>
        </main>
      </div>
    );
  }

  const primaryImage = images?.find((img) => img.is_primary) ?? images?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            {primaryImage?.image_url || product.image_url ? (
              <img
                src={primaryImage?.image_url ?? product.image_url!}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="h-96 gradient-accent rounded-lg" />
            )}
            {images && images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg border-2 border-transparent hover:border-primary cursor-pointer"
                  />
                ))}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <Badge variant="secondary">{(product as any).shops?.name}</Badge>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {product.description && (
                <p className="text-lg text-muted-foreground">{product.description}</p>
              )}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">₱{product.base_price.toLocaleString()}</span>
                {product.estimated_days && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{product.estimated_days} days</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.rush_support && <Badge variant="outline">Rush available</Badge>}
                {product.file_upload_required && <Badge variant="outline">Design file required</Badge>}
                {product.category && <Badge variant="outline">{product.category}</Badge>}
              </div>
            </div>
          </div>

          {/* Customizations & Add to Cart */}
          <div className="space-y-6">
            {customizations && customizations.length > 0 && customizations.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {group.name}
                    {group.is_required && <Badge variant="destructive">Required</Badge>}
                  </CardTitle>
                  {group.description && (
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Determine single vs multi based on is_required — single select for required groups */}
                  {group.is_required ? (
                    <RadioGroup
                      value={selectedOptions[group.id]?.[0] ?? ""}
                      onValueChange={(value) => handleSingleSelect(group.id, value)}
                    >
                      {group.customization_options
                        ?.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
                        .map((option: any) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-smooth"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={option.id} id={`opt-${option.id}`} />
                              <Label htmlFor={`opt-${option.id}`} className="cursor-pointer">
                                {option.name}
                              </Label>
                            </div>
                            {Number(option.price_modifier) !== 0 && (
                              <span className="text-sm font-medium text-primary">
                                +₱{Number(option.price_modifier).toLocaleString()}
                              </span>
                            )}
                          </div>
                        ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {group.customization_options
                        ?.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
                        .map((option: any) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-smooth"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`opt-${option.id}`}
                                checked={selectedOptions[group.id]?.includes(option.id)}
                                onCheckedChange={(checked) =>
                                  handleMultiSelect(group.id, option.id, checked as boolean)
                                }
                              />
                              <Label htmlFor={`opt-${option.id}`} className="cursor-pointer">
                                {option.name}
                              </Label>
                            </div>
                            {Number(option.price_modifier) !== 0 && (
                              <span className="text-sm font-medium text-primary">
                                +₱{Number(option.price_modifier).toLocaleString()}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader><CardTitle className="text-lg">Special Instructions</CardTitle></CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Special instructions for your print job..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(product.min_order_quantity ?? 1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(product.max_order_quantity ? Math.min(product.max_order_quantity, quantity + 1) : quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart • ₱{calculateTotal().toLocaleString()}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
