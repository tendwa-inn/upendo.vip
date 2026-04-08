import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { User } from '../../types';
import { Heart, X, Undo2, RotateCcw, Zap, MapPin, Play, FastForward, Rewind, Crown, Shield, MoreHorizontal } from 'lucide-react';
import VerificationBadge from '../VerificationBadge';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';

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
  const [activeButton, setActiveButton] = useState<string | null>(null);
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
  }

  const formatDistance = (distanceInMeters?: number | null) => {
    if (typeof distanceInMeters !== 'number' || !Number.isFinite(distanceInMeters)) return null;
    const km = Math.max(1, Math.ceil(distanceInMeters / 1000));
    return t('distance.kmAwayCompact', { count: km });
  };

  const distanceMeters = (user as any).distance_meters ?? (user as any).distance;
  const distance = formatDistance(distanceMeters);

  const formatHeight = (cm) => {
    if (!cm) return null;
    const inches = cm / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}" (${cm}cm)`;
  };

  const handlePressStart = (button: string) => setActiveButton(button);
  const handlePressEnd = () => setActiveButton(null);

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
    switch (buttonStyle) {
      case 'white-clean':
        return (
          <div className="absolute top-48 right-4 flex flex-col items-center space-y-3 z-20">
            <button
              onClick={() => onSwipeRight(user.id)}
              onMouseDown={() => handlePressStart('like')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('like')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <Heart
                className="w-8 h-8"
                fill={activeButton === 'like' ? '#ec4899' : 'white'}
                color={activeButton === 'like' ? '#ec4899' : 'white'}
              />
              <span>{t('swipe.like')}</span>
            </button>
            <button
              onClick={() => onSwipeLeft(user.id)}
              onMouseDown={() => handlePressStart('nope')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('nope')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <X className={`w-8 h-8 ${activeButton === 'nope' ? 'text-red-500' : 'text-white'}`} strokeWidth={2.5} />
              <span>{t('swipe.nope')}</span>
            </button>
            <button
              onClick={onRewind}
              onMouseDown={() => handlePressStart('rewind')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('rewind')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <RotateCcw className={`w-8 h-8 ${activeButton === 'rewind' ? 'text-yellow-500' : 'text-white'}`} strokeWidth={2.5} />
              <span>{t('swipe.rewind')}</span>
            </button>
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              onMouseDown={() => handlePressStart('more')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('more')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <MoreHorizontal className="w-8 h-8" />
              <span>{t('swipe.more')}</span>
            </button>
            {showStyleMenu && (
              <div className="absolute right-12 top-0 bg-gray-800 rounded-xl p-3 shadow-xl z-30 min-w-[140px]">
                <p className="text-xs text-gray-400 mb-2 font-semibold">{t('swipe.menu.buttonStyle')}</p>
                <button
                  onClick={() => { setButtonStyle('upendo-color'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === 'upendo-color' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.upendoColor')}
                </button>
                <button
                  onClick={() => { setButtonStyle('white-clean'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === 'white-clean' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.whiteClean')}
                </button>
                <button
                  onClick={() => { setButtonStyle('vintage'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${buttonStyle === 'vintage' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.vintage')}
                </button>
              </div>
            )}
          </div>
        );
      case 'vintage':
        return (
          <div className="absolute top-48 right-4 flex flex-col items-center space-y-3 z-20">
            <button
              onClick={() => onSwipeRight(user.id)}
              onMouseDown={() => handlePressStart('play')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('play')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <Play 
                className={`w-8 h-8 ${activeButton === 'play' ? 'text-green-500' : 'text-white'}`} 
                strokeWidth={2.5}
              />
              <span className={activeButton === 'play' ? 'text-green-500' : 'text-white'}>{t('swipe.play')}</span>
            </button>
            <button
              onClick={() => onSwipeLeft(user.id)}
              onMouseDown={() => handlePressStart('wind')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('wind')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <FastForward 
                className={`w-8 h-8 ${activeButton === 'wind' ? 'text-red-500' : 'text-white'}`} 
                strokeWidth={2.5}
              />
              <span className={activeButton === 'wind' ? 'text-red-500' : 'text-white'}>{t('swipe.wind')}</span>
            </button>
            <button
              onClick={onRewind}
              onMouseDown={() => handlePressStart('rewind')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('rewind')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <Rewind
                className={`w-8 h-8 ${activeButton === 'rewind' ? 'text-yellow-500' : 'text-white'}`}
                strokeWidth={2.5}
              />
              <span className={activeButton === 'rewind' ? 'text-yellow-500' : 'text-white'}>{t('swipe.rewind')}</span>
            </button>
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              onMouseDown={() => handlePressStart('more')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('more')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <MoreHorizontal className={`w-8 h-8 ${activeButton === 'more' ? 'text-yellow-500' : 'text-white'}`} />
              <span className={activeButton === 'more' ? 'text-yellow-500' : 'text-white'}>{t('swipe.more')}</span>
            </button>
            {showStyleMenu && (
              <div className="absolute right-12 top-0 bg-gray-800 rounded-xl p-3 shadow-xl z-30 min-w-[140px]">
                <p className="text-xs text-gray-400 mb-2 font-semibold">{t('swipe.menu.buttonStyle')}</p>
                <button
                  onClick={() => { setButtonStyle('upendo-color'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === 'upendo-color' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.upendoColor')}
                </button>
                <button
                  onClick={() => { setButtonStyle('white-clean'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === 'white-clean' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.whiteClean')}
                </button>
                <button
                  onClick={() => { setButtonStyle('vintage'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${buttonStyle === 'vintage' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.vintage')}
                </button>
              </div>
            )}
          </div>
        );
      case 'upendo-color':
      default:
        return (
          <div className="absolute top-48 right-4 flex flex-col items-center space-y-3 z-20">
            <button onClick={() => onSwipeRight(user.id)} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shadow-lg">
                <Heart className="w-4 h-4" fill="white" />
              </div>
              <span>{t('swipe.like')}</span>
            </button>
            <button onClick={() => onSwipeLeft(user.id)} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <X className="w-4 h-4" fill="white" strokeWidth={3} />
              </div>
              <span>{t('swipe.nope')}</span>
            </button>
            <button onClick={onRewind} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                <Undo2 className="w-4 h-4" />
              </div>
              <span>{t('swipe.rewind')}</span>
            </button>
            <button onClick={() => setShowStyleMenu(!showStyleMenu)} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center shadow-lg">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <span>{t('swipe.more')}</span>
            </button>
            {showStyleMenu && (
              <div className="absolute right-12 top-0 bg-gray-800 rounded-xl p-3 shadow-xl z-30 min-w-[140px]">
                <p className="text-xs text-gray-400 mb-2 font-semibold">{t('swipe.menu.buttonStyle')}</p>
                <button
                  onClick={() => { setButtonStyle('upendo-color'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === 'upendo-color' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.upendoColor')}
                </button>
                <button
                  onClick={() => { setButtonStyle('white-clean'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === 'white-clean' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.whiteClean')}
                </button>
                <button
                  onClick={() => { setButtonStyle('vintage'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${buttonStyle === 'vintage' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('swipe.menu.vintage')}
                </button>
              </div>
            )}
          </div>
        );
    }
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
      <div className="relative w-full h-full shadow-2xl overflow-hidden bg-gray-900">
        {/* Photo Navigation */}
        <div className="absolute top-0 left-0 right-0 bottom-32 z-10 flex h-auto">
          <div className="w-1/2 h-full" onClick={prevPhoto} />
          <div className="w-1/2 h-full" onClick={nextPhoto} />
        </div>

        <motion.img
          key={currentPhotoIndex}
          src={(user.photos && user.photos[currentPhotoIndex]) || 'https://placehold.co/600x800'}
          alt={user.name || 'User'}
          className="w-full h-full object-cover"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent" />

        {renderButtons()}

        <div className="absolute bottom-8 left-0 right-0 p-5 pr-24 text-white z-10">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold cursor-pointer" onClick={() => navigate(`/user/${user.id}`)}>
                 {user.name}{displayAge !== null && displayAge !== undefined ? `, ${displayAge}` : ''}
              </h2>
              <VerificationBadge profile={user} />
            </div>

            {user.bio && (
              <div className="text-gray-300 mt-1 mb-1">
                <p className={`text-white text-base ${!isBioExpanded && 'line-clamp-2'}`}>{user.bio}</p>
                {user.bio.length > 100 && (
                  <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="text-gray-400 text-sm font-semibold mt-1 hover:underline">
                    {isBioExpanded ? t('swipe.bio.seeLess') : t('swipe.bio.seeMore')}
                  </button>
                )}
              </div>
            )}
            
            {distance && (
              <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                <MapPin size={14} />
                <span>{distance}</span>
              </div>
            )}

            {(user.hereFor || []).map((purpose: string) => (
              <div key={purpose} className="mt-2">
                <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-white">{purpose}</span>
              </div>
            ))}
            
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
          </div>

          <div className="space-y-4">
            {mutualInterests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-2">{t('swipe.mutualInterests')}</h3>
                <div className="flex flex-wrap gap-2">
                  {mutualInterests.map(interest => (
                      <span key={interest} className="px-3 py-1 rounded-full text-sm font-semibold bg-white/10 text-white/80">{interest}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {(user as any).kids && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300">{(user as any).kids}</span>
              )}
              {(user as any).occupation && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-300">{(user as any).occupation}</span>
              )}
              {user.religion && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300">{user.religion}</span>
              )}
              {user.firstDate && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300">{user.firstDate}</span>
              )}
              {user.height && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500/20 text-red-300">{formatHeight(user.height)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
