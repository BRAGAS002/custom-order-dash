import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useMyShop() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-shop", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useMyShopServices(shopId: string | undefined) {
  return useQuery({
    queryKey: ["my-services", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });
}

export function useMyShopOrders(shopId: string | undefined, statusFilter?: string) {
  return useQuery({
    queryKey: ["my-shop-orders", shopId, statusFilter],
    queryFn: async () => {
      if (!shopId) return [];
      let query = supabase
        .from("orders")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("order_status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });
}

export function useMyShopStats(shopId: string | undefined) {
  return useQuery({
    queryKey: ["my-shop-stats", shopId],
    queryFn: async () => {
      if (!shopId) return null;
      const { data: orders, error } = await supabase
        .from("orders")
        .select("total_amount, order_status, created_at")
        .eq("shop_id", shopId);
      if (error) throw error;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const todayOrders = orders?.filter((o) => o.created_at && o.created_at >= todayStart) ?? [];
      const monthOrders = orders?.filter((o) => o.created_at && o.created_at >= monthStart) ?? [];

      return {
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((s, o) => s + Number(o.total_amount), 0),
        monthlyRevenue: monthOrders.reduce((s, o) => s + Number(o.total_amount), 0),
        totalOrders: orders?.length ?? 0,
        pendingOrders: orders?.filter((o) => o.order_status === "pending").length ?? 0,
        completedOrders: orders?.filter((o) => o.order_status === "completed").length ?? 0,
        processingOrders: orders?.filter((o) => o.order_status === "processing" || o.order_status === "confirmed").length ?? 0,
      };
    },
    enabled: !!shopId,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status, changedBy }: { orderId: string; status: string; changedBy: string }) => {
      const updates: any = { order_status: status, updated_at: new Date().toISOString() };
      if (status === "completed") updates.completed_at = new Date().toISOString();

      const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
      if (error) throw error;

      // Add status history
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status,
        changed_by: changedBy,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-shop-stats"] });
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (service: {
      name: string;
      description?: string;
      base_price: number;
      category?: string;
      shop_id: string;
      estimated_days?: number;
      min_order_quantity?: number;
      max_order_quantity?: number;
      rush_support?: boolean;
      file_upload_required?: boolean;
      fulfillment_type?: string;
      image_url?: string;
    }) => {
      const { data, error } = await supabase.from("products").insert(service).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
    },
  });
}

export function useToggleServiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("products").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
    },
  });
}

export function useUpdateShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("shops").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop"] });
    },
  });
}
