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
    if (!currentUser || currentUser.ghost_mode_enabled) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        set({ onlineUsers: newState });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    // Set up a function to update last_active periodically
    const interval = setInterval(async () => {
      await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
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
