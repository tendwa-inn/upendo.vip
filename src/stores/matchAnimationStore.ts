import { create } from 'zustand';

interface MatchAnimationState {
  matchedUser: any | null;
  matchedUserId: string | null;
  matchId: string | null;
  isMatchAnimationVisible: boolean;
  showMatchAnimation: (user: any, matchId: string) => void;
  hideMatchAnimation: () => void;
}

export const useMatchAnimationStore = create<MatchAnimationState>((set) => ({
  matchedUser: null,
  matchedUserId: null,
  matchId: null,
  isMatchAnimationVisible: false,
  showMatchAnimation: (user, matchId) => set({ 
    matchedUser: user, 
    matchedUserId: user?.id || null,
    matchId: matchId,
    isMatchAnimationVisible: true 
  }),
  hideMatchAnimation: () => set({ 
    matchedUser: null, 
    matchedUserId: null,
    matchId: null,
    isMatchAnimationVisible: false 
  }),
}));
