import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PopularityModalProps {
  isOpen: boolean;
  onClose: () => void;
  popularityScore: number;
  strikes: number;
  accountType: 'free' | 'pro' | 'vip';
}

const PopularityGauge: React.FC<{ score: number, accountType: string }> = ({ score, accountType }) => {
  const { t } = useTranslation();
  const percentage = Math.max(0, Math.min(100, score));
  
  const color = (() => {
    if (accountType === 'vip') return 'text-amber-400';
    if (accountType === 'pro') return 'text-cyan-400';
    if (percentage > 75) return 'text-green-400';
    if (percentage > 40) return 'text-yellow-400';
    return 'text-red-400';
  })();
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-700"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${color}`}>{percentage}</span>
        <span className="text-xs text-gray-400">{t('modal.popularity.score')}</span>
      </div>
    </div>
  );
};

const PopularityModal: React.FC<PopularityModalProps> = ({ isOpen, onClose, popularityScore, strikes, accountType }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-sm text-white border transition-colors duration-300 ${
          accountType === 'vip' ? 'border-amber-400' : accountType === 'pro' ? 'border-cyan-400' : 'border-white/10'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('modal.popularity.standing')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <PopularityGauge score={popularityScore} accountType={accountType} />
          <p className="text-xs text-gray-400 mt-2">{t('modal.popularity.visibility')}</p>
        </div>

        <div className="bg-white/5 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
            {t('modal.popularity.strikes')}
          </h3>
          {strikes > 0 ? (
            <p className="text-red-400 font-bold text-lg">{t('modal.popularity.strikeCount', { count: strikes })}</p>
          ) : (
            <div className="flex items-center text-green-400">
              <ShieldCheck className="w-4 h-4 mr-2" />
              <p className="text-sm">{t('modal.popularity.noStrikes')}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {t('modal.popularity.strikesInfo')}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`mt-6 w-full font-bold py-2 px-4 rounded-xl transition-all duration-300 ${
            accountType === 'vip' ? 'bg-amber-500 text-black hover:bg-amber-600' : 
            accountType === 'pro' ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 
            'bg-pink-600 text-white hover:bg-pink-700'
          }`}
        >
          {t('modal.popularity.close')}
        </button>
      </motion.div>
    </div>
  );
};

export default PopularityModal;
