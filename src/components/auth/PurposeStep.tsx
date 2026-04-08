import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const purposes = ['Friendship', 'Dating', 'Hookups', 'Serious Relationship'];

const PurposeStep: React.FC = () => {
  const { nextStep, updateFormData } = useSignUpStore();
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);

  const togglePurpose = (purpose: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(purpose)
        ? prev.filter((p) => p !== purpose)
        : [...prev, purpose]
    );
  };

  const handleNext = () => {
    if (selectedPurposes.length === 0) {
      toast.error('Please select at least one option');
      return;
    }
    updateFormData({ hereFor: selectedPurposes as any });
    nextStep();
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6"
      >
        <Heart className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-6">I'm here for...</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {purposes.map((purpose) => (
          <motion.button
            key={purpose}
            whileTap={{ scale: 0.95 }}
            onClick={() => togglePurpose(purpose)}
            className={`w-full py-4 text-md font-bold rounded-2xl transition-all duration-300 ${
              selectedPurposes.includes(purpose)
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white/20 text-white/80'
            }`}
          >
            {purpose}
          </motion.button>
        ))}
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

export default PurposeStep;