
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Match, User, Message } from '../types';
import { decryptMessage, encryptMessage } from '../lib/encryption';
import { useAuthStore } from './authStore';

const normalizeMessage = (msg: any): Message => ({
  ...msg,
  content: msg.type === 'text' && msg.content ? decryptMessage(msg.content) : msg.content,
  timestamp: msg.created_at,
});

const normalizeUser = (user: any): User => {
  return {
    ...user,
    lastActive: user.last_active_at ? new Date(user.last_active_at) : undefined,
    account_type: user.account_type ?? user.subscription,
  };
};

interface MatchState {
  matches: Match[];
  selectedMatch: Match | null;
  typingUsers: { [matchId: string]: string[] };
  fetchMatches: () => Promise<void>;
  createMatch: (user2Id: string) => Promise<Match | null>;
  selectMatch: (match: Match | null) => void;
  addMessage: (matchId: string, message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  setMessages: (matchId: string, messages: Message[]) => void;
  markAsRead: (matchId: string, messageId: string) => void;
  unmatch: (matchId: string) => Promise<void>;
  initializeRealtime: () => () => void;
  checkMatch: (currentUser: User, swipedUser: User) => boolean;
  editMessage: (matchId: string, messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (matchId: string, messageId: string) => Promise<void>;
  setTyping: (matchId: string, userId: string, isTyping: boolean) => void;
  subscribeToProfileChanges: () => any; // Return type is Supabase channel
  unsubscribeFromProfileChanges: () => void;
  listenForStrikes: () => () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  selectedMatch: null,
  typingUsers: {},

  subscribeToProfileChanges: () => {
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const updatedProfile = payload.new as User;
          const { matches } = get();

          const updatedMatches = matches.map(match => {
            if (match.user1.id === updatedProfile.id) {
              return { ...match, user1: { ...match.user1, ...normalizeUser(updatedProfile) } };
            }
            if (match.user2.id === updatedProfile.id) {
              return { ...match, user2: { ...match.user2, ...normalizeUser(updatedProfile) } };
            }
            return match;
          });

          set({ matches: updatedMatches });
        }
      )
      .subscribe();

    return channel;
  },

  unsubscribeFromProfileChanges: () => {
    const channel = (window as any).profileChangesChannel;
    if (channel) {
      supabase.removeChannel(channel);
    }
  },

  setTyping: (matchId, userId, isTyping) => {
    set((state) => {
      const current = state.typingUsers[matchId] || [];
      const updated = isTyping
        ? Array.from(new Set([...current, userId]))
        : current.filter((id) => id !== userId);
      return {
        typingUsers: {
          ...state.typingUsers,
          [matchId]: updated,
        },
      };
    });
  },

  fetchMatches: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { data: blockedUsersData, error: blockedUsersError } = await supabase
      .from('blocked_users')
      .select('blocked_user_id')
      .eq('user_id', currentUser.id);

    const blockedUserIds = (blockedUsersData || []).map(b => b.blocked_user_id);

    let query = supabase
      .from('matches')
      .select('*, user1:profiles!user1_id(id, name, photos, account_type, subscription, last_active_at), user2:profiles!user2_id(id, name, photos, account_type, subscription, last_active_at), messages:messages(*)')
      .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);

    if (blockedUserIds.length > 0) {
      query = query
        .not('user1_id', 'in', `(${blockedUserIds.join(',')})`)
        .not('user2_id', 'in', `(${blockedUserIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    const matchesWithLastMessage = data.map(match => {
      const user1 = normalizeUser(match.user1);
      const user2 = normalizeUser(match.user2);

      const normalizedMessages = match.messages.map(normalizeMessage);
      const sortedMessages = normalizedMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return { 
        ...match, 
        user1,
        user2,
        messages: normalizedMessages, 
        lastMessage: sortedMessages[0] 
      };
    });

    set({ matches: matchesWithLastMessage });
  },

  createMatch: async (user2Id) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return null;

    const { data: existingMatch } = await supabase
      .from('matches')
      .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages:messages(*)')
      .or(`(user1_id.eq.${currentUser.id},and(user2_id.eq.${user2Id}))`)
      .or(`(user1_id.eq.${user2Id},and(user2_id.eq.${currentUser.id}))`)
      .single();

    if (existingMatch) {
      const normalizedMessages = existingMatch.messages.map(normalizeMessage);
      return { ...existingMatch, messages: normalizedMessages };
    }

    const { data, error } = await supabase
      .from('matches')
      .insert({ user1_id: currentUser.id, user2_id: user2Id })
      .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*), messages:messages(*)')
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return null;
    }
    if (data) {
      const normalizedMessages = data.messages.map(normalizeMessage);
      const newMatch = { ...data, messages: normalizedMessages };
      set((state) => ({ matches: [newMatch, ...state.matches] }));
      return newMatch;
    }
    return null;
  },

  initializeRealtime: () => {
    const channel = supabase.channel('messages');
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = normalizeMessage(payload.new);
        const state = get();

        const matchIndex = state.matches.findIndex(m => m.id === newMessage.match_id);
        if (matchIndex === -1) return;

        if (newMessage.sender_id === useAuthStore.getState().user?.id) return;

        const updatedMatch = {
          ...state.matches[matchIndex],
          messages: [...state.matches[matchIndex].messages, newMessage],
          lastMessage: newMessage,
        };

        const newMatches = [...state.matches];
        newMatches[matchIndex] = updatedMatch;

        set({ 
          matches: newMatches.sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()),
          selectedMatch: state.selectedMatch?.id === newMessage.match_id ? updatedMatch : state.selectedMatch,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  selectMatch: (match) => {
    set({ selectedMatch: match });
  },

  setMessages: (matchId, messages) => {
    set((state) => ({
      matches: state.matches.map((match) =>
        match.id === matchId ? { ...match, messages } : match
      ),
      selectedMatch: state.selectedMatch?.id === matchId
        ? { ...state.selectedMatch, messages }
        : state.selectedMatch,
    }));
  },

  addMessage: async (matchId, message) => {
    const contentToEncrypt = message.content;
    const encryptedContent = message.type === 'text' ? encryptMessage(contentToEncrypt) : contentToEncrypt;

    const { data, error } = await supabase
      .from('messages')
      .insert({ content: encryptedContent, type: message.type, sender_id: message.senderId, match_id: matchId })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return;
    }

    const normalizedMessage = normalizeMessage(data);

    set((state) => {
      const matchIndex = state.matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return state;

      const updatedMatch = {
        ...state.matches[matchIndex],
        messages: [...state.matches[matchIndex].messages, normalizedMessage],
        lastMessage: normalizedMessage,
      };

      const newMatches = [...state.matches];
      newMatches[matchIndex] = updatedMatch;

      return {
        matches: newMatches,
        selectedMatch: state.selectedMatch?.id === matchId ? updatedMatch : state.selectedMatch,
      };
    });

    if (message.type === 'gif') {
      const recentGifs = JSON.parse(localStorage.getItem('recent_gifs') || '[]');
      const updatedRecentGifs = [message.content, ...recentGifs.filter((g: string) => g !== message.content)].slice(0, 20);
      localStorage.setItem('recent_gifs', JSON.stringify(updatedRecentGifs));
    }
  },

  unmatch: async (matchId) => {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) {
      console.error('Error unmatching:', error);
      return;
    }
    set((state) => ({
      matches: state.matches.filter((match) => match.id !== matchId),
      selectedMatch: state.selectedMatch?.id === matchId ? null : state.selectedMatch,
    }));
  },

  editMessage: async (matchId, messageId, newContent) => {
    const { error } = await supabase
      .from('messages')
      .update({ content: newContent, is_edited: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error editing message:', error);
      return;
    }
    set((state) => ({
      matches: state.matches.map((match) =>
        match.id === matchId
          ? { ...match, messages: match.messages.map(m => m.id === messageId ? {...m, content: newContent, isEdited: true} : m) }
          : match
      ),
      selectedMatch: state.selectedMatch?.id === matchId
        ? { ...state.selectedMatch, messages: state.selectedMatch.messages.map(m => m.id === messageId ? {...m, content: newContent, isEdited: true} : m) }
        : state.selectedMatch,
    }));
  },

  deleteMessage: async (matchId, messageId) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) {
      console.error('Error deleting message:', error);
      return;
    }
    set((state) => ({
      matches: state.matches.map((match) =>
        match.id === matchId
          ? { ...match, messages: match.messages.filter(m => m.id !== messageId) }
          : match
      ),
      selectedMatch: state.selectedMatch?.id === matchId
        ? { ...state.selectedMatch, messages: state.selectedMatch.messages.filter(m => m.id !== messageId) }
        : state.selectedMatch,
    }));
  },

  listenForStrikes: () => {
    const channel = supabase
      .channel('match-strikes-listener')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'matches' },
        (payload) => {
          console.log('Match deleted (likely due to strike), refreshing matches...', payload);
          // Refetch matches to remove users who were unmatched due to strikes
          get().fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
