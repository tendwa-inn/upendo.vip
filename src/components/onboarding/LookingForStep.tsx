import React from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';

const LookingForStep: React.FC = () => {
  const { nextStep, prevStep, updateFormData } = useOnboardingStore();

  const handleSelect = (lookingFor: string) => {
    updateFormData({ looking_for: lookingFor });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl p-8 space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">What are you here for?</h1>
      </div>
      <div className="space-y-4">
        <button onClick={() => handleSelect('A serious relationship')} className="w-full text-lg font-bold py-4 px-4 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-300">A serious relationship</button>
        <button onClick={() => handleSelect('Something casual')} className="w-full text-lg font-bold py-4 px-4 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-300">Something casual</button>
        <button onClick={() => handleSelect('New friends')} className="w-full text-lg font-bold py-4 px-4 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-300">New friends</button>
      </div>
      <button onClick={prevStep} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">Back</button>
    </motion.div>
  );
};

export default LookingForStep;
