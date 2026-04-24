import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { useAuthStore } from './authStore';

interface LikesState {
  likedUserIds: Set<string>; // <-- NEW: For quick lookups
  usersWhoLikedMe: (User & { liked_at?: string })[];
  hasNewLikes: boolean;
  fetchLikedUserIds: () => Promise<void>; // <-- NEW
  fetchUsersWhoLikedMe: () => Promise<void>;
  addLikedUser: (userId: string) => void; // <-- NEW
  removeLike: (likerId: string) => Promise<void>;
  markLikesAsViewed: () => void;
  listenForNewLikes: () => () => void;
}

export const useLikesStore = create<LikesState>((set, get) => ({
  likedUserIds: new Set(),
  usersWhoLikedMe: [],
  hasNewLikes: false,

  fetchLikedUserIds: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('likes')
      .select('liked_id')
      .eq('liker_id', user.id);

    if (error) {
      console.error('Error fetching liked user IDs:', error);
      return;
    }

    const ids = new Set(data.map(like => like.liked_id));
    set({ likedUserIds: ids });
  },

  addLikedUser: (userId: string) => {
    set(state => ({ likedUserIds: new Set(state.likedUserIds).add(userId) }));
  },

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

  listenForNewLikes: () => {
    const channel = supabase
      .channel('new-likes-listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `type=eq.new_like` },
        (payload) => {
          console.log('New like notification received!', payload);
          // Refetch users who liked me to update the list
          get().fetchUsersWhoLikedMe();
          set({ hasNewLikes: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
