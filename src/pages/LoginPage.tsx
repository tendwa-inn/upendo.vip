import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { ArrowLeft, Ghost, Globe, ChevronDown, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import SplashScreen from '../components/SplashScreen';
import FloatingGhosts from '../components/FloatingGhosts';
import AddToHomeScreenModal from '../components/modals/AddToHomeScreenModal';

const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuthStore();

  const [isLangMenuOpen, setLangMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const checkIfInstalled = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
          if (isStandalone || registrations.length > 0) {
            setShowInstallButton(false);
            return true;
          }
        }
      } catch (error) {
        console.error('Error checking installation status:', error);
      }
      return false;
    };

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isChrome = /Chrome/i.test(navigator.userAgent);
      const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
      if (isMobile && (isChrome || isSafari)) {
        setShowInstallButton(true);
      } else {
        setInstallModalOpen(true);
      }
    };

    const setupInstallButton = async () => {
      const isInstalled = await checkIfInstalled();
      if (!isInstalled) {
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        setTimeout(() => {
          if (!installPrompt) {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) setShowInstallButton(true);
          }
        }, 3000);
      }
    };
    setupInstallButton();
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  useEffect(() => {
    const manualTimer = setTimeout(() => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && !showInstallButton && !installPrompt) setShowInstallButton(true);
    }, 5000);
    return () => clearTimeout(manualTimer);
  }, [showInstallButton, installPrompt]);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(() => { if (!installPrompt) setShowInstallButton(true); }, 1000);
    }
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        const result = await installPrompt.prompt();
        if (result.outcome === 'accepted') toast.success('App installed successfully!');
        else toast('Installation cancelled');
        setShowInstallButton(false);
      } catch (error) {
        console.error('Installation failed:', error);
        toast.error('Installation failed. Please try again.');
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) toast('To install on iOS: Tap the share button and select "Add to Home Screen"');
      else toast.error('Installation not available. Please try using Chrome or Safari.');
    }
  };

  React.useEffect(() => {
    const id = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(id);
  }, []);

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
    try { localStorage.setItem('lang', langCode); } catch {}
    setLangMenuOpen(false);
  };

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
      <SplashScreen visible={showSplash} />

      {/* Animated background orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] left-[10%] w-48 h-48 md:w-64 md:h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,45,117,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -25, 30, 0], y: [0, 30, -25, 0], scale: [1, 0.9, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[20%] right-[5%] w-56 h-56 md:w-72 md:h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, 20, -15, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[60%] left-[50%] w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)' }}
        />
      </div>

      <FloatingGhosts />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors border border-white/10"
      >
        <ArrowLeft size={20} />
      </motion.button>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm"
        >
          {/* Ghost mascot */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer glow ring */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.15, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-4 rounded-full"
                style={{ background: 'conic-gradient(from 180deg, #ff2d75, #ff6b9d, #ff2d75, transparent, #ff2d75)', filter: 'blur(10px)' }}
              />

              {/* Ghost circle */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/15"
              >
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 md:w-12 md:h-12 text-pink-500"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(236,72,153,0.7))' }}
                >
                  <defs>
                    <mask id="loginGhostEyes">
                      <rect width="24" height="24" fill="white"/>
                      <circle cx="9" cy="10" r="1.4" fill="black"/>
                      <circle cx="15" cy="10" r="1.4" fill="black"/>
                    </mask>
                  </defs>
                  <path
                    d="M12 2c-4.418 0-8 3.582-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10c0-4.418-3.582-8-8-8z"
                    fill="currentColor"
                    mask="url(#loginGhostEyes)"
                  />
                </motion.svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="text-center mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t('findYourPerfectMatch')}
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <p className="text-pink-300/80 text-sm md:text-base font-medium">
              {t('appPurpose')}
            </p>
          </motion.div>

          {/* Google sign-in button */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.98 }}
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <img src="/google-logo.svg" alt="Google" className="w-5 h-5" />
              <span className="text-base">{t('continueWithGoogle')}</span>
            </motion.button>
          </motion.div>

          {/* Terms text */}
          <motion.p variants={itemVariants} className="text-center text-white/30 text-xs mt-4 px-4">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-pink-400/60 hover:text-pink-400 underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-pink-400/60 hover:text-pink-400 underline">Privacy Policy</Link>
          </motion.p>

          {/* Language selector */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Globe className="w-4 h-4 text-white/40" />
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    i18n.language === lang.code
                      ? 'bg-[#ff2d75]/20 text-pink-300 border border-[#ff2d75]/30'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-[#ff2d75]/40 text-xs">{t('copyright')}</p>
          </motion.div>
        </motion.div>
      </div>

      {isInstallModalOpen && (
        <AddToHomeScreenModal
          isOpen={isInstallModalOpen}
          onClose={() => setInstallModalOpen(false)}
          onInstall={handleInstallClick}
          installPrompt={installPrompt}
        />
      )}
    </div>
  );
};

export default LoginPage;
