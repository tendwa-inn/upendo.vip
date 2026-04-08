
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Story } from '../types';
import { useAuthStore } from './authStore';

interface StoryState {
  stories: Story[];
  fetchStories: () => Promise<void>;
  createStory: (imageUrl: string) => Promise<void>;
  likeStory: (storyId: string) => Promise<void>;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],

  fetchStories: async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, user:profiles(*), likes:story_likes(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }

    set({ stories: data as any });
  },

  createStory: async (imageUrl: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { error } = await supabase.from('stories').insert({ user_id: user.id, image_url: imageUrl });

    if (error) {
      console.error('Error creating story:', error);
      return;
    }

    get().fetchStories();
  },

  likeStory: async (storyId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { stories } = get();
    const story = stories.find(s => s.id === storyId);

    if (!story) return;

    const hasLiked = story.likes.some(like => like.user_id === user.id);

    if (hasLiked) {
      // Unlike the story
      const { error } = await supabase.from('story_likes').delete().match({ story_id: storyId, user_id: user.id });
      if (error) {
        console.error('Error unliking story:', error);
        return;
      }
    } else {
      // Like the story
      const { error } = await supabase.from('story_likes').insert({ story_id: storyId, user_id: user.id });
      if (error) {
        console.error('Error liking story:', error);
        return;
      }
    }

    get().fetchStories();
  },
}));
