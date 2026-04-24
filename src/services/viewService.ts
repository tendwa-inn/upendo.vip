import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import { recordProfileView as recordPopularityProfileView } from './popularityService';

export const viewService = {
  async addProfileView(viewedId: string): Promise<void> {
    const viewer = useAuthStore.getState().user;
    if (!viewer?.id || !viewedId || viewer.id === viewedId) return;

    const { error } = await supabase
      .from('profile_views')
      .upsert(
        {
          viewer_id: viewer.id,
          viewed_id: viewedId,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: 'viewer_id,viewed_id' }
      );

    if (error) {
      console.error('Error recording profile view:', error);
    }

    // Also record the view for the popularity score system
    recordPopularityProfileView(viewer.id, viewedId);
  },
};
