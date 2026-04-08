import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Star } from 'lucide-react';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoName: string;
  promoDescription: string;
}

const CongratulationsModal: React.FC<CongratulationsModalProps> = ({ isOpen, onClose, promoName, promoDescription }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl w-full max-w-sm m-4 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <div className="mx-auto bg-white/20 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <Gift className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-lg mb-4">You've successfully redeemed</p>
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-bold text-yellow-300">{promoName}</h3>
                <p className="text-white/80">{promoDescription}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-white text-pink-600 font-bold rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                Start Exploring
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CongratulationsModal;
