import { supabase } from '../lib/supabaseClient';

export interface Ad {
  id: string;
  name: string;
  type: 'swipe' | 'engagement';
  image_url: string | null;
  video_url: string | null;
  redirect_url: string;
  action_label: string;
  is_active: boolean;
  frequency: number;
  duration_seconds: number;
  reward_swipes: number;
  max_completions: number;
  created_at: string;
}

export interface AdCompletion {
  id: string;
  user_id: string;
  ad_id: string;
  completed_at: string;
}

export interface AdRewardSwipe {
  id: string;
  user_id: string;
  ad_id: string;
  swipes_remaining: number;
  created_at: string;
}

export const adService = {
  // ── CRUD ──────────────────────────────────────────────
  async getAllAds(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActiveSwipeAds(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('type', 'swipe')
      .eq('is_active', true);
    if (error) throw error;
    return data || [];
  },

  async getActiveEngagementAds(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('type', 'engagement')
      .eq('is_active', true);
    if (error) throw error;
    return data || [];
  },

  async createAd(ad: Partial<Ad>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .insert(ad)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAd(id: string, updates: Partial<Ad>): Promise<void> {
    const { error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async deleteAd(id: string): Promise<void> {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ── Engagement Completions ────────────────────────────
  async getUserCompletionCount(userId: string, adId: string): Promise<number> {
    const { count, error } = await supabase
      .from('ad_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('ad_id', adId);
    if (error) throw error;
    return count || 0;
  },

  async recordCompletion(userId: string, adId: string): Promise<void> {
    const { error } = await supabase
      .from('ad_completions')
      .insert({ user_id: userId, ad_id: adId });
    if (error) throw error;
  },

  // ── Reward Swipes ─────────────────────────────────────
  async getTotalBonusSwipes(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('ad_reward_swipes')
      .select('swipes_remaining')
      .eq('user_id', userId)
      .gt('swipes_remaining', 0);
    if (error) throw error;
    return (data || []).reduce((sum, r) => sum + r.swipes_remaining, 0);
  },

  async grantRewardSwipes(userId: string, adId: string, swipes: number): Promise<void> {
    const { error } = await supabase
      .from('ad_reward_swipes')
      .insert({ user_id: userId, ad_id: adId, swipes_remaining: swipes });
    if (error) throw error;
  },

  async useBonusSwipe(userId: string): Promise<boolean> {
    // Find a reward row with swipes remaining
    const { data, error } = await supabase
      .from('ad_reward_swipes')
      .select('id, swipes_remaining')
      .eq('user_id', userId)
      .gt('swipes_remaining', 0)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error || !data) return false;

    const { error: updateError } = await supabase
      .from('ad_reward_swipes')
      .update({ swipes_remaining: data.swipes_remaining - 1 })
      .eq('id', data.id);
    if (updateError) return false;

    return true;
  },
};
