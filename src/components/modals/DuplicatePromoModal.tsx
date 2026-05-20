import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DuplicatePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoName?: string;
}

const DuplicatePromoModal: React.FC<DuplicatePromoModalProps> = ({ isOpen, onClose, promoName }) => {
  const { t } = useTranslation();
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl w-full max-w-sm text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto bg-red-500/20 border border-red-500/30 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>

              <h2 className="text-xl font-bold mb-2">{t('modal.duplicate.title')}</h2>
              <p className="text-white/60 text-sm mb-6">
                {t('modal.duplicate.message')}
                {promoName && (
                  <span className="block mt-2 text-white/80">
                    <span className="text-yellow-400 font-semibold">{promoName}</span> {t('modal.duplicate.wasApplied')}
                  </span>
                )}
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                {t('modal.duplicate.gotIt')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DuplicatePromoModal;
