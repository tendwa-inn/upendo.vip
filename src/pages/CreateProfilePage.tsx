import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../stores/onboardingStore';
import NameStep from '../components/onboarding/NameStep';
import DobStep from '../components/onboarding/DobStep';
import GenderStep from '../components/onboarding/GenderStep';
import TribeStep from '../components/onboarding/TribeStep';
import InterestsStep from '../components/onboarding/InterestsStep';


import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const CreateProfilePage: React.FC = () => {
  const { step, prevStep } = useOnboardingStore();
  const { profile, applyPromoCode } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const savedPromoCode = localStorage.getItem('promoCode');
    if (savedPromoCode) {
      applyPromoCode(savedPromoCode);
      // Clear the promo code so it's only used once
      localStorage.removeItem('promoCode');
    }
  }, [applyPromoCode]);

  useEffect(() => {
    if (profile && profile.onboarding_completed) {
      navigate('/find', { replace: true });
    }
  }, [profile, navigate]);

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
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

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <button
        onClick={handleBack}
        className="absolute top-8 left-8 z-20 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Go back"
      >
        <IoArrowBack size={24} />
      </button>
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 md:transform-none md:scale-100"
        style={{
          backgroundImage: 'url(/SIGN%20UP.png)',
        }}
      />
      {/* Mobile overlay zoom out effect */}
      <style jsx>{`
        @media (max-width: 768px) {
          .absolute.inset-0.z-0 {
            transform: scale(1.5);
            transform-origin: center;
          }
        }
      `}</style>
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateProfilePage;
