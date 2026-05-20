import React, { useState } from 'react';
import { Button } from '@tremor/react';
import Portal from '../Portal';
import { X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCurrentTheme } from '../../stores/colorThemeStore';
import { useTranslation } from 'react-i18next';

const DeactivationModal = ({ onClose, onDeactivate }) => {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const colorTheme = useCurrentTheme(profile?.account_type || 'free');
  const [reason, setReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const reasons = [
    'deactivate.reasons.time',
    'deactivate.reasons.noMatches',
    'deactivate.reasons.notForMe',
    'deactivate.reasons.metSomeone',
    'deactivate.reasons.other',
  ];

  const handleDeactivate = () => {
    onDeactivate(reason);
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
            <h2 className="text-2xl font-bold text-white mb-4">{t('deactivate.title')}</h2>
            <p className="text-gray-300 mb-6">{t('deactivate.description')}</p>
            <div className="space-y-3 mb-6">
              {reasons.map(r => (
                <button key={r} onClick={() => setReason(r)} className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  reason === r
                    ? `${colorTheme.button.primary} shadow-lg`
                    : 'bg-white/10 hover:bg-white/20'
                }`}>
                  {t(r)}
                </button>
              ))}
            </div>
            <Button
              onClick={handleDeactivate}
              disabled={!reason}
              color="red"
              className={`w-full ${colorTheme.button.primary} ${colorTheme.button.primaryHover} text-white border-none transition-all duration-200 transform hover:scale-105 shadow-lg`}
            >
              {t('deactivate.confirm')}
            </Button>
          </div>
        </div>
        {showDeleteConfirm && (
          <div />
        )}
      </div>
    </Portal>
  );
};

export default DeactivationModal;
