import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { ChevronDown, Ghost, Users, FileText, Shield, Download, Menu, X, Info, Heart, Sparkles, Zap } from 'lucide-react';
import FloatingGhosts from '../components/FloatingGhosts';
import { useSoundSettings, useButtonSound } from '../hooks/useButtonSound';
import { soundService } from '../soundService';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useSoundSettings();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleGetStarted = useButtonSound(signInWithGoogle);
  const handleLogin = useButtonSound(() => navigate('/login'));

  const createDrawerHandler = (action: () => void) => {
    return useButtonSound(() => {
      action();
      setIsDrawerOpen(false);
    });
  };

  const handleLoginClick = createDrawerHandler(() => navigate('/login'));
  const handleCommunityClick = createDrawerHandler(() => window.open('https://chat.whatsapp.com/DYVP65HIBC25WaJMfIIqsa', '_blank'));
  const handleTermsClick = createDrawerHandler(() => navigate('/terms'));
  const handlePrivacyClick = createDrawerHandler(() => navigate('/privacy'));
  const handleAboutClick = createDrawerHandler(() => navigate('/about'));
  const handleDownloadClick = createDrawerHandler(() => {});

  const drawerItems = [
    { label: 'Login / Sign Up', icon: <Ghost className="w-5 h-5" />, onClick: handleLoginClick },
    { label: 'Join Community', icon: <Users className="w-5 h-5" />, onClick: handleCommunityClick },
    { label: 'Terms of Service', icon: <FileText className="w-5 h-5" />, onClick: handleTermsClick },
    { label: 'Privacy Policy', icon: <Shield className="w-5 h-5" />, onClick: handlePrivacyClick },
    { label: 'About Us', icon: <Info className="w-5 h-5" />, onClick: handleAboutClick },
    { label: 'Download App', icon: <Download className="w-5 h-5" />, onClick: handleDownloadClick },
  ];

  const stats = [
    { icon: <Users className="w-4 h-4" />, value: '10K+', label: 'Users' },
    { icon: <Heart className="w-4 h-4" />, value: 'Zero', label: 'Ghosting' },
    { icon: <Sparkles className="w-4 h-4" />, value: 'Real', label: 'Connections' },
  ];

  return (
    <div className="min-h-screen bg-[#2D0B0E] relative overflow-hidden">
      <FloatingGhosts />

      {/* Animated background glow */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,45,117,0.2) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
        className="relative z-50 p-4 md:p-6"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#ff2d75] to-[#ff2d75] rounded-full flex items-center justify-center shadow-lg shadow-[#ff2d75]/40"
              >
                <Ghost className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.15, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -inset-2 rounded-full bg-[#ff2d75] blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  soundService.playButtonClick();
                  toggleSound();
                }}
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white tracking-wider">Upendo</span>
          </motion.div>

          {/* Menu button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2.5 md:px-5 md:py-3 text-white hover:bg-white/15 transition-colors"
          >
            <Menu className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base hidden sm:inline">Menu</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 -mt-12 md:-mt-16">
        <div className="text-center max-w-lg mx-auto">

          {/* Ghost mascot */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, type: 'spring', stiffness: 80, damping: 12 }}
            className="mb-8 md:mb-10"
          >
            <div className="relative inline-block">
              {/* Neon glow ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.2, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-5 rounded-full"
                style={{ background: 'conic-gradient(from 0deg, #ff2d75, #ff6b9d, #ff2d75, transparent, #ff2d75)', filter: 'blur(12px)' }}
              />

              {/* Ghost container */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-[#ff2d75] to-[#ff2d75] rounded-full flex items-center justify-center shadow-2xl shadow-[#ff2d75]/50"
              >
                <Ghost className="w-14 h-14 md:w-18 md:h-18 text-white" />
              </motion.div>

              {/* Orbiting particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.5,
                  }}
                  className="absolute inset-0"
                  style={{ transform: `rotate(${i * 60}deg)` }}
                >
                  <motion.div
                    animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 md:w-2.5 md:h-2.5 bg-[#ff2d75] rounded-full shadow-lg shadow-[#ff2d75]/60"
                    style={{ marginTop: `-${20 + i * 6}px` }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, type: 'spring' }}
            className="text-4xl md:text-6xl font-extrabold mb-3 tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              Upendo
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-lg md:text-xl text-pink-300/90 font-medium mb-10 md:mb-12"
          >
            The No-Ghost Dating App
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 md:mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(255,45,117,0.4)' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleGetStarted}
              className="relative px-8 py-3.5 md:px-10 md:py-4 bg-gradient-to-r from-[#ff2d75] to-[#ff2d75] text-white rounded-full text-base md:text-lg font-bold shadow-xl shadow-[#ff2d75]/30 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Get Started
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLogin}
              className="px-8 py-3.5 md:px-10 md:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-base md:text-lg font-bold hover:border-white/30 transition-colors"
            >
              Login
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
            className="flex justify-center gap-6 md:gap-10"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 + i * 0.15 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-[#ff2d75]">{stat.icon}</span>
                  <span className="text-white font-bold text-lg md:text-xl">{stat.value}</span>
                </div>
                <span className="text-white/50 text-xs md:text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 md:w-80 bg-[#1a0709]/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#ff2d75] rounded-full flex items-center justify-center">
                    <Ghost className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">Upendo</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Drawer items */}
              <div className="flex-1 py-4 overflow-y-auto">
                {drawerItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.06, type: 'spring', stiffness: 150 }}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 px-6 py-3.5 text-white/80 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[#ff2d75] group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Drawer footer */}
              <div className="p-5 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Ghost className="w-3.5 h-3.5" />
                  <span>No ghosts allowed</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
