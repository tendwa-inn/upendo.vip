
import { supabase } from '../utils/supabase';

export const systemProfileService = {
  async getProfile() {
    const { data, error } = await supabase
      .from('system_profile')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async updateProfile(updates: { name?: string; photo_url?: string }) {
    const { data, error } = await supabase
      .from('system_profile')
      .update(updates)
      .eq('id', 1);

    if (error) {
      throw error;
    }
    return data;
  },
};
