import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useTranslation } from 'react-i18next';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const months = [
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' },
];

const WheelColumn: React.FC<{
  items: { value: number; label: string }[];
  selected: number;
  onChange: (value: number) => void;
  label: string;
}> = ({ items, selected, onChange, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const didInitRef = useRef(false);

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: index * ITEM_HEIGHT, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const idx = items.findIndex(i => i.value === selected);
    if (idx >= 0) scrollToIndex(idx, false);
  }, [items, selected, scrollToIndex]);

  const handleScroll = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const index = Math.round(container.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      scrollToIndex(clamped);
      if (items[clamped]) onChange(items[clamped].value);
    }, 80);
  }, [items, onChange, scrollToIndex]);

  return (
    <div className="flex-1 flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-widest text-pink-400/60 mb-2 font-medium">{label}</span>
      <div className="relative w-full">
        <div className="absolute top-0 left-0 right-0 h-[66px] bg-gradient-to-b from-[#1a0a10] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[66px] bg-gradient-to-t from-[#1a0a10] to-transparent z-10 pointer-events-none" />
        <div
          className="absolute left-1 right-1 z-10 pointer-events-none rounded-xl"
          style={{ top: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2, height: ITEM_HEIGHT, background: 'rgba(255,45,117,0.07)', border: '1px solid rgba(255,45,117,0.15)' }}
        />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-[220px] overflow-y-auto scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          <div style={{ height: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2 }} />
          {items.map((item, i) => (
            <div
              key={item.value}
              style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
              className="flex items-center justify-center cursor-pointer"
              onClick={() => { onChange(item.value); scrollToIndex(i); }}
            >
              <span className={`text-lg font-semibold transition-all duration-200 ${item.value === selected ? 'text-white scale-110' : 'text-white/25 scale-100'}`}>
                {item.label}
              </span>
            </div>
          ))}
          <div style={{ height: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2 }} />
        </div>
      </div>
    </div>
  );
};

const DobStep: React.FC = () => {
  const { nextStep, prevStep, updateFormData, formData } = useOnboardingStore();
  const { t } = useTranslation();

  const [day, setDay] = useState(formData.dob ? new Date(formData.dob).getUTCDate() : 15);
  const [month, setMonth] = useState(formData.dob ? new Date(formData.dob).getUTCMonth() + 1 : 6);
  const [year, setYear] = useState(formData.dob ? new Date(formData.dob).getUTCFullYear() : 2000);

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 60;
  const maxYear = currentYear - 18;

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  const yearItems = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({ value: maxYear - i, label: String(maxYear - i) }));

  useEffect(() => { if (day > daysInMonth) setDay(daysInMonth); }, [daysInMonth, day]);

  const age = (() => {
    const today = new Date();
    let a = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) a--;
    return a;
  })();

  const handleNext = () => {
    updateFormData({ dob: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md rounded-3xl p-6 pt-8 space-y-4"
      style={{ background: 'linear-gradient(145deg, rgba(40,10,20,0.95) 0%, rgba(20,8,15,0.98) 100%)', border: '1px solid rgba(255,45,117,0.15)', boxShadow: '0 0 60px rgba(255,45,117,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      <div className="flex justify-center gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 2 ? 'w-8 bg-pink-500' : i < 2 ? 'w-4 bg-pink-500/50' : 'w-4 bg-white/15'}`} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-4xl mb-2">&#128197;</p>
        <h1 className="text-2xl font-bold text-white">{t('onboarding.dob.question')}</h1>
        <p className="text-white/40 text-sm mt-1">You must be 18+</p>
      </div>

      <div className="flex gap-2 px-2">
        <WheelColumn items={days} selected={day} onChange={setDay} label="Day" />
        <WheelColumn items={months} selected={month} onChange={setMonth} label="Month" />
        <WheelColumn items={yearItems} selected={year} onChange={setYear} label="Year" />
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(255,45,117,0.12)', border: '1px solid rgba(255,45,117,0.2)' }}>
          <span className="text-pink-400 text-sm font-medium">{t('onboarding.dob.age', { age })}</span>
        </div>
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

export default DobStep;
