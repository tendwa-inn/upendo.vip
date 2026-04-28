import { create } from 'zustand';
import { adminSettingsService, AppSettings } from '../services/adminSettingsService';

interface AppSettingsState {
  settings: AppSettings[];
  getSettings: () => Promise<void>;
  getSettingForTier: (tier: string) => AppSettings | undefined;
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  settings: [],
  getSettings: async () => {
    const settings = await adminSettingsService.getAppSettings();
    set({ settings });
  },
  getSettingForTier: (tier: string) => {
    return useAppSettingsStore.getState().settings.find(s => s.account_type === tier);
  },
  setSettings: (data: AppSettings[]) => set({ settings: data }),
}));
