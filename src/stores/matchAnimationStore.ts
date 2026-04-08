import { create } from 'zustand';

interface MatchAnimationState {
  matchedUser: any | null;
  isMatchAnimationVisible: boolean;
  showMatchAnimation: (user: any) => void;
  hideMatchAnimation: () => void;
}

export const useMatchAnimationStore = create<MatchAnimationState>((set) => ({
  matchedUser: null,
  isMatchAnimationVisible: false,
  showMatchAnimation: (user) => set({ matchedUser: user, isMatchAnimationVisible: true }),
  hideMatchAnimation: () => set({ matchedUser: null, isMatchAnimationVisible: false }),
}));
