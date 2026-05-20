import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { User } from '../../types';
import { Heart, X, Undo2, RotateCcw, Zap, MapPin, Play, FastForward, Rewind, Crown, Shield, MoreHorizontal } from 'lucide-react';
import VerificationBadge from '../VerificationBadge';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { DELUXE_BUTTONS } from '../../config/deluxeButtons';

// Button interaction system — CSS-driven hover glow + click animation
// Usage: spread {...btnI('#f0abfc','clickBounce')} onto any button div
export const btnI = (glowColor: string, clickAnim = 'clickFlash') => ({
  style: { '--gc': glowColor, '--ca': clickAnim, '--rg': '0 0 8px 2px' } as React.CSSProperties,
  className: 'bi',
});
import { useTranslation } from 'react-i18next';
import usePresenceStore from '../../stores/presenceStore'; // Import presence store

import { useLikeStore } from '../../stores/likeStore';
import { useCurrentTheme } from '../../stores/colorThemeStore';

interface SwipeCardProps {
  user: User;
  onSwipeLeft: (userId: string) => void;
  onSwipeRight: (userId: string) => void;
  onRewind: () => void;
  onBoost: () => void;
  isActive: boolean;
  canSwipe: boolean;
  canRewind?: boolean;
  currentPhotoIndex: number;
  setCurrentPhotoIndex: React.Dispatch<React.SetStateAction<number>>;
  currentCardIndex?: number;
  swipeHistory?: string[];
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  onSwipeLeft,
  onSwipeRight,
  onRewind,
  onBoost,
  isActive,
  canSwipe,
  canRewind = false,
  currentPhotoIndex,
  setCurrentPhotoIndex,
  currentCardIndex,
  swipeHistory,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { profile: currentUser } = useAuthStore();
  const { buttonStyle, setButtonStyle } = useUiStore();
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [imageOrientation, setImageOrientation] = useState<'landscape' | 'portrait'>('portrait');
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const { t } = useTranslation();
  const isVip = currentUser?.account_type === 'vip';
  const isPro = currentUser?.account_type === 'pro';
  const theme = useCurrentTheme(currentUser?.account_type || 'free');

  // Inject animation keyframes once
  useEffect(() => {
    if (!document.getElementById('btn-deluxe-keyframes')) {
      const style = document.createElement('style');
      style.id = 'btn-deluxe-keyframes';
      style.textContent = [
        `@keyframes btnPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}`,
        `@keyframes morph{0%,100%{border-radius:30% 70% 70% 30%/30% 30% 70% 70%}50%{border-radius:70% 30% 30% 70%/70% 70% 30% 30%}}`,
        `@keyframes morseFlicker{0%,100%{opacity:1}50%{opacity:0.3}70%{opacity:0.8}80%{opacity:0.4}}`,
        `@keyframes bubbleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`,
        `@keyframes clickFlash{0%{box-shadow:0 0 0 0 rgba(255,255,255,0.6)}50%{box-shadow:0 0 20px 8px rgba(255,255,255,0.3)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}`,
        `@keyframes clickRipple{0%{transform:scale(1);opacity:1}100%{transform:scale(2.5);opacity:0}}`,
        `@keyframes clickBounce{0%{transform:scale(1)}30%{transform:scale(0.85)}60%{transform:scale(1.2)}100%{transform:scale(1)}}`,
        `@keyframes clickSpin{0%{transform:rotate(0deg) scale(1)}25%{transform:rotate(10deg) scale(1.1)}50%{transform:rotate(-5deg) scale(1)}100%{transform:rotate(0deg) scale(1)}}`,
        `@keyframes clickShimmer{0%{filter:brightness(1)}50%{filter:brightness(1.5)}100%{filter:brightness(1)}}`,
        `@keyframes glowPulse{0%,100%{box-shadow:0 0 8px 2px var(--glow-color, rgba(255,255,255,0.3))}50%{box-shadow:0 0 20px 8px var(--glow-color, rgba(255,255,255,0.5))}}`,
        `.bi{cursor:pointer;transition:all .2s ease;position:relative;overflow:visible}`,
        `.bi:hover{transform:scale(1.12);filter:brightness(1.3) saturate(1.2);box-shadow:0 0 20px 6px var(--gc,rgba(255,255,255,0.4))}`,
        `.bi:active{animation:var(--ca,clickFlash) .35s ease-out;transform:scale(0.92);filter:brightness(1.6)}`,
        `.bi::after{content:'';position:absolute;inset:-4px;border-radius:inherit;background:transparent;pointer-events:none;transition:all .2s ease}`,
        `.bi:hover::after{box-shadow:0 0 30px 10px var(--gc,rgba(255,255,255,0.2));opacity:1}`,
      ].join('');
      document.head.appendChild(style);
    }
  }, []);

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
  const isOnline = Boolean(onlineUsers[String(user.id)]?.length);
  
  const account_type = (user as any).accountType || (user as any).account_type;

  const dob =
    userAny.date_of_birth ||
    userAny.dob ||
    userAny.birthdate ||
    userAny.dateOfBirth ||
    user.dateOfBirth;

  const calculatedAge = calculateAge(dob);
  const displayAge = (userAny.age ?? user.age) ?? calculatedAge;

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
        return 'bg-blue-800/40 text-blue-200';
      case 'Hookups':
      case 'Dating':
        return 'bg-red-800 text-red-200';
      case 'Friendship':
        return 'bg-yellow-800 text-yellow-200';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > naturalHeight) {
      setImageOrientation('landscape');
    } else {
      setImageOrientation('portrait');
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

  const { addLikedUser, likedUserIds } = useLikeStore();
  const isLiked = likedUserIds instanceof Set && likedUserIds.has(user.id);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleLike = async () => {
    if (isLiked || isProcessing) return;

    setIsProcessing(true);
    // Visual feedback
    setActiveButton('like');
    setTimeout(() => setActiveButton(null), 200);
    
    addLikedUser(user.id);
    await onSwipeRight(user.id);

    setIsProcessing(false);
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        handleLike(); // Use handleLike to include the isLiked check
      } else {
        onSwipeLeft(user.id);
      }
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
    const ic: Record<string, { like: string; nope: string; rewind: string }> = {
      'neon-cyber':     { like: '#f0abfc', nope: '#fb923c', rewind: '#22d3ee' },
      'neon-violet':    { like: '#c084fc', nope: '#f472b6', rewind: '#818cf8' },
      'neon-ice':       { like: '#67e8f9', nope: '#93c5fd', rewind: '#a5f3fc' },
      'neon-solar':     { like: '#fbbf24', nope: '#f97316', rewind: '#fde68a' },
      'neon-midnight':  { like: '#a78bfa', nope: '#38bdf8', rewind: '#c4b5fd' },
      'neon-tangerine': { like: '#fb923c', nope: '#ef4444', rewind: '#fdba74' },
      'neon-flamingo':  { like: '#f472b6', nope: '#e879f9', rewind: '#f9a8d4' },
      'neon-lime':      { like: '#a3e635', nope: '#4ade80', rewind: '#d9f99d' },
      'classic-glass':  { like: '#ffffff', nope: '#ffffff', rewind: '#ffffff' },
      'classic-chrome': { like: '#d1d5db', nope: '#d1d5db', rewind: '#d1d5db' },
      'classic-copper': { like: '#f59e0b', nope: '#ea580c', rewind: '#d97706' },
      'classic-mono':   { like: '#ffffff', nope: '#ffffff', rewind: '#ffffff' },
      'classic-slate':  { like: '#94a3b8', nope: '#94a3b8', rewind: '#94a3b8' },
      'classic-gold':   { like: '#fbbf24', nope: '#f59e0b', rewind: '#fcd34d' },
      'glowy-aurora':   { like: '#34d399', nope: '#60a5fa', rewind: '#a78bfa' },
      'glowy-ember':    { like: '#f87171', nope: '#fb923c', rewind: '#fbbf24' },
      'glowy-ocean':    { like: '#22d3ee', nope: '#60a5fa', rewind: '#2dd4bf' },
      'pop-bubble':     { like: '#f472b6', nope: '#fb7185', rewind: '#c084fc' },
      'pop-confetti':   { like: '#34d399', nope: '#f87171', rewind: '#fbbf24' },
    };

    const glow: Record<string, { like: string; nope: string; rewind: string }> = {
      'neon-cyber':     { like: 'drop-shadow(0 0 6px #f0abfc)', nope: 'drop-shadow(0 0 6px #fb923c)', rewind: 'drop-shadow(0 0 6px #22d3ee)' },
      'neon-violet':    { like: 'drop-shadow(0 0 6px #c084fc)', nope: 'drop-shadow(0 0 6px #f472b6)', rewind: 'drop-shadow(0 0 6px #818cf8)' },
      'neon-ice':       { like: 'drop-shadow(0 0 6px #67e8f9)', nope: 'drop-shadow(0 0 6px #93c5fd)', rewind: 'drop-shadow(0 0 6px #a5f3fc)' },
      'neon-solar':     { like: 'drop-shadow(0 0 6px #fbbf24)', nope: 'drop-shadow(0 0 6px #f97316)', rewind: 'drop-shadow(0 0 6px #fde68a)' },
      'neon-midnight':  { like: 'drop-shadow(0 0 6px #a78bfa)', nope: 'drop-shadow(0 0 6px #38bdf8)', rewind: 'drop-shadow(0 0 6px #c4b5fd)' },
      'neon-tangerine': { like: 'drop-shadow(0 0 6px #fb923c)', nope: 'drop-shadow(0 0 6px #ef4444)', rewind: 'drop-shadow(0 0 6px #fdba74)' },
      'neon-flamingo':  { like: 'drop-shadow(0 0 6px #f472b6)', nope: 'drop-shadow(0 0 6px #e879f9)', rewind: 'drop-shadow(0 0 6px #f9a8d4)' },
      'neon-lime':      { like: 'drop-shadow(0 0 6px #a3e635)', nope: 'drop-shadow(0 0 6px #4ade80)', rewind: 'drop-shadow(0 0 6px #d9f99d)' },
      'glowy-aurora':   { like: 'drop-shadow(0 0 10px #34d399) drop-shadow(0 0 20px #34d39980)', nope: 'drop-shadow(0 0 10px #60a5fa) drop-shadow(0 0 20px #60a5fa80)', rewind: 'drop-shadow(0 0 10px #a78bfa) drop-shadow(0 0 20px #a78bfa80)' },
      'glowy-ember':    { like: 'drop-shadow(0 0 10px #f87171) drop-shadow(0 0 20px #f8717180)', nope: 'drop-shadow(0 0 10px #fb923c) drop-shadow(0 0 20px #fb923c80)', rewind: 'drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 20px #fbbf2480)' },
      'glowy-ocean':    { like: 'drop-shadow(0 0 10px #22d3ee) drop-shadow(0 0 20px #22d3ee80)', nope: 'drop-shadow(0 0 10px #60a5fa) drop-shadow(0 0 20px #60a5fa80)', rewind: 'drop-shadow(0 0 10px #2dd4bf) drop-shadow(0 0 20px #2dd4bf80)' },
      'glowy-rose':     { like: 'drop-shadow(0 0 10px #fb7185) drop-shadow(0 0 20px #fb718580)', nope: 'drop-shadow(0 0 10px #f472b6) drop-shadow(0 0 20px #f472b680)', rewind: 'drop-shadow(0 0 10px #e879f9) drop-shadow(0 0 20px #e879f980)' },
    };

    const c = ic[buttonStyle];
    const g = glow[buttonStyle];
    const pop = buttonStyle.startsWith('pop-');
    const popAnim = pop ? { animation: 'btnPop 0.35s ease-out' } : undefined;

    const makeIcon = (color: string, glowFilter?: string, fill = false) => ({
      color,
      filter: glowFilter || 'none',
    });

    const styles: Record<string, { like: React.ReactNode; nope: React.ReactNode; rewind: React.ReactNode; more: React.ReactNode }> = {
      'white-clean': {
        like: <Heart className="w-8 h-8" fill="white" />,
        nope: <X className="w-8 h-8" />,
        rewind: <RotateCcw className="w-8 h-8" />,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'upendo-color': {
        like: <div className={`w-9 h-9 ${theme.swipeButton?.shape || 'rounded-full'} bg-gradient-to-br ${theme.swipeButton?.like || 'from-pink-500 to-pink-600'} flex items-center justify-center`}><Heart className="w-4 h-4" fill="white" /></div>,
        nope: <div className={`w-9 h-9 ${theme.swipeButton?.shape || 'rounded-full'} bg-gradient-to-br ${theme.swipeButton?.nope || 'from-red-500 to-red-600'} flex items-center justify-center`}><X className="w-4 h-4" strokeWidth={3} /></div>,
        rewind: <div className={`w-9 h-9 ${theme.swipeButton?.shape || 'rounded-full'} bg-gradient-to-br ${theme.swipeButton?.rewind || 'from-blue-500 to-blue-600'} flex items-center justify-center`}><Undo2 className="w-4 h-4" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'vintage': {
        like: <Play className="w-8 h-8" />,
        nope: <FastForward className="w-8 h-8" />,
        rewind: <Rewind className="w-8 h-8" />,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'upendo-205': {
        like: <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_0_#15803d,0_6px_12px_rgba(0,0,0,0.3)] bg-gradient-to-b from-green-400 to-green-600 active:shadow-[0_2px_0_#15803d,0_3px_6px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all"><Heart className="w-5 h-5 text-white drop-shadow" fill="white" /></div>,
        nope: <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_0_#b91c1c,0_6px_12px_rgba(0,0,0,0.3)] bg-gradient-to-b from-red-400 to-red-600 active:shadow-[0_2px_0_#b91c1c,0_3px_6px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all"><X className="w-5 h-5 text-white drop-shadow" strokeWidth={3} /></div>,
        rewind: <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_0_#a16207,0_6px_12px_rgba(0,0,0,0.3)] bg-gradient-to-b from-yellow-400 to-yellow-600 active:shadow-[0_2px_0_#a16207,0_3px_6px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all"><Undo2 className="w-5 h-5 text-white drop-shadow" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      // ── NEON ──
      'neon-cyber': {
        like: <div {...btnI('#e879f9')} className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-600/30 to-cyan-600/30 border border-fuchsia-400/40 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-fuchsia-300" fill="currentColor" /></div>,
        nope: <div {...btnI('#fb923c')} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600/30 to-red-600/30 border border-orange-400/40 flex items-center justify-center shadow-lg shadow-orange-500/20 backdrop-blur-sm"><X className="w-4.5 h-4.5 text-orange-300" /></div>,
        rewind: <div {...btnI('#22d3ee')} className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 backdrop-blur-sm"><RotateCcw className="w-4.5 h-4.5 text-cyan-300" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'neon-violet': {
        like: <div {...btnI('#c084fc')} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/20 backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-purple-300" fill="currentColor" /></div>,
        nope: <div {...btnI('#f472b6')} className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600/30 to-rose-600/30 border border-pink-400/40 flex items-center justify-center shadow-lg shadow-pink-500/20 backdrop-blur-sm"><Zap className="w-4.5 h-4.5 text-pink-300" /></div>,
        rewind: <div {...btnI('#818cf8')} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-400/40 flex items-center justify-center shadow-lg shadow-indigo-500/20 backdrop-blur-sm"><Undo2 className="w-4.5 h-4.5 text-indigo-300" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'neon-ice': {
        like: <div {...btnI('#67e8f9')} className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/25 to-sky-600/25 border border-cyan-300/50 flex items-center justify-center shadow-lg shadow-cyan-400/25 backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-cyan-200" fill="currentColor" /></div>,
        nope: <div {...btnI('#93c5fd')} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/25 to-indigo-600/25 border border-blue-300/50 flex items-center justify-center shadow-lg shadow-blue-400/25 backdrop-blur-sm"><X className="w-4.5 h-4.5 text-blue-200" /></div>,
        rewind: <div {...btnI('#5eead4')} className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/25 to-cyan-600/25 border border-teal-300/50 flex items-center justify-center shadow-lg shadow-teal-400/25 backdrop-blur-sm"><RotateCcw className="w-4.5 h-4.5 text-teal-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'neon-solar': {
        like: <div {...btnI('#fbbf24')} className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border border-yellow-400/50 flex items-center justify-center shadow-lg shadow-yellow-500/20 backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-yellow-200" fill="currentColor" /></div>,
        nope: <div {...btnI('#f97316')} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-red-600/30 border border-orange-400/50 flex items-center justify-center shadow-lg shadow-orange-500/20 backdrop-blur-sm"><FastForward className="w-4.5 h-4.5 text-orange-200" /></div>,
        rewind: <div {...btnI('#fde68a')} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-600/30 border border-amber-300/50 flex items-center justify-center shadow-lg shadow-amber-400/20 backdrop-blur-sm"><Rewind className="w-4.5 h-4.5 text-amber-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'neon-midnight': {
        like: <div {...btnI('#a78bfa')} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-800/30 border border-violet-400/40 flex items-center justify-center shadow-lg shadow-violet-500/20 backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-violet-300" fill="currentColor" /></div>,
        nope: <div {...btnI('#38bdf8')} className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500/30 to-blue-800/30 border border-sky-400/40 flex items-center justify-center shadow-lg shadow-sky-500/20 backdrop-blur-sm"><X className="w-4.5 h-4.5 text-sky-300" /></div>,
        rewind: <div {...btnI('#c4b5fd')} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-violet-800/30 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/20 backdrop-blur-sm"><RotateCcw className="w-4.5 h-4.5 text-purple-300" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'neon-tangerine': {
        like: <div {...btnI('#fb923c')} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-600/30 border border-orange-400/50 flex items-center justify-center shadow-lg shadow-orange-500/25 backdrop-blur-sm"><Play className="w-4.5 h-4.5 text-orange-200" fill="currentColor" /></div>,
        nope: <div {...btnI('#ef4444')} className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-rose-700/30 border border-red-400/50 flex items-center justify-center shadow-lg shadow-red-500/25 backdrop-blur-sm"><FastForward className="w-4.5 h-4.5 text-red-200" /></div>,
        rewind: <div {...btnI('#fdba74')} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-600/30 border border-amber-300/50 flex items-center justify-center shadow-lg shadow-amber-400/25 backdrop-blur-sm"><Rewind className="w-4.5 h-4.5 text-amber-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'neon-flamingo': {
        like: <div {...btnI('#f472b6')} className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-600/30 border border-pink-400/50 flex items-center justify-center shadow-lg shadow-pink-500/25 backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-pink-200" fill="currentColor" /></div>,
        nope: <div {...btnI('#e879f9')} className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-purple-600/30 border border-fuchsia-400/50 flex items-center justify-center shadow-lg shadow-fuchsia-500/25 backdrop-blur-sm"><Zap className="w-4.5 h-4.5 text-fuchsia-200" /></div>,
        rewind: <div {...btnI('#fda4af')} className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400/30 to-pink-600/30 border border-rose-300/50 flex items-center justify-center shadow-lg shadow-rose-400/25 backdrop-blur-sm"><Undo2 className="w-4.5 h-4.5 text-rose-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'neon-lime': {
        like: <div {...btnI('#a3e635')} className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-500/30 to-green-600/30 border border-lime-400/50 flex items-center justify-center shadow-lg shadow-lime-500/25 backdrop-blur-sm"><Play className="w-4.5 h-4.5 text-lime-200" fill="currentColor" /></div>,
        nope: <div {...btnI('#4ade80')} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-600/30 border border-emerald-400/50 flex items-center justify-center shadow-lg shadow-emerald-500/25 backdrop-blur-sm"><FastForward className="w-4.5 h-4.5 text-emerald-200" /></div>,
        rewind: <div {...btnI('#bef264')} className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400/30 to-lime-600/30 border border-green-300/50 flex items-center justify-center shadow-lg shadow-green-400/25 backdrop-blur-sm"><Rewind className="w-4.5 h-4.5 text-green-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      // ── CLASSIC ──
      'classic-glass': {
        like: <div {...btnI('rgba(255,255,255,0.4)')} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg shadow-white/10 backdrop-blur-md"><Heart className="w-4.5 h-4.5 text-white/80" fill="currentColor" /></div>,
        nope: <div {...btnI('rgba(255,255,255,0.4)')} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg shadow-white/10 backdrop-blur-md"><X className="w-4.5 h-4.5 text-white/80" /></div>,
        rewind: <div {...btnI('rgba(255,255,255,0.4)')} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-lg shadow-white/10 backdrop-blur-md"><RotateCcw className="w-4.5 h-4.5 text-white/80" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'classic-chrome': {
        like: <div {...btnI('rgba(209,213,219,0.5)', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.4)]" style={{ background: 'linear-gradient(145deg, #e5e7eb, #9ca3af, #d1d5db)' }}><Heart className="w-4.5 h-4.5 text-gray-700" fill="currentColor" /></div>,
        nope: <div {...btnI('rgba(209,213,219,0.5)', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.4)]" style={{ background: 'linear-gradient(145deg, #d1d5db, #6b7280, #9ca3af)' }}><X className="w-4.5 h-4.5 text-gray-800" /></div>,
        rewind: <div {...btnI('rgba(209,213,219,0.5)', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.4)]" style={{ background: 'linear-gradient(145deg, #9ca3af, #4b5563, #6b7280)' }}><RotateCcw className="w-4.5 h-4.5 text-gray-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'classic-copper': {
        like: <div {...btnI('#f59e0b', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(145deg, #f59e0b, #b45309, #d97706)' }}><Heart className="w-4.5 h-4.5 text-white" fill="white" /></div>,
        nope: <div {...btnI('#ea580c', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(145deg, #ea580c, #9a3412, #c2410c)' }}><FastForward className="w-4.5 h-4.5 text-white" /></div>,
        rewind: <div {...btnI('#d97706', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(145deg, #d97706, #92400e, #b45309)' }}><Rewind className="w-4.5 h-4.5 text-white" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'classic-mono': {
        like: <div {...btnI('rgba(255,255,255,0.3)')} className="w-10 h-10 rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/25 flex items-center justify-center shadow-lg backdrop-blur-sm"><Play className="w-4.5 h-4.5 text-white" fill="currentColor" /></div>,
        nope: <div {...btnI('rgba(255,255,255,0.3)')} className="w-10 h-10 rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/25 flex items-center justify-center shadow-lg backdrop-blur-sm"><FastForward className="w-4.5 h-4.5 text-white" /></div>,
        rewind: <div {...btnI('rgba(255,255,255,0.3)')} className="w-10 h-10 rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/25 flex items-center justify-center shadow-lg backdrop-blur-sm"><Rewind className="w-4.5 h-4.5 text-white" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'classic-slate': {
        like: <div {...btnI('#94a3b8', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(145deg, #64748b, #334155, #475569)' }}><Heart className="w-4.5 h-4.5 text-slate-200" fill="currentColor" /></div>,
        nope: <div {...btnI('#64748b', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(145deg, #475569, #1e293b, #334155)' }}><X className="w-4.5 h-4.5 text-slate-300" /></div>,
        rewind: <div {...btnI('#94a3b8', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(145deg, #94a3b8, #475569, #64748b)' }}><RotateCcw className="w-4.5 h-4.5 text-slate-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'classic-gold': {
        like: <div {...btnI('#fbbf24', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_10px_rgba(251,191,36,0.3)]" style={{ background: 'linear-gradient(145deg, #fcd34d, #b45309, #f59e0b)' }}><Crown className="w-4.5 h-4.5 text-white" /></div>,
        nope: <div {...btnI('#f59e0b', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(145deg, #f59e0b, #78350f, #b45309)' }}><Shield className="w-4.5 h-4.5 text-amber-100" /></div>,
        rewind: <div {...btnI('#fde68a', 'clickShimmer')} className="w-10 h-10 rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)]" style={{ background: 'linear-gradient(145deg, #fde68a, #d97706, #fbbf24)' }}><RotateCcw className="w-4.5 h-4.5 text-amber-900" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      // ── GLOWY ──
      'glowy-aurora': {
        like: <div {...btnI('#34d399')} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)] backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-emerald-300" fill="currentColor" style={{ filter: 'drop-shadow(0 0 6px #34d399)' }} /></div>,
        nope: <div {...btnI('#60a5fa')} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(96,165,250,0.3)] backdrop-blur-sm"><X className="w-4.5 h-4.5 text-blue-300" style={{ filter: 'drop-shadow(0 0 6px #60a5fa)' }} /></div>,
        rewind: <div {...btnI('#a78bfa')} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(167,139,250,0.3)] backdrop-blur-sm"><Undo2 className="w-4.5 h-4.5 text-violet-300" style={{ filter: 'drop-shadow(0 0 6px #a78bfa)' }} /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'glowy-ember': {
        like: <div {...btnI('#f87171')} className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-rose-700/20 border border-red-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(248,113,113,0.3)] backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-red-300" fill="currentColor" style={{ filter: 'drop-shadow(0 0 6px #f87171)' }} /></div>,
        nope: <div {...btnI('#fb923c')} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-700/20 border border-orange-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(251,146,60,0.3)] backdrop-blur-sm"><FastForward className="w-4.5 h-4.5 text-orange-300" style={{ filter: 'drop-shadow(0 0 6px #fb923c)' }} /></div>,
        rewind: <div {...btnI('#fbbf24')} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-700/20 border border-amber-300/30 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)] backdrop-blur-sm"><Rewind className="w-4.5 h-4.5 text-amber-300" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'glowy-ocean': {
        like: <div {...btnI('#22d3ee')} className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-600/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-cyan-300" fill="currentColor" style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }} /></div>,
        nope: <div {...btnI('#60a5fa')} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-sky-700/20 border border-blue-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(96,165,250,0.3)] backdrop-blur-sm"><X className="w-4.5 h-4.5 text-blue-300" style={{ filter: 'drop-shadow(0 0 6px #60a5fa)' }} /></div>,
        rewind: <div {...btnI('#2dd4bf')} className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-700/20 border border-teal-300/30 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] backdrop-blur-sm"><Undo2 className="w-4.5 h-4.5 text-teal-300" style={{ filter: 'drop-shadow(0 0 6px #2dd4bf)' }} /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'glowy-rose': {
        like: <div {...btnI('#fb7185')} className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-700/20 border border-rose-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(251,113,133,0.3)] backdrop-blur-sm"><Heart className="w-4.5 h-4.5 text-rose-300" fill="currentColor" style={{ filter: 'drop-shadow(0 0 6px #fb7185)' }} /></div>,
        nope: <div {...btnI('#f472b6')} className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-fuchsia-700/20 border border-pink-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(244,114,182,0.3)] backdrop-blur-sm"><FastForward className="w-4.5 h-4.5 text-pink-300" style={{ filter: 'drop-shadow(0 0 6px #f472b6)' }} /></div>,
        rewind: <div {...btnI('#e879f9')} className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400/20 to-purple-700/20 border border-fuchsia-300/30 flex items-center justify-center shadow-[0_0_15px_rgba(232,121,249,0.3)] backdrop-blur-sm"><Rewind className="w-4.5 h-4.5 text-fuchsia-300" style={{ filter: 'drop-shadow(0 0 6px #e879f9)' }} /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      // ── POP ──
      'pop-bubble': {
        like: <div {...btnI('#f472b6', 'clickBounce')} className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-600/30 border-2 border-pink-400/50 flex items-center justify-center shadow-lg shadow-pink-500/20"><Heart className="w-4.5 h-4.5 text-pink-200" fill="currentColor" /></div>,
        nope: <div {...btnI('#fb7185', 'clickBounce')} className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400/30 to-rose-600/30 border-2 border-red-400/50 flex items-center justify-center shadow-lg shadow-red-500/20"><X className="w-4.5 h-4.5 text-red-200" /></div>,
        rewind: <div {...btnI('#c084fc', 'clickBounce')} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-violet-600/30 border-2 border-purple-400/50 flex items-center justify-center shadow-lg shadow-purple-500/20"><Undo2 className="w-4.5 h-4.5 text-purple-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
      'pop-confetti': {
        like: <div {...btnI('#34d399', 'clickBounce')} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-600/30 border-2 border-emerald-400/50 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Heart className="w-4.5 h-4.5 text-emerald-200" fill="currentColor" /></div>,
        nope: <div {...btnI('#f87171', 'clickBounce')} className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-rose-700/30 border-2 border-red-400/50 flex items-center justify-center shadow-lg shadow-red-500/20"><FastForward className="w-4.5 h-4.5 text-red-200" /></div>,
        rewind: <div {...btnI('#fbbf24', 'clickBounce')} className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-600/30 border-2 border-amber-300/50 flex items-center justify-center shadow-lg shadow-amber-400/20"><Rewind className="w-4.5 h-4.5 text-amber-200" /></div>,
        more: <MoreHorizontal className="w-8 h-8" />,
      },
    };

    // Deluxe button styles — completely custom layout and buttons
    if (buttonStyle.startsWith('deluxe-')) {
      const deluxe = DELUXE_BUTTONS[buttonStyle];
      if (deluxe) {
        return (
          <>
            <div className={deluxe.layoutClass}>
              <button onClick={handleLike} className={`transition-all duration-200 ${activeButton === 'like' ? 'scale-110' : ''}`}>
                {deluxe.like}
              </button>
              <button onClick={() => { setActiveButton('nope'); setTimeout(() => setActiveButton(null), 200); onSwipeLeft(user.id); }} className={`transition-all duration-200 ${activeButton === 'nope' ? 'scale-110' : ''}`}>
                {deluxe.nope}
              </button>
              <button onClick={() => { setActiveButton('rewind'); setTimeout(() => setActiveButton(null), 200); onRewind(); }} disabled={!canRewind} className={`transition-all duration-200 ${!canRewind ? 'opacity-30' : ''} ${activeButton === 'rewind' ? 'scale-110' : ''}`}>
                {deluxe.rewind}
              </button>
            </div>
            {/* More button — always in bottom-right */}
            <button onClick={() => setShowStyleMenu(!showStyleMenu)} className="absolute bottom-2 right-2 flex flex-col items-center gap-1 text-[9px] text-white/40 z-40">
              <MoreHorizontal className="w-6 h-6" />
            </button>
            {showStyleMenu && (
              <div className="absolute right-12 top-0 bg-gray-800 rounded-xl p-3 shadow-xl z-50 min-w-[140px] max-h-[300px] overflow-y-auto">
                <p className="text-xs text-gray-400 mb-2 font-semibold">{t('swipe.menu.buttonStyle')}</p>
                {(['upendo-color', 'white-clean', 'vintage', 'upendo-205'] as const).map(s => (
                  <button key={s} onClick={() => { setButtonStyle(s); setShowStyleMenu(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === s ? `${theme.button.primary} text-white` : 'text-gray-300 hover:bg-gray-700'}`}>
                    {s === 'upendo-color' ? t('swipe.menu.upendoColor') : s === 'white-clean' ? t('swipe.menu.whiteClean') : s === 'vintage' ? t('swipe.menu.vintage') : t('swipe.menu.upendo205')}
                  </button>
                ))}
              </div>
            )}
          </>
        );
      }
    }

    // Standard + Neon/Classic/Glowy/Pop styles
    const currentStyle = styles[buttonStyle] || styles['upendo-color'];

    return (
      <div className="absolute bottom-12 right-4 flex flex-col items-center gap-6 z-40">
        <button onClick={handleLike} className={`flex flex-col items-center gap-1 font-bold text-[9px] text-white disabled:opacity-50 transition-all duration-200 ${activeButton === 'like' ? 'scale-110' : ''}`}>
          {currentStyle.like}
          <span>{t('swipe.like')}</span>
        </button>

        <button onClick={() => { setActiveButton('nope'); setTimeout(() => setActiveButton(null), 200); onSwipeLeft(user.id); }} className={`flex flex-col items-center gap-1 font-bold text-[9px] text-white transition-all duration-200 ${activeButton === 'nope' ? 'scale-110' : ''}`}>
          {currentStyle.nope}
          <span>{t('swipe.nope')}</span>
        </button>

        <button
          onClick={() => { setActiveButton('rewind'); setTimeout(() => setActiveButton(null), 200); onRewind(); }}
          disabled={!canRewind}
          className={`flex flex-col items-center gap-1 font-bold text-[9px] ${canRewind ? 'text-white' : 'text-gray-500'} disabled:opacity-50 transition-all duration-200 ${activeButton === 'rewind' ? 'scale-110' : ''}`}
        >
          {currentStyle.rewind}
          <span>{t('swipe.rewind')}</span>
        </button>

        <button onClick={() => setShowStyleMenu(!showStyleMenu)} className="flex flex-col items-center gap-1 font-bold text-[9px] text-white">
          {currentStyle.more || <MoreHorizontal className="w-8 h-8" />}
          <span>{t('swipe.more')}</span>
        </button>

        {showStyleMenu && (
          <div className="absolute right-12 top-0 bg-gray-800 rounded-xl p-3 shadow-xl z-50 min-w-[140px] max-h-[300px] overflow-y-auto">
            <p className="text-xs text-gray-400 mb-2 font-semibold">{t('swipe.menu.buttonStyle')}</p>
            {(['upendo-color', 'white-clean', 'vintage', 'upendo-205'] as const).map(s => (
              <button key={s} onClick={() => { setButtonStyle(s); setShowStyleMenu(false); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${buttonStyle === s ? `${theme.button.primary} text-white` : 'text-gray-300 hover:bg-gray-700'}`}>
                {s === 'upendo-color' ? t('swipe.menu.upendoColor') : s === 'white-clean' ? t('swipe.menu.whiteClean') : s === 'vintage' ? t('swipe.menu.vintage') : t('swipe.menu.upendo205')}
              </button>
            ))}
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

      <div className="relative w-full h-full shadow-2xl overflow-hidden bg-gray-900 aspect-[9/16] md:aspect-[9/16] md:rounded-2xl md:max-h-full md:flex md:justify-center md:items-center">
        <div className="relative w-full h-full">
            {/* Photo Navigation */}
            <div className="absolute top-0 left-0 right-0 bottom-32 z-10 flex h-auto">
              <div className="w-1/2 h-full" onClick={prevPhoto} />
              <div className="w-1/2 h-full" onClick={nextPhoto} />
            </div>

            <motion.img
              key={currentPhotoIndex}
              src={(user.photos && user.photos[currentPhotoIndex]) || 'https://placehold.co/600x800'}
              alt={user.name || 'User'}
              onLoad={handleImageLoad}
              className="w-full h-full object-cover"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
        </div>

        {/* Overlays are now siblings to the image container */}
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {renderButtons()}

        <div className="absolute bottom-4 left-0 right-0 p-5 pr-24 text-white z-10 pointer-events-none">
          {/* The content of the user info overlay */}
          <div className="mb-2 pointer-events-auto">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold cursor-pointer" onClick={() => navigate(`/user/${user.id}`)}>
                    {user.name}{displayAge !== null && displayAge !== undefined ? ` ${displayAge}` : ''}
                  </h2>
                  <VerificationBadge profile={user} />
                {isOnline && (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" title="Online now" />
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                {distance && (
                  <div className="flex items-center gap-1.5 text-white/80 text-sm">
                    <MapPin size={14} />
                    <span>{distance}</span>
                  </div>
                )}
                
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
