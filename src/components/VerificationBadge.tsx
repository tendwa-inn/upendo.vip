
import React from 'react';
import { Shield, Check } from 'lucide-react';
import { User } from '../types';

interface VerificationBadgeProps {
  profile: User;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ profile }) => {
  const accountType = profile?.accountType || (profile as any)?.account_type || (profile as any)?.membership_type || (profile as any)?.membershipType || 'free';
  const photoCount = profile?.photos?.length || 0;

  // Define a "complete" profile for free users
  const isProfileComplete =
    photoCount > 3 &&
    profile?.bio &&
    (profile as any).occupation &&
    profile?.education;

  if (accountType === 'vip') {
    return (
      <div className="flex items-center gap-1" title="VIP Verified">
        <div className="relative w-5 h-5">
          <Shield className="absolute w-full h-full text-black fill-black" />
          <Check className="absolute w-3 h-3 top-1 left-1 text-white" strokeWidth={3} />
        </div>
      </div>
    );
  }

  if (accountType === 'pro') {
    return (
      <div className="flex items-center gap-1" title="Pro Verified">
        <div className="relative w-5 h-5">
          <Shield className="absolute w-full h-full text-blue-500 fill-blue-500" />
          <Check className="absolute w-3 h-3 top-1 left-1 text-white" strokeWidth={3} />
        </div>
      </div>
    );
  }

  if (accountType === 'free' && isProfileComplete) {
    return (
      <div className="flex items-center gap-1" title="Completed Profile">
        <Shield className="w-5 h-5 text-white" />
      </div>
    );
  }

  return null; // Render nothing if no conditions are met
};

export default VerificationBadge;
