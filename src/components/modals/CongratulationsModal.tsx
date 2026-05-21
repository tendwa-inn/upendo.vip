import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoName: string;
  promoDescription: string;
  expiresAt?: string;
}

const CongratulationsModal: React.FC<CongratulationsModalProps> = ({ isOpen, onClose, promoName, promoDescription, expiresAt }) => {
  const { t } = useTranslation();
  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  const isExpired = expiryDate && expiryDate <= new Date();
  const daysLeft = expiryDate ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-sm text-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-pink-500/30 to-purple-500/30 p-6 text-center relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                className="mx-auto bg-white/10 border border-white/20 rounded-full h-16 w-16 flex items-center justify-center mb-3"
              >
                <Gift className="w-8 h-8 text-pink-300" />
              </motion.div>

              <h2 className="text-xl font-bold mb-1">{t('modal.congrats.title')}</h2>
              <p className="text-white/50 text-sm">{t('modal.congrats.activated')}</p>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Promo name */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-white/40 uppercase tracking-wider">{t('modal.congrats.promoCode')}</span>
                </div>
                <h3 className="text-lg font-bold text-yellow-300">{promoName}</h3>
                <p className="text-white/60 text-sm mt-1">{promoDescription}</p>
              </div>

              {/* Expiry */}
              {expiryDate && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  isExpired
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <Clock className={`w-5 h-5 ${isExpired ? 'text-red-400' : 'text-emerald-400'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${isExpired ? 'text-red-300' : 'text-emerald-300'}`}>
                      {isExpired ? t('modal.congrats.expired') : t('modal.congrats.daysRemaining', { days: daysLeft, suffix: daysLeft !== 1 ? 's' : '' })}
                    </p>
                    <p className="text-white/40 text-xs">
                      {t('modal.congrats.expires', { date: expiryDate.toLocaleDateString() })}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-pink-500/20"
              >
                {t('modal.congrats.awesome')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CongratulationsModal;
