import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const PhotoViewerModal = ({ photos, startIndex, onClose, onAdd, onDelete }) => {
  const [[page, direction], setPage] = useState([startIndex, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const imageIndex = ((page % photos.length) + photos.length) % photos.length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={page}
          src={photos[imageIndex]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "tween", ease: "easeInOut", duration: 0.4 }, opacity: { duration: 0.4 } }}
          className="max-h-[80vh] max-w-[80vw] object-contain"
        />
      </AnimatePresence>
      
      <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full text-white bg-white/10 hover:bg-white/20">
        <X className="w-7 h-7" />
      </button>

      <button onClick={() => { onDelete(photos[imageIndex]); onClose(); }} className="absolute top-5 left-5 p-2 rounded-full text-white bg-white/10 hover:bg-white/20">
        <Trash2 className="w-7 h-7" />
      </button>

      {photos.length < 6 && (
        <button onClick={onAdd} className="absolute bottom-5 right-5 p-2 rounded-full text-white bg-white/10 hover:bg-white/20">
          <Plus className="w-7 h-7" />
        </button>
      )}

      <div className="absolute top-1/2 -translate-y-1/2 left-5">
        <button onClick={() => paginate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 right-5">
        <button onClick={() => paginate(1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
};

export default PhotoViewerModal;