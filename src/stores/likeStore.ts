import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';

interface LikeStore {
  likedUserIds: Set<string>;
  fetchLikedUsers: (userId: string) => Promise<void>;
  addLikedUser: (userId: string) => void;
  reset: () => void;
}

export const useLikeStore = create<LikeStore>()(
  persist(
    (set) => ({
      likedUserIds: new Set(),

      fetchLikedUsers: async (userId: string) => {
        const { data, error } = await supabase
          .from('likes')
          .select('liked_id')
          .eq('liker_id', userId);

        if (error) {
          console.error('Error fetching liked users:', error);
          return;
        }

        const likedIds = new Set(data.map(like => like.liked_id));
        set({ likedUserIds: likedIds });
      },

      addLikedUser: (userId: string) => {
        set(state => ({ likedUserIds: new Set(state.likedUserIds).add(userId) }));
      },

      reset: () => {
        set({ likedUserIds: new Set() });
      },
    }),
    {
      name: 'upendo-likes-storage',
      serialize: (state) => JSON.stringify({ ...state, likedUserIds: Array.from(state.likedUserIds) }),
      deserialize: (str) => {
        const state = JSON.parse(str);
        state.likedUserIds = new Set(state.likedUserIds);
        return state;
      },
    }
  )
);
