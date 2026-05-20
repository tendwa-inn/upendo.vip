import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { flareService } from '../../services/flareService';

interface FlareBalanceProps {
  userId: string;
  compact?: boolean;
}

const FlareBalance: React.FC<FlareBalanceProps> = ({ userId, compact = false }) => {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const b = await flareService.getBalance(userId);
      setBalance(b);
    };
    fetch();
  }, [userId]);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame className="w-4 h-4 text-orange-400" />
        </motion.div>
        <span className="text-orange-400 font-bold text-sm">{balance.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-2xl px-4 py-2">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Flame className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
      </motion.div>
      <div>
        <div className="text-orange-400 font-black text-xl leading-tight">{balance.toLocaleString()}</div>
        <div className="text-orange-400/60 text-[10px] uppercase tracking-wider">{t('store.flaresLabel')}</div>
      </div>
    </div>
  );
};

export default FlareBalance;
