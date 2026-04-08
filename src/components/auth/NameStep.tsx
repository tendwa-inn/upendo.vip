import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

const NameStep: React.FC = () => {
  const { nextStep, updateFormData } = useSignUpStore();
  const [name, setName] = useState('');

  const handleNext = () => {
    if (name.trim().length < 2) {
      toast.error('Please enter a valid name');
      return;
    }
    updateFormData({ name });
    nextStep();
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6"
      >
        <User className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-3">What's your name?</h2>
      
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-8 px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white text-center placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
        placeholder="Enter your first name"
        required
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
      >
        Next
      </motion.button>
    </div>
  );
};

export default NameStep;