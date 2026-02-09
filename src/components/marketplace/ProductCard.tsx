import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProductWithShop } from "@/hooks/useMarketplace";

interface ProductCardProps {
  product: ProductWithShop;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-smooth overflow-hidden group">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-48 gradient-accent opacity-80" />
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-bold truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {product.shops?.name}
            </p>
          </div>
          {product.category && (
            <Badge variant="outline" className="shrink-0 text-xs">
              {product.category}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary">₱{product.base_price.toLocaleString()}</p>
          {product.estimated_days && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{product.estimated_days}d</span>
            </div>
          )}
        </div>
        {product.rush_support && (
          <Badge variant="secondary" className="mt-2 text-xs">Rush available</Badge>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link to={`/products/${product.id}`}>Details</Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link to={`/products/${product.id}`}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            Order
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
