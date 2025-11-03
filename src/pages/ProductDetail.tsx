import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Mock product data for printing services
const mockProduct = {
  id: 1,
  name: "Business Cards",
  description: "Professional business cards printed on premium cardstock with your custom design",
  basePrice: 500.00,
  enterpriseName: "Baguio Print Express",
  customizationGroups: [
    {
      id: 1,
      name: "Paper Type",
      type: "Single Select",
      isRequired: true,
      options: [
        { id: 1, name: "Standard (300gsm)", priceModifier: 0 },
        { id: 2, name: "Premium (350gsm)", priceModifier: 150 },
        { id: 3, name: "Luxury (400gsm)", priceModifier: 300 },
      ],
    },
    {
      id: 2,
      name: "Finish",
      type: "Single Select",
      isRequired: true,
      options: [
        { id: 4, name: "Matte", priceModifier: 0 },
        { id: 5, name: "Glossy", priceModifier: 50 },
        { id: 6, name: "UV Coating", priceModifier: 100 },
      ],
    },
    {
      id: 3,
      name: "Additional Features",
      type: "Multi Select",
      isRequired: false,
      options: [
        { id: 7, name: "Rounded Corners", priceModifier: 50 },
        { id: 8, name: "Embossing", priceModifier: 200 },
        { id: 9, name: "Foil Stamping", priceModifier: 300 },
      ],
    },
  ],
};

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
  const [notes, setNotes] = useState("");

  const calculateTotal = () => {
    let total = mockProduct.basePrice;
    
    Object.values(selectedOptions).forEach(groupOptions => {
      groupOptions.forEach(optionId => {
        mockProduct.customizationGroups.forEach(group => {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            total += option.priceModifier;
          }
        });
      });
    });
    
    return total * quantity;
  };

  const handleSingleSelect = (groupId: number, optionId: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: [optionId],
    }));
  };

  const handleMultiSelect = (groupId: number, optionId: number, checked: boolean) => {
    setSelectedOptions(prev => {
      const currentOptions = prev[groupId] || [];
      if (checked) {
        return {
          ...prev,
          [groupId]: [...currentOptions, optionId],
        };
      } else {
        return {
          ...prev,
          [groupId]: currentOptions.filter(id => id !== optionId),
        };
      }
    });
  };

  const handleAddToCart = () => {
    // Validate required selections
    const requiredGroups = mockProduct.customizationGroups.filter(g => g.isRequired);
    const missingRequired = requiredGroups.some(group => !selectedOptions[group.id]?.length);
    
    if (missingRequired) {
      toast.error("Please select all required options");
      return;
    }

    toast.success("Added to cart!");
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="h-96 gradient-accent rounded-lg mb-4" />
            <div className="space-y-2">
              <Badge variant="secondary">{mockProduct.enterpriseName}</Badge>
              <h1>{mockProduct.name}</h1>
              <p className="text-lg text-muted-foreground">{mockProduct.description}</p>
              <div className="text-3xl font-bold text-primary">
                ${mockProduct.basePrice.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {mockProduct.customizationGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {group.name}
                    {group.isRequired && (
                      <Badge variant="destructive">Required</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {group.type === "Single Select" ? (
                    <RadioGroup
                      value={selectedOptions[group.id]?.[0]?.toString()}
                      onValueChange={(value) => handleSingleSelect(group.id, parseInt(value))}
                    >
                      {group.options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-smooth">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                            <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
                              {option.name}
                            </Label>
                          </div>
                          {option.priceModifier !== 0 && (
                            <span className="text-sm font-medium text-primary">
                              +${option.priceModifier.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {group.options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-smooth">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`option-${option.id}`}
                              checked={selectedOptions[group.id]?.includes(option.id)}
                              onCheckedChange={(checked) => 
                                handleMultiSelect(group.id, option.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
                              {option.name}
                            </Label>
                          </div>
                          {option.priceModifier !== 0 && (
                            <span className="text-sm font-medium text-primary">
                              +${option.priceModifier.toFixed(2)}
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
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Special instructions for your print job (e.g., design preferences, delivery notes)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="hero" size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart • ${calculateTotal().toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
