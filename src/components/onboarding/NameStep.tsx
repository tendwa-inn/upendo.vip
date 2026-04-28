import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';

const NameStep: React.FC = () => {
  const { nextStep, updateFormData, formData } = useOnboardingStore();
  const [name, setName] = useState(formData.name || '');
  const [error, setError] = useState('');

  const validateName = (input: string) => {
    // Only allow letters and spaces (no numbers, symbols, or emojis)
    const nameRegex = /^[a-zA-Z\s]*$/;
    return nameRegex.test(input);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    if (validateName(input)) {
      setName(input);
      setError('');
    } else {
      setError('Only letters and spaces allowed - no numbers, symbols, or emojis');
    }
  };

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
        <p className="text-gray-400 text-sm mt-2">Please use only letters and spaces</p>
      </div>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Enter your full name"
        className={`w-full p-3 bg-white/10 border rounded-xl focus:outline-none focus:ring-2 text-white ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-pink-500'
        }`}
      />
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
      <button 
        onClick={handleNext}
        disabled={!name || !!error}
        className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 disabled:bg-pink-800 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </motion.div>
  );
};

export default NameStep;
