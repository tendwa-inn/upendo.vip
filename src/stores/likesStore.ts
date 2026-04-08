import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { useAuthStore } from './authStore';

interface LikesState {
  usersWhoLikedMe: (User & { liked_at?: string })[];
  hasNewLikes: boolean;
  fetchUsersWhoLikedMe: () => Promise<void>;
  removeLike: (likerId: string) => Promise<void>;
  markLikesAsViewed: () => void;
}

export const useLikesStore = create<LikesState>((set) => ({
  usersWhoLikedMe: [],
  hasNewLikes: false,

  fetchUsersWhoLikedMe: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    // Get the IDs of users who liked the current user
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('liker_id, created_at')
      .eq('liked_id', currentUser.id);

    if (likesError) {
      console.error('Error fetching likes:', likesError);
      return;
    }

    if (!likes || likes.length === 0) {
      set({ usersWhoLikedMe: [] });
      return;
    }

    const likerIds = likes.map(l => l.liker_id);

    // Get the full profiles of those users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', likerIds);

    if (profilesError) {
      console.error('Error fetching liker profiles:', profilesError);
      return;
    }

    const usersWithLikeTs = (profiles || []).map(p => {
      const like = likes.find(l => l.liker_id === p.id);
      return { ...p, liked_at: like?.created_at };
    }).sort((a, b) => {
      const at = a.liked_at ? new Date(a.liked_at).getTime() : 0;
      const bt = b.liked_at ? new Date(b.liked_at).getTime() : 0;
      return bt - at;
    });
    set({ usersWhoLikedMe: usersWithLikeTs, hasNewLikes: (usersWithLikeTs?.length || 0) > 0 });
  },

  removeLike: async (likerId: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ liked_id: currentUser.id, liker_id: likerId });

    if (error) {
      console.error('Error removing like:', error);
    } else {
      set(state => ({
        usersWhoLikedMe: state.usersWhoLikedMe.filter(user => user.id !== likerId),
      }));
    }
  },

  markLikesAsViewed: () => set({ hasNewLikes: false }),
}));
