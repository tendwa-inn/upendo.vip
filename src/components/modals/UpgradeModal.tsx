import React from 'react';
import { motion } from 'framer-motion';
import { X, Ghost } from 'lucide-react';

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
          <style>
            {`
              @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
                100% { transform: translateY(0px); }
              }
            `}
          </style>
          <div className="relative w-48 h-48 mb-6">
            <Ghost className="absolute top-0 left-1/4 text-green-500 w-16 h-16 opacity-80" style={{ animation: 'float 3s ease-in-out infinite' }} />
            <Ghost className="absolute top-1/4 left-3/4 text-white w-12 h-12 opacity-70" style={{ animation: 'float 4s ease-in-out infinite 0.5s' }} />
            <Ghost className="absolute bottom-0 left-1/2 text-green-400 w-10 h-10 opacity-60" style={{ animation: 'float 3.5s ease-in-out infinite 1s' }} />
            <Ghost className="absolute bottom-1/4 left-0 text-white w-14 h-14 opacity-75" style={{ animation: 'float 4.5s ease-in-out infinite 1.5s' }} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">You are one step to finding your Upendo</h2>
          <p className="text-center text-gray-300 mb-6">Reach us via Upendo Chat on WhatsApp to upgrade</p>
          <a
            href="https://wa.me/260968708647?text=Hey%20I%20would%20love%20to%20subscribe%20to%20Upendo"
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