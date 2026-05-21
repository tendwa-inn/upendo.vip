import React from 'react';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SystemMessage } from '../../services/systemMessengerService';
import { useAuthStore } from '../../stores/authStore';
import { useCurrentTheme } from '../../stores/colorThemeStore';

const PINK_HEART_URL = '/icons/pink_ghost_icon.png';

interface SystemConversationProps {
  message: SystemMessage;
  onClose: () => void;
}

const SystemConversation: React.FC<SystemConversationProps> = ({ message, onClose }) => {
  const { t } = useTranslation();
  const profile = useAuthStore.getState().profile;
  const acct = (profile as any)?.account_type || (profile as any)?.accountType || (profile as any)?.subscription;
  const theme = useCurrentTheme(acct || 'free');

  // Render message content with HTML support for rich text
  const renderContent = (content: string) => {
    // If content contains HTML tags, render as HTML
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return (
        <div
          className="text-white/90 leading-relaxed system-message-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    // Otherwise render as plain text with line breaks
    return (
      <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col text-white ${theme.background}`}>
      {/* Header */}
      <div className="flex items-center p-4 pt-safe-top border-b border-white/10">
        <button onClick={onClose} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mx-auto">
          <img
            src={PINK_HEART_URL}
            alt="Upendo"
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              e.currentTarget.src = '/logo-splash.png';
            }}
          />
          <div className="flex items-center gap-2">
            <h2 className="font-bold">Upendo Chat</h2>
            <div className="relative w-5 h-5 rounded-full bg-pink-800 flex items-center justify-center" title={t('chat.systemNotification')}>
              <Shield className="absolute w-full h-full text-pink-900" />
              <Check className="absolute w-3 h-3 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-end gap-2 w-full justify-start">
          <div className="max-w-[85%]">
            <div className={`rounded-2xl shadow-lg ${theme.bubble.receiver} overflow-hidden`}>
              <div className="px-5 py-4 space-y-3">
                <h3 className="font-bold text-lg text-white">{message.title}</h3>
                {renderContent(message.message)}
              </div>
              {message.photo_url && (
                <div className="px-4 pb-4">
                  <img
                    src={message.photo_url}
                    alt="System Message"
                    className="rounded-xl w-full object-cover max-h-80"
                    onError={(e) => { e.currentTarget.src = '/logo-splash.png'; }}
                  />
                </div>
              )}
            </div>
            <div className="text-[10px] mt-1.5 opacity-60 text-left">
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Read-only footer */}
      <div className="p-4 pb-safe-bottom border-t border-white/10">
        <div className="text-center text-xs text-white/50">
          This is a system announcement. You cannot reply.
        </div>
      </div>
    </div>
  );
};

export default SystemConversation;
