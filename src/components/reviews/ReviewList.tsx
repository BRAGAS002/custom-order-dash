import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ReviewListProps {
  shopId?: string;
  productId?: string;
  limit?: number;
}

export const ReviewList = ({ shopId, productId, limit = 10 }: ReviewListProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["reviews-list", shopId, productId],
    queryFn: async () => {
      let query = supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(limit);
      if (shopId) query = query.eq("shop_id", shopId);
      if (productId) query = query.eq("product_id", productId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(shopId || productId),
  });

  if (isLoading || !data?.length) return null;

  const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Reviews ({data.length})</span>
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-warning text-warning" />
            <span className="text-base font-medium">{avg.toFixed(1)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((review) => (
          <div key={review.id} className="flex gap-3 border-b last:border-0 pb-4 last:pb-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">C</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {review.created_at && formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              {review.comment && <p className="text-sm mt-1 text-muted-foreground">{review.comment}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
