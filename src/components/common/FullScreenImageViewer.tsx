import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface FullScreenImageViewerProps {
  images: string[];
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

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({ images, initialIndex, onClose, onAdd, onDelete, onSetDP }) => {
  const [[page, direction], setPage] = useState([initialIndex, 0]);

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
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <button onClick={onClose} className="p-2 rounded-full bg-black/30 text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
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