import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  threshold,
}) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = pullDistance > 20 ? 1 : 0;
  const rotation = isRefreshing ? 360 : progress * 180;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center pt-safe-top"
      style={{
        transform: `translateY(${Math.max(0, pullDistance - 60)}px)`,
        opacity,
        pointerEvents: opacity > 0 ? 'auto' : 'none', // Add this line
      }}
      initial={false}
      animate={{
        opacity: pullDistance > 20 ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white/20 backdrop-blur-lg rounded-full p-3">
        <motion.div
          animate={{
            rotate: rotation,
            scale: isRefreshing ? 1.2 : 1 + progress * 0.2,
          }}
          transition={{
            rotate: { duration: isRefreshing ? 1 : 0.3, repeat: isRefreshing ? Infinity : 0 },
            scale: { duration: 0.2 },
          }}
        >
          <RefreshCw 
            className={`w-6 h-6 text-white ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              opacity: isRefreshing ? 1 : progress,
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PullToRefreshIndicator;