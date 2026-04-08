import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';

const DobStep: React.FC = () => {
  const { nextStep, prevStep, updateFormData, formData } = useOnboardingStore();
  
  const [day, setDay] = useState(formData.dob?.day || '');
  const [month, setMonth] = useState(formData.dob?.month || '');
  const [year, setYear] = useState(formData.dob?.year || '');

  const calculateAge = (day: string, month: string, year: string) => {
    if (!day || !month || !year) return null;
    
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(day, month, year);

  const handleNext = () => {
    const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    updateFormData({ dob });
    nextStep();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 83 }, (_, i) => currentYear - 18 - i); // Users from 18 to 100
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md bg-gray-900/30 backdrop-blur-lg rounded-3xl p-8 space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">When's your birthday?</h1>
      </div>
      <div className="flex gap-4">
        <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white">
          <option value="" disabled className="text-gray-500">Day</option>
          {days.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white">
          <option value="" disabled className="text-gray-500">Month</option>
          {months.map((m, i) => <option key={m} value={i + 1} className="text-black">{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white">
          <option value="" disabled className="text-gray-500">Year</option>
          {years.map(y => <option key={y} value={y} className="text-black">{y}</option>)}
        </select>
      </div>
      
      {currentAge !== null && (
        <div className="text-center mt-4">
          <p className="text-pink-500 text-lg font-semibold">
            So you are {currentAge} years old.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={prevStep} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">Back</button>
        <button onClick={handleNext} disabled={!day || !month || !year} className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300 disabled:bg-pink-800 disabled:cursor-not-allowed">Next</button>
      </div>
    </motion.div>
  );
};

export default DobStep;
