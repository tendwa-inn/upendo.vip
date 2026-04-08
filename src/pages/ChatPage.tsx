import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useMatchStore } from '../stores/matchStore.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Check, X, Crown, Shield } from 'lucide-react';
import { Match, User } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import SafeImage from '../components/common/SafeImage';
import { formatMessageTime } from '../utils/dateUtils';

import ChatSettingsModal from '../components/modals/ChatSettingsModal';

import { Megaphone } from 'lucide-react';
import heySticker from '/Hey.png';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { matches, newMatches, fetchMatches, unmatch } = useMatchStore();
  const { user } = useAuthStore();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnnouncementsVisible, setIsAnnouncementsVisible] = useState(true);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const deleteTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user, fetchMatches]);

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

  const acct = (useAuthStore.getState().profile as any)?.accountType || (useAuthStore.getState().profile as any)?.subscription;
  const isPro = acct === 'pro';
  return (
    <div className="h-full flex flex-col text-white">
        <>
          <div className="flex justify-between items-center p-4 pt-safe-top">
            {isSearchActive ? (
              <div className="w-full flex items-center bg-stone-700 rounded-full px-2">
                <input
                  type="text"
                  placeholder="Search matches..."
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
            <h2 className={`${((useAuthStore.getState().profile as any)?.accountType === 'vip') ? 'text-amber-400' : (isPro ? 'text-[#ff7f50]' : 'text-pink-500')} font-bold my-4`}>{t('newMatches')}</h2>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {filteredNewMatches.map((match) => {
                  const otherUser = match.user1.id === user?.id ? match.user2 : match.user1;
                  return (
                    <div key={match.id} className="flex-shrink-0 flex flex-col items-center space-y-1" onClick={() => handleSelectMatch(match)}>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 p-1">
                          <SafeImage
                            src={otherUser.photos[0]}
                            alt={otherUser.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        {otherUser.online && (
                          <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2E0C13]"></div>
                        )}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold">{otherUser.name}</span>
                        {/* Premium badge for Pro/VIP users */}
                        {((otherUser as any).accountType === 'pro' || (otherUser as any).accountType === 'vip' || (otherUser as any).account_type === 'pro' || (otherUser as any).account_type === 'vip') && (
                          <div className="flex items-center mt-1">
                            {((otherUser as any).accountType || (otherUser as any).account_type) === 'vip' ? (
                              <Shield className="w-3 h-3 text-black" />
                            ) : (
                              <Shield className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
            <h2 className={`${((useAuthStore.getState().profile as any)?.accountType === 'vip') ? 'text-amber-400' : (isPro ? 'text-[#ff7f50]' : 'text-pink-500')} font-bold my-4`}>{t('conversations')}</h2>
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
                        <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center ${((useAuthStore.getState().profile as any)?.accountType === 'vip') ? 'bg-amber-500/20' : (isPro ? 'bg-[#ff7f50]/20' : 'bg-pink-500/20')}`}>
                          <Megaphone className={`w-8 h-8 ${((useAuthStore.getState().profile as any)?.accountType === 'vip') ? 'text-amber-300' : (isPro ? 'text-[#ff7f50]' : 'text-pink-400')}`} />
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
                          <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs ${
                            ((useAuthStore.getState().profile as any)?.accountType === 'vip')
                              ? 'bg-amber-400 text-black border-black'
                              : (isPro ? 'bg-[#ff7f50] text-black border-[#0b2237]' : 'bg-pink-500 border-[#2E0C13]')
                          }`}>
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate text-gray-200">{otherUser.name}</h3>
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
                          <span className="text-xs text-gray-400">
                            {match.lastMessage && formatMessageTime(match.lastMessage.timestamp)}
                          </span>
                        </div>
                        {match.lastMessage && (
                          <p className="text-sm truncate mt-1 text-gray-400 flex items-center">
                            {match.lastMessage.senderId === user?.id && <Check className="w-4 h-4 mr-1" />}
                            {match.lastMessage.content === '/sticker hey' ? (
                              <img src={heySticker} alt="Hey" className="w-8 h-8 object-contain" />
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
