import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import type { ShopWithStats } from "@/hooks/useMarketplace";

interface ShopCardProps {
  shop: ShopWithStats;
  reviewData?: { average: number; count: number };
}

export function ShopCard({ shop, reviewData }: ShopCardProps) {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-smooth overflow-hidden group">
      <div className="h-40 gradient-hero relative">
        {shop.logo_url && (
          <img
            src={shop.logo_url}
            alt={shop.name}
            className="absolute bottom-0 left-4 translate-y-1/2 w-16 h-16 rounded-xl border-4 border-card object-cover bg-card"
          />
        )}
        {shop.verification_status === "verified" && (
          <Badge className="absolute top-3 right-3 bg-success text-success-foreground">Verified</Badge>
        )}
      </div>

      <CardHeader className={shop.logo_url ? "pt-10" : ""}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">{shop.name}</h3>
            {shop.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{shop.description}</p>
            )}
          </div>
          {reviewData && reviewData.count > 0 && (
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded shrink-0">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-sm font-medium">{reviewData.average}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          {shop.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
            <span>{shop.total_orders ?? 0} orders completed</span>
          </div>
          {shop.supported_fulfillment && (
            <div className="flex flex-wrap gap-1 mt-2">
              {shop.supported_fulfillment.map((f) => (
                <Badge key={f} variant="outline" className="text-xs capitalize">
                  {f}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="default" className="w-full" asChild>
          <Link to={`/enterprises/${shop.id}`}>View Services</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
