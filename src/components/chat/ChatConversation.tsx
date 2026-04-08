
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Phone, Video, Heart, ArrowLeft, MoreVertical, Plus, Smile, UserX, ShieldX, Flag, Check, X, Trash2, MessageSquare, Edit, MoreHorizontal, Crown, Shield } from 'lucide-react';
import { Match, Message } from '../../types';
import { useMatchStore } from '../../stores/matchStore.tsx';
import SafeImage from '../common/SafeImage';
import { useAuthStore } from '../../stores/authStore';
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

const TypingIndicator = () => {
  const isVip = ((useAuthStore.getState().profile as any)?.accountType === 'vip') || ((useAuthStore.getState().profile as any)?.subscription === 'vip');
  return (
    <div className="flex justify-start">
      <div className={`${isVip ? 'bg-[#1a1a1a]' : 'bg-[#3a1a22]'} px-4 py-3 rounded-2xl flex gap-2`}>
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

const MessageBubble: React.FC<{ message: Message; onReply: (message: Message) => void; otherUserAvatar?: string; currentUserAvatar?: string; }> = ({ message, onReply, otherUserAvatar, currentUserAvatar }) => {
  const { user: currentUser, profile } = useAuthStore();
  const { isReadReceiptsEnabled } = useSettingsStore();
  const sender = (message as any).sender_id || message.senderId;
  const isSender = sender === currentUser?.id;
  const isRead = (message as any).is_read || message.isRead;
  const isPremium = profile?.accountType === 'pro' || profile?.accountType === 'vip';
  const isVip = profile?.accountType === 'vip' || (profile as any)?.subscription === 'vip';
  const isPro = profile?.accountType === 'pro' || (profile as any)?.subscription === 'pro';

  // Handle sticker messages
  if (message.content === '/sticker hey') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, x: isSender ? 50 : -50 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`flex items-end gap-2 w-full ${isSender ? "justify-end" : "justify-start"}`}>
        {!isSender && (
          <SafeImage src={otherUserAvatar} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
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
            {isSender && isPremium && isReadReceiptsEnabled && isRead && (
              <span className={`${isVip ? 'text-amber-400' : 'text-pink-500'} font-semibold mt-0.5 opacity-100`}>Seen</span>
            )}
          </div>
        </div>
        {isSender && (
          <SafeImage src={currentUserAvatar} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
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
        <SafeImage src={otherUserAvatar} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
      )}
      <div className={`max-w-[75%]`}>
        <div className={`rounded-2xl text-sm leading-relaxed shadow-lg ${
          isSender 
            ? (isPro ? "bg-gradient-to-b from-[#ff7f50] to-[#ff5e57]" : "bg-gradient-to-b from-pink-500 to-pink-700") 
            : (isVip ? "bg-gradient-to-b from-[#1a1a1a] to-[#0b0b0b]" : (isPro ? "bg-gradient-to-b from-[#0e2030] to-[#091522]" : "bg-gradient-to-b from-[#3a1a22] to-[#2E0C13]"))
        } ${message.type === 'gif' ? 'p-0' : 'px-4 py-3'}`}>
          {message.type === 'gif' ? (
            <img src={message.content} alt="gif" className="rounded-2xl" />
          ) : (
            message.content
          )}
        </div>
        <div className={`text-[10px] mt-1 ${isSender ? "text-right" : "text-left"} flex flex-col`}>
            <span className="opacity-60">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isSender && isPremium && isReadReceiptsEnabled && isRead && (
              <span className={`${isVip ? 'text-amber-400' : (isPro ? 'text-sky-400' : 'text-pink-500')} font-semibold mt-0.5 opacity-100`}>{t('chat.seen')}</span>
            )}
          </div>
      </div>
      {isSender && (
        <SafeImage src={currentUserAvatar} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
      )}
    </motion.div>
  );
};


import usePresenceStore from '../../stores/presenceStore';
import { formatDistanceToNowStrict } from 'date-fns';

const ChatConversation: React.FC<{ match: Match }> = ({ match }) => {
  const { user: currentUser } = useAuthStore();
  const { t } = useTranslation();
  if (!currentUser) return null;

  const navigate = useNavigate();
  const { onlineUsers } = usePresenceStore();
  const otherUser = match.user1.id === currentUser?.id ? match.user2 : match.user1;
  const aCurrentUser = match.user1.id === currentUser?.id ? match.user1 : match.user2;

  const isOnline = onlineUsers[otherUser.id];
  const lastActive = otherUser.lastActive ? formatDistanceToNowStrict(new Date(otherUser.lastActive), { addSuffix: true }) : 'never';

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
    if (!currentUser) return;
    await blockService.blockUser(currentUser.id, otherUser.id);
    await unmatch(match.id);
    setBlockDialogOpen(false);
    toast.success(t('toast.block.success'));
    navigate('/chat');
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendHeySticker = () => {
    addMessage(match.id, {
      matchId: match.id,
      senderId: currentUser.id,
      content: '/sticker hey',
      type: 'text',
    });
    setShowConversationStarter(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Hide conversation starter when sending a message
    if (showConversationStarter) {
      setShowConversationStarter(false);
    }

    // Stop typing indicator when sending message
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTyping(match.id, currentUser.id, false);

    addMessage(match.id, {
      matchId: match.id,
      senderId: currentUser.id,
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
      setTyping(match.id, currentUser.id, true);
      
      // Broadcast typing event
      const channel = supabase.channel('messages-channel');
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { matchId: match.id, userId: currentUser.id, isTyping: true },
      });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(match.id, currentUser.id, false);
        
        // Broadcast stop typing event
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { matchId: match.id, userId: currentUser.id, isTyping: false },
        });
        
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      // Stop typing if message is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(match.id, currentUser.id, false);
      
      // Broadcast stop typing event
      const channel = supabase.channel('messages-channel');
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { matchId: match.id, userId: currentUser.id, isTyping: false },
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
      setTyping(match.id, currentUser.id, false);
    };
  }, []);

  // Check if other user is typing in this match
  const otherUserTyping = typingUsers[match.id]?.includes(otherUser.id) || false;


  const acct = (useAuthStore.getState().profile as any)?.accountType || (useAuthStore.getState().profile as any)?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';
  return (
    <div className={`h-screen flex flex-col text-white relative ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#2b0f16] to-[#120508]'}`}>
      <div className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-5 z-0" style={{ backgroundImage: "url('/Upendo Chat Theme.png')" }}></div>
      <div className="relative h-full flex flex-col z-10">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-white/10 ${isVip ? 'bg-black' : isPro ? 'bg-[#0b2237]' : ''}`}>
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
                <Link to={`/user/${otherUser.id}`} className="font-semibold hover:underline">
                  {otherUser.name}
                </Link>
                {/* Premium badge for Pro/VIP users */}
                {((otherUser as any).accountType === 'pro' || (otherUser as any).accountType === 'vip' || (otherUser as any).account_type === 'pro' || (otherUser as any).account_type === 'vip') && (
                  <div className="flex items-center">
                    {((otherUser as any).accountType || (otherUser as any).account_type) === 'vip' ? (
                      <Shield className="w-4 h-4 text-black" />
                    ) : (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {isOnline ? <span className={`${isVip ? 'text-amber-300' : isPro ? 'text-sky-400' : 'text-pink-400'}`}>{t('chat.onlineNow')}</span> : t('chat.activeAgo', { time: lastActive })}
              </div>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2">
              <MoreVertical />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
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
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    <MessageBubble message={msg} onReply={() => {}} otherUserAvatar={otherUser.photos ? otherUser.photos[0] : undefined} currentUserAvatar={aCurrentUser.photos ? aCurrentUser.photos[0] : undefined} />
                  </React.Fragment>
                );
              })}
            </>
          )}
          {otherUserTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2">
          <button type="button" className="p-2 rounded-full bg-white/10">
            <Plus size={18} />
          </button>
          <input
            value={message}
            onChange={handleInputChange}
            placeholder={t('chat.input.placeholder')}
            className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none"
          />
          <button type="button" onClick={() => setGifPickerOpen(!isGifPickerOpen)} className="p-2 rounded-full bg-white/10">
            <Smile size={18} />
          </button>
          <button
            type="submit"
            className={`p-3 rounded-full transition ${isVip ? 'bg-amber-400 text-black hover:bg-amber-500' : isPro ? 'bg-[#ff7f50] hover:bg-[#ff5e57] text-white' : 'bg-pink-500 hover:bg-pink-600'}`}
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
              className="bg-gradient-to-br from-[#1a0f14] to-[#2E0C13] rounded-2xl p-6 mx-4 max-w-sm w-full border border-pink-500/30 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
              
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
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 transition text-white hover:scale-105 shadow-lg shadow-pink-500/25"
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
              className="bg-gradient-to-br from-[#1a0f14] to-[#2E0C13] rounded-2xl p-6 mx-4 max-w-sm w-full border border-pink-500/30 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
              
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
                senderId: currentUser.id,
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
