import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { User, Users } from 'lucide-react';

const GenderStep: React.FC = () => {
  const { nextStep, updateFormData } = useSignUpStore();
  const [gender, setGender] = useState<'man' | 'woman'>('woman');

  const handleNext = () => {
    const lookingFor = gender === 'man' ? 'women' : 'men';
    updateFormData({ gender, lookingFor });
    nextStep();
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6"
      >
        <Users className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-6">I am a...</h2>
      
      <div className="space-y-4 mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setGender('woman')}
          className={`w-full py-3 text-lg font-bold rounded-2xl transition-all duration-300 ${
            gender === 'woman' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
              : 'bg-white/20 text-white/80'
          }`}
        >
          Woman
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setGender('man')}
          className={`w-full py-3 text-lg font-bold rounded-2xl transition-all duration-300 ${
            gender === 'man' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
              : 'bg-white/20 text-white/80'
          }`}
        >
          Man
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300"
      >
        Next
      </motion.button>
    </div>
  );
};

export default GenderStep;