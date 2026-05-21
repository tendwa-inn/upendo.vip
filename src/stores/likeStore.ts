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
    (set, get) => ({
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

        const likedIds = new Set(data?.map(like => like.liked_id) || []);
        set({ likedUserIds: likedIds });
      },

      addLikedUser: (userId: string) => {
        set(state => {
          console.log('addLikedUser - likedUserIds type:', typeof state.likedUserIds);
          console.log('addLikedUser - likedUserIds value:', state.likedUserIds);
          
          // Safely convert to Set
          const currentLikedUserIds =
            state.likedUserIds instanceof Set
              ? state.likedUserIds
              : new Set(
                  Array.isArray(state.likedUserIds)
                    ? state.likedUserIds
                    : []
                );
          
          const updated = new Set(currentLikedUserIds);
          updated.add(userId);
          
          return { likedUserIds: updated };
        });
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
        state.likedUserIds = new Set(Array.isArray(state.likedUserIds) ? state.likedUserIds : []);
        return state;
      },
    }
  )
);
