import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ReviewFormProps {
  orderId: string;
  shopId: string;
  productId?: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ orderId, shopId, productId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user || rating === 0) throw new Error("Please select a rating");
      const { error } = await supabase.from("reviews").insert({
        order_id: orderId,
        shop_id: shopId,
        product_id: productId || null,
        customer_id: user.id,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      queryClient.invalidateQueries({ queryKey: ["shop-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      onSuccess?.();
    },
    onError: (err: any) => toast.error(err.message || "Failed to submit review"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <Button
          onClick={() => submitReview.mutate()}
          disabled={rating === 0 || submitReview.isPending}
          className="w-full"
        >
          {submitReview.isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  );
};
