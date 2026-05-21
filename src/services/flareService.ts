import { supabase } from '../lib/supabaseClient';

export const flareService = {
  // Ensure the user has a flare account row, create if missing
  async ensureFlareAccount(userId: string): Promise<void> {
    const { data } = await supabase
      .from('user_flares')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) {
      // Row doesn't exist — create it
      await supabase
        .from('user_flares')
        .insert({ user_id: userId, balance: 0, total_earned: 0, total_spent: 0 });
    }
  },

  async getBalance(userId: string): Promise<number> {
    // Ensure account exists first
    await this.ensureFlareAccount(userId);

    const { data, error } = await supabase
      .from('user_flares')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return 0;
    return data.balance;
  },

  async getFlareAccount(userId: string) {
    await this.ensureFlareAccount(userId);

    const { data, error } = await supabase
      .from('user_flares')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return { balance: 0, total_earned: 0, total_spent: 0 };
    }
    return data;
  },

  async addFlares(userId: string, amount: number, type: string, referenceId?: string): Promise<{ success: boolean; error?: string }> {
    // Ensure account exists first
    await this.ensureFlareAccount(userId);

    const { error } = await supabase.rpc('add_flares', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_reference_id: referenceId || null,
    });

    if (error) {
      console.error('Failed to add flares:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  async spendFlares(userId: string, amount: number, type: string, referenceId?: string): Promise<boolean> {
    await this.ensureFlareAccount(userId);

    const { data, error } = await supabase.rpc('spend_flares', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_reference_id: referenceId || null,
    });

    if (error) {
      console.error('Failed to spend flares:', error);
      return false;
    }
    return data as boolean;
  },

  async getTransactions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('flare_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
    return data || [];
  },
};
