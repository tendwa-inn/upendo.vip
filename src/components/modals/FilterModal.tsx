import React, { useState } from 'react';
import Portal from '../Portal';
import { X, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';

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
        <div className={`bg-gradient-to-br from-[#1a0f14] to-[#2E0C13] rounded-2xl w-full max-w-md p-6 text-white border relative shadow-2xl ${
          isVip ? 'border-amber-400/30' : (isPro ? 'border-sky-400/30' : 'border-pink-500/30')
        }`}>
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-2xl blur-xl ${
            isVip ? 'bg-gradient-to-r from-amber-400/10 to-yellow-500/10' : (isPro ? 'bg-gradient-to-r from-sky-400/10 to-blue-500/10' : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10')
          }`}></div>

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
                <select value={tribe} onChange={(e) => setTribe(e.target.value)} className="w-full p-3 bg-white/5 rounded-md border border-white/10 focus:ring-2 focus:ring-pink-500 outline-none transition-all duration-300">
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
              className={`px-8 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105 ${
                isVip 
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 hover:bg-amber-500' 
                  : isPro 
                    ? 'bg-[#ff7f50] text-black shadow-lg shadow-orange-400/30 hover:bg-[#ff5e57]' 
                    : 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/20 hover:from-pink-700 hover:to-pink-600'
              }`}
            >{t('filters.apply')}</button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default FilterModal;
