import React from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useTranslation } from 'react-i18next';

const cardStyle = {
  background: 'linear-gradient(145deg, rgba(40,10,20,0.95) 0%, rgba(20,8,15,0.98) 100%)',
  border: '1px solid rgba(255,45,117,0.15)',
  boxShadow: '0 0 60px rgba(255,45,117,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const GenderStep: React.FC = () => {
  const { nextStep, prevStep, updateFormData } = useOnboardingStore();
  const { t } = useTranslation();

  const handleSelect = (gender: string) => {
    const looking_for = gender === 'male' ? 'female' : 'male';
    updateFormData({ gender, looking_for });
    nextStep();
  };

  const genders = [
    { value: 'male', emoji: '\uD83D\uDC68', label: t('onboarding.gender.male') },
    { value: 'female', emoji: '\uD83D\uDC69', label: t('onboarding.gender.female') },
  ];

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
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 3 ? 'w-8 bg-pink-500' : i < 3 ? 'w-4 bg-pink-500/50' : 'w-4 bg-white/15'}`} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-4xl mb-2">&#9877;&#65039;</p>
        <h1 className="text-2xl font-bold text-white">{t('onboarding.gender.question')}</h1>
      </div>

      <div className="space-y-3">
        {genders.map(({ value, emoji, label }) => (
          <motion.button
            key={value}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(value)}
            className="w-full text-lg font-bold py-4 px-4 rounded-xl text-white transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-3"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <span className="text-2xl">{emoji}</span>
            <span>{label}</span>
          </motion.button>
        ))}
      </div>

      <button onClick={prevStep} className="w-full font-semibold py-3 px-4 rounded-xl text-white/70 hover:text-white transition-all duration-300" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {t('onboarding.back')}
      </button>
    </motion.div>
  );
};

export default GenderStep;
