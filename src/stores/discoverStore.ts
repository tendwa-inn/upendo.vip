import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Story } from '../types';

interface DiscoverState {
  stories: Story[];
  viewedStories: Set<string>;
  fetchStories: () => Promise<void>;
  addStory: (story: Omit<Story, 'id' | 'createdAt'>) => Promise<void>;
  viewStory: (storyId: string) => void;
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  stories: [],
  viewedStories: new Set(),
  fetchStories: async () => {
    const { data, error } = await supabase.from('stories').select('*');
    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }
    set({ stories: data });
  },
  addStory: async (story) => {
    const { data, error } = await supabase.from('stories').insert(story).select();
    if (error) {
      console.error('Error adding story:', error);
      return;
    }
    if (data) {
      set((state) => ({ stories: [data[0], ...state.stories] }));
    }
  },
  viewStory: (storyId) => {
    set((state) => ({
      viewedStories: new Set(state.viewedStories).add(storyId),
    }));
  },
}));
