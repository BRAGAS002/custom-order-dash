import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [shopsRes, ordersRes, usersRes, revenueRes] = await Promise.all([
        supabase.from("shops").select("id, status", { count: "exact" }),
        supabase.from("orders").select("id, order_status", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("orders").select("total_amount"),
      ]);

      const totalShops = shopsRes.count ?? 0;
      const activeShops = shopsRes.data?.filter((s) => s.status === "active").length ?? 0;
      const totalOrders = ordersRes.count ?? 0;
      const pendingOrders = ordersRes.data?.filter((o) => o.order_status === "pending").length ?? 0;
      const activeUsers = usersRes.count ?? 0;
      const monthlyRevenue = revenueRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;

      return { totalShops, activeShops, totalOrders, pendingOrders, activeUsers, monthlyRevenue };
    },
  });
}

export function useAdminShops() {
  return useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminUserRoles() {
  return useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("key");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateShopVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shopId, status }: { shopId: string; status: string }) => {
      const { error } = await supabase
        .from("shops")
        .update({ verification_status: status })
        .eq("id", shopId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUpdateShopStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shopId, status }: { shopId: string; status: string }) => {
      const { error } = await supabase
        .from("shops")
        .update({ status })
        .eq("id", shopId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: any; description?: string }) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert({ key, value, description, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, notes }: { reportId: string; notes: string }) => {
      const { error } = await supabase
        .from("user_reports")
        .update({ status: "resolved", admin_notes: notes, resolved_at: new Date().toISOString() })
        .eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}
