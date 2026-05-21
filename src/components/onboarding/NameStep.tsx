import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useTranslation } from 'react-i18next';

const cardStyle = {
  background: 'linear-gradient(145deg, rgba(40,10,20,0.95) 0%, rgba(20,8,15,0.98) 100%)',
  border: '1px solid rgba(255,45,117,0.15)',
  boxShadow: '0 0 60px rgba(255,45,117,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const NameStep: React.FC = () => {
  const { nextStep, updateFormData, formData } = useOnboardingStore();
  const { t } = useTranslation();
  const [name, setName] = useState(formData.name || '');
  const [error, setError] = useState('');

  const validateName = (input: string) => /^[a-zA-Z\s]*$/.test(input);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (validateName(input)) { setName(input); setError(''); }
    else setError(t('onboarding.name.error'));
  };

  const handleNext = () => { updateFormData({ name }); nextStep(); };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md rounded-3xl p-6 pt-8 space-y-5"
      style={cardStyle}
    >
      <div className="flex justify-center gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 1 ? 'w-8 bg-pink-500' : 'w-4 bg-white/15'}`} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-4xl mb-2">&#128075;</p>
        <h1 className="text-2xl font-bold text-white">{t('onboarding.name.question')}</h1>
        <p className="text-white/40 text-sm mt-1">{t('onboarding.name.description')}</p>
      </div>

      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder={t('onboarding.name.placeholder')}
        className="w-full p-3.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-300"
        style={{ background: 'rgba(255,255,255,0.08)', border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)' }}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleNext}
        disabled={!name || !!error}
        className="w-full font-bold py-3 px-4 rounded-xl text-white transition-all duration-300 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #ff2d75 0%, #ff6b9d 100%)', boxShadow: '0 4px 20px rgba(255,45,117,0.3)' }}
      >
        {t('onboarding.next')}
      </button>
    </motion.div>
  );
};

export default NameStep;
