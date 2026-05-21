import { create } from 'zustand';
import { adminSettingsService, AppSettings } from '../services/adminSettingsService';
import { checkSupabaseHealth } from '../lib/supabaseHealth';

interface AppSettingsState {
  settings: AppSettings[];
  isLoading: boolean;
  error: string | null;
  getSettings: () => Promise<void>;
  getSettingForTier: (tier: string) => AppSettings | undefined;
  reset: () => void;
  setSettings: (data: AppSettings[]) => void;
}

export const useAppSettingsStore = create<AppSettingsState>((set, get) => ({
  settings: [],
  isLoading: false,
  error: null,
  getSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check connection health first
      const health = await checkSupabaseHealth();
      if (!health.healthy) {
        console.warn('Supabase connection unhealthy, attempting to load settings anyway...');
      }
      
      const settings = await adminSettingsService.getAppSettings();
      set({ settings, isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to load app settings:', error);
      set({ isLoading: false, error: 'Failed to load app settings' });
      // Don't throw - let the service handle the fallback
    }
  },
  getSettingForTier: (tier: string) => {
    const settings = get().settings;
    if (!settings || settings.length === 0) {
      console.warn('No settings available, returning undefined');
      return undefined;
    }
    return settings.find(s => s.account_type === tier);
  },
  setSettings: (data: AppSettings[]) => set({ settings: data, error: null }),
  reset: () => set({ settings: [], isLoading: false, error: null }),
}));
