import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Flame, X, Check, Sparkles, Zap, Palette, Ghost, Eye, Crown, Star, Package, ShoppingCart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { storeService, StoreItem, StorePurchase } from '../services/storeService';
import { flareService } from '../services/flareService';
import { useAuthStore } from '../stores/authStore';
import { useCurrentTheme, useColorThemeStore } from '../stores/colorThemeStore';
import { useUiStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';
import FlareBalance from '../components/store/FlareBalance';
import StoreItemCard from '../components/store/StoreItemCard';

const StorePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const CATEGORIES = [
    { key: 'all', label: t('store.cat.all'), icon: Star },
    { key: 'swipes', label: t('store.cat.swipes'), icon: Zap },
    { key: 'themes', label: t('store.cat.themes'), icon: Palette },
    { key: 'ghost_package', label: t('store.cat.ghost'), icon: Ghost },
    { key: 'read_receipts', label: t('store.cat.readReceipts'), icon: Eye },
    { key: 'subscription', label: t('store.cat.subscriptions'), icon: Crown },
    { key: 'buttons', label: t('store.cat.buttons'), icon: Sparkles },
  ];
  const theme = useCurrentTheme(profile?.account_type);
  const { setTheme: setColorTheme } = useColorThemeStore();
  const { setButtonStyle } = useUiStore();
  const { toggleReadReceipts, isReadReceiptsEnabled } = useSettingsStore();
  const { updateUserProfile } = useAuthStore();
  const userId = profile?.id || '';

  const [items, setItems] = useState<StoreItem[]>([]);
  const [purchases, setPurchases] = useState<StorePurchase[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [confirmItem, setConfirmItem] = useState<StoreItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [successItem, setSuccessItem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'store' | 'purchases'>('store');
  const [purchaseSubTab, setPurchaseSubTab] = useState<'active' | 'expired'>('active');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [storeItems, flareBalance, userPurchases] = await Promise.all([
        storeService.getActiveItems(),
        flareService.getBalance(userId),
        storeService.getActivePurchases(userId),
      ]);
      setItems(storeItems);
      setBalance(flareBalance);
      setPurchases(userPurchases);
      setLoading(false);
    };
    load();
  }, [userId]);

  // Check if an item is currently active (purchased and not expired)
  const purchasedItemIds = useMemo(() => {
    const ids = new Set<number>();
    const now = Date.now();

    for (const p of purchases) {
      if (p.status !== 'completed') continue;

      const item = p.store_items;
      if (!item) continue;

      const effect = item.effect || {};
      const durationDays = effect.duration_days;

      // Permanent items (no duration_days) - always active if purchased
      if (!durationDays) {
        ids.add(p.store_item_id);
        continue;
      }

      // Duration-based items - check if still within validity period
      const purchaseTime = new Date(p.created_at).getTime();
      const expiryTime = purchaseTime + durationDays * 24 * 60 * 60 * 1000;
      if (now < expiryTime) {
        ids.add(p.store_item_id);
      }
    }

    return ids;
  }, [purchases]);

  // Split purchases into active and expired based on actual duration_days
  const { activePurchases, expiredPurchases } = useMemo(() => {
    const now = Date.now();
    const active: StorePurchase[] = [];
    const expired: StorePurchase[] = [];

    for (const p of purchases) {
      if (p.status !== 'completed') continue;
      const item = p.store_items;
      if (!item) continue;

      const effect = item.effect || {};
      const durationDays = effect.duration_days;

      // Permanent items (no duration_days) are always active
      if (!durationDays) {
        active.push(p);
        continue;
      }

      // Duration-based: active if within the item's actual duration
      const purchaseTime = new Date(p.created_at).getTime();
      const expiryTime = purchaseTime + durationDays * 24 * 60 * 60 * 1000;
      if (now < expiryTime) {
        active.push(p);
      } else {
        expired.push(p);
      }
    }

    return { activePurchases: active, expiredPurchases: expired };
  }, [purchases]);

  // Use / activate a purchased item
  const handleUseItem = useCallback((purchase: StorePurchase) => {
    const item = purchase.store_items;
    if (!item) return;

    const effect = item.effect || {};

    switch (item.category) {
      case 'themes':
        if (effect.theme_id) {
          setColorTheme(effect.theme_id, userId);
          toast.success(t('store.applied', { name: item.name }));
        } else {
          toast.success(t('store.active2', { name: item.name }));
        }
        break;
      case 'ghost_package':
        if (effect.theme_id) {
          setColorTheme(effect.theme_id, userId);
        }
        updateUserProfile({ ghost_mode_enabled: true });
        toast.success(t('store.ghostEnabled'));
        break;
      case 'buttons':
        if (effect.button_style) {
          setButtonStyle(effect.button_style);
          toast.success(t('store.applied', { name: item.name }));
        } else {
          toast.success(t('store.active2', { name: item.name }));
        }
        break;
      case 'swipes':
        toast.success(t('store.swipesReady', { name: item.name }));
        break;
      case 'read_receipts':
        if (!isReadReceiptsEnabled) {
          toggleReadReceipts();
        }
        toast.success(t('store.readReceiptsEnabled'));
        break;
      case 'subscription':
        toast.success(t('store.subscriptionActive'));
        break;
      default:
        toast.success(t('store.active2', { name: item.name }));
    }
  }, [setColorTheme, setButtonStyle, userId]);

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(i => i.category === activeCategory);

  const handleBuyClick = useCallback((item: StoreItem) => {
    if (balance < item.price_flares) {
      toast.error(t('store.notEnoughFlares'));
      return;
    }
    setConfirmItem(item);
  }, [balance]);

  const handleConfirmPurchase = async () => {
    if (!confirmItem) return;
    setPurchasing(true);
    const result = await storeService.purchaseItem(userId, confirmItem.id);
    setPurchasing(false);
    if (result.success) {
      setBalance(prev => prev - confirmItem.price_flares);

      // Apply effects immediately
      const effect = confirmItem.effect || {};

      // Theme: apply immediately
      if (confirmItem.category === 'themes' && effect.theme_id) {
        setColorTheme(effect.theme_id, userId);
      }

      // Ghost package: apply theme too
      if (confirmItem.category === 'ghost_package' && effect.theme_id) {
        setColorTheme(effect.theme_id, userId);
      }

      // Buttons: apply button style immediately
      if (confirmItem.category === 'buttons' && effect.button_style) {
        setButtonStyle(effect.button_style);
      }

      // Ghost package: enable ghost mode
      if (confirmItem.category === 'ghost_package') {
        updateUserProfile({ ghost_mode_enabled: true });
      }

      // Read receipts: enable if not already on
      if (confirmItem.category === 'read_receipts' && !isReadReceiptsEnabled) {
        toggleReadReceipts();
      }

      // Refresh purchases to update "Already Bought" state
      const updatedPurchases = await storeService.getActivePurchases(userId);
      setPurchases(updatedPurchases);

      setConfirmItem(null);
      setSuccessItem(confirmItem.name);
      setTimeout(() => setSuccessItem(null), 3000);
      toast.success(t('store.activated', { name: confirmItem.name }));
    } else {
      toast.error(result.error || t('store.purchaseFailed'));
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className={`fixed inset-0 ${theme.background} flex flex-col items-center justify-center z-50`}>
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ShoppingBag className={`w-16 h-16 ${theme.primary} drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]`} />
        </motion.div>
        <h2 className={`${theme.text} font-bold text-xl mt-4`}>{t('store.title')}</h2>
        <div className="flex items-center gap-2 mt-3">
          <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${theme.primary.replace('text-', 'border-')}`} />
          <span className={`${theme.text} opacity-40 text-sm`}>{t('store.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${theme.background} flex flex-col overflow-hidden max-w-full`}>
      {/* Header */}
      <div className={`flex-shrink-0 px-4 py-3 ${theme.stickyHeader} backdrop-blur-md border-b border-white/5`}>
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className={`w-5 h-5 ${theme.text}`} />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className={`w-5 h-5 ${theme.primary}`} />
            <h1 className={`${theme.text} font-bold text-lg`}>{t('store.title')}</h1>
          </div>
          <FlareBalance userId={userId} compact />
        </div>
      </div>

      {/* Balance Banner */}
      <div className="flex-shrink-0 px-4 py-3">
        <div className={`bg-gradient-to-r ${theme.button.primary.replace('bg-gradient-to-r', '')}/10 border ${theme.accent.border} rounded-2xl p-4 flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.button.primary.replace('bg-gradient-to-r', '')}/30 flex items-center justify-center`}
            >
              <Flame className={`w-6 h-6 ${theme.primary} drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]`} />
            </motion.div>
            <div>
              <div className={`${theme.primary} font-black text-2xl`}>{balance.toLocaleString()}</div>
              <div className={`${theme.primary} opacity-50 text-xs uppercase tracking-wider`}>{t('store.flaresAvailable')}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className={`px-3 py-2 ${theme.button.primary} rounded-xl text-white text-xs font-bold ${theme.button.primaryHover} transition-all flex-shrink-0`}
          >
            {t('store.earnMore')}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex-shrink-0 px-4 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {CATEGORIES.map(cat => {
            const count = cat.key === 'all' ? items.length : items.filter(i => i.category === cat.key).length;
            if (count === 0 && cat.key !== 'all') return null;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setActiveView('store'); }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.key && activeView === 'store'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.key && activeView === 'store' ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setActiveView('purchases')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'purchases'
                ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {t('store.purchases')}
            {purchases.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeView === 'purchases' ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {purchases.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Items Grid or Purchases */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
        {activeView === 'purchases' ? (
          <>
            {/* Active / Expired sub-tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPurchaseSubTab('active')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  purchaseSubTab === 'active'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('store.active')}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  purchaseSubTab === 'active' ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {activePurchases.length}
                </span>
              </button>
              <button
                onClick={() => setPurchaseSubTab('expired')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  purchaseSubTab === 'expired'
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {t('store.expired')}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  purchaseSubTab === 'expired' ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {expiredPurchases.length}
                </span>
              </button>
            </div>

            {/* Purchase list */}
            {(purchaseSubTab === 'active' ? activePurchases : expiredPurchases).length > 0 ? (
              <div className="space-y-3">
                {(purchaseSubTab === 'active' ? activePurchases : expiredPurchases).map((p, i) => {
                  const item = p.store_items;
                  const effect = item?.effect || {};
                  const durationDays = effect.duration_days;
                  const isPermanent = !durationDays;
                  const purchaseDate = new Date(p.created_at);
                  const isActive = purchaseSubTab === 'active';

                  // Calculate days info
                  let daysInfo = '';
                  if (!isPermanent && durationDays) {
                    const elapsed = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
                    const remaining = durationDays - elapsed;
                    if (remaining > 0) {
                      daysInfo = t('store.daysRemaining', { days: remaining });
                    } else {
                      daysInfo = t('store.expiredLabel');
                    }
                  }

                  // Icon per category
                  const CategoryIcon = item?.category === 'themes' ? Palette
                    : item?.category === 'buttons' ? Sparkles
                    : item?.category === 'swipes' ? Zap
                    : item?.category === 'ghost_package' ? Ghost
                    : item?.category === 'read_receipts' ? Eye
                    : item?.category === 'subscription' ? Crown
                    : Package;

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`bg-white/5 border rounded-xl p-4 ${
                        isActive ? 'border-green-500/20' : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Category icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-green-500/10' : 'bg-white/5'
                        }`}>
                          <CategoryIcon className={`w-6 h-6 ${isActive ? 'text-green-400' : 'text-white/30'}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-sm">{item?.name || `Item #${p.store_item_id}`}</h4>
                          <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{item?.description || ''}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                            <span>{purchaseDate.toLocaleDateString()}</span>
                            {isPermanent ? (
                              <span className="text-purple-400">{t('store.permanent')}</span>
                            ) : (
                              <span>{daysInfo}</span>
                            )}
                          </div>
                        </div>

                        {/* Right side: cost + Use button */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 text-orange-400 font-bold text-sm">
                            <Flame className="w-3.5 h-3.5" />
                            {p.flare_cost}
                          </div>
                          {isActive && (
                            <button
                              onClick={() => handleUseItem(p)}
                              className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold rounded-lg hover:from-orange-400 hover:to-pink-500 transition-all active:scale-95"
                            >
                              {t('store.use')}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                {purchaseSubTab === 'active' ? (
                  <Sparkles className="w-12 h-12 text-white/10 mb-3" />
                ) : (
                  <Clock className="w-12 h-12 text-white/10 mb-3" />
                )}
                <p className="text-white/30 text-sm">
                  {purchaseSubTab === 'active' ? t('store.noActivePurchases') : t('store.noExpiredPurchases')}
                </p>
              </div>
            )}
          </>
        ) : (
          // Items Grid
          filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 min-w-0">
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <StoreItemCard
                    item={item}
                    canAfford={balance >= item.price_flares}
                    onBuy={handleBuyClick}
                    isPurchased={purchasedItemIds.has(item.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBag className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-white/30 text-sm">{t('store.noItemsCategory')}</p>
            </div>
          )
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {confirmItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setConfirmItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a0a10] rounded-2xl w-full max-w-sm border border-orange-500/30 shadow-2xl shadow-orange-500/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                  <Flame className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{t('store.confirmPurchase')}</h3>
                <p className="text-white/60 text-sm mb-4">{confirmItem.name}</p>
                <div className="bg-white/5 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-black text-2xl">{confirmItem.price_flares}</span>
                    <span className="text-white/40 text-sm">{t('store.flares')}</span>
                  </div>
                  <div className="text-white/30 text-xs mt-1">
                    {t('store.balanceAfter', { balance: (balance - confirmItem.price_flares).toLocaleString() })}
                  </div>
                </div>
                <p className="text-white/50 text-xs">{t('store.promoNote')}</p>
              </div>
              <div className="flex border-t border-white/10">
                <button onClick={() => setConfirmItem(null)} className="flex-1 py-3 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-medium">
                  {t('store.cancel')}
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold hover:from-orange-400 hover:to-pink-500 transition-all disabled:opacity-50"
                >
                  {purchasing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      {t('store.processing')}
                    </div>
                  ) : t('store.buyNow')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {successItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] pointer-events-none"
          >
            <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl px-6 py-3 flex items-center gap-2 shadow-2xl shadow-orange-500/40">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white font-bold">{t('store.activated', { name: successItem })}</span>
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StorePage;
