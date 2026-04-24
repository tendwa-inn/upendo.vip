import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ButtonStyle = 'upendo-color' | 'white-clean' | 'vintage';

interface UiState {
  buttonStyle: ButtonStyle;
  setButtonStyle: (style: ButtonStyle) => void;
  isProfileSetupModalOpen: boolean;
  openProfileSetupModal: () => void;
  closeProfileSetupModal: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      buttonStyle: 'upendo-color',
      setButtonStyle: (style) => set({ buttonStyle: style }),
      isProfileSetupModalOpen: false,
      openProfileSetupModal: () => set({ isProfileSetupModalOpen: true }),
      closeProfileSetupModal: () => set({ isProfileSetupModalOpen: false }),
      reset: () => set({ buttonStyle: 'upendo-color', isProfileSetupModalOpen: false }),
    }),
    {
      name: 'ui-settings-storage',
    }
  )
);
