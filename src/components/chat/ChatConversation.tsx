import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Phone, Video, Heart, ArrowLeft, MoreVertical, Plus, Smile, UserX, ShieldX, Flag, Check, X, Trash2, MessageSquare, Edit, MoreHorizontal, Crown, Shield } from 'lucide-react';
import { Match, Message } from '../../types';
import { useMatchStore } from '../../stores/matchStore.tsx';
import SafeImage from '../common/SafeImage';
import { useAuthStore } from '../../stores/authStore';
import usePresenceStore from '../../stores/presenceStore';
import { reportService } from '../../services/reportService';
import ReportUserModal from '../modals/ReportUserModal';
import { blockService } from '../../services/blockService';
import { Link, useNavigate } from 'react-router-dom';
import { encryptMessage, decryptMessage } from '../../lib/encryption';
import { formatMessageTime, formatMessageDate } from '../../utils/dateUtils';
import { shouldShowDateSeparator } from '../../utils/messageUtils';
import GifPicker from './GifPicker';
import { supabase } from '../../lib/supabaseClient';
import heySticker from '/Hey.png'; // Import the sticker
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const ConversationStarter: React.FC<{ onSendHey: () => void }> = ({ onSendHey }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="mb-4">
        <img 
          src={heySticker} 
          alt={t('chat.sticker.alt')}
          className="w-24 h-24 object-contain cursor-pointer hover:scale-110 transition-transform"
          onClick={onSendHey}
          title={t('chat.sticker.title')}
        />
      </div>
      <div className="text-white/80 text-lg font-medium mb-2">
        {t('chat.conversationStarter.title')}
      </div>
      <div className="text-white/60 text-sm">
        {t('chat.conversationStarter.subtitle')}
      </div>
    </div>
  );
};

const TypingIndicator = ({ viewerTheme }: { viewerTheme: any }) => {
  return (
    <div className="flex justify-start">
      <div className={`${viewerTheme.bubble.receiver} px-4 py-3 rounded-2xl flex gap-2`}>
        <motion.span
          className="w-2 h-2 bg-white/60 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="w-2 h-2 bg-white/60 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.span
          className="w-2 h-2 bg-white/60 rounded-full"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ 
  message: Message; 
  onReply: (message: Message) => void; 
  otherUser: any;
  currentUserInMatch: any;
  viewerTheme: any; 
}> = ({ message, onReply, otherUser, currentUserInMatch, viewerTheme }) => {
  const { user: loggedInUser } = useAuthStore();
  const { t } = useTranslation();
  const { isReadReceiptsEnabled } = useSettingsStore();

  const isSender = ((message as any).sender_id || message.senderId) === loggedInUser?.id;
  const senderProfile = isSender ? currentUserInMatch : otherUser;
  const senderAccountType = (senderProfile as any)?.account_type || (senderProfile as any)?.subscription || 'free';
  const senderTheme = getTheme(senderAccountType);

  const isRead = (message as any).is_read || message.isRead;

  // Handle sticker messages
  if (message.content === '/sticker hey') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, x: isSender ? 50 : -50 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`flex items-end gap-2 w-full ${isSender ? "justify-end" : "justify-start"}`}>
        {!isSender && (
          <SafeImage src={otherUser.photos?.[0]} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
        )}
        <div className="max-w-[75%]">
          <div className="rounded-2xl text-sm leading-relaxed shadow-lg bg-transparent p-0">
            <img 
              src={heySticker} 
              alt="Hey sticker" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className={`text-[10px] mt-1 ${isSender ? "text-right" : "text-left"} flex flex-col`}>
            <span className="opacity-60">{formatMessageTime(message.timestamp)}</span>
            {isSender && (senderAccountType === 'pro' || senderAccountType === 'vip') && isReadReceiptsEnabled && isRead && (
              <span className={cn("font-semibold mt-0.5 opacity-100", senderTheme.primary)}>{t('chat.seen')}</span>
            )}
          </div>
        </div>
        {isSender && (
          <SafeImage src={currentUserInMatch.photos?.[0]} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: isSender ? 50 : -50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex items-end gap-2 w-full ${isSender ? "justify-end" : "justify-start"}`}>
      {!isSender && (
        <SafeImage src={otherUser.photos?.[0]} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
      )}
      <div className={`max-w-[75%]`}>
        <div className={`rounded-2xl text-sm leading-relaxed shadow-lg ${isSender ? senderTheme.bubble.sender : viewerTheme.bubble.receiver} ${message.type === 'gif' ? 'p-0' : 'px-4 py-3'}`}>
          {message.type === 'gif' ? (
            <img src={message.content} alt="gif" className="rounded-2xl" />
          ) : (
            message.content
          )}
        </div>
        <div className={`text-[10px] mt-1 ${isSender ? "text-right" : "text-left"} flex flex-col`}>
            <span className="opacity-60">{formatMessageTime(message.timestamp)}</span>
            {isSender && (senderAccountType === 'pro' || senderAccountType === 'vip') && isReadReceiptsEnabled && isRead && (
              <span className={cn("font-semibold mt-0.5 opacity-100", senderTheme.primary)}>{t('chat.seen')}</span>
            )}
          </div>
      </div>
      {isSender && (
        <SafeImage src={currentUserInMatch.photos?.[0]} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
      )}
    </motion.div>
  );
};


import { wordFilterService } from '../../services/wordFilterService';
import { formatDistanceToNowStrict } from 'date-fns';

import { getTheme } from '../../styles/theme';

const ChatConversation: React.FC<{ match: Match }> = ({ match }) => {
  const { user: loggedInUser, profile } = useAuthStore();
  const accountType = (profile as any)?.account_type || (profile as any)?.subscription || 'free';
  const theme = getTheme(accountType);
  const isVip = accountType === 'vip';
  const isPro = accountType === 'pro';
  const { t } = useTranslation();
  if (!loggedInUser) return null;

  const navigate = useNavigate();
  const { onlineUsers } = usePresenceStore();
  const otherUser = match.user1.id === loggedInUser?.id ? match.user2 : match.user1;
  const currentUserInMatch = match.user1.id === loggedInUser?.id ? match.user1 : match.user2;
  
  // Debug: Log the entire match data to understand the structure
  console.log('[DEBUG] ChatConversation match data:', {
    matchId: match.id,
    user1: {
      id: match.user1.id,
      name: match.user1.name,
      lastActive: match.user1.lastActive,
      last_active_at: (match.user1 as any).last_active_at,
    },
    user2: {
      id: match.user2.id,
      name: match.user2.name,
      lastActive: match.user2.lastActive,
      last_active_at: (match.user2 as any).last_active_at,
    },
    otherUser: {
      id: otherUser.id,
      name: otherUser.name,
      lastActive: otherUser.lastActive,
      last_active_at: (otherUser as any).last_active_at,
    }
  });
  
  const otherUserTheme = getTheme((otherUser as any)?.account_type || (otherUser as any)?.accountType || (otherUser as any)?.subscription);

  const isOnline = !!onlineUsers[otherUser.id];
  
  const lastActive = otherUser.last_active_at
    ? formatDistanceToNowStrict(
        new Date(otherUser.last_active_at),
        { addSuffix: true }
      )
    : 'never';

  // Check if this is a new conversation (no messages yet)
  const isNewConversation = match.messages.length === 0;

  const [message, setMessage] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isUnmatchDialogOpen, setUnmatchDialogOpen] = useState(false);
  const [isBlockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isGifPickerOpen, setGifPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showConversationStarter, setShowConversationStarter] = useState(isNewConversation);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReport = (reason: string) => {
    setMenuOpen(false);
    setReportModalOpen(true);
  };

  const handleGifButtonClick = () => {
    if (isVip) {
      setGifPickerOpen(!isGifPickerOpen);
    } else {
      toast.error('Only VIP users can send GIFs.');
    }
  };

  const handleUnmatchClick = () => {
    setMenuOpen(false);
    setUnmatchDialogOpen(true);
  };

  const handleBlockClick = () => {
    setMenuOpen(false);
    setBlockDialogOpen(true);
  };

  const { addMessage, unmatch, setTyping, typingUsers, fetchMatches } = useMatchStore();

  const handleBack = () => {
    fetchMatches(); // Fetch in the background
    navigate('/chat');
  };

  // Show conversation starter for new conversations
  useEffect(() => {
    if (isNewConversation) {
      setShowConversationStarter(true);
    }
  }, [isNewConversation]);

  // Hide conversation starter when any message is received
  useEffect(() => {
    if (match.messages.length > 0 && showConversationStarter) {
      setShowConversationStarter(false);
    }
  }, [match.messages.length, showConversationStarter]);

  const handleUnmatch = async () => {
    await unmatch(match.id);
    setUnmatchDialogOpen(false);
    navigate('/chat');
  };

  const handleBlock = async () => {
    if (!loggedInUser) return;
    await blockService.blockUser(loggedInUser.id, otherUser.id);
    await unmatch(match.id);
    setBlockDialogOpen(false);
    toast.success(t('toast.block.success'));
    navigate('/chat');
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendHeySticker = () => {
    if (!loggedInUser) return;

    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      matchId: match.id,
      senderId: loggedInUser.id,
      content: '/sticker hey',
      type: 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Optimistically update the UI
    useMatchStore.setState(state => {
      const matches = state.matches.map(m => {
        if (m.id === match.id) {
          return {
            ...m,
            messages: [...m.messages, optimisticMessage]
          };
        }
        return m;
      });
      return { matches };
    });

    // Send the message to the server
    addMessage(match.id, {
      matchId: match.id,
      senderId: loggedInUser.id,
      content: '/sticker hey',
      type: 'text',
    });
    setShowConversationStarter(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    console.log('[DEBUG] ChatConversation: Checking message for filtered words...');
    const filteredWord = await wordFilterService.checkMessage(trimmedMessage);
    console.log('[DEBUG] ChatConversation: Filtered word check result:', filteredWord);

    if (filteredWord) {
      toast.error('Your message contains restricted content and was not sent.');
      console.log('[DEBUG] ChatConversation: Filtered word found. Taking action...');

      // Unmatch the users
      console.log('[DEBUG] ChatConversation: Calling unmatch_user RPC...');
      await supabase.rpc('unmatch_user', {
        user_id1: loggedInUser.id,
        user_id2: otherUser.id
      });

      // Record the strike and notify the user
      console.log('[DEBUG] ChatConversation: Calling record_strike_and_notify RPC...');
      await supabase.rpc('record_strike_and_notify', {
        p_user_id: loggedInUser.id,
        p_word: filteredWord.word
      });

      // Navigate away from the chat
      console.log('[DEBUG] ChatConversation: Navigating away...');
      navigate('/chat');
      return; // Stop the message from being sent
    }

    // Hide conversation starter when sending a message
    if (showConversationStarter) {
      setShowConversationStarter(false);
    }

    // Stop typing indicator when sending message
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTyping(match.id, loggedInUser.id, false);

    addMessage(match.id, {
      matchId: match.id,
      senderId: loggedInUser.id,
      content: message,
      type: 'text',
    });
    setMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Hide conversation starter when user starts typing
    if (showConversationStarter && newMessage.trim()) {
      setShowConversationStarter(false);
    }

    // Start typing indicator
    if (newMessage.trim()) {
      setTyping(match.id, loggedInUser.id, true);
      
      // Broadcast typing event
      const channel = supabase.channel('messages-channel');
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { matchId: match.id, userId: loggedInUser.id, isTyping: true },
      });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(match.id, loggedInUser.id, false);
        
        // Broadcast stop typing event
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { matchId: match.id, userId: loggedInUser.id, isTyping: false },
        });
        
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      // Stop typing if message is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(match.id, loggedInUser.id, false);
      
      // Broadcast stop typing event
      const channel = supabase.channel('messages-channel');
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { matchId: match.id, userId: loggedInUser.id, isTyping: false },
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [match.messages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing when leaving the chat
      setTyping(match.id, loggedInUser.id, false);
    };
  }, []);

  // Check if other user is typing in this match
  const otherUserTyping = typingUsers[match.id]?.includes(otherUser.id) || false;

  return (
    <div className={`h-screen flex flex-col text-white relative ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#2b0f16] to-[#120508]'}`}>
      <div className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-5 z-0" style={{ backgroundImage: "url('/upendo-chat-theme.png')" }}></div>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-white/10 ${isVip ? 'bg-black' : isPro ? 'bg-[#0b2237]' : ''} flex-shrink-0 z-10`}>
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1">
            <ArrowLeft />
          </button>
          <div className="relative">
            <SafeImage src={otherUser.photos[0]} alt="avatar" className="w-10 h-10 rounded-full" fallbackSrc="/upendo-logo.png" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 ${isVip ? 'border-black' : isPro ? 'border-[#0b2237]' : 'border-[#2b0f16]'}`}></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/user/${otherUser.id}`} className="font-semibold hover:underline text-white">
                {otherUser.name}
              </Link>
            </div>
            <div className={cn("text-xs font-bold", otherUserTheme.primary)}>
              {isOnline ? t('chat.onlineNow') : t('chat.activeAgo', { time: lastActive })}
            </div>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2">
            <MoreVertical />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className={`absolute top-16 right-4 w-48 rounded-md shadow-lg z-50 ${
              isVip ? 'bg-black/80 border border-amber-400/30' : isPro ? 'bg-[#0b1a2b]/90 border border-sky-400/30' : 'bg-[#3a1a22]'
            }`}
          >
            <ul className="py-1">
              <li>
                <button onClick={handleUnmatchClick} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2">
                  <UserX size={16} /> {t('chat.menu.unmatch')}
                </button>
              </li>
              <li>
                <button onClick={handleBlockClick} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2">
                  <ShieldX size={16} /> {t('chat.menu.block')}
                </button>
              </li>
              <li>
                <button onClick={() => handleReport('')} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 flex items-center gap-2">
                  <Flag size={16} /> {t('chat.menu.report')}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
        {showConversationStarter && (
          <ConversationStarter onSendHey={handleSendHeySticker} />
        )}
        {!showConversationStarter && (
          <>
            {match.messages.map((msg, index) => {
              const showDateSeparator = shouldShowDateSeparator(msg, match.messages[index - 1]);
              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="text-center text-xs text-white/40 uppercase">
                      {formatMessageDate(msg.timestamp)}
                    </div>
                  )}
                  <MessageBubble message={msg} onReply={() => {}} otherUser={otherUser} currentUserInMatch={currentUserInMatch} viewerTheme={theme} />
                </React.Fragment>
              );
            })}
          </>
        )}
        {otherUserTyping && <TypingIndicator viewerTheme={theme} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 z-10">
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2">
          <button
            type="button"
            onClick={handleGifButtonClick}
            className={`p-2 rounded-full transition ${!isVip ? 'opacity-50 cursor-not-allowed' : theme.bubble.sender + ' hover:opacity-80'}`}
          >
            <Smile size={18} />
          </button>
          <input
            value={message}
            onChange={handleInputChange}
            placeholder={t('chat.input.placeholder')}
            className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className={cn("p-3 rounded-full transition text-white", theme.bubble.sender)}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Confirmation Dialogs */}
      <AnimatePresence>
        {isUnmatchDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setUnmatchDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`bg-gradient-to-br ${isVip ? 'from-black to-[#0b0b0b] border-amber-400/30' : isPro ? 'from-[#071521] to-[#0b2237] border-cyan-400/30' : 'from-[#1a0f14] to-[#2E0C13] border-pink-500/30'} rounded-2xl p-6 mx-4 max-w-sm w-full border shadow-2xl relative`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl blur-xl ${
                isVip ? 'bg-gradient-to-r from-amber-400/10 to-yellow-500/10' : isPro ? 'bg-gradient-to-r from-cyan-400/10 to-blue-500/10' : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10'
              }`}></div>
              
              <h3 className="text-lg font-semibold mb-2 text-white relative z-10">{t('chat.unmatch.title')}</h3>
              <p className="text-gray-300 mb-4 relative z-10">{t('chat.unmatch.body', { name: otherUser.name })}</p>
              <div className="flex gap-3 justify-end relative z-10">
                <button
                  onClick={() => setUnmatchDialogOpen(false)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-white hover:scale-105"
                >
                  {t('chat.unmatch.cancel')}
                </button>
                <button
                  onClick={handleUnmatch}
                  className={`px-4 py-2 rounded-full transition text-white hover:scale-105 shadow-lg ${
                    isVip ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25' : isPro ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-cyan-500/25' : 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 shadow-pink-500/25'
                  }`}
                >
                  {t('chat.unmatch.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBlockDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setBlockDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`bg-gradient-to-br ${isVip ? 'from-black to-[#0b0b0b] border-amber-400/30' : isPro ? 'from-[#071521] to-[#0b2237] border-cyan-400/30' : 'from-[#1a0f14] to-[#2E0C13] border-pink-500/30'} rounded-2xl p-6 mx-4 max-w-sm w-full border shadow-2xl relative`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl blur-xl ${
                isVip ? 'bg-gradient-to-r from-amber-400/10 to-yellow-500/10' : isPro ? 'bg-gradient-to-r from-cyan-400/10 to-blue-500/10' : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10'
              }`}></div>
              
              <h3 className="text-lg font-semibold mb-2 text-white relative z-10">{t('chat.block.title')}</h3>
              <p className="text-gray-300 mb-4 relative z-10">{t('chat.block.body', { name: otherUser.name })}</p>
              <div className="flex gap-3 justify-end relative z-10">
                <button
                  onClick={() => setBlockDialogOpen(false)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-white hover:scale-105"
                >
                  {t('chat.block.cancel')}
                </button>
                <button
                  onClick={handleBlock}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition text-white hover:scale-105 shadow-lg shadow-red-500/25"
                >
                  {t('chat.block.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportUserModal
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={(reason) => handleReport(reason)}
      />

      <AnimatePresence>
        {isGifPickerOpen && (
          <GifPicker
            onSelect={(gifUrl) => {
              addMessage(match.id, {
                matchId: match.id,
                senderId: loggedInUser.id,
                content: gifUrl,
                type: 'gif',
              });
              setGifPickerOpen(false);
            }}
            onClose={() => setGifPickerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatConversation;
