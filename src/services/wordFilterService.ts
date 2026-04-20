import { supabase } from '../lib/supabaseClient';

export const wordFilterService = {
  // Get all filtered words
  async getFilteredWords() {
    const { data, error } = await supabase
      .from('word_filter')
      .select(`
        *,
        word_actions(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Set an automatic action for a word
  async setWordAction(wordId: number, actionType: string, durationDays: number | null) {
    const { data, error } = await supabase
      .from('word_actions')
      .upsert({ word_id: wordId, action_type: actionType, duration_days: durationDays }, { onConflict: 'word_id' });

    if (error) throw error;
    return data;
  },

  // Update the status of a user action
  async updateActionStatus(actionId: number, status: string) {
    const { data, error } = await supabase
      .from('user_actions')
      .update({ status })
      .eq('id', actionId);

    if (error) throw error;
    return data;
  },

  // Get the current user's active suspension
  async getCurrentUserSuspension() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', user.id)
      .in('action_type', ['suspension', 'ban'])
      .or('expires_at.is.null,expires_at.gt.now')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0] ?? null;
  },

  // Submit an appeal for a user action
  async submitAppeal(actionId: number, appealReason: string) {
    const { data, error } = await supabase
      .from('user_actions')
      .update({ appeal_reason: appealReason, status: 'appealed' })
      .eq('id', actionId);

    if (error) throw error;
    return data;
  },

  // Add a new filtered word
  async addFilteredWord(word: string) {
    const { data, error } = await supabase
      .from('word_filter')
      .insert([{ word }]);

    if (error) throw error;
    return data;
  },

  // Remove a filtered word
  async removeFilteredWord(id: number) {
    const { error } = await supabase
      .from('word_filter')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get flagged content with user details
  async getFlaggedContent() {
    const { data, error } = await supabase
      .from('flagged_content')
      .select(`
        *,
        word:word_filter(word),
        user:profiles(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Take action on a user
  async takeUserAction(userId: string, actionType: 'warning' | 'suspension' | 'ban', reason?: string, expiresAt?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('user_actions')
      .insert([{
        user_id: userId,
        action_type: actionType,
        reason,
        admin_id: user?.id,
        expires_at: expiresAt
      }]);

    if (error) throw error;
    return data;
  },

  // Get user actions
  async getUserActions(userId?: string) {
    let query = supabase
      .from('user_actions')
      .select(`
        *,
        admin:profiles!user_actions_admin_id_fkey(id, name),
        user:profiles!user_actions_user_id_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
};
