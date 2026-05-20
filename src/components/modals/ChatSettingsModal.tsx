import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import Portal from '../Portal';
import { useTranslation } from 'react-i18next';
import { useCurrentTheme } from '../../stores/colorThemeStore';
import { storeService, StorePurchase } from '../../services/storeService';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateUserProfile } = useAuthStore();
  const { isAutoUnmatchEnabled, toggleAutoUnmatch, isReadReceiptsEnabled, toggleReadReceipts, setReadReceipts } = useSettingsStore();
  const [isGhostMode, setGhostMode] = React.useState(profile?.ghost_mode_enabled || false);
  const [purchases, setPurchases] = useState<StorePurchase[]>([]);
  const { t } = useTranslation();
  const acct = profile?.account_type || profile?.subscription || 'free';
  const theme = useCurrentTheme(acct);

  const toggleGhostMode = async () => {
    if (!user) return;
    const newStatus = !isGhostMode;
    setGhostMode(newStatus);
    await updateUserProfile({ ghost_mode_enabled: newStatus });
  };

  const isPremium = profile?.account_type === 'pro' || profile?.account_type === 'vip';

  // Fetch store purchases when modal opens
  useEffect(() => {
    if (isOpen && user) {
      storeService.getActivePurchases(user.id).then(setPurchases);
    }
  }, [isOpen, user]);

  // Check if user has active store purchase for a category
  const hasActivePurchase = useMemo(() => {
    const now = Date.now();
    return (category: string) => {
      if (isPremium) return true;
      return purchases.some(p => {
        if (p.status !== 'completed' || !p.store_items) return false;
        const item = p.store_items;
        if (item.category !== category) return false;
        const effect = item.effect || {};
        const isPermanent = !effect.duration_days;
        if (isPermanent) return true;
        const purchaseTime = new Date(p.created_at).getTime();
        const expiryTime = purchaseTime + effect.duration_days * 24 * 60 * 60 * 1000;
        return now < expiryTime;
      });
    };
  }, [purchases, isPremium]);

  const hasGhostAccess = hasActivePurchase('ghost_package');
  const hasReadReceiptsAccess = hasActivePurchase('read_receipts');

  // Disable read receipts if user lost access (purchase expired or account downgraded)
  useEffect(() => {
    if (isOpen && !hasReadReceiptsAccess && isReadReceiptsEnabled) {
      setReadReceipts(false);
    }
  }, [isOpen, hasReadReceiptsAccess]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`${theme.background} rounded-t-2xl w-full max-w-md absolute bottom-0 mb-20 text-white border-t ${theme.accent.border} shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-t-2xl blur-xl ${theme.accent.glow.replace('shadow-', 'bg-').replace('/20', '/10').replace('/30', '/10')}`}></div>

              <div className="p-4 border-b border-white/10 flex items-center justify-between relative z-10">
                <h2 className="text-xl font-bold text-white">{t('chatSettings.title')}</h2>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-110">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-white">{t('chatSettings.section.settings')}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{t('chatSettings.autoUnmatch.title')}</h4>
                      <p className="text-sm text-gray-400">{t('chatSettings.autoUnmatch.desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isAutoUnmatchEnabled} onChange={toggleAutoUnmatch} className="sr-only peer" />
                      <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 ${theme.accent.toggleRing} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme.accent.toggle}`}></div>
                    </label>
                  </div>

                  <div className={`flex items-center justify-between ${!hasGhostAccess ? 'opacity-50' : ''}`}>
                    <div>
                      <h4 className="font-semibold flex items-center text-white">
                        {t('chatSettings.ghostMode.title')} {!hasGhostAccess && <Lock className="w-4 h-4 ml-2" />}
                      </h4>
                      <p className="text-sm text-gray-400">{t('chatSettings.ghostMode.desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" disabled={!hasGhostAccess} checked={isGhostMode} onChange={toggleGhostMode} className="sr-only peer" />
                      <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 ${theme.accent.toggleRing} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme.accent.toggle}`}></div>
                    </label>
                  </div>

                  <div className={`flex items-center justify-between ${!hasReadReceiptsAccess ? 'opacity-50' : ''}`}>
                    <div>
                      <h4 className="font-semibold flex items-center text-white">
                        {t('chatSettings.readReceipts.title')} {!hasReadReceiptsAccess && <Lock className="w-4 h-4 ml-2" />}
                      </h4>
                      <p className="text-sm text-gray-400">{t('chatSettings.readReceipts.desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!hasReadReceiptsAccess}
                        checked={isReadReceiptsEnabled}
                        onChange={toggleReadReceipts}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 ${theme.accent.toggleRing} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme.accent.toggle}`}></div>
                    </label>
                  </div>



                  {!hasGhostAccess && !hasReadReceiptsAccess && (
                    <div className="text-center pt-4">
                      <button className={`font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105 ${theme.button.primary} ${theme.button.primaryHover} text-white shadow-lg ${theme.accent.glow}`}>
                        {t('chatSettings.upgradeCta')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default ChatSettingsModal;
