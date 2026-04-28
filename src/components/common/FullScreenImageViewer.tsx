import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Crown, Shield } from 'lucide-react';

import { User } from '../../types';

interface FullScreenImageViewerProps {
  images: string[];
  user: User; // Add user prop
  initialIndex: number;
  onClose: () => void;
  onAdd?: () => void;
  onDelete?: (photoUrl: string) => void;
  onSetDP?: (photoUrl: string) => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({ images, user, initialIndex, onClose, onAdd, onDelete, onSetDP }) => {
  const [[page, direction], setPage] = useState([initialIndex, 0]);
  const age = user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : null;
  const accountType = user.account_type;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const imageIndex = ((page % images.length) + images.length) % images.length;

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x);
    if (swipe > 100) {
      if (offset.x > 0) {
        paginate(-1);
      } else {
        paginate(1);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-black/30 text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 text-white">
          <span className="font-bold text-lg">{user.name} {age}</span>
          {accountType === 'vip' && <Crown className="w-5 h-5 text-amber-400" />}
          {accountType === 'pro' && <Shield className="w-5 h-5 text-cyan-400" fill="currentColor" />}
        </div>
        {/* Placeholder for other actions */}
        <div className="w-10"></div>
      </div>

      {/* Image Viewer */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={page}
            src={images[imageIndex]}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute max-h-full max-w-full object-contain"
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button onClick={() => paginate(-1)} className="absolute left-4 p-2 rounded-full bg-black/30 text-white z-10">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button onClick={() => paginate(1)} className="absolute right-4 p-2 rounded-full bg-black/30 text-white z-10">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 flex justify-center space-x-4">
        {onAdd && <button onClick={onAdd} className="text-white">Add</button>}
        {onDelete && <button onClick={() => onDelete(images[imageIndex])} className="text-white">Delete</button>}
        {onSetDP && <button onClick={() => onSetDP(images[imageIndex])} className="text-white">Set as DP</button>}
      </div>
    </motion.div>
  );
};

export default FullScreenImageViewer;