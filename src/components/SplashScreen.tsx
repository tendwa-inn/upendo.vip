import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
// Using a custom filled ghost SVG with transparent eyes

interface SplashScreenProps {
  visible: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ visible }) => {
  const { profile } = useAuthStore();
  const [theme, setTheme] = useState('free');
  const [isInitialDelayOver, setIsInitialDelayOver] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialDelayOver(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialDelayOver) {
      const newTheme = profile?.account_type === 'vip' ? 'vip' : profile?.account_type === 'pro' ? 'pro' : 'free';
      setTheme(newTheme);
    }
  }, [profile, isInitialDelayOver]);

  if (!visible) return null;

  const themes = {
    free: {
      gradient: 'from-[#22090E] to-[#2E0C13]',
      ghost: 'text-pink-500',
      glow: 'drop-shadow-[0_0_18px_rgba(236,72,153,0.9)]',
    },
    pro: {
      gradient: 'from-[#071521] to-[#0b2237]',
      ghost: 'text-cyan-400',
      glow: 'drop-shadow-[0_0_18px_rgba(34,211,238,0.9)]',
    },
    vip: {
      gradient: 'from-black to-[#0b0b0b]',
      ghost: 'text-amber-400',
      glow: 'drop-shadow-[0_0_18px_rgba(251,191,36,0.9)]',
    },
  };

  const currentTheme = themes[theme];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b ${currentTheme.gradient}`}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-40 h-40 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className={currentTheme.glow}
            >
              <svg viewBox="0 0 24 24" className={`w-16 h-16 ${currentTheme.ghost}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <mask id="ghostEyesMask">
                    <rect width="24" height="24" fill="white"/>
                    <circle cx="9" cy="10" r="1.4" fill="black"/>
                    <circle cx="15" cy="10" r="1.4" fill="black"/>
                  </mask>
                </defs>
                <path
                  d="M12 2c-4.418 0-8 3.582-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10c0-4.418-3.582-8-8-8z"
                  fill="currentColor"
                  mask="url(#ghostEyesMask)"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
