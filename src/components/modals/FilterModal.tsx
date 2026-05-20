import React, { useState } from 'react';
import Portal from '../Portal';
import { X, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import { useCurrentTheme } from '../../stores/colorThemeStore';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const africanTribes = [
  'Akan', 'Bemba', 'Chewa', 'Ewe', 'Ga', 'Hausa', 'Igbo', 'Kaonde', 'Kikuyu', 'Lozi', 'Lunda', 'Luo', 'Maasai', 'Mambwe', 'Namwanga', 'Ndebele', 'Ngoni', 'Nsenga', 'Nyanja', 'Shona', 'Sotho', 'Tonga', 'Tumbuka', 'Venda', 'Xhosa', 'Yoruba', 'Zulu'
].sort();

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const { profile, isPro, isVip } = useAuthStore();
  const { t } = useTranslation();
  const acct = profile?.account_type || profile?.subscription || 'free';
  const theme = useCurrentTheme(acct);
  const [ageRange, setAgeRange] = useState([22, 37]);
  const [distance, setDistance] = useState(50);
  const [tribe, setTribe] = useState('');



  if (!isOpen) return null;

  const handleApply = () => {
    onApply({ ageRange, distance, tribe: isVip ? tribe : '' });
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className={`${theme.background} rounded-2xl w-full max-w-md p-6 text-white border ${theme.accent.border} relative shadow-2xl`}>
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-2xl blur-xl ${theme.accent.glow.replace('shadow-', 'bg-').replace('/20', '/10').replace('/30', '/10')}`}></div>

          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-2xl font-bold text-white">{t('filters.title')}</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-110">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">{t('filters.ageRange', { min: ageRange[0], max: ageRange[1] })}</label>
              <input type="range" min="18" max="60" value={ageRange[1]} onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])} className="w-full" />
              <input type="range" min="18" max="60" value={ageRange[0]} onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">{t('filters.distanceKm', { km: distance })}</label>
              <input type="range" min="1" max="100" value={distance} onChange={(e) => setDistance(parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300 flex items-center">
                {t('filters.tribe')}
                {!isVip && <Lock className="w-3 h-3 ml-2 text-yellow-400" />}
              </label>
              {isVip ? (
                <select value={tribe} onChange={(e) => setTribe(e.target.value)} className={`w-full p-3 bg-white/5 rounded-md border border-white/10 focus:ring-2 ${theme.accent.ring} outline-none transition-all duration-300`}>
                  <option value="">{t('filters.allTribes')}</option>
                  {africanTribes.map(t => <option key={t} value={t} className="bg-gray-800 text-white">{t}</option>)}
                </select>
              ) : (
                <div className="w-full p-3 bg-white/5 rounded-md border border-white/10 text-gray-500 cursor-not-allowed">
                  {t('filters.vipFeature')}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 relative z-10">
            <button 
              onClick={onClose} 
              className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 font-semibold transition-all duration-300 hover:scale-105 border border-white/10"
            >
              {t('general.cancel')}
            </button>
            <button 
              onClick={handleApply}
              className={`px-8 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105 ${theme.button.primary} ${theme.button.primaryHover} text-white shadow-lg ${theme.accent.glow}`}
            >{t('filters.apply')}</button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default FilterModal;
