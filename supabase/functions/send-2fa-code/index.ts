import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
    if (!authHeader) throw new Error('No authorization header');

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user }, error: userError } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (userError || !user) throw new Error('Unauthorized');

    const { action } = await req.json();

    if (action === 'generate') {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      // Store code as 2FA secret temporarily
      await supabase.from('profiles').update({
        two_factor_secret: JSON.stringify({ code, expires_at: expiresAt }),
      }).eq('id', user.id);

      // In production you'd send an email here. For now, we return the code for testing.
      // The code would be sent via email integration.
      console.log(`2FA code for ${user.email}: ${code}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Verification code sent to your email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      const { code } = await req.json();
      const { data: profile } = await supabase.from('profiles').select('two_factor_secret').eq('id', user.id).single();

      if (!profile?.two_factor_secret) {
        return new Response(JSON.stringify({ verified: false, error: 'No code generated' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const stored = JSON.parse(profile.two_factor_secret as string);
      if (new Date(stored.expires_at) < new Date()) {
        return new Response(JSON.stringify({ verified: false, error: 'Code expired' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (stored.code !== code) {
        return new Response(JSON.stringify({ verified: false, error: 'Invalid code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Mark 2FA as enabled
      await supabase.from('profiles').update({
        two_factor_enabled: true,
        two_factor_secret: null,
      }).eq('id', user.id);

      return new Response(JSON.stringify({ verified: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'toggle') {
      const { enabled } = await req.json();
      await supabase.from('profiles').update({
        two_factor_enabled: enabled,
        two_factor_secret: null,
      }).eq('id', user.id);

      return new Response(JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
