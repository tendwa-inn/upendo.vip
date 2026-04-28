import React, { useRef, useState } from 'react';
import { User } from '../types';
import { useAuthStore } from '../stores/authStore';
import { Lock, Eye, Heart, Crown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import UpgradeModal from './modals/UpgradeModal';
import { useLikesStore } from '../stores/likesStore';
import { useViewsStore } from '../stores/viewsStore';

interface UserListItemProps {
  user: User;
  type: 'view' | 'like';
  onLikeBack?: (userId: string) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, type, onLikeBack }) => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isPremium = profile?.account_type === 'pro' || profile?.account_type === 'vip';
  
  // Calculate age from dob if user.age is missing
  const getAge = () => {
    if (user.age) return user.age;
    const dob = (user as any).dob || user.dateOfBirth;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return null;
  };
  
  const displayAge = getAge();

  // Check if user has active profile viewing promo
  const hasProfileViewPromo = profile?.canViewProfilesExpiresAt 
    ? new Date(profile.canViewProfilesExpiresAt) > new Date()
    : false;
    
  const canViewProfile = isPremium || hasProfileViewPromo;
  const isFree = !canViewProfile;

  // swipe-to-dismiss
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = async (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -50) {
      if (type === 'like') {
        await useLikesStore.getState().removeLike(user.id);
      } else if (type === 'view') {
        await useViewsStore.getState().removeView(user.id);
      }
    }
    touchStartX.current = null;
  };

  const handleClick = () => {
    if (canViewProfile) {
      navigate(`/user/${user.id}`);
    } else {
      // Show upgrade modal instead of window.confirm
      setShowUpgradeModal(true);
    }
  };

  const handleLikeBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeBack) {
      onLikeBack(user.id);
    }
  };

  return (
    <>
      <div 
        className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-3 ${
          canViewProfile ? 'cursor-pointer hover:bg-white/20' : 'cursor-not-allowed'
        } transition-all duration-200`}
        onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}>
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          <div className="relative">
            <img 
              src={user.photos?.[0] || '/placeholder-avatar.png'} 
              alt={isFree ? "A blurred user" : user.name}
              className={`w-16 h-16 rounded-full object-cover ${isFree ? 'filter blur-md' : ''}`}
            />
            {isFree && (
              <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1">
                {type === 'view' ? <Eye className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            {isFree ? (
              <div>
                <h3 className="font-semibold text-lg">
                  {type === 'view' ? 'Someone is stalking you' : 'Someone liked you'}
                </h3>
                <p className="text-sm text-white/60">
                  Upgrade to {profile?.account_type === 'free' ? 'Pro or VIP' : 'see who'}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-lg flex items-center">
                  {user.name}
                  {(user.accountType === 'pro' || user.accountType === 'vip') && (
                    <div className={`ml-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.accountType === 'pro' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-black text-white'
                    }`}>
                      {user.accountType === 'vip' ? (
                        <Crown className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      <span>{user.accountType.toLowerCase()}</span>
                    </div>
                  )}
                </h3>
                {displayAge !== null && (
                  <p className="text-sm text-white/70">{isPremium ? displayAge : `${displayAge} years old`}</p>
                )}
                {type === 'view' && (user as any).viewed_at && (
                  <p className="text-xs text-white/60 mt-1">
                    {formatDistanceToNow(new Date((user as any).viewed_at), { addSuffix: true })}
                  </p>
                )}
                {type === 'like' && (user as any).liked_at && (
                  <p className="text-xs text-white/60 mt-1">
                    {formatDistanceToNow(new Date((user as any).liked_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          {type === 'like' && canViewProfile && (
            <button
              onClick={handleLikeBack}
              className={`${(useAuthStore.getState().profile as any)?.account_type === 'vip' ? 'bg-amber-400 hover:bg-amber-500 text-black' : ((useAuthStore.getState().profile as any)?.account_type === 'pro' ? 'bg-cyan-400 hover:bg-cyan-500 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white')} px-4 py-2 rounded-full text-sm font-medium transition-colors`}
            >Like Back</button>
          )}
        </div>
      </div>
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </>
  );
};

export default React.memo(UserListItem);
