import React from 'react';
import { motion } from 'framer-motion';

interface AddToHomeScreenModalProps {
  onInstall: () => void;
  onClose: () => void;
}

const AddToHomeScreenModal: React.FC<AddToHomeScreenModalProps> = ({ onInstall, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-sm text-white border border-white/10 text-center"
      >
        <h2 className="text-xl font-bold mb-4">Save to Home Screen</h2>
        <p className="text-gray-300 mb-6">For the best experience, add Upendo to your home screen.</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
            Not Now
          </button>
          <button onClick={onInstall} className="w-full py-2 rounded-xl bg-pink-500 hover:bg-pink-600 transition-all font-bold">
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddToHomeScreenModal;
