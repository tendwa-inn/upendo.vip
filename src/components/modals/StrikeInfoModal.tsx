
import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, BookOpen, BarChart } from 'lucide-react';
import { useModalStore } from '../../stores/modalStore'; // Assuming a modal store for inter-modal communication

const StrikeInfoModal = ({ isOpen, onClose }) => {
  const { openPopularityModal } = useModalStore();

  if (!isOpen) return null;

  const handleCheckVisibility = () => {
    onClose(); // Close this modal first
    openPopularityModal(); // Then open the popularity modal
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-8 w-full max-w-lg text-white border border-white/10 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10">
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <ShieldAlert className="w-16 h-16 mx-auto text-yellow-400" />
          <h2 className="text-2xl font-bold text-white mt-4">Community Guideline Strike</h2>
        </div>

        <p className="text-gray-300 text-center mb-8">
          Our community is built on respect. This strike was issued because of content that violates our policies against inappropriate language or profanity. Please review our guidelines to ensure a safe and positive experience for everyone.
        </p>

        <div className="space-y-4">
          <a 
            href="/community-guidelines" // Placeholder link
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Read Community Guidelines
          </a>
          <button 
            onClick={handleCheckVisibility}
            className="w-full flex items-center justify-center gap-3 py-3 bg-yellow-500/20 text-yellow-300 font-semibold rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            <BarChart className="w-5 h-5" />
            Check Account Visibility
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default StrikeInfoModal;
