import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import Portal from '../Portal';
import { useTranslation } from 'react-i18next';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateUserProfile } = useAuthStore();
  const { isAutoUnmatchEnabled, toggleAutoUnmatch, isReadReceiptsEnabled, toggleReadReceipts } = useSettingsStore();
  const [isGhostMode, setGhostMode] = React.useState(profile?.ghostModeEnabled || false);
  const { t } = useTranslation();

  const toggleGhostMode = async () => {
    if (!user) return;
    const newStatus = !isGhostMode;
    setGhostMode(newStatus);
    await updateUserProfile({ ghostModeEnabled: newStatus });
  };

  const isPremium = profile?.accountType === 'pro' || profile?.accountType === 'vip';
  const isVip = profile?.accountType === 'vip';
  const isPro = profile?.accountType === 'pro';

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
              className={`bg-gradient-to-br from-[#1a0f14] to-[#2E0C13] rounded-t-2xl w-full max-w-md absolute bottom-0 mb-20 text-white border-t ${
                isVip ? 'border-amber-400/30' : (isPro ? 'border-[#ff7f50]/30' : 'border-pink-500/30')
              } shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-t-2xl blur-xl ${
                isVip ? 'bg-gradient-to-r from-amber-400/10 to-yellow-500/10' : (isPro ? 'bg-gradient-to-r from-[#ff7f50]/10 to-orange-500/10' : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10')
              }`}></div>

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
                      <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 ${
                        isVip ? 'peer-focus:ring-amber-400/50' : (isPro ? 'peer-focus:ring-[#ff7f50]/50' : 'peer-focus:ring-pink-500/50')
                      } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isVip ? 'peer-checked:bg-amber-400' : (isPro ? 'peer-checked:bg-[#ff7f50]' : 'peer-checked:bg-pink-500')
                      }`}></div>
                    </label>
                  </div>

                  <div className={`flex items-center justify-between ${!isPremium ? 'opacity-50' : ''}`}>
                    <div>
                      <h4 className="font-semibold flex items-center text-white">
                        {t('chatSettings.ghostMode.title')} {!isPremium && <Lock className="w-4 h-4 ml-2" />}
                      </h4>
                      <p className="text-sm text-gray-400">{t('chatSettings.ghostMode.desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" disabled={!isPremium} checked={isGhostMode} onChange={toggleGhostMode} className="sr-only peer" />
                      <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 ${
                        isVip ? 'peer-focus:ring-amber-400/50' : (isPro ? 'peer-focus:ring-[#ff7f50]/50' : 'peer-focus:ring-pink-500/50')
                      } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isVip ? 'peer-checked:bg-amber-400' : (isPro ? 'peer-checked:bg-[#ff7f50]' : 'peer-checked:bg-pink-500')
                      }`}></div>
                    </label>
                  </div>

                  <div className={`flex items-center justify-between ${!isPremium ? 'opacity-50' : ''}`}>
                    <div>
                      <h4 className="font-semibold flex items-center text-white">
                        {t('chatSettings.readReceipts.title')} {!isPremium && <Lock className="w-4 h-4 ml-2" />}
                      </h4>
                      <p className="text-sm text-gray-400">{t('chatSettings.readReceipts.desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        disabled={!isPremium} 
                        checked={isPremium ? isReadReceiptsEnabled : false}
                        onChange={toggleReadReceipts}
                        className="sr-only peer" 
                      />
                      <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 ${
                        isVip ? 'peer-focus:ring-amber-400/50' : (isPro ? 'peer-focus:ring-[#ff7f50]/50' : 'peer-focus:ring-pink-500/50')
                      } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isVip ? 'peer-checked:bg-amber-400' : (isPro ? 'peer-checked:bg-[#ff7f50]' : 'peer-checked:bg-pink-500')
                      }`}></div>
                    </label>
                  </div>

                  <div className={`flex items-center justify-between ${!isPremium ? 'opacity-50' : ''}`}>
                    <div>
                      <h4 className="font-semibold flex items-center text-white">
                        {t('chatSettings.disappearingVN.title')} {!isPremium && <Lock className="w-4 h-4 ml-2" />}
                      </h4>
                      <p className="text-sm text-gray-400">{t('chatSettings.disappearingVN.desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" disabled={!isPremium} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-pink-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>

                  {!isPremium && (
                    <div className="text-center pt-4">
                      <button className={`font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105 ${
                        isVip ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/25 hover:bg-amber-500' : 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25 hover:from-pink-700 hover:to-pink-600'
                      }`}>
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
