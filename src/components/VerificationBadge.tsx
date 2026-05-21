
import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface VerificationBadgeProps {
  profile: User;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ profile }) => {
  const { t } = useTranslation();

  if (!profile || !profile.is_verified) return null;

  return (
    <div className="relative w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center" title={t('verified.title')}>
      <Check className="absolute w-3 h-3 top-1 left-1 text-white" strokeWidth={3} />
    </div>
  );
};

export default VerificationBadge;
