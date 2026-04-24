// src/services/popularityService.ts
import { supabase } from '../lib/supabaseClient';

export const recordUserActivity = async (userId: string) => {
  await supabase.rpc('record_user_activity', { p_user_id: userId });
};

export const incrementSwipeCount = async (userId: string) => {
  await supabase.rpc('increment_swipe_count', { p_user_id: userId });
};

export const recordMessageSent = async (userId: string) => {
  await supabase.rpc('record_message_sent', { p_user_id: userId });
};

export const recordProfileView = async (viewerId: string, viewedId: string) => {
  await supabase.rpc('record_profile_view', { p_viewer_id: viewerId, p_viewed_id: viewedId });
};

export const recordUnmatch = async (unmatcherId: string, unmatchedId: string) => {
  await supabase.rpc('record_unmatch', { p_unmatcher_id: unmatcherId, p_unmatched_id: unmatchedId });
};

export const getPopularityScore = async (userId: string): Promise<number> => {
  const { data, error } = await supabase.rpc('calculate_popularity_score', { p_user_id: userId });
  if (error) {
    console.error('Error fetching popularity score:', error);
    return 65; // Default score on error
  }
  return data as number;
};
