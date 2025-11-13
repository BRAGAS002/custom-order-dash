import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { socket_id, channel_name } = await req.json();

    // Verify user has access to this order channel
    const orderId = channel_name.replace('private-order-', '');
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customer_id, shops!inner(owner_id)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Check if user is customer or business owner
    const isCustomer = order.customer_id === user.id;
    const isBusinessOwner = (order.shops as any).owner_id === user.id;

    if (!isCustomer && !isBusinessOwner) {
      throw new Error('Unauthorized access to this channel');
    }

    // Create Pusher signature
    const pusherAppId = Deno.env.get('PUSHER_APP_ID');
    const pusherSecret = Deno.env.get('PUSHER_SECRET');
    
    const stringToSign = `${socket_id}:${channel_name}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(pusherSecret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(stringToSign)
    );
    
    const authSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const auth = `${pusherAppId}:${authSignature}`;

    return new Response(
      JSON.stringify({ auth }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pusher-auth:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
