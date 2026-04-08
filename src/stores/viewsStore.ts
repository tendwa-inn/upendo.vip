import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { useAuthStore } from './authStore';

interface ViewsState {
  usersWhoViewedMe: User[];
  hasNewViews: boolean;
  fetchUsersWhoViewedMe: () => Promise<void>;
  markViewsAsViewed: () => void;
}

export const useViewsStore = create<ViewsState>((set) => ({
  usersWhoViewedMe: [],
  hasNewViews: false,

  fetchUsersWhoViewedMe: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { data: views, error: viewsError } = await supabase
      .from('profile_views')
      .select('viewer_id, viewed_at')
      .eq('viewed_id', currentUser.id);

    if (viewsError) {
      console.error('Error fetching views:', viewsError);
      return;
    }

    if (!views || views.length === 0) {
      set({ usersWhoViewedMe: [] });
      return;
    }

    const viewerIds = views.map(v => v.viewer_id);

    // Get the full profiles of those users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', viewerIds);

    if (profilesError) {
      console.error('Error fetching viewer profiles:', profilesError);
      return;
    }

    const filteredProfiles = profiles.filter(p => p.id !== currentUser.id);

    // Combine profile data with the timestamp of the view
    const usersWithViewTimestamp = filteredProfiles.map(profile => {
      const view = views.find(v => v.viewer_id === profile.id);
      return {
        ...profile,
        viewed_at: view ? view.viewed_at : undefined,
      };
    });

    // Sort by the view timestamp on the client-side
    const sortedUsers = usersWithViewTimestamp.sort((a, b) => {
      if (a.viewed_at && b.viewed_at) {
        return new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime();
      }
      return 0;
    });

    set({ usersWhoViewedMe: sortedUsers, hasNewViews: (sortedUsers?.length || 0) > 0 });
  },

  markViewsAsViewed: () => set({ hasNewViews: false }),

  removeView: async (viewerId: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    const { error } = await supabase
      .from('profile_views')
      .delete()
      .match({ viewed_id: currentUser.id, viewer_id: viewerId });
    if (error) {
      console.error('Error removing view:', error);
    } else {
      set(state => ({
        usersWhoViewedMe: state.usersWhoViewedMe.filter(u => u.id !== viewerId),
      }));
    }
  },
}));
