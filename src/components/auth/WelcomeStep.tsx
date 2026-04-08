import React from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import { PartyPopper } from 'lucide-react';

interface WelcomeStepProps {
  onComplete: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  const { formData } = useSignUpStore();

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6"
      >
        <PartyPopper className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-3">Welcome, {formData.name}!</h2>
      <p className="text-white/80 mb-8">
        You're all set! Get ready to find your perfect match.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onComplete}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
      >
        Start Swiping
      </motion.button>
    </div>
  );
};

export default WelcomeStep;
