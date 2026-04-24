
import React, { useEffect, useState } from 'react';
import { SystemMessage, systemMessengerService } from '../services/systemMessengerService';
import NotificationItem from '../components/notifications/NotificationItem';
import SystemConversation from '../components/chat/SystemConversation';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from 'react-i18next';
import ChatSettingsModal from '../components/modals/ChatSettingsModal';
import SystemMessageModal from '../components/modals/SystemMessageModal';
import { getTheme } from '../styles/theme';
import { cn } from '../lib/utils';

const SystemMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SystemMessage | null>(null);
  const { profile } = useAuthStore();
  const theme = getTheme(profile?.account_type || profile?.subscription);
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
        <div className="w-8"></div> {/* Spacer */}
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
                notification={msg as any} 
                onClick={() => setSelectedMessage(msg)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMessagesPage;
