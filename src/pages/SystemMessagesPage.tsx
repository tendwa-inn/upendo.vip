
import React, { useEffect, useState } from 'react';
import { SystemMessage, systemMessengerService } from '../services/systemMessengerService';
import NotificationItem from '../components/notifications/NotificationItem';
import SystemConversation from '../components/chat/SystemConversation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from 'react-i18next';
import ChatSettingsModal from '../components/modals/ChatSettingsModal';
import SystemMessageModal from '../components/modals/SystemMessageModal';
import { getTheme } from '../styles/theme';
import { useCurrentTheme } from '../stores/colorThemeStore';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const SystemMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SystemMessage | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { profile } = useAuthStore();
  const theme = useCurrentTheme(profile?.account_type || profile?.subscription || 'free');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await systemMessengerService.getSystemMessages();
        setMessages(fetchedMessages || []);
      } catch (error) {
        console.error('Failed to fetch system messages', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSelectMessage = (message: SystemMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      systemMessengerService.markAsRead(message.id);
      // Optimistically update the UI
      setMessages(messages.map(m => m.id === message.id ? { ...m, isRead: true } : m));
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = async () => {
    setShowClearConfirm(false);
    try {
      await systemMessengerService.dismissAllForUser();
      setMessages([]);
      toast.success('All system messages cleared');
    } catch (error) {
      console.error('Failed to clear messages:', error);
      toast.error('Failed to clear messages');
    }
  };

  if (selectedMessage) {
    return <SystemConversation message={selectedMessage} onClose={() => setSelectedMessage(null)} />;
  }

  return (
    <div className={cn("h-screen flex flex-col text-white", theme.background)}>
      <div className={cn("flex items-center p-4 pt-safe-top border-b border-white/10", theme.stickyHeader)}>
        <Link to="/chat" className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className={cn("text-xl font-bold text-center flex-1", theme.primary)}>{t('announcements')}</h1>
        {messages.length > 0 && (
          <button onClick={handleClearAll} className={`p-2 ${theme.primary} opacity-60 hover:opacity-100 transition-all`} title="Clear all">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="text-center p-8">{t('loadingAnnouncements')}</div>
        ) : messages.length === 0 ? (
          <div className="text-center p-8">{t('noAnnouncements')}</div>
        ) : (
          <div>
            {messages.map((msg) => (
              <NotificationItem
                key={msg.id}
                notification={{...msg, type: 'system-message', timestamp: msg.created_at} as any}
                onClick={() => handleSelectMessage(msg)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className={`${theme.background} p-6 rounded-2xl shadow-2xl max-w-sm w-full border ${theme.accent.border}`}>
            <h3 className="text-lg font-bold text-white mb-2">Clear All Messages</h3>
            <p className="text-white/70 text-sm mb-6">This will permanently delete all system messages. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMessagesPage;
