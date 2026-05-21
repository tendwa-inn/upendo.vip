import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Send, Camera, Phone, Video, Heart, ArrowLeft, MoreVertical, Plus, Smile, UserX, ShieldX, Flag, Check, X, Trash2, MessageSquare, Edit, MoreHorizontal, Crown, Shield, Reply, Gamepad2 } from 'lucide-react';
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
import GhostGameArena from '../games/GhostGameArena';
import GameInviteMessage from '../games/GameInviteMessage';
import { flareService } from '../../services/flareService';
import { soundService } from '../../soundService';

// Incoming message sound (iMessage-like ding via Web Audio API)
const playIncomingSound = () => {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 1200;
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second tone (slightly higher, delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 1600;
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.25, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);

    // Cleanup
    setTimeout(() => ctx.close(), 500);
  } catch {}
};

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

  const isRead = (message as any).is_read || message.isRead;

  // Swipe to reply
  const x = useMotionValue(0);
  const replyOpacity = useTransform(x, [0, 60, 80], [0, 0.5, 1]);
  const bubbleX = useTransform(x, [0, 80], [0, 30], { clamp: true });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = useCallback((_: any, info: { offset: { x: number } }) => {
    setIsDragging(false);
    if (info.offset.x > 60) {
      onReply(message);
    }
  }, [message, onReply]);

  // Handle sticker messages
  if (message.content === '/sticker hey') {
    return (
      <div className="relative flex items-end gap-2 w-full">
        {/* Reply indicator */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isSender ? 'right-0' : 'left-0'}`}
          style={{ opacity: replyOpacity }}
        >
          <Reply size={16} className="text-white/60" />
        </motion.div>

        <motion.div
          style={{ x: bubbleX }}
          drag="x"
          dragConstraints={{ left: 0, right: 80 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          initial={isSender ? { scale: 1 } : { opacity: 0, y: 8 }}
          animate={isSender ? { scale: [1, 1.04, 1] } : { opacity: 1, y: 0 }}
          transition={isSender ? { duration: 0.25, times: [0, 0.4, 1], ease: "easeOut" } : { duration: 0.15, ease: "easeOut" }}
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
                <span className={cn("font-semibold mt-0.5 opacity-100", viewerTheme.primary)}>{t('chat.seen')}</span>
              )}
            </div>
          </div>
          {isSender && (
            <SafeImage src={currentUserInMatch.photos?.[0]} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
          )}
        </motion.div>
      </div>
    );
  }

  // Check if this message is a reply
  const replyToId = (message as any).reply_to;
  const replyContent = (message as any).reply_content;

  return (
    <div className="relative flex items-end gap-2 w-full">
      {/* Reply indicator - shows when swiping */}
      <motion.div
        className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 ${isSender ? 'right-0' : 'left-0'}`}
        style={{ opacity: replyOpacity }}
      >
        <Reply size={16} className="text-white/60" />
      </motion.div>

      <motion.div
        style={{ x: bubbleX }}
        drag="x"
        dragConstraints={{ left: 0, right: 80 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        initial={isSender ? { scale: 1 } : { opacity: 0, y: 8 }}
        animate={isSender ? { scale: [1, 1.04, 1] } : { opacity: 1, y: 0 }}
        transition={isSender ? { duration: 0.25, times: [0, 0.4, 1], ease: "easeOut" } : { duration: 0.15, ease: "easeOut" }}
        className={`flex items-end gap-2 w-full ${isSender ? "justify-end" : "justify-start"}`}>
        {!isSender && (
          <SafeImage src={otherUser.photos?.[0]} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
        )}
        <div className={`max-w-[75%]`}>
          {/* Reply preview */}
          {replyToId && replyContent && (
            <div className={`mb-1 px-3 py-1.5 rounded-t-xl border-l-2 text-xs ${
              isSender
                ? 'bg-white/10 border-white/40 text-white/60'
                : 'bg-white/5 border-white/30 text-white/50'
            }`}>
              <span className="opacity-70 line-clamp-1">{replyContent}</span>
            </div>
          )}
          <div className={`rounded-2xl text-sm leading-relaxed shadow-lg ${isSender ? viewerTheme.bubble.sender : viewerTheme.bubble.receiver} ${message.type === 'gif' ? 'p-0' : 'px-4 py-3'} ${replyToId ? 'rounded-t-none' : ''}`}>
            {message.type === 'gif' ? (
              <img src={message.content} alt="gif" className="rounded-2xl" />
            ) : (
              message.content
            )}
          </div>
          <div className={`text-[10px] mt-1 ${isSender ? "text-right" : "text-left"} flex flex-col`}>
            <span className="opacity-60">{formatMessageTime(message.timestamp)}</span>
            {isSender && (senderAccountType === 'pro' || senderAccountType === 'vip') && isReadReceiptsEnabled && isRead && (
              <span className={cn("font-semibold mt-0.5 opacity-100", viewerTheme.primary)}>{t('chat.seen')}</span>
            )}
          </div>
        </div>
        {isSender && (
          <SafeImage src={currentUserInMatch.photos?.[0]} alt="avatar" className="w-8 h-8 rounded-full" fallbackSrc="/upendo-logo.png" />
        )}
      </motion.div>
    </div>
  );
};


import { wordFilterService } from '../../services/wordFilterService';
import { formatDistanceToNowStrict } from 'date-fns';

import { getTheme } from '../../styles/theme';
import { useCurrentTheme } from '../../stores/colorThemeStore';

const ChatConversation: React.FC<{ match: Match }> = ({ match }) => {
  const { user: loggedInUser, profile } = useAuthStore();
  const accountType = (profile as any)?.account_type || (profile as any)?.subscription || 'free';
  const theme = useCurrentTheme(accountType);
  const isVip = accountType === 'vip';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onlineUsers } = usePresenceStore();

  // Select messages separately so component re-renders when messages change
  const messages = useMatchStore(
    (state) => state.matches.find((m) => m.id === match.id)?.messages || match.messages
  );
  // Select typingUsers separately so component re-renders when typing status changes
  const typingUsersFromStore = useMatchStore((state) => state.typingUsers);

  // Play incoming sound when a new message from the other user arrives
  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    if (!loggedInUser) return;
    if (messages.length > prevMsgCountRef.current && prevMsgCountRef.current > 0) {
      const latest = messages[messages.length - 1];
      if (latest && latest.senderId !== loggedInUser.id) {
        playIncomingSound();
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, loggedInUser?.id]);

  // Use live match from Zustand store instead of stale props
  const liveMatch = useMatchStore(
    (state) =>
      state.matches.find((m) => m.id === match.id) || match
  );

  const [message, setMessage] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isUnmatchDialogOpen, setUnmatchDialogOpen] = useState(false);
  const [isBlockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isGifPickerOpen, setGifPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showConversationStarter, setShowConversationStarter] = useState(() => messages.length === 0);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Game state persistence key
  const gameStorageKey = `upendo-game-${match.id}`;

  // Load persisted game state or use defaults
  const loadGameState = () => {
    try {
      const saved = localStorage.getItem(gameStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Don't resume finished or idle games
        if (parsed.gameState === 'finished' || parsed.gameState === 'idle') {
          localStorage.removeItem(gameStorageKey);
          return null;
        }
        return parsed;
      }
    } catch {}
    return null;
  };

  const savedGame = useRef(loadGameState()).current;
  const [gameState, setGameState] = useState<'idle' | 'inviteSent' | 'myTurn' | 'opponentTurn' | 'opponentPlayed' | 'finished'>(savedGame?.gameState || 'idle');
  const [gameRound, setGameRound] = useState(savedGame?.gameRound || 1);
  const [gameRoundScores, setGameRoundScores] = useState<{ my: number; opp: number }[]>(savedGame?.gameRoundScores || []);
  const [opponentLastScore, setOpponentLastScore] = useState(savedGame?.opponentLastScore || 0);
  // Track whose turn is next within a round: true = my turn next, false = opponent's turn next
  const [isMyTurnNext, setIsMyTurnNext] = useState(savedGame?.isMyTurnNext ?? true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Persist game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState === 'idle') {
      localStorage.removeItem(gameStorageKey);
      return;
    }
    localStorage.setItem(gameStorageKey, JSON.stringify({
      gameState,
      gameRound,
      gameRoundScores,
      opponentLastScore,
      isMyTurnNext,
    }));
  }, [gameState, gameRound, gameRoundScores, opponentLastScore, gameStorageKey]);

  // Get realtime channel from store for typing broadcasts
  const { realtimeChannel } = useMatchStore();

  const { addMessage, unmatch, setTyping, typingUsers, fetchMatches, channel } = useMatchStore();

  // Show conversation starter for new conversations
  useEffect(() => {
    if (!loggedInUser) return;
    if (messages.length === 0) {
      setShowConversationStarter(true);
    }
  }, [messages.length === 0, loggedInUser?.id]);

  // Hide conversation starter when any message is received
  useEffect(() => {
    if (messages.length > 0 && showConversationStarter) {
      setShowConversationStarter(false);
    }
  }, [messages.length, showConversationStarter]);

  if (!loggedInUser) return null;

  const otherUser = liveMatch.user1.id === loggedInUser.id ? liveMatch.user2 : liveMatch.user1;
  const currentUserInMatch = liveMatch.user1.id === loggedInUser.id ? liveMatch.user1 : liveMatch.user2;

  const otherUserTheme = getTheme((otherUser as any)?.account_type || (otherUser as any)?.accountType || (otherUser as any)?.subscription);

  const isOnline = Boolean(onlineUsers[String(otherUser.id)]?.length);

  const lastActive = otherUser.last_active_at
    ? formatDistanceToNowStrict(
        new Date(otherUser.last_active_at),
        { addSuffix: true }
      )
    : 'never';

  const handleReport = (reason: string) => {
    setMenuOpen(false);
    setReportModalOpen(true);
  };

  const handleReportUser = async (reason: string, details: string) => {
    if (!loggedInUser || !otherUser) {
      console.error('No current user or target user found');
      toast.error(t('error.userInfoUnavailable'));
      return;
    }
    
    try {
      await reportService.createUserReport(loggedInUser.id, otherUser.id, reason, details || '');
      toast.success(t('toast.report.success'));
      setReportModalOpen(false);
      setMenuOpen(false);
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error(t('toast.report.error'));
    }
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

  const handleBack = () => {
    navigate('/chat');
  };

  const handleUnmatch = async () => {
    localStorage.removeItem(gameStorageKey);
    await unmatch(liveMatch.id);
    setUnmatchDialogOpen(false);
    navigate('/chat');
  };

  const handleBlock = async () => {
    if (!loggedInUser) return;
    localStorage.removeItem(gameStorageKey);
    await blockService.blockUser(loggedInUser.id, otherUser.id);
    await unmatch(liveMatch.id);
    setBlockDialogOpen(false);
    toast.success(t('toast.block.success'));
    navigate('/chat');
  };
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSendHeySticker = () => {
    if (!loggedInUser) return null;

    // Send the message to the server - addMessage handles optimistic update
    addMessage(liveMatch.id, {
      matchId: liveMatch.id,
      senderId: loggedInUser.id,
      content: '/sticker hey',
      type: 'text',
    });
    setShowConversationStarter(false);
  };

  const handleSendGameInvite = () => {
    if (!loggedInUser) return;
    if (gameState !== 'idle' && gameState !== 'finished') {
      toast.error('A game is already in progress!');
      return;
    }
    addMessage(liveMatch.id, {
      matchId: liveMatch.id,
      senderId: loggedInUser.id,
      content: '/game-invite',
      type: 'text',
    });
    setGameState('inviteSent');
    setGameRound(1);
    setGameRoundScores([]);
    setOpponentLastScore(0);
    toast.success('Game invite sent!');
  };

  const handleAcceptGameInvite = () => {
    if (!loggedInUser) return;
    if (gameState !== 'idle' && gameState !== 'finished' && gameState !== 'inviteSent') {
      toast.error('A game is already in progress!');
      return;
    }
    addMessage(liveMatch.id, {
      matchId: liveMatch.id,
      senderId: loggedInUser.id,
      content: '/game-accepted',
      type: 'text',
    });
    // Accepter plays first
    setGameState('myTurn');
    setGameRound(1);
    setGameRoundScores([]);
    setOpponentLastScore(0);
  };

  // Called when a player finishes their turn (sends message only, no state change yet)
  const handleTurnEnd = (myScore: number, round: number) => {
    addMessage(liveMatch.id, {
      matchId: liveMatch.id,
      senderId: loggedInUser!.id,
      content: `/game-turn:${myScore}:${round}`,
      type: 'text',
    });
    setGameRoundScores(prev => {
      const existing = [...prev];
      if (existing.length >= round) {
        existing[round - 1] = { ...existing[round - 1], my: myScore };
      } else {
        existing.push({ my: myScore, opp: 0 });
      }
      return existing;
    });
  };

  // Called after turn end screen is done showing (arena auto-advances)
  const handleTurnEndComplete = (round: number) => {
    if (round >= 3) {
      // Last round done — calculate final results
      const totalMine = gameRoundScores.reduce((sum, r) => sum + r.my, 0);
      const totalOpp = gameRoundScores.reduce((sum, r) => sum + r.opp, 0);
      const roundsWon = gameRoundScores.filter(r => r.my > r.opp).length;
      const won = totalMine > totalOpp;
      const flares = won ? roundsWon * 15 + 25 : roundsWon * 15 + 5 * (3 - roundsWon);
      handleGameEnd(totalMine, totalOpp, flares);
    } else {
      setGameRound(round + 1);
      setGameState('opponentTurn');
    }
  };

  // Called when the game is fully complete (both players played all rounds)
  const handleGameEnd = async (myTotal: number, oppTotal: number, flaresEarned: number) => {
    setGameState('finished');
    if (loggedInUser && flaresEarned > 0) {
      await flareService.addFlares(loggedInUser.id, flaresEarned, 'game_reward');
    }
    const won = myTotal > oppTotal;
    addMessage(liveMatch.id, {
      matchId: liveMatch.id,
      senderId: loggedInUser!.id,
      content: `/game-result:${myTotal}:${oppTotal}:${flaresEarned}:${won ? 'win' : 'loss'}`,
      type: 'text',
    });
  };

  // Process game turns from messages — all logic inline to avoid stale closures
  const processedGameTurnsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!loggedInUser) return;
    for (const msg of messages) {
      const content = (msg as any).content || '';
      if (!content.startsWith('/game-turn:')) continue;
      if (processedGameTurnsRef.current.has(msg.id)) continue;

      const isMine = msg.senderId === loggedInUser.id;
      if (isMine) {
        processedGameTurnsRef.current.add(msg.id);
        continue;
      }

      const parts = content.split(':');
      const turnScore = parseInt(parts[1]) || 0;
      const round = parseInt(parts[2]) || 1;

      // Update opponent score for this round
      setGameRoundScores(prev => {
        const existing = [...prev];
        if (existing.length >= round) {
          existing[round - 1] = { ...existing[round - 1], opp: turnScore };
        } else {
          existing.push({ my: 0, opp: turnScore });
        }
        return existing;
      });
      setOpponentLastScore(turnScore);

      // Transition to opponentPlayed — works even if user dismissed (idle) or is waiting
      setGameState(prev => {
        if (prev === 'inviteSent' || prev === 'opponentTurn' || prev === 'idle') {
          return 'opponentPlayed';
        }
        return prev;
      });
      setGameRound(round);

      processedGameTurnsRef.current.add(msg.id);
    }
  }, [messages, loggedInUser?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const filteredWord = await wordFilterService.checkMessage(trimmedMessage);

    if (filteredWord) {
      toast.error('Your message contains restricted content and was not sent.');

      // Unmatch the users
      await supabase.rpc('unmatch_user', {
        user_id1: loggedInUser.id,
        user_id2: otherUser.id
      });

      // Record the strike and notify the user
      await supabase.rpc('record_strike_and_notify', {
        p_user_id: loggedInUser.id,
        p_word: filteredWord.word
      });

      // Navigate away from the chat
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
    setTyping(liveMatch.id, loggedInUser.id, false);
    
    // Broadcast stop typing event when sending message
      if (realtimeChannel) {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { matchId: liveMatch.id, userId: loggedInUser.id, isTyping: false },
        });
      }

    // Play send sound
    soundService.playSound('notification', 0.5);

    addMessage(liveMatch.id, {
      matchId: liveMatch.id,
      senderId: loggedInUser.id,
      content: message,
      type: 'text',
      ...(replyTo && {
        reply_to: replyTo.id,
        reply_content: replyTo.content,
      }),
    });

    setMessage('');
    setReplyTo(null);
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
      setTyping(liveMatch.id, loggedInUser.id, true);
      
      // Broadcast typing event using persistent channel
      if (realtimeChannel) {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { matchId: liveMatch.id, userId: loggedInUser.id, isTyping: true },
        });
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(liveMatch.id, loggedInUser.id, false);
        
        // Broadcast stop typing event using persistent channel
        if (realtimeChannel) {
          realtimeChannel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { matchId: liveMatch.id, userId: loggedInUser.id, isTyping: false },
          });
        }
        
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      // Stop typing if message is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(liveMatch.id, loggedInUser.id, false);
      
      // Broadcast stop typing event using persistent channel
      if (realtimeChannel) {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { matchId: liveMatch.id, userId: loggedInUser.id, isTyping: false },
        });
      }
    }
  };

  // Auto-scroll to bottom when messages change, but only if already near bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'instant' });
    }
  }, [messages]);

  // Scroll to bottom on initial load / match change
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'instant' });
    });
  }, [match.id]);

  // Polling fallback: fetch messages from OTHER users every 3s
  useEffect(() => {
    const fetchMatchMessages = async () => {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('match_id', match.id)
        .neq('sender_id', user.id);

      if (error || !data) return;

      const storeMatch = useMatchStore.getState().matches.find(m => m.id === match.id);
      if (!storeMatch) return;

      const existingIds = new Set(storeMatch.messages.map(m => m.id));
      const hasNew = data.some(m => !existingIds.has(m.id));

      if (hasNew) {
        useMatchStore.getState().fetchMatches();
      }
    };

    const interval = setInterval(fetchMatchMessages, 3000);
    return () => clearInterval(interval);
  }, [match.id]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing when leaving the chat
    setTyping(liveMatch.id, loggedInUser.id, false);
      
      // Broadcast stop typing event when leaving using persistent channel
      if (realtimeChannel) {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { matchId: liveMatch.id, userId: loggedInUser.id, isTyping: false },
        });
      }
    };
  }, []);

  // Check if other user is typing in this match
  const otherUserTyping = typingUsersFromStore[liveMatch.id]?.includes(otherUser.id) || false;

  return (
    <div className={`h-screen flex flex-col text-white relative ${theme.background}`}>
      <div className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-5 z-0" style={{ backgroundImage: "url('/upendo-chat-theme.png')" }}></div>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 flex items-center justify-between p-4 border-b border-white/10 ${theme.stickyHeader} flex-shrink-0 z-20`}>
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-1">
            <ArrowLeft />
          </button>
          <div className="relative">
            <SafeImage src={otherUser.photos[0]} alt="avatar" className="w-10 h-10 rounded-full" fallbackSrc="/upendo-logo.png" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 ${theme.stickyHeader.replace('bg-', 'border-')}`}></div>
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
            className={`absolute top-16 right-4 w-48 rounded-md shadow-lg z-50 ${theme.stickyHeader} border ${theme.accent.border}`}
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 z-10 pt-20 scrollbar-hide">
        {showConversationStarter && (
          <ConversationStarter onSendHey={handleSendHeySticker} />
        )}
        {!showConversationStarter && (
          <>
            {messages.map((msg, index) => {
              const showDateSeparator = shouldShowDateSeparator(msg, messages[index - 1]);
              // Find the replied-to message content
              const repliedMsg = (msg as any).reply_to ? messages.find(m => m.id === (msg as any).reply_to) : null;
              const enrichedMsg = repliedMsg ? { ...msg, reply_content: (msg as any).reply_content || repliedMsg.content } : msg;
              const msgContent = enrichedMsg.content;
              const isGameMessage = msgContent?.startsWith('/game-');

              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="text-center text-xs text-white/40 uppercase">
                      {formatMessageDate(msg.timestamp)}
                    </div>
                  )}
                  {isGameMessage ? (
                    msgContent === '/game-invite' ? (
                      <GameInviteMessage
                        type="invite"
                        senderName={(enrichedMsg as any).senderId === loggedInUser?.id ? 'You' : otherUser.name}
                        isSender={(enrichedMsg as any).senderId === loggedInUser?.id}
                        onAccept={handleAcceptGameInvite}
                      />
                    ) : msgContent === '/game-accepted' ? (
                      <div className="mx-auto my-2 text-center">
                        <span className="text-purple-400 text-xs font-medium bg-purple-500/10 px-3 py-1 rounded-full">
                          Game accepted! Playing...
                        </span>
                      </div>
                    ) : msgContent.startsWith('/game-turn:') ? (
                      (() => {
                        const parts = msgContent.split(':');
                        const turnScore = parseInt(parts[1]) || 0;
                        const round = parseInt(parts[2]) || 1;
                        const isMine = (enrichedMsg as any).senderId === loggedInUser?.id;
                        return (
                          <div className="mx-auto my-2 text-center">
                            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${isMine ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                              {isMine ? 'You' : otherUser.name} scored {turnScore} in Round {round}
                            </span>
                          </div>
                        );
                      })()
                    ) : msgContent.startsWith('/game-result:') ? (
                      (() => {
                        const parts = msgContent.split(':');
                        const mySc = parseInt(parts[1]) || 0;
                        const theirSc = parseInt(parts[2]) || 0;
                        const flares = parseInt(parts[3]) || 0;
                        return (
                          <GameInviteMessage
                            type="result"
                            myScore={(enrichedMsg as any).senderId === loggedInUser?.id ? mySc : theirSc}
                            theirScore={(enrichedMsg as any).senderId === loggedInUser?.id ? theirSc : mySc}
                            flaresEarned={(enrichedMsg as any).senderId === loggedInUser?.id ? flares : 0}
                            isSender={(enrichedMsg as any).senderId === loggedInUser?.id}
                          />
                        );
                      })()
                    ) : null
                  ) : (
                    <MessageBubble message={enrichedMsg as Message} onReply={(m) => setReplyTo(m)} otherUser={otherUser} currentUserInMatch={currentUserInMatch} viewerTheme={theme} />
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
        {otherUserTyping && <TypingIndicator viewerTheme={theme} />}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 z-10">
        {/* Reply Preview */}
        {replyTo && (
          <div className="px-4 pt-2 pb-0 flex items-center gap-2">
            <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 border-l-2 border-white/40 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-white/60 block">
                  Replying to {((replyTo as any).sender_id || replyTo.senderId) === loggedInUser?.id ? 'yourself' : otherUser.name}
                </span>
                <span className="text-sm text-white/80 truncate block">
                  {replyTo.type === 'gif' ? 'GIF' : replyTo.type === 'sticker' ? 'Sticker' : replyTo.content}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-2 p-1 hover:bg-white/10 rounded-full"
              >
                <X size={14} className="text-white/60" />
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendGameInvite}
            className="p-2 rounded-full transition bg-gradient-to-br from-purple-500/30 to-pink-500/30 hover:from-purple-500/50 hover:to-pink-500/50"
            title="Challenge to a game"
          >
            <Gamepad2 size={18} className="text-purple-300" />
          </button>
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
            placeholder={replyTo ? 'Reply to message...' : t('chat.input.placeholder')}
            className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            data-no-sound
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
              className={`${theme.background} rounded-2xl p-6 mx-4 max-w-sm w-full border ${theme.accent.border} shadow-2xl relative`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl blur-xl ${theme.accent.glow.replace('shadow-', 'bg-').replace('/20', '/10')}`}></div>

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
                  className={`px-4 py-2 rounded-full transition text-white hover:scale-105 shadow-lg ${theme.button.primary} ${theme.button.primaryHover}`}
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
              className={`${theme.background} rounded-2xl p-6 mx-4 max-w-sm w-full border ${theme.accent.border} shadow-2xl relative`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl blur-xl ${theme.accent.glow.replace('shadow-', 'bg-').replace('/20', '/10')}`}></div>

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
        onSubmit={(reason, details) => handleReportUser(reason, details)}
      />

      <AnimatePresence>
        {isGifPickerOpen && (
          <GifPicker
            onSelect={(gifUrl) => {
              addMessage(liveMatch.id, {
                matchId: liveMatch.id,
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

      {/* Resume Game Banner — only show when you dismissed the arena but it's your turn */}
      {gameState === 'idle' && gameRoundScores.length > 0 && gameRoundScores.some(r => r.opp > 0 && r.my === 0) && (
        <div className="fixed bottom-20 left-4 right-4 z-30 flex justify-center">
          <button
            onClick={() => { setOpponentLastScore(gameRoundScores.find(r => r.opp > 0 && r.my === 0)?.opp || 0); setGameState('opponentPlayed'); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:from-purple-400 hover:to-pink-500 transition-all animate-pulse"
          >
            <Gamepad2 size={16} />
            Resume Game — Your Turn
          </button>
        </div>
      )}

      {/* Ghost Game Arena */}
      {(gameState === 'myTurn' || gameState === 'opponentPlayed' || gameState === 'finished') && loggedInUser && (
        <GhostGameArena
          matchId={liveMatch.id}
          myId={loggedInUser.id}
          opponentName={otherUser.name}
          isInviter={gameRoundScores.length > 0}
          opponentLastScore={opponentLastScore}
          showOpponentPlayed={gameState === 'opponentPlayed'}
          currentRound={gameRound}
          roundScores={gameRoundScores}
          onStartPlaying={() => setGameState('myTurn')}
          onTurnEnd={handleTurnEnd}
          onTurnEndComplete={handleTurnEndComplete}
          onGameEnd={handleGameEnd}
          onCancel={() => setGameState('idle')}
        />
      )}
    </div>
  );
};

export default ChatConversation;
