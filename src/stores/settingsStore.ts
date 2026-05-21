import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  isAutoUnmatchEnabled: boolean;
  toggleAutoUnmatch: () => void;
  isReadReceiptsEnabled: boolean;
  toggleReadReceipts: () => void;
  setReadReceipts: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isAutoUnmatchEnabled: false,
      toggleAutoUnmatch: () => set((state) => ({ isAutoUnmatchEnabled: !state.isAutoUnmatchEnabled })),
      isReadReceiptsEnabled: true,
      toggleReadReceipts: () => set((state) => ({ isReadReceiptsEnabled: !state.isReadReceiptsEnabled })),
      setReadReceipts: (enabled: boolean) => set({ isReadReceiptsEnabled: enabled }),
    }),
    {
      name: 'upendo-chat-settings',
    }
  )
);
