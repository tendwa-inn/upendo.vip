import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const interestsWithEmojis: { key: string; emoji: string }[] = [
  { key: 'interests.reading', emoji: '\uD83D\uDCDA' },
  { key: 'interests.traveling', emoji: '\u2708\uFE0F' },
  { key: 'interests.movies', emoji: '\uD83C\uDFAC' },
  { key: 'interests.music', emoji: '\uD83C\uDFB5' },
  { key: 'interests.cooking', emoji: '\uD83D\uDC68\u200D\uD83C\uDF73' },
  { key: 'interests.dancing', emoji: '\uD83D\uDD7A' },
  { key: 'interests.art', emoji: '\uD83C\uDFA8' },
  { key: 'interests.photography', emoji: '\uD83D\uDCF7' },
  { key: 'interests.hiking', emoji: '\uD83E\uDD7E' },
  { key: 'interests.sports', emoji: '\u26BD' },
  { key: 'interests.gaming', emoji: '\uD83C\uDFAE' },
  { key: 'interests.yoga', emoji: '\uD83E\uDDD8' },
  { key: 'interests.writing', emoji: '\u270D\uFE0F' },
  { key: 'interests.fashion', emoji: '\uD83D\uDC57' },
  { key: 'interests.technology', emoji: '\uD83D\uDCBB' },
  { key: 'interests.history', emoji: '\uD83C\uDFDB\uFE0F' },
].sort((a, b) => a.key.localeCompare(b.key));

const cardStyle = {
  background: 'linear-gradient(145deg, rgba(40,10,20,0.95) 0%, rgba(20,8,15,0.98) 100%)',
  border: '1px solid rgba(255,45,117,0.15)',
  boxShadow: '0 0 60px rgba(255,45,117,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const InterestsStep: React.FC = () => {
  const { prevStep, updateFormData, formData, completeOnboarding } = useOnboardingStore();
  const { updateUserProfile } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(formData.interests || []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) return prev.filter(i => i !== interest);
      if (prev.length < 5) return [...prev, interest];
      return prev;
    });
  };

  const handleNext = async () => {
    const profileData = { ...formData, interests: selectedInterests };
    const { error } = await supabase.rpc('create_user_profile_onboarding', { data: profileData });

    if (error) {
      console.error("Failed to create profile:", error);
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("There was an error creating your profile.");
        return;
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (profile) {
        const processed: any = {
          ...profile,
          lastActive: profile.last_active_at || profile.lastActive || new Date(),
          account_type: profile.account_type || 'free',
          bio: profile.bio || '',
          hereFor: profile.here_for || profile.hereFor || [],
          photos: profile.photos || [],
          onboarding_completed: true,
          strikes: profile.strikes || 0,
          firstDate: profile.first_date || profile.firstDate || '',
          occupation: profile.occupation || '',
          kids: profile.kids || '',
          dateOfBirth: profile.dob ? new Date(profile.dob) : undefined,
        };
        if (processed.location && typeof processed.location === 'string') {
          const m = (processed.location as string).match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
          if (m) processed.location = { name: profile.location_name || '', longitude: parseFloat(m[1]), latitude: parseFloat(m[2]) };
          else if (profile.location_name) processed.location = { name: profile.location_name, longitude: null, latitude: null };
        } else if (profile.location_name) {
          processed.location = { name: profile.location_name, longitude: null, latitude: null };
        }
        useAuthStore.getState().setProfile(processed);
      }
    }
    completeOnboarding();
  };

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
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 5 ? 'w-8 bg-pink-500' : i < 5 ? 'w-4 bg-pink-500/50' : 'w-4 bg-white/15'}`} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-4xl mb-2">&#10024;</p>
        <h1 className="text-2xl font-bold text-white">{t('onboarding.interests.question')}</h1>
        <p className="text-white/40 text-sm mt-1">{t('onboarding.interests.description')}</p>
      </div>

      {/* Counter */}
      <div className="text-center">
        <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(255,45,117,0.12)', color: 'rgba(255,107,157,0.9)' }}>
          {selectedInterests.length} / 5 selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {interestsWithEmojis.map(({ key, emoji }) => {
          const isSelected = selectedInterests.includes(key);
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleInterest(key)}
              className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
              style={isSelected
                ? { background: 'linear-gradient(135deg, #ff2d75 0%, #ff6b9d 100%)', boxShadow: '0 4px 15px rgba(255,45,117,0.3)' }
                : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              <span className="text-base">{emoji}</span>
              <span>{t(key)}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={prevStep} className="flex-1 font-semibold py-3 px-4 rounded-xl text-white/70 hover:text-white transition-all duration-300" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {t('onboarding.back')}
        </button>
        <button
          onClick={handleNext}
          disabled={selectedInterests.length < 3 || selectedInterests.length > 5}
          className="flex-1 font-bold py-3 px-4 rounded-xl text-white transition-all duration-300 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #ff2d75 0%, #ff6b9d 100%)', boxShadow: '0 4px 20px rgba(255,45,117,0.3)' }}
        >
          {t('onboarding.next')}
        </button>
      </div>
    </motion.div>
  );
};

export default InterestsStep;
