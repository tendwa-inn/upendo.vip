import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';

const africanTribes = [
  'Zulu', 'Xhosa', 'Maasai', 'Yoruba', 'Igbo', 'Hausa', 'Kikuyu', 'Shona', 
  'Amhara', 'Oromo', 'Somali', 'Akan', 'Fulani', 'Berber', 'Bambara', 
  'Wolof', 'Mossi', 'Chewa', 'Tswana', 'Sotho', 'Swazi', 'Ndebele', 
  'Venda', 'Malagasy', 'Fang', 'Bakongo', 'Luba', 'Mongo', 'Tiv', 'Ewe', 
  'Fon', 'Ga', 'Bemba', 'Tonga', 'Lozi', 'Luvale', 'Herero', 'Ovambo', 
  'San', 'Khoikhoi', 'Namwanga', 'Ngoni'
].sort();

const TribeStep: React.FC = () => {
  const { nextStep, prevStep, updateFormData, formData } = useOnboardingStore();
  const [tribe, setTribe] = useState(formData.tribe || '');

  const handleNext = () => {
    updateFormData({ tribe });
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
        <h1 className="text-3xl font-bold text-white">What's your tribe?</h1>
        <p className="text-white/60 mt-1">(Optional)</p>
      </div>
      <select 
        value={tribe} 
        onChange={(e) => setTribe(e.target.value)} 
        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
      >
        <option value="" className="text-gray-500">Select your tribe (optional)</option>
        {africanTribes.map(t => <option key={t} value={t} className="text-black">{t}</option>)}
      </select>
      <div className="flex gap-4">
        <button onClick={prevStep} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">Back</button>
        <button onClick={handleNext} className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300">Next</button>
      </div>
    </motion.div>
  );
};

export default TribeStep;
