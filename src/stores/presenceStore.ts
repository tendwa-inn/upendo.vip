import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';

interface PresenceState {
  onlineUsers: Record<string, any>;
  initializePresence: () => void;
  unsubscribePresence: () => void;
}

const usePresenceStore = create<PresenceState>((set) => ({
  onlineUsers: {},
  initializePresence: () => {
    const currentUser = useAuthStore.getState().user;
    const currentProfile = useAuthStore.getState().profile;
    if (!currentUser || !currentProfile || currentProfile.ghost_mode_enabled) return;

    // Check if presence is already initialized
    if ((window as any).presenceChannel) {
      return;
    }

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    // Set up presence event listeners BEFORE subscribing
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        set({ onlineUsers: newState });
      })
      .on('presence', { event: 'leave' }, async ({ key, leftPresences }) => {
        // When a user leaves, update their last_active timestamp
        if (key === currentUser.id) {
          await supabase
            .from('profiles')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', currentUser.id);
        }
      });

    // Subscribe to the channel after setting up all listeners
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        try {
          await channel.track({ online_at: new Date().toISOString() });
        } catch (error) {
          console.error('Error tracking presence:', error);
        }
      }
    });

    // Set up a function to update last_active periodically
    const interval = setInterval(async () => {
      await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() }) // ONLY update last_active_at
        .eq('id', currentUser.id);
    }, 30000); // Every 30 seconds

    // Store the channel and interval so we can clean up
    (window as any).presenceChannel = channel;
    (window as any).presenceInterval = interval;
  },
  unsubscribePresence: () => {
    const channel = (window as any).presenceChannel;
    const interval = (window as any).presenceInterval;
    if (channel) {
      supabase.removeChannel(channel);
    }
    if (interval) {
      clearInterval(interval);
    }
  },
}));

export default usePresenceStore;
