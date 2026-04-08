import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "apply-promo-code" up and running!`);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, userId } = await req.json();

    if (!code || !userId) {
      throw new Error('Promo code and user ID are required.');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 1. Find the promo code
    const { data: promoCode, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (promoError || !promoCode) {
      return new Response(JSON.stringify({ error: 'Invalid promo code' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // 2. Check if user has already redeemed this code
    const { data: existingRedemption, error: redemptionError } = await supabase
      .from('user_promos')
      .select('id')
      .eq('user_id', userId)
      .eq('promo_code_id', promoCode.id)
      .single();

    if (existingRedemption) {
       return new Response(JSON.stringify({ error: 'You have already used this promo code.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Apply the promo code
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + promoCode.duration_days);

    // Insert into user_promos
    const { error: insertError } = await supabase.from('user_promos').insert({
      user_id: userId,
      promo_code_id: promoCode.id,
      expires_at: expires_at.toISOString(),
    });

    if (insertError) throw insertError;

    // 4. Update user's subscription based on promo type
    if (promoCode.type === 'VIP') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription: 'vip', subscription_expires_at: expires_at.toISOString() })
        .eq('id', userId);
      if (updateError) throw updateError;
    } else if (promoCode.type === 'PRO') {
        const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription: 'pro', subscription_expires_at: expires_at.toISOString() })
        .eq('id', userId);
      if (updateError) throw updateError;
    }
    // Add other promo types like 'BOOST' here if needed

    return new Response(JSON.stringify({ success: true, message: `Promo code "${promoCode.name}" applied successfully!` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
