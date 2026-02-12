import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useShops, useProducts, useProductCategories, useShopById } from "@/hooks/useMarketplace";
import { ShopCard } from "@/components/marketplace/ShopCard";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag } from "lucide-react";
import { ReportDialog } from "@/components/marketplace/ReportDialog";

export default function Enterprises() {
  const { enterpriseId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"shops" | "services">("shops");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");

  const { data: shops, isLoading: shopsLoading } = useShops(searchQuery || undefined);
  const { data: products, isLoading: productsLoading } = useProducts({
    shopId: enterpriseId,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: !enterpriseId ? searchQuery || undefined : undefined,
  });
  const { data: categories } = useProductCategories();
  const { data: shop } = useShopById(enterpriseId);

  // Filter and sort products
  const filteredProducts = (products ?? []).filter((p) => {
    if (priceRange === "under100") return p.base_price < 100;
    if (priceRange === "100-500") return p.base_price >= 100 && p.base_price <= 500;
    if (priceRange === "500-1000") return p.base_price >= 500 && p.base_price <= 1000;
    if (priceRange === "over1000") return p.base_price > 1000;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.base_price - b.base_price;
    if (sortBy === "price-high") return b.base_price - a.base_price;
    if (sortBy === "newest") return 0; // already ordered by created_at desc
    return (b.total_orders ?? 0) - (a.total_orders ?? 0); // popular
  });

  // Shop detail view
  if (enterpriseId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Button variant="ghost" onClick={() => navigate("/enterprises")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Shops
          </Button>

          {shop && (
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                {shop.logo_url && (
                  <img src={shop.logo_url} alt={shop.name} className="w-20 h-20 rounded-xl object-cover border" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold">{shop.name}</h1>
                    {shop.verification_status === "verified" && (
                      <Badge className="bg-success text-success-foreground">Verified</Badge>
                    )}
                  </div>
                  {shop.description && <p className="text-muted-foreground mb-2">{shop.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {shop.address && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{shop.address}</span></div>}
                    <div className="flex items-center gap-1"><ShoppingBag className="h-4 w-4" /><span>{shop.total_orders ?? 0} orders</span></div>
                  </div>
                </div>
                <ReportDialog reportedId={shop.id} reportedType="shop" />
              </div>
            </div>
          )}

          {categories && categories.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map((cat) => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {productsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="text-center py-16"><p className="text-lg text-muted-foreground">No services available yet</p></div>
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
          <p className="text-lg text-muted-foreground mb-6">Discover print shops and services across Baguio — order with confidence</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search shops or services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]"><SlidersHorizontal className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low-High</SelectItem>
                  <SelectItem value="price-high">Price: High-Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Price Range" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under100">Under ₱100</SelectItem>
                  <SelectItem value="100-500">₱100 - ₱500</SelectItem>
                  <SelectItem value="500-1000">₱500 - ₱1,000</SelectItem>
                  <SelectItem value="over1000">Over ₱1,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "shops" | "services")} className="space-y-6">
          <TabsList>
            <TabsTrigger value="shops">Print Shops</TabsTrigger>
            <TabsTrigger value="services">All Services</TabsTrigger>
          </TabsList>

          <TabsContent value="shops">
            {shopsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : shops && shops.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-lg text-muted-foreground">{searchQuery ? "No shops found matching your search" : "No print shops available yet"}</p></div>
            )}
          </TabsContent>

          <TabsContent value="services">
            {categories && categories.length > 1 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {categories.map((cat) => (
                  <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </Button>
                ))}
              </div>
            )}
            {productsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-lg text-muted-foreground">{searchQuery ? "No services found matching your search" : "No services available yet"}</p></div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
