import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-md text-white border border-white/10 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <img src="https://placehold.co/192x192/E91E63/FFFFFF?text=Couple\nin+Love" alt="Couple in love" className="w-48 h-48 object-cover rounded-full mb-6" />
          <h2 className="text-2xl font-bold text-center mb-4">You are one step to finding your Upendo</h2>
          <p className="text-center text-gray-300 mb-6">Reach us via Upendo Chat on WhatsApp to upgrade</p>
          <a
            href="https://wa.me/260776836722"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full font-bold py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 text-center"
          >
            Upgrade on WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default UpgradeModal;