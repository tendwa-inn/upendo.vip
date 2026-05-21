import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useMatchStore } from '../stores/matchStore.tsx';
import { useLikesStore } from '../stores/likesStore';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Check, X, Crown, Shield, FileImage, Heart, UserPlus } from 'lucide-react';
import { Match, User } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useCurrentTheme } from '../stores/colorThemeStore';
import SafeImage from '../components/common/SafeImage';
import { formatMessageTime } from '../utils/dateUtils';

import ChatSettingsModal from '../components/modals/ChatSettingsModal';

import { Megaphone } from 'lucide-react';
import heySticker from '/Hey.png';

import { systemMessengerService } from '../services/systemMessengerService';
import { connectionApplicationService, ConnectionRequest } from '../services/connectionApplicationService';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { matches, newMatches, fetchMatches, unmatch, createMatch } = useMatchStore();
  const { removeLike } = useLikesStore();
  const { user } = useAuthStore();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnnouncementsVisible, setIsAnnouncementsVisible] = useState(true);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [messageRequests, setMessageRequests] = useState<any[]>([]);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const deleteTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (user) {
      const checkUnread = async () => {
        const messages = await systemMessengerService.getSystemMessages();
        setHasUnreadAnnouncements(messages.some(m => !m.isRead));
      };
      checkUnread();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchConnectionRequests();
      fetchMessageRequests();
    }
  }, [user, fetchMatches]);

  const fetchConnectionRequests = async () => {
    if (!user) return;
    try {
      const requests = await connectionApplicationService.getIncomingRequests(user.id);
      setConnectionRequests(requests);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    }
  };

  const handleAcceptRequest = async (request: ConnectionRequest) => {
    if (!user) return;
    try {
      const match = await connectionApplicationService.acceptConnectionRequest(request.id, user.id);
      toast.success(t('toast.connectionAccepted'));
      setConnectionRequests(prev => prev.filter(r => r.id !== request.id));
      fetchMatches();
      if (match) {
        navigate(`/chat/${match.id}`);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(t('toast.connectionAcceptFailed'));
    }
  };

  const handleDenyRequest = async (request: ConnectionRequest) => {
    try {
      await connectionApplicationService.denyConnectionRequest(request.id);
      toast('Connection request denied');
      setConnectionRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error(t('toast.connectionDenyFailed'));
    }
  };

  const fetchMessageRequests = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('message_requests')
        .select('id, sender_id, message, created_at')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        setMessageRequests([]);
        return;
      }

      const senderIds = data.map(r => r.sender_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photos')
        .in('id', senderIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const enriched = data.map(r => ({
        ...r,
        sender: profileMap.get(r.sender_id) || { id: r.sender_id, name: 'Unknown', photos: [] },
      }));

      setMessageRequests(enriched);
    } catch (e) {
      console.error('Error fetching message requests:', e);
    }
  };

  const handleAcceptMessageRequest = async (request: any) => {
    try {
      await supabase.from('message_requests').update({ status: 'accepted' }).eq('id', request.id);
      // Delete the notification for this message request
      await supabase.from('notifications').delete().eq('type', 'message-request').eq('actor_id', request.sender_id).eq('user_id', currentUser?.id);
      const newMatch = await createMatch(request.sender_id) as any;
      if (newMatch) {
        toast.success(t('toast.matchCreated'));
        navigate(`/chat/${newMatch.id}`);
      }
      setMessageRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (e) {
      console.error('Error accepting message request:', e);
      toast.error(t('toast.requestAcceptFailed'));
    }
  };

  const handleDeclineMessageRequest = async (request: any) => {
    try {
      await supabase.from('message_requests').update({ status: 'declined' }).eq('id', request.id);
      // Delete the notification for this message request
      await supabase.from('notifications').delete().eq('type', 'message-request').eq('actor_id', request.sender_id).eq('user_id', currentUser?.id);
      setMessageRequests(prev => prev.filter(r => r.id !== request.id));
      toast('Message request declined');
    } catch (e) {
      console.error('Error declining message request:', e);
    }
  };

  const handleOpenOrCreateMatch = async (userId: string) => {
    const newMatch = await createMatch(userId) as any;
    if (newMatch) {
      removeLike(userId);
      toast.success(t('toast.youMatched'));
      navigate(`/chat/${newMatch.id}`);
    } else {
      toast.error(t('toast.matchFailed'));
    }
  };

  const handleSelectMatch = (match: Match) => {
    navigate(`/chat/${match.id}`);
  };

  const handleDelete = (id: string, name: string, deleteAction: () => void) => {
    setPendingDeletions(prev => [...prev, id]);

    const toastId = toast(
      (t) => (
        <div className="flex items-center">
          <span>
            Deleted <b>{name}</b>
          </span>
          <button
            className="ml-4 p-1 text-sm font-medium text-pink-500 border border-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition-all"
            onClick={() => {
              clearTimeout(deleteTimers.current[id]);
              setPendingDeletions(prev => prev.filter(pId => pId !== id));
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 10000 }
    );

    deleteTimers.current[id] = setTimeout(() => {
      deleteAction();
      toast.dismiss(toastId);
    }, 10000);
  };

  const filteredNewMatches = newMatches.filter(match => {
    const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredConversations = matches.filter(match => {
    const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const acct = (useAuthStore.getState().profile as any)?.account_type || (useAuthStore.getState().profile as any)?.subscription;
  const theme = useCurrentTheme(acct || 'free');
  return (
    <div className="h-full flex flex-col text-white">
        <>
          <div className="flex justify-between items-center p-4 pt-safe-top">
            {isSearchActive ? (
              <div className="w-full flex items-center bg-stone-700 rounded-full px-2">
                <input
                  type="text"
                  placeholder={t('chat.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-2 px-2 text-white focus:outline-none"
                  autoFocus
                />
                <button onClick={() => { setSearchQuery(''); setIsSearchActive(false); }} className="p-2">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setIsSearchActive(true)} className="p-2">
                  <Search className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">{t('messages')}</h1>
                <button onClick={() => setIsSettingsModalOpen(true)} className="p-2">
                  <SlidersHorizontal className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="px-4">
            
            <div>
            <h2 className={`${theme.primary} font-bold my-4`}>{t('newMatches')}</h2>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {filteredNewMatches.map((match) => {
                  const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
                  return (
                    <div key={match.id} className="flex flex-col items-center space-y-2 text-center">
                      <button onClick={() => handleOpenOrCreateMatch(otherUser.id)} className="relative block group">
                        <SafeImage src={otherUser.photos?.[0] || '/placeholder-avatar.png'} alt={otherUser.name} className="w-16 h-16 rounded-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                      </button>
                      <p className="text-xs w-16 truncate">{otherUser.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connection Requests */}
            {connectionRequests.length > 0 && (
              <div>
                <h2 className={`${theme.primary} font-bold my-4`}>
                  Connection Requests
                </h2>
                <div className="space-y-2">
                  {connectionRequests.map((request) => (
                    <div key={request.id} className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 border border-white/10">
                      <button
                        onClick={() => request.requester?.id && navigate(`/user/${request.requester.id}`)}
                        className="flex items-center space-x-3 flex-1 min-w-0 text-left"
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                          <SafeImage
                            src={request.requester?.photos?.[0] || '/placeholder-avatar.png'}
                            alt={request.requester?.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{request.requester?.name || 'Unknown User'}</h3>
                          <p className="text-sm text-white/60 truncate">wants to connect with you</p>
                        </div>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDenyRequest(request)}
                          className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Requests */}
            {messageRequests.length > 0 && (
              <div>
                <h2 className={`${theme.primary} font-bold my-4`}>
                  Message Requests
                </h2>
                <div className="space-y-2">
                  {messageRequests.map((request) => {
                    const isExpanded = expandedRequestId === request.id;
                    return (
                      <div
                        key={request.id}
                        onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                        className="rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center space-x-4 p-3">
                          <div
                            className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); navigate(`/user/${request.sender_id}`); }}
                          >
                            <SafeImage
                              src={request.sender?.photos?.[0] || '/placeholder-avatar.png'}
                              alt={request.sender?.name || 'User'}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">{request.sender?.name || 'Unknown User'}</h3>
                            <p className="text-sm text-white/60 truncate">
                              {request.message || 'wants to chat with you'}
                            </p>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-white/10 mt-2 pt-3" onClick={(e) => e.stopPropagation()}>
                            <p className="text-white/80 text-sm mb-3">
                              {request.message || 'No message included'}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptMessageRequest(request)}
                                className="flex-1 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDeclineMessageRequest(request)}
                                className="flex-1 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
            <h2 className={`${theme.primary} font-bold my-4`}>{t('conversations')}</h2>
              <div className="overflow-y-auto h-full">
                {/* Static Announcements Link */}
                {isAnnouncementsVisible && !pendingDeletions.includes('announcements') && (
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -100, right: 0 }}
                    onDragEnd={(event, info) => {
                      if (info.offset.x < -50) {
                        handleDelete('announcements', 'Announcements', () => setIsAnnouncementsVisible(false));
                      }
                    }}
                  >
                    <Link to="/system-messages" className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-white/5">
                      <div className="relative">
                        {hasUnreadAnnouncements && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full border-2 border-gray-800"></div>
                        )}
                        <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-white/10`}>
                          <Megaphone className={`w-8 h-8 ${theme.primary}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-gray-200">{t('announcements')}</h3>
                        <p className="text-sm truncate mt-1 text-gray-400">{t('officialMessages')}</p>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {filteredConversations.filter(match => !pendingDeletions.includes(match.id)).map((match) => {
                  const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
                  const unreadCount = (match.messages || []).filter(m => !m.isRead && m.senderId !== user?.id).length;
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      drag="x"
                      dragConstraints={{ left: -100, right: 0 }}
                      onDragEnd={(event, info) => {
                        if (info.offset.x < -50) {
                          handleDelete(match.id, otherUser.name, () => unmatch(match.id));
                        }
                      }}
                      onClick={() => handleSelectMatch(match)}
                      className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-white/5"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full overflow-hidden">
                          <SafeImage
                            src={otherUser.photos[0]}
                            alt={otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {unreadCount > 0 && (
                          <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs text-white ${theme.button.primary} ${theme.stickyHeader.replace('bg-', 'border-')}`}>
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold truncate ${
                              (otherUser as any).account_type === 'vip' ? 'text-amber-400' : 
                              (otherUser as any).account_type === 'pro' ? 'text-cyan-400' : 
                              'text-pink-400'
                            }`}>{otherUser.name}</h3>
                            {/* Premium badge for Pro/VIP users */}
                            {((otherUser as any).account_type === 'pro' || (otherUser as any).account_type === 'vip') && (
                              <div className="flex items-center">
                                {(otherUser as any).account_type === 'vip' ? (
                                  <Shield className="w-4 h-4 text-amber-400" fill="currentColor" />
                                ) : (
                                  <Shield className="w-4 h-4 text-cyan-400" fill="currentColor" />
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {match.lastMessage && formatMessageTime(match.lastMessage.timestamp)}
                          </span>
                        </div>
                        {match.lastMessage && (
                          <p className="text-sm truncate mt-1 text-gray-400 flex items-center">
                            {match.lastMessage.senderId === user?.id && <Check className="w-4 h-4 mr-1" />}
                            {match.lastMessage.content === '/sticker hey' ? (
                              <img src={heySticker} alt="Hey" className="w-8 h-8 object-contain" />
                            ) : match.lastMessage.content.includes('.gif') ? (
                              <span className="flex items-center"><FileImage className="w-4 h-4 mr-1" /> GIF</span>
                            ) : (
                              match.lastMessage.content
                            )}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      <ChatSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </div>
  );
};

export default ChatPage;
