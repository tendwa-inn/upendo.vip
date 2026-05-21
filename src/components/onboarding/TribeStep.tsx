import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';

const africanTribes = [
  'Zulu', 'Xhosa', 'Maasai', 'Yoruba', 'Igbo', 'Hausa', 'Kikuyu', 'Shona',
  'Amhara', 'Oromo', 'Somali', 'Akan', 'Fulani', 'Berber', 'Bambara',
  'Wolof', 'Mossi', 'Chewa', 'Tswana', 'Sotho', 'Swazi', 'Ndebele',
  'Venda', 'Malagasy', 'Fang', 'Bakongo', 'Luba', 'Mongo', 'Tiv', 'Ewe',
  'Fon', 'Ga', 'Bemba', 'Tonga', 'Lozi', 'Luvale', 'Herero', 'Ovambo',
  'San', 'Khoikhoi', 'Namwanga', 'Ngoni'
].sort();

const cardStyle = {
  background: 'linear-gradient(145deg, rgba(40,10,20,0.95) 0%, rgba(20,8,15,0.98) 100%)',
  border: '1px solid rgba(255,45,117,0.15)',
  boxShadow: '0 0 60px rgba(255,45,117,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const TribeStep: React.FC = () => {
  const { nextStep, prevStep, updateFormData, formData } = useOnboardingStore();
  const { t } = useTranslation();
  const [tribe, setTribe] = useState(formData.tribe || '');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = africanTribes.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchRef.current) searchRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selected: string) => {
    setTribe(selected);
    setIsOpen(false);
    setSearch('');
  };

  const handleNext = () => { updateFormData({ tribe }); nextStep(); };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md rounded-3xl p-6 pt-8 space-y-5"
      style={cardStyle}
    >
      <div className="flex justify-center gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 4 ? 'w-8 bg-pink-500' : i < 4 ? 'w-4 bg-pink-500/50' : 'w-4 bg-white/15'}`} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-4xl mb-2">&#127758;</p>
        <h1 className="text-2xl font-bold text-white">{t('onboarding.tribe.question')}</h1>
        <p className="text-white/40 text-sm mt-1">{t('onboarding.tribe.optional')}</p>
      </div>

      {/* Custom dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3.5 rounded-xl text-left flex items-center justify-between transition-all duration-300"
          style={{ background: 'rgba(255,255,255,0.08)', border: isOpen ? '1px solid rgba(255,45,117,0.4)' : '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className={tribe ? 'text-white' : 'text-white/35'}>
            {tribe || t('onboarding.tribe.placeholder')}
          </span>
          <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
              style={{ background: 'rgba(30,10,18,0.98)', border: '1px solid rgba(255,45,117,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(255,45,117,0.05)', backdropFilter: 'blur(20px)' }}
            >
              {/* Search input */}
              <div className="p-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tribes..."
                  className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              {/* Tribe list */}
              <div className="max-h-[200px] overflow-y-auto scrollbar-hide pb-1">
                {filtered.length === 0 ? (
                  <div className="px-4 py-3 text-white/30 text-sm text-center">No tribes found</div>
                ) : (
                  filtered.map((t) => {
                    const isSelected = t === tribe;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleSelect(t)}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors duration-150"
                        style={{
                          background: isSelected ? 'rgba(255,45,117,0.15)' : 'transparent',
                          color: isSelected ? '#ff6b9d' : 'rgba(255,255,255,0.7)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) (e.target as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        <span className="font-medium">{t}</span>
                        {isSelected && <Check className="w-4 h-4 text-pink-400" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={prevStep} className="flex-1 font-semibold py-3 px-4 rounded-xl text-white/70 hover:text-white transition-all duration-300" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {t('onboarding.back')}
        </button>
        <button onClick={handleNext} className="flex-1 font-bold py-3 px-4 rounded-xl text-white transition-all duration-300 hover:brightness-110" style={{ background: 'linear-gradient(135deg, #ff2d75 0%, #ff6b9d 100%)', boxShadow: '0 4px 20px rgba(255,45,117,0.3)' }}>
          {t('onboarding.next')}
        </button>
      </div>
    </motion.div>
  );
};

export default TribeStep;
