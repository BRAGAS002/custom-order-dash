import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useSavedServices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-services", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_services")
        .select("*, products:product_id(id, name, base_price, image_url, category, shops:shop_id(id, name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useToggleSaveService() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, collection }: { productId: string; collection?: string }) => {
      if (!user) throw new Error("Not authenticated");
      // Check if already saved
      const { data: existing } = await supabase
        .from("saved_services")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("saved_services").delete().eq("id", existing.id);
        if (error) throw error;
        return { saved: false };
      } else {
        const { error } = await supabase.from("saved_services").insert({
          user_id: user.id,
          product_id: productId,
          collection_name: collection || "Default",
        });
        if (error) throw error;
        return { saved: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-services"] });
    },
  });
}

export function useIsServiceSaved(productId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-saved", user?.id, productId],
    queryFn: async () => {
      if (!user || !productId) return false;
      const { data } = await supabase
        .from("saved_services")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!productId,
  });
}
