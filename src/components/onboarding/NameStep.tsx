import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';

const NameStep: React.FC = () => {
  const { nextStep, updateFormData, formData } = useOnboardingStore();
  const [name, setName] = useState(formData.name || '');

  const handleNext = () => {
    updateFormData({ name });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl p-8 space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">What's your name?</h1>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your full name"
        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
      />
      <button 
        onClick={handleNext}
        disabled={!name}
        className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 disabled:bg-pink-800 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </motion.div>
  );
};

export default NameStep;
