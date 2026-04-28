import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Heart, Mail, Lock, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import SplashScreen from '../components/SplashScreen';
import FloatingGhosts from '../components/FloatingGhosts';
import AddToHomeScreenModal from '../components/modals/AddToHomeScreenModal';

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { signInWithGoogle } = useAuthStore();

  const [isLangMenuOpen, setLangMenuOpen] = useState(false);
  const [isProductsOpen, setProductsOpen] = useState(false);
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
            if (isMobile) {
              setShowInstallButton(true);
            }
          }
        }, 3000);
      }
    };
    
    setupInstallButton();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const manualTimer = setTimeout(() => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && !showInstallButton && !installPrompt) {
        setShowInstallButton(true);
      }
    }, 5000);

    return () => clearTimeout(manualTimer);
  }, [showInstallButton, installPrompt]);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(() => {
        if (!installPrompt) {
          setShowInstallButton(true);
        }
      }, 1000);
    }
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      try {
        const result = await installPrompt.prompt();
        if (result.outcome === 'accepted') {
          toast.success('App installed successfully!');
        } else {
          toast('Installation cancelled');
        }
        setShowInstallButton(false);
      } catch (error) {
        console.error('Installation failed:', error);
        toast.error('Installation failed. Please try again.');
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        toast('To install on iOS: Tap the share button and select "Add to Home Screen"');
      } else {
        toast.error('Installation not available. Please try using Chrome or Safari.');
      }
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
    try {
      localStorage.setItem('lang', langCode);
    } catch {}
    setLangMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#22090E] to-[#2E0C13] relative overflow-hidden">
      <SplashScreen visible={showSplash} />
      
      {showInstallButton && !showSplash && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleInstall}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-rose-700 to-purple-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/20 backdrop-blur-sm opacity-40"
          style={{
            background: 'linear-gradient(135deg, #be185d, #6b21a8)',
            boxShadow: '0 4px 15px rgba(190, 24, 93, 0.3)'
          }}
        >
          <Download size={16} className="flex-shrink-0" />
          <span className="hidden sm:inline font-semibold">Install App</span>
        </motion.button>
      )}
      
      <FloatingGhosts />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="drop-shadow-[0_0_12px_rgba(236,72,153,0.85)]"
            >
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-pink-500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <mask id="loginGhostEyesMask">
                    <rect width="24" height="24" fill="white"/>
                    <circle cx="9" cy="10" r="1.4" fill="black"/>
                    <circle cx="15" cy="10" r="1.4" fill="black"/>
                  </mask>
                </defs>
                <path
                  d="M12 2c-4.418 0-8 3.582-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10c0-4.418-3.582-8-8-8z"
                  fill="currentColor"
                  mask="url(#loginGhostEyesMask)"
                />
              </svg>
            </motion.div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }} 
            className="text-5xl font-bold text-white"
          >
            {t('findYourPerfectMatch')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.6 }} 
            className="text-lg text-pink-300 mt-2 mb-8"
          >
            {t('appPurpose')}
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white/20 text-white font-bold py-3 rounded-2xl transition-all duration-300 hover:bg-white/30 mt-4"
          >
            <img src="/google-logo.svg" alt="Google" className="w-5 h-5" />
            {t('continueWithGoogle')}
          </motion.button>

        </div>

        <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
          <div className="flex justify-center gap-4 mb-2">
            <div className="relative">
              <button onClick={() => setLangMenuOpen(!isLangMenuOpen)} className="hover:text-white">{t('language')}</button>
              {isLangMenuOpen && (
                <div className="absolute bottom-full mb-2 w-40 bg-white/10 backdrop-blur-lg rounded-xl p-2 text-left">
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
            <a href="#" onClick={(e) => { e.preventDefault(); setProductsOpen(true); }} className="hover:text-white">{t('products')}</a>
            <Link to="/privacy" className="hover:text-white">{t('privacyPolicy', 'Privacy Policy')}</Link>
            <Link to="/terms" className="hover:text-white">{t('termsOfService')}</Link>
          </div>
          <p className="text-pink-400">{t('copyright')}</p>
        </footer>

        {isProductsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-gradient-to-br from-[#1a0f14] to-[#2E0C13] text-white rounded-2xl border border-pink-500/30 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-pink-400">{t('products')}</h2>
                <button
                  onClick={() => setProductsOpen(false)}
                  aria-label={t('general.close')}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm leading-6 text-white/90 max-h-[70vh] overflow-y-auto">
                <p>{t('tos.p1')}</p>
                <p>{t('tos.p2')}</p>
                <p>{t('tos.p3')}</p>
                <p>{t('tos.p4')}</p>
              </div>
            </motion.div>
          </div>
        )}


      </motion.div>

      {isInstallModalOpen && (
        <AddToHomeScreenModal
          isOpen={isInstallModalOpen}
          onClose={() => setInstallModalOpen(false)}
          installPrompt={installPrompt}
        />
      )}
    </div>
  );
};

export default HomePage;