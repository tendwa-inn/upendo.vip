import { supabase } from '../lib/supabaseClient';

export const blockService = {
  async blockUser(blockerId: string, blockedId: string) {
    const { error } = await supabase
      .from('blocked_users')
      .insert([{ user_id: blockerId, blocked_user_id: blockedId }]);

    // Ignore duplicate key errors — user is already blocked
    if (error && error.code !== '23505') {
      console.error('Error blocking user:', error);
      throw error;
    }

    // Clean up likes between the two users
    await supabase.from('likes').delete().match({ liker_id: blockedId, liked_id: blockerId });
    await supabase.from('likes').delete().match({ liker_id: blockerId, liked_id: blockedId });
  },

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_user_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }

    return data?.map(r => r.blocked_user_id) || [];
  },
};
