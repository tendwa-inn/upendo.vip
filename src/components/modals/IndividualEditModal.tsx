import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { 
  occupations, 
  heights, 
  religions, 
  loveLanguages, 
  drinkingAndSmokingOptions, 
  firstDateIdeas,
  educationOptions,
  relationshipIntentOptions,
  kidsOptions,
  hereForOptions
} from '../../lib/options';

const IndividualEditModal = ({ field, value, onSave, onClose }) => {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const isVip = profile?.account_type === 'vip';
  const isPro = profile?.account_type === 'pro';
  const [currentValue, setCurrentValue] = useState(field === 'hereFor' ? (Array.isArray(value) ? value : []) : (value || ''));
  const [hasChanged, setHasChanged] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Field title mapping with contextual questions
  const fieldTitles = {
    bio: t('profile.edit.bioTitle'),
    occupation: t('profile.edit.occupationTitle'),
    education: t('profile.edit.educationTitle'),
    height: t('profile.edit.heightTitle'),
    religion: t('profile.edit.religionTitle'),
    loveLanguage: t('profile.edit.loveLanguageTitle'),
    drinking: t('profile.edit.drinkingTitle'),
    smoking: t('profile.edit.smokingTitle'),
    kids: t('profile.edit.kidsTitle'),
    firstDate: t('profile.edit.firstDateTitle'),
    relationshipIntent: t('profile.edit.relationshipIntentTitle'),
    hereFor: t('profile.edit.hereForTitle')
  };

  const filteredOccupations = useMemo(() => {
    if (field !== 'occupation') return [];
    return occupations.filter(occ => 
      occ.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, field]);

  const renderInput = () => {
    switch (field) {
      case 'occupation':
        return (
          <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {occupations.map(occ => (
              <option className="text-black" key={occ} value={occ}>{occ}</option>
            ))}
          </select>
        );
      case 'height':
        return (
                    <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {heights.map(h => <option className="text-black" key={h} value={h}>{h}</option>)}
          </select>
        );
      case 'religion':
        return (
          <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {religions.map(r => <option className="text-black" key={r} value={r}>{r}</option>)}
          </select>
        );
      case 'loveLanguage':
        return (
          <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {loveLanguages.map(ll => <option className="text-black" key={ll} value={ll}>{ll}</option>)}
          </select>
        );
      case 'drinking':
      case 'smoking':
        return (
          <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {drinkingAndSmokingOptions.map(opt => <option className="text-black" key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      case 'firstDate':
        return (
          <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {firstDateIdeas.map(idea => <option className="text-black" key={idea} value={idea}>{idea}</option>)}
          </select>
        );
      case 'education':
        return (
          <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {educationOptions.map(edu => <option className="text-black" key={edu} value={edu}>{edu}</option>)}
          </select>
        );
      case 'relationshipIntent':
        return (
          <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {relationshipIntentOptions.map(intent => <option className="text-black" key={intent} value={intent}>{intent}</option>)}
          </select>
        );
      case 'kids':
        return (
          <select value={currentValue} onChange={e => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`}>
            <option className="text-black" value="">{t('general.notSpecified')}</option>
            {kidsOptions.map(option => <option className="text-black" key={option} value={option}>{option}</option>)}
          </select>
        );
      case 'hereFor':
        const handleHereForChange = (option) => {
          setCurrentValue([option]);
          setHasChanged(true);
        };
        return (
          <div className="flex flex-wrap gap-2">
            {hereForOptions.map(option => (
              <button
                key={option}
                onClick={() => handleHereForChange(option)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  currentValue.includes(option)
                    ? (isVip ? 'bg-amber-400 text-black' : isPro ? 'bg-cyan-400 text-white' : 'bg-pink-600 text-white')
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'bio':
        return (
          <div>
            <textarea 
              value={currentValue} 
              onChange={(e) => { setCurrentValue(e.target.value); setHasChanged(true); }} 
              maxLength="250"
              className={`w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`} 
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {currentValue?.length || 0} / 250
            </div>
          </div>
        );
      default:
          return <input type="text" value={currentValue} onChange={(e) => { setCurrentValue(e.target.value); setHasChanged(true); }} className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 text-white ${isVip ? 'focus:ring-amber-400' : isPro ? 'focus:ring-cyan-400' : 'focus:ring-pink-400'}`} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className={`bg-gradient-to-b ${isVip ? 'from-black to-[#0b0b0b]' : isPro ? 'from-[#071521] to-[#0b2237]' : 'from-[#2E0C13] to-[#22090E]'} rounded-2xl p-6 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto text-white border ${isVip ? 'border-amber-400/30' : isPro ? 'border-cyan-400/30' : 'border-white/10'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{fieldTitles[field] || t('profile.edit.editProfile')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="min-h-[150px] sm:min-h-[100px]">
          {renderInput()}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white/10 rounded-lg font-semibold transition-colors hover:bg-white/20"
          >
            {t('general.cancel')}
          </button>
          <button 
            onClick={() => onSave(field, currentValue)} 
            className={`px-5 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isVip ? 'bg-amber-400 hover:bg-amber-500 text-black' : isPro ? 'bg-cyan-400 hover:bg-cyan-500 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}
            disabled={!hasChanged && currentValue === value}
          >
            {t('general.save')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default IndividualEditModal;
