
-- =============================================
-- UniPrint Full Database Schema Migration
-- =============================================

-- 1. Enhance existing tables
-- =============================================

-- Products/Services enhancements
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rush_support boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fulfillment_type text DEFAULT 'both',
ADD COLUMN IF NOT EXISTS file_upload_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_size_support boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS min_order_quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_order_quantity integer,
ADD COLUMN IF NOT EXISTS estimated_days integer DEFAULT 3;

-- Shops enhancements
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS business_documents jsonb,
ADD COLUMN IF NOT EXISTS gcash_number text,
ADD COLUMN IF NOT EXISTS gcash_name text,
ADD COLUMN IF NOT EXISTS allowed_payment_methods text[] DEFAULT ARRAY['cash'],
ADD COLUMN IF NOT EXISTS supported_fulfillment text[] DEFAULT ARRAY['pickup'],
ADD COLUMN IF NOT EXISTS rush_options jsonb;

-- Orders enhancements  
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS fulfillment_type text DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS rush_type text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS rush_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_code_id uuid,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_date date,
ADD COLUMN IF NOT EXISTS completed_at timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- Profiles enhancements
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret text;

-- 2. New tables
-- =============================================

-- Customization Groups
CREATE TABLE public.customization_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customization Options
CREATE TABLE public.customization_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.customization_groups(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price_modifier numeric DEFAULT 0,
  is_default boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Pricing Rules
CREATE TABLE public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  rule_type text NOT NULL,
  min_quantity integer,
  max_quantity integer,
  price_per_unit numeric,
  formula text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service Images
CREATE TABLE public.service_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Saved Services (Bookmarks)
CREATE TABLE public.saved_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  collection_name text DEFAULT 'Default',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Order Items (multi-item orders)
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  design_file_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Order Item Customizations
CREATE TABLE public.order_item_customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL,
  customization_group text NOT NULL,
  selected_option text NOT NULL,
  price_modifier numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Order Status History
CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  changed_by uuid NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Order Design Files
CREATE TABLE public.order_design_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_by uuid NOT NULL,
  status text DEFAULT 'pending',
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  reference_number text,
  proof_url text,
  confirmed_by uuid,
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES public.payments(id),
  order_id uuid REFERENCES public.orders(id),
  shop_id uuid REFERENCES public.shops(id),
  amount numeric NOT NULL,
  transaction_type text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- AI Image Generations
CREATE TABLE public.ai_image_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prompt text NOT NULL,
  image_url text,
  status text DEFAULT 'pending',
  model_used text DEFAULT 'gemini',
  created_at timestamptz DEFAULT now()
);

-- Design Assets (user uploads)
CREATE TABLE public.design_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size integer,
  created_at timestamptz DEFAULT now()
);

-- Discount Codes
CREATE TABLE public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  min_order_amount numeric DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Conversations (upgraded chat)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  customer_id uuid NOT NULL,
  business_id uuid NOT NULL,
  shop_id uuid REFERENCES public.shops(id),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Reports
CREATE TABLE public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_type text NOT NULL,
  reported_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  admin_notes text,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- System Settings
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid NOT NULL,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(order_id, customer_id)
);

-- 3. Enable RLS on all new tables
-- =============================================
ALTER TABLE public.customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_design_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_image_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- =============================================

-- Customization Groups: Anyone can view (for product pages), shop owners can manage
CREATE POLICY "Anyone can view customization groups" ON public.customization_groups FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage customization groups" ON public.customization_groups FOR ALL USING (
  EXISTS (SELECT 1 FROM products JOIN shops ON shops.id = products.shop_id WHERE products.id = customization_groups.product_id AND shops.owner_id = auth.uid())
);

-- Customization Options: Anyone can view, shop owners can manage
CREATE POLICY "Anyone can view customization options" ON public.customization_options FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage customization options" ON public.customization_options FOR ALL USING (
  EXISTS (SELECT 1 FROM customization_groups JOIN products ON products.id = customization_groups.product_id JOIN shops ON shops.id = products.shop_id WHERE customization_groups.id = customization_options.group_id AND shops.owner_id = auth.uid())
);

-- Pricing Rules: Anyone can view active, shop owners can manage
CREATE POLICY "Anyone can view active pricing rules" ON public.pricing_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Shop owners can manage pricing rules" ON public.pricing_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM products JOIN shops ON shops.id = products.shop_id WHERE products.id = pricing_rules.product_id AND shops.owner_id = auth.uid())
);

-- Service Images: Anyone can view, shop owners can manage
CREATE POLICY "Anyone can view service images" ON public.service_images FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage service images" ON public.service_images FOR ALL USING (
  EXISTS (SELECT 1 FROM products JOIN shops ON shops.id = products.shop_id WHERE products.id = service_images.product_id AND shops.owner_id = auth.uid())
);

-- Saved Services: Users manage their own
CREATE POLICY "Users can view own saved services" ON public.saved_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save services" ON public.saved_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave services" ON public.saved_services FOR DELETE USING (auth.uid() = user_id);

-- Order Items: Customers see their order items, shop owners see theirs
CREATE POLICY "Customers can view their order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Shop owners can view their order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders JOIN shops ON shops.id = orders.shop_id WHERE orders.id = order_items.order_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Customers can create order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Order Item Customizations
CREATE POLICY "Customers can view their customizations" ON public.order_item_customizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM order_items JOIN orders ON orders.id = order_items.order_id WHERE order_items.id = order_item_customizations.order_item_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Shop owners can view order customizations" ON public.order_item_customizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM order_items JOIN orders ON orders.id = order_items.order_id JOIN shops ON shops.id = orders.shop_id WHERE order_items.id = order_item_customizations.order_item_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Customers can add customizations" ON public.order_item_customizations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM order_items JOIN orders ON orders.id = order_items.order_id WHERE order_items.id = order_item_customizations.order_item_id AND orders.customer_id = auth.uid())
);

-- Order Status History
CREATE POLICY "Customers can view their order history" ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Shop owners can view and add status history" ON public.order_status_history FOR ALL USING (
  EXISTS (SELECT 1 FROM orders JOIN shops ON shops.id = orders.shop_id WHERE orders.id = order_status_history.order_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all status history" ON public.order_status_history FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Order Design Files
CREATE POLICY "Customers can manage their design files" ON public.order_design_files FOR ALL USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_design_files.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Shop owners can view and review design files" ON public.order_design_files FOR ALL USING (
  EXISTS (SELECT 1 FROM orders JOIN shops ON shops.id = orders.shop_id WHERE orders.id = order_design_files.order_id AND shops.owner_id = auth.uid())
);

-- Payments
CREATE POLICY "Customers can view their payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Customers can create payments" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Shop owners can manage their payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM orders JOIN shops ON shops.id = orders.shop_id WHERE orders.id = payments.order_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Transactions
CREATE POLICY "Shop owners can view their transactions" ON public.transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = transactions.shop_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- AI Image Generations
CREATE POLICY "Users can view own AI generations" ON public.ai_image_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create AI generations" ON public.ai_image_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Design Assets
CREATE POLICY "Users can manage own design assets" ON public.design_assets FOR ALL USING (auth.uid() = user_id);

-- Discount Codes: Anyone can view active codes, shop owners manage theirs
CREATE POLICY "Anyone can view active discount codes" ON public.discount_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Shop owners can manage their discount codes" ON public.discount_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE shops.id = discount_codes.shop_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all discount codes" ON public.discount_codes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Conversations
CREATE POLICY "Customers can view their conversations" ON public.conversations FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Business owners can view their conversations" ON public.conversations FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Customers can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Business owners can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = business_id);

-- User Reports
CREATE POLICY "Users can create reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage all reports" ON public.user_reports FOR ALL USING (has_role(auth.uid(), 'admin'));

-- System Settings: Admins only
CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read system settings" ON public.system_settings FOR SELECT USING (true);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL USING (has_role(auth.uid(), 'admin'));

-- 5. Storage buckets for file uploads
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('design-files', 'design-files', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('business-documents', 'business-documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-avatars', 'profile-avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-generations', 'ai-generations', true) ON CONFLICT DO NOTHING;

-- Storage policies
-- Service images: public read, shop owners write
CREATE POLICY "Anyone can view service images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Shop owners can upload service images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');
CREATE POLICY "Shop owners can update service images" ON storage.objects FOR UPDATE USING (bucket_id = 'service-images' AND auth.role() = 'authenticated');
CREATE POLICY "Shop owners can delete service images" ON storage.objects FOR DELETE USING (bucket_id = 'service-images' AND auth.role() = 'authenticated');

-- Shop logos: public read, shop owners write
CREATE POLICY "Anyone can view shop logos" ON storage.objects FOR SELECT USING (bucket_id = 'shop-logos');
CREATE POLICY "Authenticated users can upload shop logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop-logos' AND auth.role() = 'authenticated');

-- Design files: owner read/write
CREATE POLICY "Users can view own design files" ON storage.objects FOR SELECT USING (bucket_id = 'design-files' AND auth.role() = 'authenticated');
CREATE POLICY "Users can upload design files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'design-files' AND auth.role() = 'authenticated');

-- Payment proofs: authenticated users
CREATE POLICY "Authenticated can view payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated can upload payment proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

-- Profile avatars: public read, owner write
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');

-- AI generations: public read, authenticated write
CREATE POLICY "Anyone can view AI generations" ON storage.objects FOR SELECT USING (bucket_id = 'ai-generations');
CREATE POLICY "Users can upload AI generations" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ai-generations' AND auth.role() = 'authenticated');

-- Business documents: private, authenticated upload
CREATE POLICY "Authenticated can view business docs" ON storage.objects FOR SELECT USING (bucket_id = 'business-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated can upload business docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'business-documents' AND auth.role() = 'authenticated');

-- 6. Triggers for updated_at
-- =============================================
CREATE TRIGGER update_customization_groups_updated_at BEFORE UPDATE ON public.customization_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Enable realtime for key tables
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- 8. Seed default system settings
-- =============================================
INSERT INTO public.system_settings (key, value, description) VALUES
  ('platform_name', '"UniPrint"', 'Platform display name'),
  ('platform_tagline', '"Your One-Stop Print Service Marketplace"', 'Platform tagline'),
  ('tax_rate', '0', 'Tax rate percentage'),
  ('order_auto_complete_days', '7', 'Days after which orders auto-complete'),
  ('order_overdue_cancel_days', '14', 'Days after which overdue orders get cancelled'),
  ('ai_generation_daily_limit', '10', 'Daily AI generation limit per user')
ON CONFLICT (key) DO NOTHING;
