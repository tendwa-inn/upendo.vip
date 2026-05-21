import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../stores/onboardingStore';
import NameStep from '../components/onboarding/NameStep';
import DobStep from '../components/onboarding/DobStep';
import GenderStep from '../components/onboarding/GenderStep';
import TribeStep from '../components/onboarding/TribeStep';
import InterestsStep from '../components/onboarding/InterestsStep';
import { IoArrowBack } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NeonGhosts from '../components/NeonGhosts';

const CreateProfilePage: React.FC = () => {
  const { step, prevStep, onboardingCompleted } = useOnboardingStore();
  const { profile, hasAllRequiredFields, applyPromoCode, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLangMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const savedPromoCode = localStorage.getItem('promoCode');
    if (savedPromoCode) {
      applyPromoCode(savedPromoCode);
      localStorage.removeItem('promoCode');
    }
  }, [applyPromoCode]);

  // After onboarding completes AND profile is loaded, redirect.
  // Only fire when both flags are true — avoids redirect loops with stale persisted state.
  useEffect(() => {
    if (onboardingCompleted && profile) {
      navigate(hasAllRequiredFields ? '/find' : '/profile', { replace: true });
    }
  }, [onboardingCompleted, profile, hasAllRequiredFields, navigate]);

  const handleBack = async () => {
    if (step === 1) {
      await signOut();
      navigate('/login');
    } else {
      prevStep();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <NameStep />;
      case 2:
        return <DobStep />;
      case 3:
        return <GenderStep />;
      case 4:
        return <TribeStep />;
      case 5:
        return <InterestsStep />;
      default:
        return <NameStep />;
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'bem', name: 'Ichibemba' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ny', name: 'Chichewa' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'af', name: 'Afrikaans' },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    try {
      localStorage.setItem('lang', langCode);
    } catch {}
    setLangMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <NeonGhosts />
      <button
        onClick={handleBack}
        className="absolute top-8 left-8 z-20 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Go back"
      >
        <IoArrowBack size={24} />
      </button>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <div className="relative">
            <button onClick={() => setLangMenuOpen(!isLangMenuOpen)} className="hover:text-white">{t('language')}</button>
            {isLangMenuOpen && (
              <div className="absolute bottom-full mb-2 w-40 bg-white/10 backdrop-blur-lg rounded-xl p-2 text-left z-30">
                {languages.map(lang => (
                  <button 
                    key={lang.code} 
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`block w-full text-left px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors ${i18n.language === lang.code ? 'bg-white/20' : ''}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/privacy" className="hover:text-white">{t('privacyPolicy', 'Privacy Policy')}</Link>
        </div>
        <p className="text-pink-400">{t('copyright')}</p>
      </footer>
    </div>
  );
};

export default CreateProfilePage;