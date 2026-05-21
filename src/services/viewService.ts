import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import { recordProfileView as recordPopularityProfileView } from './popularityService';
import { onesignalService } from './onesignalService';

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

    // Send push notification for the view (only if the view was successfully recorded)
    if (!error) {
      try {
        // Get viewer's name for the notification
        const { data: viewerProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', viewer.id)
          .single();

        await onesignalService.sendViewNotification(
          viewedId,
          viewerProfile?.name || 'Someone'
        );
      } catch (notificationError) {
        console.error('Failed to send view push notification:', notificationError);
        // Continue even if push notification fails
      }
    }
  },
};
