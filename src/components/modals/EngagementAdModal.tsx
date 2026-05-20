import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Clock, Gift, CheckCircle } from 'lucide-react';
import { Ad } from '../../services/adService';
import Portal from '../Portal';
import { useTranslation } from 'react-i18next';

interface EngagementAdModalProps {
  isOpen: boolean;
  ad: Ad;
  onClose: () => void;
  onComplete: () => void;
}

const EngagementAdModal: React.FC<EngagementAdModalProps> = ({ isOpen, ad, onClose, onComplete }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(ad.duration_seconds);
  const [isComplete, setIsComplete] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(ad.duration_seconds);
      setIsComplete(false);
      setCanClose(false);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsComplete(true);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, ad.duration_seconds]);

  const progress = ((ad.duration_seconds - timeLeft) / ad.duration_seconds) * 100;

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1`;
  };

  const handleClose = () => {
    if (canClose) {
      onComplete();
    }
  };

  const handleActionClick = () => {
    window.open(ad.redirect_url, '_blank');
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              {/* Close button - only visible when complete */}
              {canClose && (
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Timer Bar */}
              <div className="relative h-1.5 bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400 font-semibold">
                      {isComplete ? t('ad.complete') : t('ad.watchFor', { time: timeLeft })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-green-500/20 rounded-full px-2 py-0.5">
                    <Gift className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 font-bold">{t('ad.swipesReward', { count: ad.reward_swipes })}</span>
                  </div>
                </div>

                {/* Media */}
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
                  {ad.video_url ? (
                    isYouTubeUrl(ad.video_url) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(ad.video_url)}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={ad.video_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        playsInline
                        controls={false}
                      />
                    )
                  ) : ad.image_url ? (
                    <img src={ad.image_url} alt={ad.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <p>{t('ad.noMedia')}</p>
                    </div>
                  )}

                  {/* Overlay when not complete */}
                  {!isComplete && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div
                            className="bg-amber-400 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/80 font-mono min-w-[2rem] text-right">{timeLeft}s</span>
                      </div>
                    </div>
                  )}

                  {/* Completion overlay */}
                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"
                    >
                      <CheckCircle className="w-16 h-16 text-green-400 mb-2" />
                      <p className="text-white font-bold text-lg">{t('ad.rewardEarned')}</p>
                    </motion.div>
                  )}
                </div>

                {/* Ad Name */}
                <h3 className="text-lg font-bold text-white mb-1">{ad.name}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {isComplete
                    ? t('ad.rewardMessage')
                    : t('ad.watchFull')}
                </p>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Action Button (Visit/Subscribe/Follow) */}
                  <button
                    onClick={handleActionClick}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 transition-all font-bold text-white flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {ad.action_label}
                  </button>

                  {/* Complete/Close Button */}
                  {isComplete && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleClose}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all font-bold text-white flex items-center justify-center gap-2"
                    >
                      <Gift className="w-4 h-4" />
                      {t('ad.claimSwipes', { count: ad.reward_swipes })}
                    </motion.button>
                  )}
                </div>

                {/* Skip hint */}
                {!canClose && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    {t('ad.closeAfter', { seconds: ad.duration_seconds })}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default EngagementAdModal;
