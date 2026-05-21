import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { useAuthStore } from './authStore';
import { blockService } from '../services/blockService';

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
  reset: () => void;
}

const initialState = {
  likedUserIds: new Set(),
  usersWhoLikedMe: [],
  hasNewLikes: false,
};

export const useLikesStore = create<LikesState>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),

  fetchLikedUserIds: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('likes')
      .select('liked_id')
      .eq('liker_id', user.id)
      .abortSignal(new AbortController().signal);

    if (error) {
      console.error('Error fetching liked user IDs:', error);
      return;
    }

    const ids = new Set(data?.map(like => like.liked_id) || []);
    set({ likedUserIds: ids });
  },

  addLikedUser: (userId: string) => {
    set(state => {
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

  fetchUsersWhoLikedMe: async (userId: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    // Get the IDs of users who liked the current user
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('liker_id, created_at')
      .eq('liked_id', currentUser.id)
      .abortSignal(new AbortController().signal);

    if (likesError) {
      console.error('Error fetching likes:', likesError);
      return;
    }

    if (!likes || likes.length === 0) {
      set({ usersWhoLikedMe: [] });
      return;
    }

    const likerIds = likes.map(l => l.liker_id);

    // Filter out blocked users, matched users, and disliked (unmatched) users
    const [blockedIds, matchedRes, dislikedRes] = await Promise.all([
      blockService.getBlockedUserIds(currentUser.id),
      supabase.from('matches').select('user1_id, user2_id').or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`),
      supabase.from('dislikes').select('disliked_user_id').eq('user_id', currentUser.id)
    ]);
    const matchedIds = new Set(
      (matchedRes.data || []).flatMap(m =>
        m.user1_id === currentUser.id ? [m.user2_id] : [m.user1_id]
      )
    );
    const dislikedIds = new Set((dislikedRes.data || []).map(d => d.disliked_user_id));
    const filteredLikerIds = likerIds.filter(id => !blockedIds.includes(id) && !matchedIds.has(id) && !dislikedIds.has(id));

    if (filteredLikerIds.length === 0) {
      set({ usersWhoLikedMe: [] });
      return;
    }

    // Get the full profiles of those users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', filteredLikerIds)
      .abortSignal(new AbortController().signal);

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
    const user = useAuthStore.getState().user;
    if (!user) return () => {};

    const channel = supabase.channel('new-likes-listener');

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if ((payload.new as any).type === 'new_like') {
            get().fetchUsersWhoLikedMe();
            set({ hasNewLikes: true });
          }
          if ((payload.new as any).type === 'system' && (payload.new as any).message?.includes('strike')) {
            get().fetchUsersWhoLikedMe();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
