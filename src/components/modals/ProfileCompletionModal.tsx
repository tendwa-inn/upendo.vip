import React from 'react';
import { Check, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCurrentTheme } from '../../stores/colorThemeStore';
import { useTranslation } from 'react-i18next';

const ProfileCompletionModal = ({ profile, onClose }) => {
  const { profile: authProfile } = useAuthStore();
  const { t } = useTranslation();
  const acct = authProfile?.account_type || authProfile?.subscription || 'free';
  const theme = useCurrentTheme(acct);
  const completionCriteria = {
    bio: !!profile.bio,
    photos: (profile.photos?.length || 0) >= 3,
    location: !!profile.location?.name,
    hereFor: !!profile.hereFor,
  };

  const allComplete = Object.values(completionCriteria).every(Boolean);

  const criteriaList = [
    { label: t('modal.profileComplete.writeBio'), completed: completionCriteria.bio },
    { label: t('modal.profileComplete.uploadPhotos'), completed: completionCriteria.photos },
    { label: t('modal.profileComplete.setLocation'), completed: completionCriteria.location },
    { label: t('modal.profileComplete.setPurpose'), completed: completionCriteria.hereFor },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`${theme.background} rounded-2xl p-6 w-full max-w-md text-white border ${theme.accent.border}`}>
        <h2 className="text-2xl font-bold mb-4">{t('modal.profileComplete.title')}</h2>
        <p className="text-gray-300 mb-6">{t('modal.profileComplete.steps')}</p>
        
        <div className="space-y-3 mb-6">
          {criteriaList.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <span className={item.completed ? 'text-gray-400 line-through' : 'text-white'}>{item.label}</span>
              {item.completed ? <Check className={`w-5 h-5 ${theme.primary}`} /> : <X className="w-5 h-5 text-red-500" />}
            </div>
          ))}
        </div>

        {allComplete ? (
          <div className={`text-center p-4 rounded-lg bg-green-500/20`}>
            <p className={`font-semibold text-green-400`}>{t('modal.profileComplete.done')}</p>
          </div>
        ) : (
          <div className="text-center p-4 bg-red-500/20 rounded-lg">
            <p className="font-semibold text-red-400">{t('modal.profileComplete.incomplete')}</p>
          </div>
        )}

        <button onClick={onClose} className={`mt-6 w-full font-bold py-2 px-4 rounded-xl transition-all duration-300 ${theme.button.primary} ${theme.button.primaryHover} text-white`}>{t('modal.profileComplete.close')}</button>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
