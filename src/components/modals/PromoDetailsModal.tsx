import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Calendar, Tag } from 'lucide-react';

interface PromoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode?: string;
  promoName?: string;
  promoDescription?: string;
  expiresAt?: string;
}

const PromoDetailsModal: React.FC<PromoDetailsModalProps> = ({
  isOpen,
  onClose,
  promoCode,
  promoName,
  promoDescription,
  expiresAt
}) => {
  if (!isOpen) return null;

  const formatExpiryDate = (dateString: string) => {
    if (!dateString) return 'No expiration';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-8 w-full max-w-lg text-white border border-white/10 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Promo Code Details</h2>
          </div>

          {/* Promo Code */}
          {promoCode && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-pink-400" />
                <span className="text-sm text-gray-300">Promo Code</span>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <code className="text-lg font-mono text-pink-400">{promoCode}</code>
              </div>
            </div>
          )}

          {/* Promo Name */}
          {promoName && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-300">Promotion Name</span>
              </div>
              <p className="text-white font-semibold">{promoName}</p>
            </div>
          )}

          {/* Description */}
          {promoDescription && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 text-blue-400">ℹ️</div>
                <span className="text-sm text-gray-300">Description</span>
              </div>
              <p className="text-gray-200 leading-relaxed">{promoDescription}</p>
            </div>
          )}

          {/* Expiration */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-300">Valid Till</span>
            </div>
            <p className="text-yellow-300 font-semibold">
              {formatExpiryDate(expiresAt || '')}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200"
          >
            Got it!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromoDetailsModal;