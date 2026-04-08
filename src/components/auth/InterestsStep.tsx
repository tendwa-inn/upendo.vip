import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignUpStore } from '../../stores/signUpStore';
import toast from 'react-hot-toast';

const InterestsStep: React.FC = () => {
  const { formData, updateData, nextStep } = useSignUpStore();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(formData.interests || []);

  const interests = ['Travel', 'Movies', 'Music', 'Gaming', 'Reading', 'Sports', 'Cooking', 'Art'];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      } else {
        if (prev.length >= 5) {
          toast.error('You can select up to 5 interests.');
          return prev;
        }
        return [...prev, interest];
      }
    });
  };

  const handleNext = () => {
    if (selectedInterests.length < 3) {
      toast.error('Please select at least 3 interests.');
      return;
    }
    updateData({ interests: selectedInterests });
    nextStep();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <h2 className="text-3xl font-bold mb-2 text-white">What are your interests?</h2>
      <p className="text-white/80 mb-6">Select at least 3.</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {interests.map((interest) => (
          <motion.button
            key={interest}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleInterest(interest)}
            className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 ${
              selectedInterests.includes(interest)
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white/20 text-white/80'
            }`}
          >
            {interest}
          </motion.button>
        ))}
      </div>
      <button onClick={handleNext} className="w-full p-4 bg-purple-600 text-white rounded-lg font-bold">
        Next
      </button>
    </motion.div>
  );
};

export default InterestsStep;
