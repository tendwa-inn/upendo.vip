import { supabase } from '../utils/supabase';

export interface AppSettings {
  id: number;
  account_type: string;
  swipes_per_week: number;
  rewind_count: number;
  international_dating: boolean;
  unlimited_message_requests: boolean;
  price: string;
  ghost_mode: boolean;
  read_receipts: boolean;
  visibility_rate: number;
  message_requests: number;
  profile_views: number;
  ghost_mode: boolean;
  read_receipts: boolean;
}

export const adminSettingsService = {
  async getAppSettings(): Promise<AppSettings[]> {
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) throw error;
    return data;
  },

  async updateAppSettings(settings: Partial<AppSettings> & { id: number }): Promise<void> {
    const { id, ...updateData } = settings;
    const { error } = await supabase.from('app_settings').update(updateData).eq('id', id);
    if (error) throw error;
  },
};
