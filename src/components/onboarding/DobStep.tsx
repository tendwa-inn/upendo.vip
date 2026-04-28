import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';

const DobStep: React.FC = () => {
  const { nextStep, prevStep, updateFormData, formData } = useOnboardingStore();
  
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (formData.dob) {
      const date = new Date(formData.dob);
      setDay(date.getDate().toString());
      setMonth((date.getMonth() + 1).toString());
      setYear(date.getFullYear().toString());
    }
  }, [formData.dob]);

  useEffect(() => {
    if (day && month && year) {
      const today = new Date();
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    }
  }, [day, month, year]);

  const handleNext = () => {
    if (day && month && year) {
      const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      updateFormData({ dob });
      nextStep();
    }
  };

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
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="flex-1 p-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="" className="text-black">Day</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d} className="text-black">{d}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="flex-1 p-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="" className="text-black">Month</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m} className="text-black">{m}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="flex-1 p-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="" className="text-black">Year</option>
          {Array.from({ length: 83 }, (_, i) => new Date().getFullYear() - 18 - i).map((y) => (
            <option key={y} value={y} className="text-black">{y}</option>
          ))}
        </select>
      </div>

      {age !== null && (
        <div className="text-center">
          <p className="text-pink-500 text-lg font-semibold">
            So you are {age} years old.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={prevStep} className="w-full font-bold py-3 px-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300">Back</button>
        <button onClick={handleNext} className="w-full font-bold py-3 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300">Next</button>
      </div>
    </motion.div>
  );
};

export default DobStep;
