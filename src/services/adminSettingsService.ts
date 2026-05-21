import { supabase } from '../lib/supabaseClient';

export interface AppSettings {
  id: number;
  account_type: string;
  swipes_per_day: number;
  rewind_count: number;
  international_dating: boolean;
  unlimited_message_requests: boolean;
  price: string;
  ghost_mode: boolean;
  read_receipts: boolean;
  visibility_rate: number;
  message_requests: number;
  profile_views: number;
  daily_vibe_changes: number;
  connection_limit: number;
  connection_requests: number;
}

export const adminSettingsService = {
  async getAppSettings(): Promise<AppSettings[]> {
    try {
      // Test connection first with a simple query
      const { data: testData, error: testError } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Connection test failed:', testError);
        // Return fallback data if connection fails
        return getFallbackAppSettings();
      }
      
      // Fetch core columns that exist in production
      const { data, error } = await supabase
        .from('app_settings')
        .select('id, account_type, swipes_per_day, rewind_count, visibility_rate, message_requests, profile_views, ghost_mode, read_receipts, daily_vibe_changes, connection_limit, connection_requests');
      
      if (error) {
        console.error('Error loading app settings:', error);
        // Return fallback data instead of throwing
        return getFallbackAppSettings();
      }
      
      if (!data || data.length === 0) {
        console.warn('No app settings found in database, using fallback');
        return getFallbackAppSettings();
      }
      
      // Ensure all columns have defaults if missing from DB
      const processedData = data.map((setting: any) => ({
        ...setting,
        daily_vibe_changes: setting.daily_vibe_changes ?? (setting.account_type === 'free' ? 1 : setting.account_type === 'pro' ? 5 : 10),
        connection_limit: setting.connection_limit ?? (setting.account_type === 'free' ? 3 : setting.account_type === 'pro' ? 10 : -1),
        connection_requests: setting.connection_requests ?? (setting.account_type === 'free' ? 2 : setting.account_type === 'pro' ? 10 : -1),
        international_dating: setting.international_dating ?? false,
        unlimited_message_requests: setting.unlimited_message_requests ?? false,
        price: setting.price ?? (setting.account_type === 'free' ? '0' : setting.account_type === 'pro' ? '9.99' : '19.99')
      }));
      
      return processedData;
      
    } catch (error) {
      console.error('Error loading app settings:', error);
      // Return fallback data instead of throwing
      return getFallbackAppSettings();
    }
  },

  async updateAppSettings(settings: Partial<AppSettings> & { id: number }): Promise<void> {
    const { id, account_type, ...updateData } = settings;

    // Write core columns that exist in production
    const safeUpdateData: Record<string, any> = {
      swipes_per_day: updateData.swipes_per_day,
      rewind_count: updateData.rewind_count,
      visibility_rate: updateData.visibility_rate,
      message_requests: updateData.message_requests,
      profile_views: updateData.profile_views,
      ghost_mode: updateData.ghost_mode,
      read_receipts: updateData.read_receipts,
      daily_vibe_changes: updateData.daily_vibe_changes,
      connection_limit: updateData.connection_limit,
      connection_requests: updateData.connection_requests,
    };

    // Remove undefined values
    Object.keys(safeUpdateData).forEach(key => {
      if (safeUpdateData[key] === undefined) {
        delete safeUpdateData[key];
      }
    });

    console.log(`[Settings] Updating ${account_type} (id=${id}):`, safeUpdateData);

    const { data, error } = await supabase.from('app_settings').update(safeUpdateData).eq('id', id).select();

    console.log(`[Settings] Update result for ${account_type}:`, { data, error });

    if (error) {
      console.error('Error updating app settings:', error);
      throw error;
    }
  },
};

// Fallback app settings in case of database connection issues
function getFallbackAppSettings(): AppSettings[] {
  console.warn('Using fallback app settings due to database connection issues');
  return [
    {
      id: 1,
      account_type: 'free',
      swipes_per_day: 35,
      rewind_count: 4,
      international_dating: false,
      unlimited_message_requests: false,
      price: '0',
      ghost_mode: false,
      read_receipts: false,
      visibility_rate: 50,
      message_requests: 3,
      profile_views: 10,
      daily_vibe_changes: 1,
      connection_limit: 3,
      connection_requests: 2
    },
    {
      id: 2,
      account_type: 'pro',
      swipes_per_day: 150,
      rewind_count: 10,
      international_dating: false,
      unlimited_message_requests: false,
      price: '9.99',
      ghost_mode: true,
      read_receipts: true,
      visibility_rate: 75,
      message_requests: 7,
      profile_views: -1,
      daily_vibe_changes: 5,
      connection_limit: 10,
      connection_requests: 10
    },
    {
      id: 3,
      account_type: 'vip',
      swipes_per_day: 300,
      rewind_count: -1,
      international_dating: false,
      unlimited_message_requests: false,
      price: '19.99',
      ghost_mode: true,
      read_receipts: true,
      visibility_rate: 100,
      message_requests: 15,
      profile_views: -1,
      daily_vibe_changes: 10,
      connection_limit: -1,
      connection_requests: -1
    }
  ];
}
