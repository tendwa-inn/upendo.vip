import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { X } from 'lucide-react';

const MatchAnimation = ({ matchedUser, onClose }) => {
  const { profile: currentUser } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000); // Auto-close after 6 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!currentUser || !matchedUser) return null;

  const isVip = ((useAuthStore.getState().profile as any)?.accountType === 'vip') || ((useAuthStore.getState().profile as any)?.subscription === 'vip');
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative w-full max-w-md text-center"
        >
          <h1 className={`text-5xl font-bold mb-8 ${isVip ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]' : 'text-white'}`} style={{ fontFamily: 'Lobster, cursive' }}>It's a Match!</h1>
          <p className="text-white/80 text-lg mb-12">You and {matchedUser.name} have liked each other.</p>
          
          <div className="relative flex justify-center items-center h-48">
            {/* Current User Photo */}
            <motion.div 
              initial={{ x: -100, rotate: -15, scale: 0.8 }}
              animate={{ x: -40, rotate: -8, scale: 1 }}
              className="absolute w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden"
            >
              <img src={currentUser.photos[0]} alt={currentUser.name} className="w-full h-full object-cover" />
            </motion.div>

            {/* Matched User Photo */}
            <motion.div 
              initial={{ x: 100, rotate: 15, scale: 0.8 }}
              animate={{ x: 40, rotate: 8, scale: 1 }}
              className={`absolute w-40 h-40 rounded-full border-4 ${isVip ? 'border-amber-400' : 'border-pink-500'} shadow-lg overflow-hidden`}
            >
              <img src={matchedUser.photos[0]} alt={matchedUser.name} className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose} // Allow manual closing
            className={`mt-16 px-8 py-3 font-bold rounded-full shadow-lg transition-all duration-300 ${isVip ? 'bg-amber-400 text-black hover:bg-amber-500' : 'bg-pink-600 text-white hover:bg-pink-700'}`}
          >
            Send a Message
          </motion.button>

          <button onClick={onClose} className="absolute top-0 right-0 text-white/50 hover:text-white transition-all">
            <X size={28} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchAnimation;
