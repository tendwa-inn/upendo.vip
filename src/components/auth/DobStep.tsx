import React, { useState } from 'react';
import { useSignUpStore } from '../../stores/signUpStore';
import { motion } from 'framer-motion';

const DobStep: React.FC = () => {
  const { formData, updateFormData, nextStep } = useSignUpStore();
  const [error, setError] = useState('');

  const handleNext = () => {
    const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
    if (age < 18 || age > 60) {
      setError('You must be between 18 and 60 to sign up.');
    } else {
      nextStep();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <h2 className="text-3xl font-bold mb-6 text-white">When is your birthday?</h2>
      <input
        type="date"
        value={formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : ''}
        onChange={(e) => updateFormData({ dateOfBirth: new Date(e.target.value) })}
        className="w-full p-4 bg-white/10 text-white rounded-lg mb-4"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button onClick={handleNext} className="w-full p-4 bg-purple-600 text-white rounded-lg font-bold">
        Next
      </button>
    </motion.div>
  );
};

export default DobStep;