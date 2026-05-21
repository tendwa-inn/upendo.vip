import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMatchStore } from '../stores/matchStore';
import { useAuthStore } from '../stores/authStore';
import { useCurrentTheme } from '../stores/colorThemeStore';

interface MessageBanner {
  id: string;
  matchId: string;
  senderName: string;
  senderPhoto: string;
  preview: string;
}

const MessageNotificationBanner: React.FC = () => {
  const [banners, setBanners] = useState<MessageBanner[]>([]);
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const accountType = (profile as any)?.account_type || 'free';
  const theme = useCurrentTheme(accountType);

  const dismiss = useCallback((id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  }, []);

  const handleClick = useCallback((banner: MessageBanner) => {
    dismiss(banner.id);
    navigate(`/chat/${banner.matchId}`);
  }, [navigate, dismiss]);

  // Listen for new incoming messages via store subscription
  useEffect(() => {
    let prevMatchMessages: Record<string, number> = {};

    const unsubscribe = useMatchStore.subscribe((state) => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;

      for (const match of state.matches) {
        const count = match.messages.length;
        const prevCount = prevMatchMessages[match.id] || 0;

        if (count > prevCount && prevCount > 0) {
          const latest = match.messages[match.messages.length - 1];
          if (latest && latest.senderId !== currentUser.id) {
            const otherUser = match.user1.id === currentUser.id ? match.user2 : match.user1;
            const senderName = (otherUser as any).display_name || (otherUser as any).name || 'Someone';
            const senderPhoto = otherUser.photos?.[0] || '';
            const preview = latest.type === 'text' ? latest.content : 'Sent you a message';

            const bannerId = `msg-${latest.id}-${Date.now()}`;
            setBanners(prev => {
              if (prev.some(b => b.matchId === match.id)) return prev;
              return [...prev, { id: bannerId, matchId: match.id, senderName, senderPhoto, preview }];
            });

            setTimeout(() => {
              setBanners(prev => prev.filter(b => b.id !== bannerId));
            }, 4000);
          }
        }

        prevMatchMessages[match.id] = count;
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none">
      <AnimatePresence>
        {banners.map(banner => (
          <motion.div
            key={banner.id}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto mt-3 w-[92%] max-w-md cursor-pointer"
            onClick={() => handleClick(banner)}
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border ${theme.background} ${theme.accent.border}`}
            >
              {/* Sender photo */}
              <div className={`w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2 ${theme.accent.border}`}>
                {banner.senderPhoto ? (
                  <img src={banner.senderPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${theme.button.primary} flex items-center justify-center text-white font-bold text-lg`}>
                    {banner.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`${theme.text} font-semibold text-sm truncate`}>{banner.senderName}</p>
                <p className={`${theme.text} opacity-70 text-xs truncate`}>{banner.preview}</p>
              </div>

              {/* Dismiss button */}
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(banner.id); }}
                className={`flex-shrink-0 p-1 rounded-full hover:opacity-80 transition-opacity ${theme.text}`}
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MessageNotificationBanner;
