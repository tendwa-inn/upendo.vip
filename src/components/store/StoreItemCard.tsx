import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Palette, Ghost, Eye, Crown, Sparkles, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StoreItem } from '../../services/storeService';
import { THEME_MAP } from '../../styles/theme';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  swipes: <Zap className="w-6 h-6" />,
  themes: <Palette className="w-6 h-6" />,
  ghost_package: <Ghost className="w-6 h-6" />,
  read_receipts: <Eye className="w-6 h-6" />,
  subscription: <Crown className="w-6 h-6" />,
  buttons: <Sparkles className="w-6 h-6" />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  swipes: 'from-pink-500/20 to-rose-500/20',
  themes: 'from-purple-500/20 to-violet-500/20',
  ghost_package: 'from-lime-500/20 to-green-500/20',
  read_receipts: 'from-sky-500/20 to-cyan-500/20',
  subscription: 'from-amber-500/20 to-yellow-500/20',
  buttons: 'from-fuchsia-500/20 to-pink-500/20',
};

const CATEGORY_BORDER: Record<string, string> = {
  swipes: 'border-pink-500/30',
  themes: 'border-purple-500/30',
  ghost_package: 'border-lime-500/30',
  read_receipts: 'border-sky-500/30',
  subscription: 'border-amber-500/30',
  buttons: 'border-fuchsia-500/30',
};

const CATEGORY_ICON_COLOR: Record<string, string> = {
  swipes: 'text-pink-400',
  themes: 'text-purple-400',
  ghost_package: 'text-lime-400',
  read_receipts: 'text-sky-400',
  subscription: 'text-amber-400',
  buttons: 'text-fuchsia-400',
};

interface StoreItemCardProps {
  item: StoreItem;
  canAfford: boolean;
  onBuy: (item: StoreItem) => void;
  isPurchased?: boolean;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, canAfford, onBuy, isPurchased }) => {
  const { t } = useTranslation();
  const icon = CATEGORY_ICONS[item.category] || <Sparkles className="w-6 h-6" />;
  const gradient = CATEGORY_GRADIENTS[item.category] || 'from-gray-500/20 to-gray-600/20';
  const border = CATEGORY_BORDER[item.category] || 'border-gray-500/30';
  const iconColor = CATEGORY_ICON_COLOR[item.category] || 'text-gray-400';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-3 flex flex-col gap-2 backdrop-blur-sm min-w-0 overflow-hidden`}
    >
      {/* Icon */}
      <div className={`${iconColor} drop-shadow-lg`}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          icon
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold text-sm leading-tight truncate">{item.name}</h3>
        <p className="text-white/50 text-xs mt-1 line-clamp-2">{item.description}</p>
        {/* Color scheme preview for themes */}
        {item.category === 'themes' && item.effect?.theme_id && THEME_MAP[item.effect.theme_id] && (
          <div className="flex gap-1.5 mt-2">
            {[THEME_MAP[item.effect.theme_id].preview.bg, THEME_MAP[item.effect.theme_id].preview.accent, THEME_MAP[item.effect.theme_id].preview.bubble].map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Price + Buy */}
      <div className="flex items-center justify-between mt-auto gap-1">
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-orange-400 font-black text-sm">{item.price_flares}</span>
        </div>
        {isPurchased ? (
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-green-500/20 border border-green-500/30 flex-shrink-0">
            <Check className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-[10px] font-bold">{t('storeItem.bought')}</span>
          </div>
        ) : (
          <button
            onClick={() => onBuy(item)}
            disabled={!canAfford}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex-shrink-0 ${
              canAfford
                ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-orange-400 hover:to-pink-500'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {canAfford ? t('storeItem.buy') : t('storeItem.needMore')}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default StoreItemCard;
