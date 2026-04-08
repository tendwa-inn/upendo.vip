import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Ticket } from 'lucide-react';

const PromoCodeModal = ({ onClose, onApply }) => {
  const [code, setCode] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-8 w-full max-w-md text-white border border-white/10 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold text-white mb-4">Enter Promo Code</h2>
          <p className="text-gray-300 mb-6">Unlock special features and boosts with a promo code.</p>
          <input 
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER YOUR CODE"
            className="w-full p-4 text-center tracking-widest font-bold bg-white/10 border-2 border-dashed border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 mb-6"
          />
          <button 
            onClick={() => onApply(code)} 
            disabled={!code}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed"
          >
            Apply Code
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PromoCodeModal;