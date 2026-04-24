import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SystemMessage } from '../../services/systemMessengerService';
import VerificationBadge from '../VerificationBadge';
import { useAuthStore } from '../../stores/authStore';

const PINK_HEART_URL = '/Notifications Image Icon/Upendo Notifications.png';

interface SystemConversationProps {
  message: SystemMessage;
  onClose: () => void;
}

const SystemConversation: React.FC<SystemConversationProps> = ({ message, onClose }) => {
  const systemProfile = {
    account_type: 'pro',
  };
  const acct = (useAuthStore.getState().profile as any)?.accountType || (useAuthStore.getState().profile as any)?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';

  return (
    <div className={`h-screen flex flex-col text-white ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'}`}>
      {/* Header */}
      <div className="flex items-center p-4 pt-safe-top border-b border-white/10">
        <button onClick={onClose} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mx-auto">
          <img src={PINK_HEART_URL} alt="Upendo" className="w-10 h-10 rounded-full" />
          <div className="flex items-center gap-2">
            <h2 className="font-bold">Upendo Chat</h2>
            <VerificationBadge profile={systemProfile as any} />
          </div>
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-end gap-2 w-full justify-start">
          <div className="max-w-[85%]">
            <div className={`rounded-2xl text-sm leading-relaxed shadow-lg ${isVip ? 'bg-gradient-to-b from-[#1a1a1a] to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#0e2030] to-[#091522]' : 'bg-gradient-to-b from-[#3a1a22] to-[#2E0C13]'} px-4 py-3`}>
              <h3 className="font-bold text-base mb-2 text-white">{message.title}</h3>
              {message.photo_url && <img src={message.photo_url} alt="System Message" className="rounded-lg mb-2 max-w-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
              <p className="text-white">{message.message}</p>
            </div>
            <div className="text-[10px] mt-1 opacity-60 text-left">
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
