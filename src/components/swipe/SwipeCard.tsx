import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { User } from '../../types';
import { Heart, X, Undo2, RotateCcw, Zap, MapPin, Play, FastForward, Rewind, Crown, Shield, MoreHorizontal } from 'lucide-react';
import VerificationBadge from '../VerificationBadge';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';
import usePresenceStore from '../../stores/presenceStore'; // Import presence store

interface SwipeCardProps {
  user: User;
  onSwipeLeft: (userId: string) => void;
  onSwipeRight: (userId: string) => void;
  onRewind: () => void;
  onBoost: () => void;
  isActive: boolean;
  canSwipe: boolean;
  currentPhotoIndex: number;
  setCurrentPhotoIndex: React.Dispatch<React.SetStateAction<number>>;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  onSwipeLeft,
  onSwipeRight,
  onRewind,
  onBoost,
  isActive,
  canSwipe,
  currentPhotoIndex,
  setCurrentPhotoIndex,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { profile: currentUser } = useAuthStore();
  const { buttonStyle, setButtonStyle } = useUiStore();
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const { t } = useTranslation();

  const calculateAge = (dob?: string | Date) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userAny = user as any;

  const { onlineUsers } = usePresenceStore();
  const isOnline = !!onlineUsers[user.id];
  const accountType = (user as any).accountType || (user as any).account_type;

  const dob =
    userAny.date_of_birth ||
    userAny.dob ||
    userAny.birthdate ||
    userAny.dateOfBirth ||
    user.dateOfBirth;

  const calculatedAge = calculateAge(dob);
  const displayAge = (userAny.age ?? user.age) ?? calculatedAge;

  if (import.meta.env.DEV) {
    console.log('DOB:', dob);
    console.log('Calculated Age:', calculatedAge);
    console.log('User hereFor:', user.hereFor);
    console.log('User here_for:', (user as any).here_for);
    console.log('User interested_in:', (user as any).interested_in);
    console.log('User relationship_intent:', (user as any).relationship_intent);
    console.log('User data keys:', Object.keys(user));
    console.log('User data:', user);
  }

  // Handle different possible field names and formats for user's purposes
  const getUserHereFor = () => {
    const userAny = user as any;
    const intent = userAny.relationship_intent || userAny.interested_in;

    if (intent && typeof intent === 'string' && intent.trim()) {
      return [intent];
    }

    if (user.hereFor && Array.isArray(user.hereFor) && user.hereFor.length > 0) {
      return user.hereFor;
    }
    
    return [];
  };

  const userHereFor = getUserHereFor();

  const getPurposeColor = (purpose: string) => {
    switch (purpose) {
      case 'Serious Relationship':
        return 'bg-blue-800 text-blue-200';
      case 'Hookups':
      case 'Dating':
        return 'bg-red-800 text-red-200';
      case 'Friendship':
        return 'bg-yellow-800 text-yellow-200';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  const formatDistance = (distanceInMeters?: number | null) => {
    if (typeof distanceInMeters !== 'number' || !Number.isFinite(distanceInMeters)) return null;
    const km = Math.max(1, Math.ceil(distanceInMeters / 1000));
    return t('distance.kmAwayCompact', { count: km });
  };

  const distanceMeters = (user as any).distance_meters ?? (user as any).distance;
  const distance = formatDistance(distanceMeters);

  const formatHeight = (heightValue: number | string) => {
    if (!heightValue) return null;

    // If it's a string like "4' 10\" (147cm)", extract the feet and inches part.
    if (typeof heightValue === 'string') {
      const match = heightValue.match(/^(\d+'\d+")/);
      if (match) {
        return match[1];
      }
    }

    // If it's a number (cm), convert it.
    if (typeof heightValue === 'number') {
      const inches = heightValue / 2.54;
      const feet = Math.floor(inches / 12);
      const remainingInches = Math.round(inches % 12);
      return `${feet}'${remainingInches}"`;
    }

    // Fallback for unexpected formats.
    return heightValue;
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) onSwipeRight(user.id);
      else onSwipeLeft(user.id);
    }
  };

  const nextPhoto = () => {
    if (user.photos && user.photos.length > 0) {
      setCurrentPhotoIndex(prev => Math.min(prev + 1, user.photos.length - 1));
    }
  };
  const prevPhoto = () => setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));

  const mutualInterests = (currentUser?.interests || []).filter(interest => (user.interests || []).includes(interest));

  if (!isActive) return null;

  const renderButtons = () => {
    const styles = {
      'white-clean': {
        like: <Heart className="w-8 h-8" fill="white" />,
        nope: <X className="w-8 h-8" />,
        rewind: <RotateCcw className="w-8 h-8" />,
        colorClass: () => 'text-white'
      },
      'upendo-color': {
        like: <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4" fill="white" /></div>,
        nope: <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center shadow-lg"><X className="w-4 h-4" strokeWidth={3} /></div>,
        rewind: <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"><Undo2 className="w-4 h-4" /></div>,
        colorClass: () => 'text-white'
      },
      'vintage': {
        like: <Play className="w-8 h-8" />,
        nope: <FastForward className="w-8 h-8" />,
        rewind: <Rewind className="w-8 h-8" />,
        colorClass: () => 'text-white'
      }
    };

    const currentStyle = styles[buttonStyle] || styles['upendo-color'];

    return (
      <div className="absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40">
        <button onClick={() => onSwipeRight(user.id)} className="flex flex-col items-center gap-1 font-bold text-[9px] text-white">
          {currentStyle.like}
          <span>{t('swipe.like')}</span>
        </button>
        
        <button onClick={() => onSwipeLeft(user.id)} className="flex flex-col items-center gap-1 font-bold text-[9px] text-white">
          {currentStyle.nope}
          <span>{t('swipe.nope')}</span>
        </button>

        <button onClick={onRewind} className="flex flex-col items-center gap-1 font-bold text-[9px] text-white">
          {currentStyle.rewind}
          <span>{t('swipe.rewind')}</span>
        </button>
        
        <button onClick={() => setShowStyleMenu(!showStyleMenu)} className="flex flex-col items-center gap-1 font-bold text-[9px] text-white">
          {currentStyle.more || <MoreHorizontal className="w-8 h-8" />}
          <span>{t('swipe.more')}</span>
        </button>
        
        {showStyleMenu && (
          <div className="absolute right-12 top-0 bg-gray-800 rounded-xl p-3 shadow-xl z-50 min-w-[140px]">
            <p className="text-xs text-gray-400 mb-2 font-semibold">{t('swipe.menu.buttonStyle')}</p>
            <button onClick={() => { setButtonStyle('upendo-color'); setShowStyleMenu(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === 'upendo-color' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
              {t('swipe.menu.upendoColor')}
            </button>
            <button onClick={() => { setButtonStyle('white-clean'); setShowStyleMenu(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === 'white-clean' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
              {t('swipe.menu.whiteClean')}
            </button>
            <button onClick={() => { setButtonStyle('vintage'); setShowStyleMenu(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${buttonStyle === 'vintage' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
              {t('swipe.menu.vintage')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 w-full h-full"
      style={{ x, rotate, opacity }}
      drag
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      layout
      initial={{ scale: 1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 50 }}
    >
      <div className="relative w-full h-full shadow-2xl overflow-hidden bg-gray-900 aspect-[9/16]">
        {/* Photo Navigation */}
        <div className="absolute top-0 left-0 right-0 bottom-32 z-10 flex h-auto">
          <div className="w-1/2 h-full" onClick={prevPhoto} />
          <div className="w-1/2 h-full" onClick={nextPhoto} />
        </div>

        <motion.img
          key={currentPhotoIndex}
          src={(user.photos && user.photos[currentPhotoIndex]) || 'https://placehold.co/600x800'}
          alt={user.name || 'User'}
          className="w-full h-full object-contain"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent" />

        {renderButtons()}

        <div className="absolute bottom-4 left-0 right-0 p-5 pr-24 text-white z-10">
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold cursor-pointer" onClick={() => navigate(`/user/${user.id}`)}>
                 {user.name}{displayAge !== null && displayAge !== undefined ? `, ${displayAge}` : ''}
              </h2>
              {isOnline && (!accountType || accountType === 'free') && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
              <VerificationBadge profile={user} />
            </div>

            <div className="flex items-center gap-2 mt-1">
              {distance && (
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <MapPin size={14} />
                  <span>{distance}</span>
                </div>
              )}
              
              {/* Show viewed user's purposes */}
              {userHereFor.length > 0 ? (
                userHereFor.map((purpose: string) => (
                  <span key={purpose} className={`px-3 py-1 rounded-full text-sm ${getPurposeColor(purpose)}`}>{purpose}</span>
                ))
              ) : (
                <span className="px-3 py-1 rounded-full text-sm bg-gray-600 text-gray-300">Not specified</span>
              )}
            </div>

            {user.bio && (
              <div className="text-gray-300 mt-1">
                <p className={`text-white text-base ${!isBioExpanded && 'line-clamp-2'}`}>{user.bio}</p>
                {user.bio.length > 100 && (
                  <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="text-gray-400 text-sm font-semibold mt-1 hover:underline">
                    {isBioExpanded ? t('swipe.bio.seeLess') : t('swipe.bio.seeMore')}
                  </button>
                )}
              </div>
            )}
            
            {/* Badges row */}
            {((user as any).accountType === 'pro' || (user as any).accountType === 'vip' || (user as any).account_type === 'pro' || (user as any).account_type === 'vip') && (
              <div className="flex items-center mt-2">
                <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  ((user as any).accountType || (user as any).account_type) === 'pro' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-black text-white'
                }`}>
                  {((user as any).accountType || (user as any).account_type) === 'vip' ? (
                    <Crown className="w-3.5 h-3.5" />
                  ) : (
                    <Shield className="w-3.5 h-3.5" />
                  )}
                  <span>{((user as any).accountType || (user as any).account_type).toLowerCase()}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {(user as any).kids && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">{(user as any).kids}</span>
              )}
              {(user as any).occupation && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">{(user as any).occupation}</span>
              )}
              {user.religion && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">{user.religion}</span>
              )}
              {user.firstDate && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300">{user.firstDate}</span>
              )}
              {user.height && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300">{formatHeight(user.height)}</span>
              )}
              {mutualInterests.slice(0, 2).map(interest => (
                <span key={interest} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-800 text-green-200">{interest}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
