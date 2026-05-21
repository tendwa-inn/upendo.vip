import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Match, Message } from '../types';
import { useAuthStore } from './authStore';
import { recordUnmatch, recordMessageSent } from '../services/popularityService';
import { onesignalService } from '../services/onesignalService';
import { encryptMessage } from '../lib/crypto';
import { normalizeMessage } from '../lib/messageUtils';
import toast from 'react-hot-toast';

import { RealtimeChannel } from '@supabase/supabase-js';

interface MatchState {
  matches: Match[];
  newMatches: Match[];
  selectedMatch: Match | null;
  typingUsers: Record<string, string[]>; // matchId -> array of userIds who are typing
  hasNewMatches: boolean;
  channel: RealtimeChannel | null;
  realtimeChannel: RealtimeChannel | null;
  fetchMatches: () => Promise<void>;
  selectMatch: (match: Match | null) => void;
  addMessage: (matchId: string, message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  unmatch: (matchId: string) => Promise<void>;
  initializeRealtime: () => () => void; // Returns an unsubscribe function
  createMatch: (matchedUserId: string) => Promise<void>;
  setTyping: (matchId: string, userId: string, isTyping: boolean) => void;
  markMatchesAsViewed: () => void;
  listenForStrikes: () => () => void;
  reset: () => void;
}

const initialState = {
  matches: [],
  newMatches: [],
  selectedMatch: null,
  typingUsers: {},
  hasNewMatches: false,
  channel: null,
  realtimeChannel: null,
};

export const useMatchStore = create<MatchState>((set, get) => ({
  ...initialState,
  clearMatches: () => set(initialState),
  reset: () => set(initialState),

  fetchMatches: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('matches')
      .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages(*)')
      .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    const matchesWithNormalizedMessages = data.map(match => {
      const messages = match.messages || [];
      const normalizedMessages = messages.map(normalizeMessage).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return { ...match, messages: normalizedMessages, lastMessage: normalizedMessages[normalizedMessages.length - 1] };
    });
    
    const sortedMatches = matchesWithNormalizedMessages.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

    const newMatches = sortedMatches.filter(match => match.messages.length === 0);
    const existingMatches = sortedMatches.filter(match => match.messages.length > 0);

    set({ matches: existingMatches, newMatches: newMatches, hasNewMatches: newMatches.length > 0 });
  },

  addMessage: async (matchId, message) => {
    const currentUser = useAuthStore.getState().user;
    // Create optimistic message for immediate UI update
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      matchId: matchId,
      senderId: message.senderId,
      content: message.content,
      type: message.type || 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
      ...(message.reply_to && { reply_to: message.reply_to }),
      ...(message.reply_content && { reply_content: message.reply_content }),
    };

    // Add optimistic message immediately
    set((state) => {
      const matchIndex = state.matches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return state;

      const updatedMatch = {
        ...state.matches[matchIndex],
        messages: [...state.matches[matchIndex].messages, optimisticMessage],
        lastMessage: optimisticMessage,
      };

      const newMatches = [...state.matches];
      newMatches[matchIndex] = updatedMatch;

      // Sort matches by last message time
      const sortedMatches = newMatches.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      });

      return {
        matches: sortedMatches,
        selectedMatch: state.selectedMatch?.id === matchId ? updatedMatch : state.selectedMatch,
      };
    });

    // Send to server
    const encryptedContent = message.type === "text" ? encryptMessage(message.content) : message.content;

    const insertData: any = { content: encryptedContent, type: message.type, sender_id: message.senderId, match_id: matchId };
    if (message.reply_to) insertData.reply_to = message.reply_to;
    if (message.reply_content) insertData.reply_content = message.reply_content;

    const { data, error } = await supabase
      .from("messages")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      set((state) => {
        const matchIndex = state.matches.findIndex((m) => m.id === matchId);
        if (matchIndex === -1) return state;

        const updatedMatch = {
          ...state.matches[matchIndex],
          messages: state.matches[matchIndex].messages.filter(m => m.id !== optimisticId),
        };

        const newMatches = [...state.matches];
        newMatches[matchIndex] = updatedMatch;

        return {
          matches: newMatches,
          selectedMatch: state.selectedMatch?.id === matchId ? updatedMatch : state.selectedMatch,
        };
      });
      return;
    }

    // Replace optimistic message with real message
    const cleanMessage = normalizeMessage(data);
    recordMessageSent(message.senderId);

    // Send push notification to the other user
    try {
      const state = get();
      const matchData = state.matches.find(m => m.id === matchId);
      if (matchData && currentUser) {
        const otherUser = matchData.user1.id === currentUser.id ? matchData.user2 : matchData.user1;
        const senderName = currentUser.id === matchData.user1.id
          ? (matchData.user1 as any).display_name || (matchData.user1 as any).name || 'Someone'
          : (matchData.user2 as any).display_name || (matchData.user2 as any).name || 'Someone';
        const preview = message.type === 'text' ? message.content : 'Sent you a message';
        onesignalService.sendMessageNotification(otherUser.id, senderName, preview);
      }
    } catch {}

    set((state) => {
      const matchIndex = state.matches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return state;

      // Replace optimistic message in-place to avoid visual glitch
      const updatedMessages = state.matches[matchIndex].messages.map(m =>
        m.id === optimisticId ? cleanMessage : m
      );
      const updatedMatch = {
        ...state.matches[matchIndex],
        messages: updatedMessages,
        lastMessage: cleanMessage,
      };

      const newMatches = [...state.matches];
      newMatches[matchIndex] = updatedMatch;

      // Sort matches by last message time
      const sortedMatches = newMatches.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      });

      return {
        matches: sortedMatches,
        selectedMatch: state.selectedMatch?.id === matchId ? updatedMatch : state.selectedMatch,
      };
    });
  },

  markMatchesAsViewed: () => set({ hasNewMatches: false }),
  
  selectMatch: async (match) => {
    set({ selectedMatch: match });
    if (match) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        // Mark unread messages sent by the other user as read
        const unreadMessages = match.messages.filter(m => !m.isRead && m.senderId !== currentUser.id);
        
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map(m => m.id);
          
          const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', messageIds);
            
          if (!error) {
            // Update local state to reflect read status
            set((state) => {
              const matchIndex = state.matches.findIndex((m) => m.id === match.id);
              if (matchIndex === -1) return state;
              
              const updatedMessages = state.matches[matchIndex].messages.map(m => 
                messageIds.includes(m.id) ? { ...m, isRead: true } : m
              );
              
              const updatedMatch = {
                ...state.matches[matchIndex],
                messages: updatedMessages,
              };
              
              const newMatches = [...state.matches];
              newMatches[matchIndex] = updatedMatch;
              
              return {
                matches: newMatches,
                selectedMatch: state.selectedMatch?.id === match.id ? updatedMatch : state.selectedMatch,
              };
            });
          } else {
            console.error('Error marking messages as read:', error);
          }
        }
      }
    }
  },

  unmatch: async (matchId: string) => {
    const { matches } = get();
    const match = matches.find(m => m.id === matchId);
    const currentUser = useAuthStore.getState().user;

    if (!match || !currentUser) return;

    const otherUserId = match.user1.id === currentUser.id ? match.user2.id : match.user1.id;
    // Record the unmatch for popularity score, but don't block the UI
    recordUnmatch(currentUser.id, otherUserId).catch(console.error);

    // Use RPC to clean up likes, record mutual dislikes, and delete the match
    // This bypasses RLS so we can insert dislikes in both directions
    const { error: rpcError } = await supabase.rpc('unmatch_user', {
      user_id1: currentUser.id,
      user_id2: otherUserId,
    });
    if (rpcError) {
      console.error('Error in unmatch RPC:', rpcError);
      return;
    }

    set((state) => ({
      matches: state.matches.filter((match) => match.id !== matchId),
      selectedMatch: state.selectedMatch?.id === matchId ? null : state.selectedMatch,
    }));
  },

  initializeRealtime: () => {
    const { channel: existingChannel, realtimeChannel: existingRealtime } = get();

    // If already subscribed, return cleanup
    if (existingChannel || existingRealtime) {
      return () => {
        const ch = get().channel || get().realtimeChannel;
        if (ch) {
          supabase.removeChannel(ch);
          set({ channel: null, realtimeChannel: null });
        }
      };
    }

    // Remove any stale channels with same name
    const channels = supabase.getChannels();
    channels.forEach(ch => {
      if (ch.topic === 'realtime-messages') {
        supabase.removeChannel(ch);
      }
    });

    const channel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.warn('[Realtime] INSERT event received:', payload.new?.id, 'from sender:', payload.new?.sender_id);
        const newMessage = normalizeMessage(payload.new);
        const state = get();
        const currentUser = useAuthStore.getState().user;

        // Skip messages from the current user - they're handled by addMessage
        if (currentUser && newMessage.senderId === currentUser.id) {
          console.warn('[Realtime] Skipping own message');
          return;
        }

        // Don't show notification if user is already viewing the chat
        if (state.selectedMatch?.id !== newMessage.matchId) {
          const matchData = state.matches.find(m => m.id === newMessage.matchId);
          const sender = matchData?.user1.id === newMessage.senderId ? matchData.user1 : matchData?.user2;
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('New Message', {
              body: newMessage.content,
              icon: sender?.photos?.[0] || '/placeholder-avatar.png',
            });
          });
        } else {
          // If they are currently viewing the chat, automatically mark this message as read
          supabase.from('messages').update({ is_read: true }).eq('id', newMessage.id).then();
          newMessage.isRead = true;
        }

        const matchIndex = state.matches.findIndex(m => m.id === newMessage.matchId);

        if (matchIndex === -1) {
          get().fetchMatches();
          return;
        }

        const match = state.matches[matchIndex];
        const existingMessages = match.messages || [];
        const exists = existingMessages.some(m => m.id === newMessage.id);
        if (exists) return;

        const updatedMatch = {
          ...match,
          messages: [...existingMessages, newMessage],
          lastMessage: newMessage,
        };

        const newMatches = [...state.matches];
        newMatches[matchIndex] = updatedMatch;

        newMatches.sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
        });

        set({
          matches: newMatches,
          selectedMatch: state.selectedMatch?.id === newMessage.matchId ? updatedMatch : state.selectedMatch,
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const updatedMsg = normalizeMessage(payload.new);
        const state = get();
        const matchIndex = state.matches.findIndex(m => m.id === updatedMsg.matchId);
        if (matchIndex === -1) return;

        set((state) => {
          const match = state.matches[matchIndex];
          const updatedMessages = match.messages.map(m =>
            m.id === updatedMsg.id ? { ...m, isRead: updatedMsg.isRead } : m
          );

          const updatedMatch = {
            ...match,
            messages: updatedMessages,
            lastMessage: updatedMessages[updatedMessages.length - 1],
          };

          const newMatches = [...state.matches];
          newMatches[matchIndex] = updatedMatch;

          return {
            matches: newMatches,
            selectedMatch: state.selectedMatch?.id === updatedMsg.matchId ? updatedMatch : state.selectedMatch,
          };
        });
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        console.warn('[Realtime] Typing broadcast received:', payload.payload);
        const { matchId, userId, isTyping: typingStatus } = payload.payload;
        get().setTyping(matchId, userId, typingStatus);
      })
      .subscribe((status, err) => {
        console.warn('[Realtime] Subscribe status:', status, err || '');
        if (status === 'SUBSCRIBED') {
          set({ channel, realtimeChannel: channel });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          set({ channel: null, realtimeChannel: null });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      set({ channel: null, realtimeChannel: null });
    };
  },

  createMatch: async (matchedUserId: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return null;

    // Check if a match already exists to prevent duplicates
    const { data: existingMatches, error: existingMatchError } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${matchedUserId}),and(user1_id.eq.${matchedUserId},user2_id.eq.${currentUser.id})`);

    if (existingMatches && existingMatches.length > 0) {
      const { data: fullMatch, error: fetchError } = await supabase
        .from('matches')
        .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages(*)')
        .eq('id', existingMatches[0].id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing match:', fetchError);
        return null;
      }
      
      get().fetchMatches();
      
      return fullMatch;
    }

    if (existingMatchError) {
      console.error('Error checking for existing match:', existingMatchError);
      // Decide if we should proceed or not. For now, we'll stop.
      return;
    }

    const { data, error } = await supabase.from('matches').insert({ user1_id: currentUser.id, user2_id: matchedUserId }).select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages(*)').single();
    if (error) {
      console.error('Error creating match:', error);
      return null;
    }

    const newMatch = { ...data, messages: [] };
    set(state => ({ 
        matches: [newMatch, ...state.matches],
        newMatches: [newMatch, ...state.newMatches], 
        hasNewMatches: true,
        selectedMatch: newMatch
    }));

    // Ensure we are subscribed to this new match
    get().initializeRealtime();

    // Send notification to the other user
    const { data: matchedUserProfile } = await supabase.from('profiles').select('name').eq('id', currentUser.id).single();
    await supabase.from('notifications').insert({
      user_id: matchedUserId,
      title: 'New Match!',
      message: `You matched with ${matchedUserProfile?.name || 'someone'}`,
      type: 'match',
    });

    return newMatch;
  },

  setTyping: (matchId: string, userId: string, isTyping: boolean) => {
    set((state) => {
      const currentTypingUsers = state.typingUsers[matchId] || [];
      let newTypingUsers: string[];
      
      if (isTyping) {
        // Add userId if not already typing
        if (!currentTypingUsers.includes(userId)) {
          newTypingUsers = [...currentTypingUsers, userId];
        } else {
          newTypingUsers = currentTypingUsers;
        }
      } else {
        // Remove userId from typing users
        newTypingUsers = currentTypingUsers.filter(id => id !== userId);
      }
      
      return {
        typingUsers: {
          ...state.typingUsers,
          [matchId]: newTypingUsers
        }
      };
    });
  },

  listenForStrikes: () => {
    const channel = supabase
      .channel('match-strikes-listener')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'matches' },
        (payload) => {
          console.log('Match deleted (likely due to strike), refreshing matches...', payload);
          get().fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
