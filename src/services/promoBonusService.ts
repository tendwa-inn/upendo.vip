import { supabase } from '../lib/supabaseClient';

// Cache promo bonuses to avoid querying every swipe
let cachedUserId: string | null = null;
let cachedBonuses: PromoBonuses | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

export interface PromoBonuses {
  bonusSwipes: number;      // extra swipes from limited_swipes promo (effect.swipe_count)
  unlimitedSwipes: boolean;  // unlimited_swipes promo active
  bonusMessageRequests: number; // extra message requests from message_requests promo (effect.request_count)
  unlimitedMessageRequests: boolean; // if promo grants unlimited
}

const defaultBonuses: PromoBonuses = {
  bonusSwipes: 0,
  unlimitedSwipes: false,
  bonusMessageRequests: 0,
  unlimitedMessageRequests: false,
};

export async function getPromoBonuses(userId: string): Promise<PromoBonuses> {
  const now = Date.now();
  if (cachedUserId === userId && cachedBonuses && now - cacheTimestamp < CACHE_TTL) {
    return cachedBonuses;
  }

  try {
    const { data, error } = await supabase
      .from('user_promos')
      .select('promo_codes!inner(type, effect, duration_days)')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString());

    if (error || !data) {
      return defaultBonuses;
    }

    const bonuses = { ...defaultBonuses };

    for (const row of data) {
      const promo = (row as any).promo_codes;
      if (!promo) continue;
      const effect = promo.effect || {};

      if (promo.type === 'limited_swipes') {
        bonuses.bonusSwipes += effect.swipe_count || 0;
      } else if (promo.type === 'unlimited_swipes') {
        bonuses.unlimitedSwipes = true;
      } else if (promo.type === 'message_requests') {
        if (effect.unlimited) {
          bonuses.unlimitedMessageRequests = true;
        } else {
          bonuses.bonusMessageRequests += effect.request_count || 0;
        }
      }
    }

    cachedUserId = userId;
    cachedBonuses = bonuses;
    cacheTimestamp = now;
    return bonuses;
  } catch {
    return defaultBonuses;
  }
}

export function clearPromoBonusCache() {
  cachedUserId = null;
  cachedBonuses = null;
  cacheTimestamp = 0;
}
