// =====================================================
// UPENDO CHAT SYSTEM - JAVASCRIPT/TYPESCRIPT IMPLEMENTATION
// =====================================================
// Complete implementation guide for message persistence
// across navigation and refresh
// =====================================================

// =====================================================
// 1. DATABASE SERVICE IMPLEMENTATION
// =====================================================

import { supabase } from './supabaseClient';

/**
 * Chat Database Service
 * Handles all database operations for chat system
 */
export class ChatDatabaseService {
  
  /**
   * Store a new message in the database
   */
  static async storeMessage(matchId: string, senderId: string, content: string, type: string = 'text') {
    try {
      const { data, error } = await supabase
        .rpc('send_message', {
          p_match_id: matchId,
          p_sender_id: senderId,
          p_content: content,
          p_message_type: type
        });

      if (error) throw error;
      return { success: true, messageId: data };
    } catch (error) {
      console.error('Error storing message:', error);
      return { success: false, error };
    }
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_conversations_detailed', {
          p_user_id: userId
        });

      if (error) throw error;
      return { success: true, conversations: data };
    } catch (error) {
      console.error('Error getting conversations:', error);
      return { success: false, error };
    }
  }

  /**
   * Get messages for a specific conversation with pagination
   */
  static async getConversationMessages(matchId: string, userId: string, limit: number = 50, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .rpc('get_conversation_messages_paginated', {
          p_match_id: matchId,
          p_user_id: userId,
          p_limit: limit,
          p_offset: offset
        });

      if (error) throw error;
      return { success: true, messages: data };
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return { success: false, error };
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(messageIds: number[], userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('mark_messages_as_read', {
          p_message_ids: messageIds,
          p_user_id: userId
        });

      if (error) throw error;
      return { success: true, updatedCount: data };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error };
    }
  }

  /**
   * Mark entire conversation as read
   */
  static async markConversationAsRead(matchId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('mark_conversation_as_read', {
          p_match_id: matchId,
          p_user_id: userId
        });

      if (error) throw error;
      return { success: true, updatedCount: data };
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return { success: false, error };
    }
  }

  /**
   * Get conversations that need refresh
   */
  static async getConversationsNeedingRefresh(userId: string, lastRefreshTime?: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_conversations_needing_refresh', {
          p_user_id: userId,
          p_last_refresh_time: lastRefreshTime || null
        });

      if (error) throw error;
      return { success: true, conversations: data };
    } catch (error) {
      console.error('Error getting conversations needing refresh:', error);
      return { success: false, error };
    }
  }

  /**
   * Sync conversation messages
   */
  static async syncConversationMessages(userId: string, matchId: string, lastSyncTime?: string) {
    try {
      const { data, error } = await supabase
        .rpc('sync_conversation_messages', {
          p_user_id: userId,
          p_match_id: matchId,
          p_last_sync_time: lastSyncTime || null
        });

      if (error) throw error;
      return { success: true, syncData: data };
    } catch (error) {
      console.error('Error syncing conversation messages:', error);
      return { success: false, error };
    }
  }

  /**
   * Handle browser refresh - restore conversation state
   */
  static async handleBrowserRefresh(userId: string, currentUrl?: string) {
    try {
      const { data, error } = await supabase
        .rpc('handle_browser_refresh', {
          p_user_id: userId,
          p_current_url: currentUrl || null
        });

      if (error) throw error;
      return { success: true, refreshData: data };
    } catch (error) {
      console.error('Error handling browser refresh:', error);
      return { success: false, error };
    }
  }

  /**
   * Restore conversation after page reload
   */
  static async restoreConversationAfterReload(userId: string, matchId: string) {
    try {
      const { data, error } = await supabase
        .rpc('restore_conversation_after_reload', {
          p_user_id: userId,
          p_match_id: matchId
        });

      if (error) throw error;
      return { success: true, conversationData: data };
    } catch (error) {
      console.error('Error restoring conversation:', error);
      return { success: false, error };
    }
  }
}

// =====================================================
// 2. CHAT STATE MANAGEMENT (ZUSTAND STORE)
// =====================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: string;
  isRead: boolean;
  isEdited: boolean;
  createdAt: string;
}

interface Conversation {
  matchId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhotos: string[];
  lastMessageContent: string;
  lastMessageTime: string;
  unreadCount: number;
  totalMessages: number;
}

interface ChatState {
  conversations: Conversation[];
  currentMessages: Message[];
  selectedConversation: Conversation | null;
  isLoading: boolean;
  lastRefreshTime: string | null;
  
  // Actions
  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (matchId: string, userId: string) => Promise<void>;
  sendMessage: (matchId: string, senderId: string, content: string) => Promise<void>;
  markAsRead: (messageIds: string[], userId: string) => Promise<void>;
  selectConversation: (conversation: Conversation | null) => void;
  refreshConversations: (userId: string) => Promise<void>;
  handleNavigationBack: (userId: string) => Promise<void>;
  handleBrowserRefresh: (userId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentMessages: [],
      selectedConversation: null,
      isLoading: false,
      lastRefreshTime: null,

      /**
       * Load all conversations for the user
       */
      loadConversations: async (userId: string) => {
        set({ isLoading: true });
        try {
          const result = await ChatDatabaseService.getUserConversations(userId);
          if (result.success) {
            set({ 
              conversations: result.conversations,
              lastRefreshTime: new Date().toISOString(),
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error loading conversations:', error);
          set({ isLoading: false });
        }
      },

      /**
       * Load messages for a specific conversation
       */
      loadMessages: async (matchId: string, userId: string) => {
        set({ isLoading: true });
        try {
          const result = await ChatDatabaseService.getConversationMessages(matchId, userId);
          if (result.success) {
            set({ 
              currentMessages: result.messages.reverse(), // Reverse to show oldest first
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error loading messages:', error);
          set({ isLoading: false });
        }
      },

      /**
       * Send a new message
       */
      sendMessage: async (matchId: string, senderId: string, content: string) => {
        try {
          // Optimistically add message to current state
          const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            matchId,
            senderId,
            content,
            type: 'text',
            isRead: false,
            isEdited: false,
            createdAt: new Date().toISOString()
          };

          set(state => ({
            currentMessages: [...state.currentMessages, optimisticMessage]
          }));

          // Store in database
          const result = await ChatDatabaseService.storeMessage(matchId, senderId, content);
          if (result.success) {
            // Update conversations to reflect new last message
            await get().refreshConversations(senderId);
          } else {
            // Remove optimistic message on failure
            set(state => ({
              currentMessages: state.currentMessages.filter(msg => msg.id !== optimisticMessage.id)
            }));
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      },

      /**
       * Mark messages as read
       */
      markAsRead: async (messageIds: string[], userId: string) => {
        try {
          const numericIds = messageIds.map(id => parseInt(id)).filter(id => !isNaN(id));
          if (numericIds.length > 0) {
            await ChatDatabaseService.markMessagesAsRead(numericIds, userId);
            
            // Update local state
            set(state => ({
              currentMessages: state.currentMessages.map(msg => 
                messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
              )
            }));
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      },

      /**
       * Select a conversation
       */
      selectConversation: (conversation: Conversation | null) => {
        set({ selectedConversation: conversation });
      },

      /**
       * Refresh conversations from database
       */
      refreshConversations: async (userId: string) => {
        try {
          const result = await ChatDatabaseService.getUserConversations(userId);
          if (result.success) {
            set({ 
              conversations: result.conversations,
              lastRefreshTime: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error refreshing conversations:', error);
        }
      },

      /**
       * Handle navigation back to conversations list
       */
      handleNavigationBack: async (userId: string) => {
        try {
          // Update navigation state in database
          await supabase.rpc('handle_navigation_to_conversations', {
            p_user_id: userId
          });

          // Refresh conversations
          await get().refreshConversations(userId);
          
          // Clear current messages and selected conversation
          set({ 
            currentMessages: [],
            selectedConversation: null
          });
        } catch (error) {
          console.error('Error handling navigation back:', error);
        }
      },

      /**
       * Handle browser refresh
       */
      handleBrowserRefresh: async (userId: string) => {
        try {
          const result = await ChatDatabaseService.handleBrowserRefresh(userId);
          if (result.success && result.refreshData) {
            const refreshData = result.refreshData[0];
            
            if (refreshData.should_sync_conversations) {
              await get().refreshConversations(userId);
            }

            if (refreshData.last_conversation_id && refreshData.conversations_outdated) {
              // Restore the last conversation if needed
              const conversation = get().conversations.find(c => c.matchId === refreshData.last_conversation_id);
              if (conversation) {
                await get().loadMessages(conversation.matchId, userId);
                set({ selectedConversation: conversation });
              }
            }
          }
        } catch (error) {
          console.error('Error handling browser refresh:', error);
        }
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        conversations: state.conversations,
        lastRefreshTime: state.lastRefreshTime
      })
    }
  )
);

// =====================================================
// 3. REACT HOOKS FOR CHAT NAVIGATION
// =====================================================

import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

/**
 * Hook for managing chat navigation and persistence
 */
export function useChatNavigation(userId: string) {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  const {
    conversations,
    currentMessages,
    selectedConversation,
    loadConversations,
    loadMessages,
    selectConversation,
    handleNavigationBack,
    handleBrowserRefresh
  } = useChatStore();

  /**
   * Initialize chat on component mount
   */
  useEffect(() => {
    const initializeChat = async () => {
      // Handle browser refresh
      if (performance.navigation.type === 1) {
        await handleBrowserRefresh(userId);
      } else {
        // Normal load
        await loadConversations(userId);
      }
    };

    initializeChat();
  }, [userId]);

  /**
   * Handle conversation selection when URL changes
   */
  useEffect(() => {
    if (matchId && conversations.length > 0) {
      const conversation = conversations.find(c => c.matchId === matchId);
      if (conversation) {
        selectConversation(conversation);
        loadMessages(matchId, userId);
      }
    } else if (!matchId) {
      selectConversation(null);
    }
  }, [matchId, conversations, userId]);

  /**
   * Handle navigation back to conversations list
   */
  const handleBack = async () => {
    await handleNavigationBack(userId);
    navigate('/chat');
  };

  /**
   * Handle conversation selection
   */
  const handleSelectConversation = async (conversation: Conversation) => {
    selectConversation(conversation);
    navigate(`/chat/${conversation.matchId}`);
    await loadMessages(conversation.matchId, userId);
  };

  return {
    conversations,
    currentMessages,
    selectedConversation,
    handleBack,
    handleSelectConversation,
    refreshConversations: () => loadConversations(userId)
  };
}

// =====================================================
// 4. CHAT CONVERSATION COMPONENT EXAMPLE
// =====================================================

import React, { useState, useEffect, useRef } from 'react';

interface ChatConversationProps {
  userId: string;
  matchId: string;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({ userId, matchId }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    currentMessages,
    selectedConversation,
    loadMessages,
    sendMessage,
    handleNavigationBack
  } = useChatStore();

  // Load messages when component mounts or matchId changes
  useEffect(() => {
    loadMessages(matchId, userId);
  }, [matchId, userId, loadMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      await sendMessage(matchId, userId, message.trim());
      setMessage('');
    }
  };

  const handleBack = async () => {
    await handleNavigationBack(userId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button onClick={handleBack} className="mr-4">
          ← Back
        </button>
        <div className="flex items-center">
          <img 
            src={selectedConversation?.otherUserPhotos?.[0] || '/placeholder-avatar.png'} 
            alt={selectedConversation?.otherUserName}
            className="w-10 h-10 rounded-full mr-3"
          />
          <h3>{selectedConversation?.otherUserName}</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`mb-4 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}
          >
            <div className={`inline-block p-3 rounded-lg ${
              msg.senderId === userId 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {msg.content}
              <div className="text-xs mt-1 opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

// =====================================================
// 5. CHAT LIST COMPONENT EXAMPLE
// =====================================================

export const ChatList: React.FC<{ userId: string }> = ({ userId }) => {
  const { conversations, handleSelectConversation } = useChatStore();

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.matchId}
          onClick={() => handleSelectConversation(conversation)}
          className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-50"
        >
          <img 
            src={conversation.otherUserPhotos?.[0] || '/placeholder-avatar.png'}
            alt={conversation.otherUserName}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold truncate">{conversation.otherUserName}</h4>
              {conversation.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm truncate">
              {conversation.lastMessageContent || 'Start a conversation'}
            </p>
            <p className="text-gray-400 text-xs">
              {conversation.lastMessageTime 
                ? new Date(conversation.lastMessageTime).toLocaleDateString()
                : ''
              }
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// =====================================================
// 6. USAGE EXAMPLES
// =====================================================

/**
 * Example usage in a React component
 */
export const ChatPage: React.FC<{ userId: string }> = ({ userId }) => {
  const { conversations, refreshConversations } = useChatStore();
  const { handleSelectConversation } = useChatNavigation(userId);

  useEffect(() => {
    // Refresh conversations on mount
    refreshConversations();
    
    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(() => {
      refreshConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshConversations]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Messages</h2>
        <button 
          onClick={refreshConversations}
          className="text-blue-500 text-sm"
        >
          Refresh
        </button>
      </div>
      <ChatList userId={userId} />
    </div>
  );
};

/**
 * Example usage in main App component
 */
export const App: React.FC = () => {
  const userId = 'current-user-id'; // Get from auth context

  return (
    <Routes>
      <Route path="/chat" element={<ChatPage userId={userId} />} />
      <Route 
        path="/chat/:matchId" 
        element={<ChatConversation userId={userId} matchId={useParams().matchId!} />} 
      />
    </Routes>
  );
};