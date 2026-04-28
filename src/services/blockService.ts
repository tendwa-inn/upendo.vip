import { supabase } from '../lib/supabaseClient';

export const blockService = {
  async blockUser(blockerId: string, blockedId: string) {
    const { data, error } = await supabase
      .from('blocked_users')
      .insert([{ user_id: blockerId, blocked_user_id: blockedId }]);

    if (error) {
      console.error('Error blocking user:', error);
      throw error;
    }

    return data;
  },
};
