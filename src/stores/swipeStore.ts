import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import { useDiscoveryStore } from './discoveryStore';
import { useMatchStore } from './matchStore.tsx';

interface SwipeState {
  swipeCount: number;
  lastSwipeAt: Date | null;
  swipeRight: (likedUserId: string) => Promise<{ matched: boolean }>;
  swipeLeft: (swipedUserId: string) => Promise<void>;
  loadSwipeState: () => void;
}

const LIMITS = { free: 35, pro: 150, vip: 300 } as const;

export const useSwipeStore = create<SwipeState>((set, get) => ({
  swipeCount: 0,
  lastSwipeAt: null,

  loadSwipeState: () => {
    const savedState = localStorage.getItem('swipeState');
    if (savedState) {
      const { swipeCount, lastSwipeAt } = JSON.parse(savedState);
      const lastSwipeDate = new Date(lastSwipeAt);
      const now = new Date();

      // Reset swipe count if it's a new day
      if (now.getDate() !== lastSwipeDate.getDate() || now.getMonth() !== lastSwipeDate.getMonth() || now.getFullYear() !== lastSwipeDate.getFullYear()) {
        set({ swipeCount: 0, lastSwipeAt: now });
      } else {
        set({ swipeCount, lastSwipeAt: lastSwipeDate });
      }
    }
  },

  swipeRight: async (likedUserId) => {
    const { user: currentUser, profile } = useAuthStore.getState();
    if (!currentUser || !profile) return { matched: false };

    if (!likedUserId || likedUserId === currentUser.id) {
      return { matched: false };
    }

    // Check swipe limit by tier
    const tier = ((profile as any).accountType || (profile as any).subscription || (profile as any).subscriptionTier || 'free') as 'free' | 'pro' | 'vip';
    const limit = LIMITS[tier] ?? LIMITS.free;
    {
      const { swipeCount, lastSwipeAt } = get();
      const now = new Date();

      const isSameDay = lastSwipeAt &&
        now.getFullYear() === lastSwipeAt.getFullYear() &&
        now.getMonth() === lastSwipeAt.getMonth() &&
        now.getDate() === lastSwipeAt.getDate();

      if (isSameDay && swipeCount >= limit) {
        console.log('Daily swipe limit reached.');
        return { matched: false };
      }

      const newSwipeCount = isSameDay ? swipeCount + 1 : 1;
      set({ swipeCount: newSwipeCount, lastSwipeAt: now });
      localStorage.setItem('swipeState', JSON.stringify({ swipeCount: newSwipeCount, lastSwipeAt: now }));
    }

    const { data: existingLike, error: existingLikeError } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', currentUser.id)
      .eq('liked_id', likedUserId)
      .limit(1)
      .maybeSingle();

    if (existingLikeError) {
      console.error('Error checking existing like:', existingLikeError);
      return { matched: false };
    }

    if (!existingLike) {
      const { error: likeError } = await supabase
        .from('likes')
        .insert({ liker_id: currentUser.id, liked_id: likedUserId });

      if (likeError) {
        console.error('Error recording like:', likeError);
        return { matched: false };
      }
    }

    // Check for a mutual like
    const { data: mutualLike, error: mutualLikeError } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', likedUserId)
      .eq('liked_id', currentUser.id)
      .limit(1)
      .maybeSingle();

    if (mutualLikeError) {
      console.error('Error checking mutual like:', mutualLikeError);
      useDiscoveryStore.getState().removePotentialMatch(likedUserId);
      return { matched: false };
    }

    if (mutualLike) {
      // It's a match!
      const { createMatch } = useMatchStore.getState();
      await createMatch(likedUserId);
      useDiscoveryStore.getState().removePotentialMatch(likedUserId);
      return { matched: true };
    }

    useDiscoveryStore.getState().removePotentialMatch(likedUserId);
    return { matched: false };
  },

  swipeLeft: async (swipedUserId) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    // We don't need to record left swipes in the DB for this logic, just remove from discovery
    useDiscoveryStore.getState().removePotentialMatch(swipedUserId);
  },
}));
