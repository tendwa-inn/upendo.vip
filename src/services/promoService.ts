import { supabase } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { PromoCode } from '../types/admin';

export const promoService = {
  // Map camelCase to snake_case for database
  mapToDbFormat: (promo: Partial<PromoCode>) => {
    const dbPromo: any = {};
    if (promo.name) dbPromo.name = promo.name;
    if (promo.description) dbPromo.description = promo.description;
    if (promo.code) dbPromo.code = promo.code;
    if (promo.type) dbPromo.type = promo.type;
    if (promo.durationDays !== undefined && promo.durationDays !== null) dbPromo.duration_days = promo.durationDays;
    if (promo.maxUses !== undefined && promo.maxUses !== null) dbPromo.max_uses = promo.maxUses;
    if (promo.effect) dbPromo.effect = promo.effect;
    if (promo.expiresAt) dbPromo.expires_at = promo.expiresAt;
    return dbPromo;
  },

  // Map snake_case to camelCase from database
  mapFromDbFormat: (dbPromo: any): PromoCode => {
    return {
      id: String(dbPromo.id),
      code: dbPromo.code,
      name: dbPromo.name,
      description: dbPromo.description,
      type: dbPromo.type,
      durationDays: dbPromo.duration_days,
      maxUses: dbPromo.max_uses,
      timesUsed: dbPromo.times_used || 0,
      createdAt: new Date(dbPromo.created_at),
      expiresAt: dbPromo.expires_at ? new Date(dbPromo.expires_at) : undefined,
      effect: dbPromo.effect || {},
    };
  },

  // Fetch all promo codes
  async getPromoCodes(): Promise<{ active: PromoCode[], expired: PromoCode[] }> {
    const { data: promos, error: promosError } = await supabase
      .from('promo_codes')
      .select('*');

    if (promosError) throw promosError;

    const { data: usage, error: usageError } = await supabase.rpc('get_promo_code_usage_counts');

    if (usageError) {
      console.error('RPC Error get_promo_code_usage_counts:', usageError);
      throw usageError;
    }

    const usageMap = new Map(usage.map(u => [u.promo_code_id, u.times_used]));

    const now = new Date();
    const active: PromoCode[] = [];
    const expired: PromoCode[] = [];

    promos.forEach(code => {
      const timesUsed = usageMap.get(code.id) || 0;
      const isExpired = new Date(code.expires_at) < now || (code.max_uses !== null && timesUsed >= code.max_uses);
      const promo = promoService.mapFromDbFormat(code);
      promo.timesUsed = timesUsed;

      if (isExpired) {
        expired.push(promo);
      } else {
        active.push(promo);
      }
    });

    return { active, expired };
  },

  // Create a new promo code
  async createPromoCode(promoData: Partial<PromoCode>): Promise<PromoCode> {
    const dbPromo = promoService.mapToDbFormat(promoData);
    const { data, error } = await supabase
      .from('promo_codes')
      .insert([dbPromo])
      .select()
      .single();

    if (error) throw error;
    return promoService.mapFromDbFormat(data);
  },

  // Delete a promo code and revert users
  async deletePromoCode(promoId: string): Promise<void> {
    // Get the current session to ensure we are authenticated as an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Create a temporary client with the user's access token to ensure RLS is respected
    const supabaseAuthed = createClient(supabase.supabaseUrl, supabase.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });

    const numericPromoId = Number(promoId);

    const { data: promo, error: promoError } = await supabaseAuthed
      .from('promo_codes')
      .select('*')
      .eq('id', numericPromoId)
      .single();

    if (promoError) throw promoError;
    if (!promo) throw new Error('Promo code not found');

    const { data: userPromos, error: userPromosError } = await supabaseAuthed
      .from('user_promos')
      .select('user_id')
      .eq('promo_code_id', numericPromoId);

    if (userPromosError) throw userPromosError;

    if (promo.type === 'pro_account' || promo.type === 'vip_account') {
      const userIds = userPromos.map(up => up.user_id);
      if (userIds.length > 0) {
        const { error: updateError } = await supabaseAuthed
          .from('profiles')
          .update({ account_type: 'free', subscription_expires_at: null })
          .in('id', userIds);
        if (updateError) throw updateError;
      }
    } else if (promo.type === 'profile_views') {
      const userIds = userPromos.map(up => up.user_id);
      if (userIds.length > 0) {
        const { error: updateError } = await supabaseAuthed
          .from('profiles')
          .update({ can_view_profiles_expires_at: null })
          .in('id', userIds);
        if (updateError) throw updateError;
      }
    }

    const { error: deleteUserPromosError } = await supabaseAuthed
      .from('user_promos')
      .delete()
      .eq('promo_code_id', numericPromoId);

    if (deleteUserPromosError) throw deleteUserPromosError;

    const { error: deletePromoError } = await supabaseAuthed
      .from('promo_codes')
      .delete()
      .eq('id', numericPromoId);

    if (deletePromoError) throw deletePromoError;
  },
};
