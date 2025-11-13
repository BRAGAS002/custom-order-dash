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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
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

    const { order_id, message, sender_type } = await req.json();

    // Insert message into database
    const { data: chatMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        order_id,
        sender_id: user.id,
        sender_type,
        message,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Trigger Pusher event
    const pusherAppId = Deno.env.get('PUSHER_APP_ID');
    const pusherKey = Deno.env.get('PUSHER_KEY') || 'f7ca062b8f895c3f2497';
    const pusherSecret = Deno.env.get('PUSHER_SECRET');
    const pusherCluster = 'ap1';

    const channelName = `private-order-${order_id}`;
    const eventName = 'new-message';
    
    const body = JSON.stringify({
      name: eventName,
      channel: channelName,
      data: JSON.stringify({
        id: chatMessage.id,
        message: chatMessage.message,
        sender_id: chatMessage.sender_id,
        sender_type: chatMessage.sender_type,
        created_at: chatMessage.created_at,
      }),
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const bodyMd5 = await crypto.subtle.digest('MD5', new TextEncoder().encode(body))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));

    const stringToSign = [
      'POST',
      `/apps/${pusherAppId}/events`,
      `auth_key=${pusherKey}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`,
    ].join('\n');

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

    const pusherUrl = `https://api-${pusherCluster}.pusher.com/apps/${pusherAppId}/events?auth_key=${pusherKey}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}&auth_signature=${authSignature}`;

    const pusherResponse = await fetch(pusherUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!pusherResponse.ok) {
      console.error('Pusher error:', await pusherResponse.text());
      throw new Error('Failed to send message to Pusher');
    }

    return new Response(
      JSON.stringify({ success: true, message: chatMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-message:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
