import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Image, User, Heart } from 'lucide-react';

const ProfileCompletionModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const handleNext = (answer) => {
    const newAnswers = { ...answers, ...answer };
    setAnswers(newAnswers);

    if (step === 1) {
      onClose(newAnswers);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-lg text-white border border-white/10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">What are you here for?</h2>
          <button onClick={() => onClose(null)} className="p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <button onClick={() => handleNext({ looking_for: 'Serious Relationship' })} className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">Serious Relationship</button>
          <button onClick={() => handleNext({ looking_for: 'Casual/Hookup' })} className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">Casual/Hookup</button>
          <button onClick={() => handleNext({ looking_for: 'Friendship' })} className="w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">Friendship</button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionModal;
