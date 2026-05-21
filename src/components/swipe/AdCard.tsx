import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Megaphone, ChevronRight } from 'lucide-react';
import { Ad } from '../../services/adService';

interface AdCardProps {
  ad: Ad;
  onDismiss: () => void;
  isActive: boolean;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onDismiss, isActive }) => {
  const [imgError, setImgError] = useState(false);

  if (!isActive) return null;

  const hasImage = ad.image_url && !imgError;

  return (
    <motion.div
      className="absolute inset-0 select-none"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        {/* Sponsored Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Megaphone className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs text-yellow-400 font-semibold">Sponsored</span>
        </div>

        {/* Ad Image */}
        {hasImage ? (
          <img
            src={ad.image_url!}
            alt={ad.name}
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <Megaphone className="w-24 h-24 text-white/10" />
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none" />

        {/* Ad Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
          <h3 className="text-xl font-bold mb-1">{ad.name}</h3>

          {/* Action Button */}
          {ad.redirect_url ? (
            <a
              href={ad.redirect_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 transition-all font-bold text-white text-center shadow-lg shadow-pink-500/25 mb-3"
            >
              <span className="flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {ad.action_label || 'Learn More'}
              </span>
            </a>
          ) : null}

          {/* Continue Button */}
          <button
            onClick={onDismiss}
            className="w-full py-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all font-medium text-white flex items-center justify-center gap-1"
          >
            Continue Swiping
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdCard;
