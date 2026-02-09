import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useShops, useProducts, useProductCategories, useShopById } from "@/hooks/useMarketplace";
import { ShopCard } from "@/components/marketplace/ShopCard";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ShoppingBag } from "lucide-react";

export default function Enterprises() {
  const { enterpriseId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"shops" | "services">("shops");

  const { data: shops, isLoading: shopsLoading } = useShops(searchQuery || undefined);
  const { data: products, isLoading: productsLoading } = useProducts({
    shopId: enterpriseId,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: !enterpriseId ? searchQuery || undefined : undefined,
  });
  const { data: categories } = useProductCategories();
  const { data: shop } = useShopById(enterpriseId);

  // Shop detail view
  if (enterpriseId) {
    const shopProducts = products ?? [];

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Button variant="ghost" onClick={() => navigate("/enterprises")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Button>

          {shop && (
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                {shop.logo_url && (
                  <img src={shop.logo_url} alt={shop.name} className="w-20 h-20 rounded-xl object-cover border" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold">{shop.name}</h1>
                    {shop.verification_status === "verified" && (
                      <Badge className="bg-success text-success-foreground">Verified</Badge>
                    )}
                  </div>
                  {shop.description && <p className="text-muted-foreground mb-2">{shop.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {shop.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{shop.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" />
                      <span>{shop.total_orders ?? 0} orders</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category filter */}
          {categories && categories.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {productsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : shopProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No products available yet</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Default marketplace view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Printing Marketplace</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover print shops and services across Baguio — order with confidence
          </p>

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search shops or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "shops" | "services")} className="space-y-6">
          <TabsList>
            <TabsTrigger value="shops">Print Shops</TabsTrigger>
            <TabsTrigger value="services">All Services</TabsTrigger>
          </TabsList>

          <TabsContent value="shops">
            {shopsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : shops && shops.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  {searchQuery ? "No shops found matching your search" : "No print shops available yet"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="services">
            {categories && categories.length > 1 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}

            {productsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  {searchQuery ? "No services found matching your search" : "No services available yet"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
