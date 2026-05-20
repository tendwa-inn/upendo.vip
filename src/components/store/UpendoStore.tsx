import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storeService, StoreItem } from '../../services/storeService';
import { flareService } from '../../services/flareService';
import FlareBalance from './FlareBalance';
import StoreItemCard from './StoreItemCard';

interface UpendoStoreProps {
  userId: string;
}

const UpendoStore: React.FC<UpendoStoreProps> = ({ userId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [storeItems, flareBalance] = await Promise.all([
        storeService.getActiveItems(),
        flareService.getBalance(userId),
      ]);
      setItems(storeItems);
      setBalance(flareBalance);
      setLoading(false);
    };
    load();
  }, [userId]);

  const featured = items.slice(0, 3);

  if (loading) {
    return (
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-400" />
          <h2 className="text-white font-bold text-base">{t('store.title')}</h2>
        </div>
        <FlareBalance userId={userId} compact />
      </div>

      {/* 3 Featured Items */}
      {featured.length > 0 ? (
        <div className="p-3 grid grid-cols-3 gap-2 min-w-0">
          {featured.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StoreItemCard
                item={item}
                canAfford={balance >= item.price_flares}
                onBuy={() => navigate('/store')}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-white/30 text-sm">{t('store.comingSoon')}</p>
        </div>
      )}

      {/* View All Button */}
      <button
        onClick={() => navigate('/store')}
        className="w-full py-3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors border-t border-white/5"
      >
        <span className="text-orange-400 text-sm font-semibold">{t('store.viewAll')}</span>
        <ArrowRight className="w-4 h-4 text-orange-400" />
      </button>
    </div>
  );
};

export default UpendoStore;
