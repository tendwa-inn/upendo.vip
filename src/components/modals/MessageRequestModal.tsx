import React, { useState } from 'react';
import Portal from '../Portal';
import { useAuthStore } from '../../stores/authStore';
import { useCurrentTheme } from '../../stores/colorThemeStore';
import { MessageSquare, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MessageRequestModalProps {
  receiverName: string;
  onSend: (message: string) => void;
  onClose: () => void;
}

const MessageRequestModal: React.FC<MessageRequestModalProps> = ({
  receiverName,
  onSend,
  onClose,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const { profile } = useAuthStore();
  const acct = profile?.account_type || profile?.subscription || 'free';
  const theme = useCurrentTheme(acct);

  const handleSend = () => {
    onSend(message.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
        <div className={`${theme.background} p-6 rounded-2xl shadow-2xl z-50 text-white max-w-md w-full mx-4 border ${theme.accent.border} relative`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center relative z-10">
            {/* Icon */}
            <div className={`mx-auto mb-4 w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center border-2 border-pink-500/30`}>
              <MessageSquare className="w-8 h-8 text-pink-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {t('messageRequest.title', 'Send a Message Request')}
            </h3>

            <p className="text-gray-300 mb-4 text-sm">
              {t('messageRequest.subtitle', { name: receiverName, defaultValue: `Send a message to ${receiverName}` })}
            </p>

            {/* Message Input */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 200))}
              onKeyDown={handleKeyDown}
              placeholder={t('messageRequest.placeholder', 'Say something nice...')}
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-pink-500/50 transition-colors min-h-[80px]"
              rows={3}
              autoFocus
            />

            <div className="flex justify-between items-center mt-1 mb-4">
              <span className="text-xs text-gray-400">{message.length}/200</span>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-600/50 transition-all duration-200 font-medium"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSend}
                className={`px-6 py-2.5 rounded-full ${theme.button.primary} ${theme.button.primaryHover} text-white font-medium transition-all duration-200`}
              >
                {t('messageRequest.send', 'Send Request')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default MessageRequestModal;
