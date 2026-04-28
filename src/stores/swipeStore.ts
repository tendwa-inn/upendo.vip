import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import { useDiscoveryStore } from './discoveryStore';
import { useMatchStore } from './matchStore';
import { useAppSettingsStore } from './appSettingsStore';

interface SwipeState {
  swipeCount: number;
  lastSwipeAt: Date | null;
  rewindCount: number;
  lastRewindAt: Date | null;
  swipeRight: (likedUserId: string) => Promise<{ matched: boolean }>;
  swipeLeft: (swipedUserId: string) => Promise<void>;
  rewind: () => Promise<boolean>; // Return true if rewind was successful
  loadSwipeState: () => void;
}

const LIMITS = { free: 35, pro: 150, vip: 300 } as const;

export const useSwipeStore = create<SwipeState>((set, get) => ({
  swipeCount: 0,
  lastSwipeAt: null,

  rewindCount: 0,
  lastRewindAt: null,

  loadSwipeState: () => {
    const savedState = localStorage.getItem('swipeState');
    if (savedState) {
      const { swipeCount, lastSwipeAt, rewindCount, lastRewindAt } = JSON.parse(savedState);
      const lastSwipeDate = new Date(lastSwipeAt);
      const lastRewindDate = new Date(lastRewindAt);
      const now = new Date();

      // Reset swipe count if it's a new day
      if (now.getDate() !== lastSwipeDate.getDate() || now.getMonth() !== lastSwipeDate.getMonth() || now.getFullYear() !== lastSwipeDate.getFullYear()) {
        set({ swipeCount: 0, lastSwipeAt: now });
      } else {
        set({ swipeCount, lastSwipeAt: lastSwipeDate });
      }

      // Reset rewind count if it's a new day
      if (now.getDate() !== lastRewindDate.getDate() || now.getMonth() !== lastRewindDate.getMonth() || now.getFullYear() !== lastRewindDate.getFullYear()) {
        set({ rewindCount: 0, lastRewindAt: now });
      } else {
        set({ rewindCount, lastRewindAt: lastRewindDate });
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
    const tier = ((profile as any).account_type || (profile as any).subscription || (profile as any).subscriptionTier || 'free') as 'free' | 'pro' | 'vip';
    const settings = useAppSettingsStore.getState().getSettingForTier(tier);
    const limit = settings?.swipes_per_day ?? (LIMITS[tier] ?? LIMITS.free);
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
      localStorage.setItem('swipeState', JSON.stringify({ swipeCount: newSwipeCount, lastSwipeAt: now, rewindCount: get().rewindCount, lastRewindAt: get().lastRewindAt }));
    }

    // 1. Use upsert to safely insert the like, avoiding duplicate errors
    const { error } = await supabase
      .from('likes')
      .upsert(
        { liker_id: currentUser.id, liked_id: likedUserId },
        { onConflict: 'liker_id,liked_id' }
      );

    // 2. Explicitly handle errors, but ignore duplicate violations (code 23505)
    // Note: upsert should prevent this, but it's good practice
    if (error && error.code !== '23505') {
      console.error('Error liking user:', error);
      return { matched: false };
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
    } else {
      // Create a notification for the liked user if it's not a match yet
      await supabase.from('notifications').insert({
        user_id: likedUserId,
        actor_id: currentUser.id,
        type: 'new_like',
        title: 'You have a new like!',
        message: `${profile?.name || 'Someone'} liked your profile.`
      });
    }

    useDiscoveryStore.getState().removePotentialMatch(likedUserId);
    return { matched: false };
  },

  swipeLeft: async (swipedUserId) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    // Add to dislikes table
    const { error } = await supabase
      .from('dislikes')
      .insert({ user_id: currentUser.id, disliked_user_id: swipedUserId });

    if (error) {
      console.error('Error recording dislike:', error);
      // Don't stop the UI flow, but log the error
    }

// Increment swipe count for popularity score
    incrementSwipeCount(currentUser.id);

    // We still remove from discovery locally for immediate feedback
    useDiscoveryStore.getState().removePotentialMatch(swipedUserId);
  },

  rewind: async () => {
    const { profile } = useAuthStore.getState();
    if (!profile) return false;

    const tier = ((profile as any).account_type || (profile as any).subscription || (profile as any).subscriptionTier || 'free') as 'free' | 'pro' | 'vip';
    const settings = useAppSettingsStore.getState().getSettingForTier(tier);
    const limit = settings?.rewind_count ?? 0;

    if (limit === 0) return false; // No rewinds for this tier

    const { rewindCount, lastRewindAt } = get();
    const now = new Date();

    const isSameDay = lastRewindAt &&
      now.getFullYear() === lastRewindAt.getFullYear() &&
      now.getMonth() === lastRewindAt.getMonth() &&
      now.getDate() === lastRewindAt.getDate();

    if (limit !== -1 && isSameDay && rewindCount >= limit) {
      console.log('Daily rewind limit reached.');
      return false;
    }

    const newRewindCount = isSameDay ? rewindCount + 1 : 1;
    set({ rewindCount: newRewindCount, lastRewindAt: now });
    localStorage.setItem('swipeState', JSON.stringify({ swipeCount: get().swipeCount, lastSwipeAt: get().lastSwipeAt, rewindCount: newRewindCount, lastRewindAt: now }));

    return true;
  },
}));
