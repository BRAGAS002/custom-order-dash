import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSavedServices, useToggleSaveService } from "@/hooks/useSavedServices";
import { toast } from "sonner";
import { useState } from "react";

export default function SavedServices() {
  const navigate = useNavigate();
  const { data: saved, isLoading } = useSavedServices();
  const toggleSave = useToggleSaveService();
  const [activeCollection, setActiveCollection] = useState("All");

  const collections = ["All", ...new Set(saved?.map((s) => s.collection_name || "Default") ?? [])];
  const filtered = activeCollection === "All"
    ? saved
    : saved?.filter((s) => (s.collection_name || "Default") === activeCollection);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Saved Services</h1>
        </div>

        {/* Collection filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {collections.map((col) => (
            <Button
              key={col}
              variant={activeCollection === col ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCollection(col)}
            >
              {col}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item: any) => (
              <Card key={item.id} className="shadow-card hover:shadow-card-hover transition-smooth cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1" onClick={() => navigate(`/products/${item.product_id}`)}>
                      <h3 className="font-semibold truncate group-hover:text-primary transition-smooth">
                        {item.products?.name ?? "Service"}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.products?.shops?.name ?? ""}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        toggleSave.mutate({ productId: item.product_id }, {
                          onSuccess: () => toast.success("Removed from saved"),
                        });
                      }}
                    >
                      <Heart className="h-5 w-5 fill-destructive text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ₱{Number(item.products?.base_price ?? 0).toLocaleString()}
                    </span>
                    {item.products?.category && (
                      <Badge variant="outline">{item.products.category}</Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">{item.collection_name || "Default"}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No saved services yet</h2>
              <p className="text-muted-foreground mb-6">Browse the marketplace and save services you're interested in</p>
              <Button onClick={() => navigate("/enterprises")}>Browse Services</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
