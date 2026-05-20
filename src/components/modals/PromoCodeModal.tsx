import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useCurrentTheme } from '../../stores/colorThemeStore';

const PromoCodeModal = ({ onClose, onApply }) => {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const colorTheme = useCurrentTheme(profile?.account_type || 'free');
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code || isApplying) return;
    setIsApplying(true);
    try {
      await onApply(code);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className={`rounded-2xl p-8 w-full max-w-md text-white relative shadow-2xl ${colorTheme.background}`}
      >
        <div className={`absolute inset-0 rounded-2xl blur-xl ${colorTheme.accent.glow}`}></div>

        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 z-10">
          <X className="w-6 h-6" />
        </button>
        <div className="relative z-10 text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold text-white mb-4">{t('promo.title')}</h2>
          <p className="text-gray-300 mb-6">{t('promo.description')}</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('promo.placeholder')}
            className="w-full p-4 text-center tracking-widest font-bold bg-white/10 border-2 border-dashed border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 mb-6"
          />
          <button
            onClick={handleApply}
            disabled={!code || isApplying}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorTheme.button.primary} ${colorTheme.button.primaryHover}`}
          >
            {isApplying ? 'Applying...' : t('promo.apply')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PromoCodeModal;
