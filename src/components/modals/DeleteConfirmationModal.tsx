import React from 'react';
import { Button } from '@tremor/react';
import Portal from '../Portal';
import { X, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
  const { profile } = useAuthStore();
  const acct = profile?.accountType || profile?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';

  const bgColor = isVip ? 'bg-gradient-to-br from-gray-900 to-black' : isPro ? 'bg-gradient-to-br from-[#071521] to-[#0b2237]' : 'bg-gradient-to-br from-[#1a0f14] to-[#2E0C13]';
  const borderColor = isVip ? 'border-amber-500/30' : isPro ? 'border-sky-500/30' : 'border-pink-500/30';
  const buttonColor = isVip ? 'bg-amber-600 hover:bg-amber-700' : isPro ? 'bg-sky-600 hover:bg-sky-700' : 'bg-red-600 hover:bg-red-700';

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`${bgColor} rounded-2xl p-8 w-full max-w-lg text-white border ${borderColor} relative shadow-2xl`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 z-10">
            <X className="w-6 h-6" />
          </button>
          <div className="relative z-10 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Are you sure?</h2>
            <p className="text-gray-300 mb-6">
              This action is irreversible. All your data, including matches, messages, and photos, will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <Button onClick={onClose} variant="secondary" className="w-full bg-transparent border-gray-500 text-gray-300 hover:bg-gray-500/10 hover:border-gray-400 transition-all duration-200">
                Cancel
              </Button>
              <Button onClick={onConfirm} className={`w-full ${buttonColor} text-white border-none transition-all duration-200 transform hover:scale-105 shadow-lg`}>
                Confirm Deletion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DeleteConfirmationModal;
