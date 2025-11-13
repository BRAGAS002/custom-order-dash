-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'business')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Customers can view messages for their orders
CREATE POLICY "Customers can view their order messages"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = chat_messages.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- Business owners can view messages for their shop orders
CREATE POLICY "Shop owners can view their order messages"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    JOIN public.shops ON shops.id = orders.shop_id
    WHERE orders.id = chat_messages.order_id
    AND shops.owner_id = auth.uid()
  )
);

-- Customers can send messages for their orders
CREATE POLICY "Customers can send messages for their orders"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  sender_type = 'customer' AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = chat_messages.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- Business owners can send messages for their shop orders
CREATE POLICY "Business owners can send messages for their orders"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  sender_type = 'business' AND
  EXISTS (
    SELECT 1 FROM public.orders
    JOIN public.shops ON shops.id = orders.shop_id
    WHERE orders.id = chat_messages.order_id
    AND shops.owner_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_order_id ON public.chat_messages(order_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);