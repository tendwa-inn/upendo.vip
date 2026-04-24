import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PopularityModalProps {
  isOpen: boolean;
  onClose: () => void;
  popularityScore: number;
  strikes: number;
}

const PopularityGauge: React.FC<{ score: number }> = ({ score }) => {
  const percentage = Math.max(0, Math.min(100, score));
  const color = percentage > 75 ? 'text-green-400' : percentage > 40 ? 'text-yellow-400' : 'text-red-400';
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
        <span className="text-xs text-gray-400">Score</span>
      </div>
    </div>
  );
};

const PopularityModal: React.FC<PopularityModalProps> = ({ isOpen, onClose, popularityScore, strikes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-sm text-white border border-white/10"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Profile Standing</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <PopularityGauge score={popularityScore} />
          <p className="text-xs text-gray-400 mt-2">This score affects your visibility to others.</p>
        </div>

        <div className="bg-white/5 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
            Profile Strikes
          </h3>
          {strikes > 0 ? (
            <p className="text-red-400 font-bold text-lg">{strikes} strike(s)</p>
          ) : (
            <div className="flex items-center text-green-400">
              <ShieldCheck className="w-4 h-4 mr-2" />
              <p className="text-sm">No strikes. Your profile is in good standing!</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Strikes are given for violating community guidelines, such as using inappropriate language.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full font-bold py-2 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default PopularityModal;
