import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

interface SettingsState {
  isAutoUnmatchEnabled: boolean;
  toggleAutoUnmatch: () => void;
  isReadReceiptsEnabled: boolean;
  toggleReadReceipts: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isAutoUnmatchEnabled: false,
      toggleAutoUnmatch: () => set((state) => ({ isAutoUnmatchEnabled: !state.isAutoUnmatchEnabled })),
      isReadReceiptsEnabled: true,
      toggleReadReceipts: () => {
        const { profile } = useAuthStore.getState();
        const isPremium = profile?.accountType === 'pro' || profile?.accountType === 'vip';
        
        // Only allow premium users to toggle read receipts
        if (isPremium) {
          set((state) => ({ isReadReceiptsEnabled: !state.isReadReceiptsEnabled }));
        }
      },
    }),
    {
      name: 'upendo-chat-settings',
      // Add a function to check and disable read receipts for free users on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { profile } = useAuthStore.getState();
          const isPremium = profile?.accountType === 'pro' || profile?.accountType === 'vip';
          
          // Disable read receipts if user is not premium
          if (!isPremium && state.isReadReceiptsEnabled) {
            state.isReadReceiptsEnabled = false;
          }
        }
      },
    }
  )
);
