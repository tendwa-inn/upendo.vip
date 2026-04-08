import { supabase } from '../lib/supabaseClient';

export const blockService = {
  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    const { error } = await supabase.from('blocked_users').insert({ user_id: userId, blocked_user_id: blockedUserId });
    if (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },
};
