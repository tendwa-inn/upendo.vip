import React, { useState } from 'react';
import Portal from '../Portal';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useCurrentTheme } from '../../stores/colorThemeStore';

interface DeleteAccountModalProps {
  onClose: () => void;
  onDelete: (reason: string) => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onClose, onDelete }) => {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const colorTheme = useCurrentTheme(profile?.account_type || 'free');
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'reason' | 'confirm'>('reason');

  const reasons = [
    'I found someone',
    'Taking a break',
    'Not satisfied with the app',
    'Privacy concerns',
    'Too many notifications',
    'Other',
  ];

  const handleNext = () => {
    if (step === 'reason' && reason) {
      setStep('confirm');
    }
  };

  const handleDelete = () => {
    if (confirmText === 'DELETE') {
      onDelete(reason);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`rounded-2xl p-8 w-full max-w-lg text-white relative shadow-2xl ${colorTheme.background}`}>
          <div className={`absolute inset-0 rounded-2xl blur-xl ${colorTheme.accent.glow}`}></div>

          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 z-10">
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10">
            {step === 'reason' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-red-500/20">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Delete Account</h2>
                </div>
                <p className="text-gray-300 mb-6">Your account, photos, messages, and all data will be permanently deleted. This cannot be undone.</p>

                <p className="text-sm text-gray-400 mb-3">Why are you leaving?</p>
                <div className="space-y-3 mb-6">
                  {reasons.map(r => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        reason === r
                          ? `${colorTheme.button.primary} shadow-lg`
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!reason}
                    className={`flex-1 py-3 rounded-xl ${colorTheme.button.primary} ${colorTheme.button.primaryHover} transition-all text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-red-500/20">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Confirm Deletion</h2>
                </div>

                <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 mb-5">
                  <p className="text-red-400 font-medium mb-1">Warning</p>
                  <p className="text-gray-300 text-sm">All your data including photos, messages, matches, and connections will be permanently deleted.</p>
                </div>

                <p className="text-sm text-gray-400 mb-2">
                  Type <span className="text-white font-bold">DELETE</span> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder={t('deleteAccount.placeholder')}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all mb-5"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('reason')}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={confirmText !== 'DELETE'}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete My Account
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DeleteAccountModal;
