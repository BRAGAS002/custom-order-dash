import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShopWithStats {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  status: string | null;
  verification_status: string | null;
  supported_fulfillment: string[] | null;
  allowed_payment_methods: string[] | null;
  total_orders: number | null;
  total_revenue: number | null;
  gcash_number: string | null;
  gcash_name: string | null;
}

export interface ProductWithShop {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category: string | null;
  image_url: string | null;
  is_active: boolean | null;
  estimated_days: number | null;
  min_order_quantity: number | null;
  max_order_quantity: number | null;
  rush_support: boolean | null;
  file_upload_required: boolean | null;
  fulfillment_type: string | null;
  total_orders: number | null;
  shop_id: string;
  shops: {
    id: string;
    name: string;
    address: string | null;
    logo_url: string | null;
  };
}

export function useShops(search?: string) {
  return useQuery({
    queryKey: ["shops", search],
    queryFn: async () => {
      let query = supabase
        .from("shops")
        .select("*")
        .eq("status", "active");

      if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
      }

      const { data, error } = await query.order("total_orders", { ascending: false });
      if (error) throw error;
      return data as ShopWithStats[];
    },
  });
}

export function useShopById(shopId: string | undefined) {
  return useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      if (!shopId) return null;
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("id", shopId)
        .maybeSingle();
      if (error) throw error;
      return data as ShopWithStats | null;
    },
    enabled: !!shopId,
  });
}

export function useProducts(filters?: {
  shopId?: string;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, shops!inner(id, name, address, logo_url)")
        .eq("is_active", true);

      if (filters?.shopId) {
        query = query.eq("shop_id", filters.shopId);
      }
      if (filters?.category && filters.category !== "All") {
        query = query.eq("category", filters.category);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order("total_orders", { ascending: false });
      if (error) throw error;
      return data as unknown as ProductWithShop[];
    },
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true)
        .not("category", "is", null);
      if (error) throw error;
      const categories = [...new Set(data?.map((p) => p.category).filter(Boolean))];
      return ["All", ...categories] as string[];
    },
  });
}

export function useProductById(productId: string | undefined) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*, shops!inner(id, name, address, logo_url, gcash_number, gcash_name, allowed_payment_methods, supported_fulfillment)")
        .eq("id", productId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ProductWithShop & {
        shops: ShopWithStats;
      };
    },
    enabled: !!productId,
  });
}

export function useProductCustomizations(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-customizations", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("customization_groups")
        .select("*, customization_options(*)")
        .eq("product_id", productId)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}

export function useProductImages(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-images", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("service_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}

export function useShopReviews(shopId: string | undefined) {
  return useQuery({
    queryKey: ["shop-reviews", shopId],
    queryFn: async () => {
      if (!shopId) return { reviews: [], average: 0, count: 0 };
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("shop_id", shopId);
      if (error) throw error;
      const count = data?.length ?? 0;
      const average = count > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / count : 0;
      return { reviews: data, average: Math.round(average * 10) / 10, count };
    },
    enabled: !!shopId,
  });
}
