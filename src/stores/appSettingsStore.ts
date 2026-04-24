import { create } from 'zustand';
import { adminSettingsService, AppSettings } from '../services/adminSettingsService';

interface AppSettingsState {
  settings: AppSettings[];
  getSettings: () => Promise<void>;
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  settings: [],
  getSettings: async () => {
    const settings = await adminSettingsService.getAppSettings();
    set({ settings });
  },
  reset: () => set({ settings: [] }),
}));
