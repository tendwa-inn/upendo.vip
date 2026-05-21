import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ButtonStyle =
  | 'upendo-color' | 'white-clean' | 'vintage' | 'upendo-205'
  // Neon
  | 'neon-cyber' | 'neon-violet' | 'neon-ice' | 'neon-solar' | 'neon-midnight' | 'neon-tangerine' | 'neon-flamingo' | 'neon-lime'
  // Classic
  | 'classic-glass' | 'classic-chrome' | 'classic-copper' | 'classic-mono' | 'classic-slate' | 'classic-gold'
  // Glowy
  | 'glowy-aurora' | 'glowy-ember' | 'glowy-ocean' | 'glowy-rose'
  // Pop
  | 'pop-bubble' | 'pop-confetti'
  // Deluxe Edition
  | 'deluxe-neon-outline' | 'deluxe-spinner-ring' | 'deluxe-rounded-pill' | 'deluxe-square-solid'
  | 'deluxe-diamond' | 'deluxe-morphing' | 'deluxe-capsule' | 'deluxe-torch'
  | 'deluxe-ripple' | 'deluxe-cluster' | 'deluxe-tiered' | 'deluxe-gothic'
  | 'deluxe-chrome-ring' | 'deluxe-sketch' | 'deluxe-tape' | 'deluxe-pearl'
  | 'deluxe-morse' | 'deluxe-underwater' | 'deluxe-stealth' | 'deluxe-lava'
  | 'deluxe-typewriter' | 'deluxe-sapphire' | 'deluxe-stamp' | 'deluxe-crown'
  | 'deluxe-shield' | 'deluxe-compass' | 'deluxe-sunburst' | 'deluxe-atom'
  | 'deluxe-orbit' | 'deluxe-minimal-dot' | 'deluxe-bar-segment' | 'deluxe-text-only'
  | 'deluxe-emoji-face' | 'deluxe-cyber-slash' | 'deluxe-prism' | 'deluxe-wireframe'
  | 'deluxe-gem' | 'deluxe-cross-stitch' | 'deluxe-triangle-set' | 'deluxe-plasma';

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
