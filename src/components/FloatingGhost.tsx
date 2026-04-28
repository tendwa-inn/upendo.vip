import React from 'react';
import { motion } from 'framer-motion';

const FloatingGhost: React.FC<{ delay: number }> = ({ delay }) => {
  const duration = 10 + Math.random() * 10;

  return (
    <motion.div
      initial={{ y: '110vh', x: `${Math.random() * 100}vw`, opacity: 0, scale: Math.random() * 0.5 + 0.5 }}
      animate={{ y: '-10vh', opacity: [0, 0.7, 0.7, 0] }}
      transition={{
        delay,
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear',
        times: [0, 0.1, 0.9, 1]
      }}
      className="absolute top-0 left-0"
    >
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-pink-500/20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M12 2c-4.418 0-8 3.582-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10c0-4.418-3.582-8-8-8z"
          fill="currentColor"
        />
      </svg>
    </motion.div>
  );
};

export default FloatingGhost;