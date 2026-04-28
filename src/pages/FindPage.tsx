import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeStore } from '../stores/swipeStore';
import { useMatchStore } from '../stores/matchStore.tsx';

import { useDiscoveryStore } from '../stores/discoveryStore';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useLikesStore } from '../stores/likesStore';
import { useViewsStore } from '../stores/viewsStore';
import usePresenceStore from '../stores/presenceStore';
import SwipeCard from '../components/swipe/SwipeCard';
import UserListItem from '../components/UserListItem';
import FilterModal from '../components/modals/FilterModal';
import { SlidersHorizontal, Bell, Eye, Heart, Loader2, Ghost } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recalcVisibilityForCurrentUser } from '../services/visibilityService';
import PhotoWall from '../components/PhotoWall';
import ProfileCompletionWall from '../components/ProfileCompletionWall';
import MatchAnimation from '../components/modals/MatchAnimation';
import { useMatchAnimationStore } from '../stores/matchAnimationStore';

const FindPage: React.FC = () => {
  const { swipeRight, swipeLeft, loadSwipeState, rewind } = useSwipeStore();
  const { potentialMatches, fetchPotentialMatches, isFetching } = useDiscoveryStore();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<string[]>([]);
  const { user: currentUser, profile } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { createMatch, matches } = useMatchStore();
  const { usersWhoLikedMe, fetchUsersWhoLikedMe, removeLike, hasNewLikes, markLikesAsViewed, listenForNewLikes, fetchLikedUserIds } = useLikesStore();
  const { listenForStrikes } = useDiscoveryStore();
  const { usersWhoViewedMe, fetchUsersWhoViewedMe, hasNewViews, markViewsAsViewed } = useViewsStore();
  const { onlineUsers } = usePresenceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [isInterstitialVisible, setIsInterstitialVisible] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { buttonStyle } = useUiStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'views' | 'likes'>('discover');
  const { isMatchAnimationVisible, matchedUser, hideMatchAnimation } = useMatchAnimationStore();
  const { t } = useTranslation();

  // Random mode toggle (persisted)
  const [swipeMode, setSwipeMode] = useState<'smart' | 'random'>(() => {
    try { return (localStorage.getItem('swipeMode') as 'smart' | 'random') || 'smart'; } catch { return 'smart'; }
  });
  useEffect(() => { try { localStorage.setItem('swipeMode', swipeMode); } catch {} }, [swipeMode]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'swipeMode' && e.newValue && (e.newValue === 'smart' || e.newValue === 'random')) {
        setSwipeMode(e.newValue as 'smart' | 'random');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Deterministic daily shuffle utilities
  const hashString = (s: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  const makeRng = (seedStr: string) => {
    let seed = hashString(seedStr) || 123456789;
    return () => {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return ((seed >>> 0) % 1_000_000) / 1_000_000;
    };
  };
  const seededShuffle = <T,>(arr: T[], seedStr: string): T[] => {
    const a = arr.slice();
    const rnd = makeRng(seedStr);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const orderedPotentialMatches = useMemo(() => {
    const uid = currentUser?.id || 'guest';
    const today = new Date().toISOString().slice(0, 10);
    const normalizeGender = (g?: string) => {
      if (!g) return null;
      const s = String(g).toLowerCase();
      if (['male','man','m'].includes(s)) return 'male';
      if (['female','woman','f'].includes(s)) return 'female';
      return null;
    };
    const myGender = normalizeGender((useAuthStore.getState().profile as any)?.gender);
    const wantGender = myGender === 'female' ? 'male' : (myGender === 'male' ? 'female' : null);
    const getCountry = (locName?: string | null) => {
      if (!locName) return null;
      const parts = String(locName).split(',').map(p => p.trim()).filter(Boolean);
      return parts.length ? parts[parts.length - 1] : null;
    };
    const meCountry = getCountry((useAuthStore.getState().profile as any)?.location?.name || (useAuthStore.getState().profile as any)?.location_name);
    const tier = ((useAuthStore.getState().profile as any)?.account_type || (useAuthStore.getState().profile as any)?.subscription || 'free') as 'free' | 'pro' | 'vip';
    const chosenScope = (localStorage.getItem('locationScope') || 'nearby') as 'nearby'|'country'|'global';
    const tierMax: 'nearby'|'country'|'global' = tier === 'vip' ? 'global' : (tier === 'pro' ? 'country' : 'nearby');
    const effectiveScope: 'nearby'|'country'|'global' = tierMax === 'nearby' ? 'nearby' : (tierMax === 'country' ? (chosenScope === 'nearby' ? 'nearby' : 'country') : chosenScope);
    const inTierGeo = (p: any) => {
      const meters = p.distance_meters ?? p.distance ?? null;
      const country = getCountry(p.location_name || p.location?.name);
      if (effectiveScope === 'nearby') return meters === null || meters <= 100_000;
      if (effectiveScope === 'country') return !meCountry || !country ? true : meCountry === country;
      return true;
    };
    const calcAge = (dob?: string | Date | null) => {
      if (!dob) return null;
      const birthDate = new Date(dob as any);
      if (Number.isNaN(birthDate.getTime())) return null;
      const now = new Date();
      let a = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) a--;
      return a;
    };
    const self: any = useAuthStore.getState().profile || {};
    const ageRange: [number, number] | undefined = (typeof (filters as any)?.ageRange?.[0] === 'number' && typeof (filters as any)?.ageRange?.[1] === 'number')
      ? (filters as any).ageRange
      : undefined;
    const selectedVibe: string | undefined = undefined; // deck doesn’t expose vibe; leave neutral
    const completeness = (p: any) => {
      const hasBio = !!p.bio;
      const hasHere = Array.isArray(p.hereFor) && p.hereFor.length > 0;
      const hasPhotos = Array.isArray(p.photos) && p.photos.length > 0;
      return (hasBio ? 1 : 0) + (hasHere ? 1 : 0) + (hasPhotos ? 1 : 0);
    };
    const baseVisibilityByTier = (p: any) => {
      const t = (p.accountType || p.account_type || p.subscription) as string | undefined;
      if (t === 'vip') return 0.8;
      if (t === 'pro') return 0.65;
      return 0.5;
    };
    const likedMeIds = new Set((useLikesStore.getState().usersWhoLikedMe || []).map(u => u.id));
    const recencyBoost = (last: any) => {
      if (!last) return 0;
      const now = Date.now();
      const ts = new Date(last).getTime();
      if (!Number.isFinite(ts)) return 0;
      const hours = Math.max(0, (now - ts) / 36e5);
      if (hours <= 1) return 0.2;
      if (hours <= 6) return 0.12;
      if (hours <= 24) return 0.05;
      return 0;
    };
    const overlapCount = (a: string[] = [], b: string[] = []) => a.filter(x => b.includes(x)).length;
    const scoreFor = (p: any) => {
      // Filters and hard constraints
      const theirGender = normalizeGender(p.gender);
      if (wantGender && theirGender !== wantGender) return -Infinity;
      if (!inTierGeo(p)) return -Infinity;
      const age = p.age ?? calcAge(p.date_of_birth || p.dob || p.dateOfBirth || p.birthdate);
      if (ageRange && typeof age === 'number' && (age < ageRange[0] || age > ageRange[1])) return -Infinity;
      // Components
      const distM = p.distance_meters ?? p.distance ?? null;
      const distKm = typeof distM === 'number' ? Math.ceil(Math.max(1, distM / 1000)) : null;
      const distScore = distKm === null ? 0 : Math.max(0, 1 - Math.min(distKm, 500) / 500); // closer -> higher
      const hereSelf: string[] = self?.hereFor || [];
      const hereOther: string[] = p?.hereFor || [];
      const intentionsMatch = overlapCount(hereSelf, hereOther) > 0 ? 1 : 0;
      // Free users: allow randomization across intentions a bit
      const intentionWeight = tier === 'free' ? (intentionsMatch ? 0.6 : 0.2) : (intentionsMatch ? 0.9 : 0.1);
      const interestsSelf: string[] = self?.interests || [];
      const interestsOther: string[] = p?.interests || [];
      const mutualInterests = overlapCount(interestsSelf, interestsOther);
      const kidsMatch = self?.kids && p?.kids && self.kids === p.kids ? 1 : 0;
      const drinkMatch = self?.drinking && p?.drinking && self.drinking === p.drinking ? 1 : 0;
      const smokeMatch = self?.smoking && p?.smoking && self.smoking === p.smoking ? 1 : 0;
      const religionMatch = self?.religion && p?.religion && self.religion === p.religion ? 1 : 0;
      const loveLangMatch = self?.loveLanguage && p?.loveLanguage && self.loveLanguage === p.loveLanguage ? 1 : 0;
      const visMod = typeof p.visibility_modifier === 'number' && isFinite(p.visibility_modifier) ? p.visibility_modifier : 1.0;
      const visibility = (baseVisibilityByTier(p) * visMod) + (completeness(p) * 0.05) + recencyBoost(p.lastActive);
      const likedMeBoost = likedMeIds.has(p.id) ? 0.8 : 0; // strong priority for people who liked me
      const onlineBoost = onlineUsers && (onlineUsers as any)[p.id] ? 0.15 : 0;
      // Daily vibes alignment (if present on either side, small nudge)
      const vibeSelf = (self as any).dailyVibe;
      const vibeOther = (p as any).dailyVibe;
      const vibeBoost = vibeSelf && vibeOther && vibeSelf === vibeOther ? 0.1 : 0;
      // Compose score
      const score =
        visibility * 2.0 +
        distScore * 1.2 +
        intentionWeight * 1.4 +
        Math.min(mutualInterests, 4) * 0.3 +
        (kidsMatch * 0.25 + drinkMatch * 0.2 + smokeMatch * 0.2) +
        (religionMatch * 0.15 + loveLangMatch * 0.15) +
        vibeBoost +
        likedMeBoost +
        onlineBoost;
      // Small deterministic jitter to avoid ties
      const rnd = makeRng(`${uid}-${today}-${p.id}`)();
      return score + rnd * 0.05;
    };
    const filtered = potentialMatches.filter((p: any) => {
      const theirGender = normalizeGender(p.gender);
      if (wantGender && theirGender !== wantGender) return false;
      if (!inTierGeo(p)) return false;
      const age = p.age ?? calcAge(p.date_of_birth || p.dob || p.dateOfBirth || p.birthdate);
      if (ageRange && typeof age === 'number' && (age < ageRange[0] || age > ageRange[1])) return false;
      return true;
    });
    if (swipeMode === 'random') {
      return seededShuffle(filtered, `${uid}-${today}`);
    }
    return filtered
      .map(p => ({ p, s: scoreFor(p) }))
      .sort((a, b) => b.s - a.s)
      .map(x => x.p);
  }, [potentialMatches, swipeMode, currentUser?.id]);



  useEffect(() => {
    // The fetchInitialData is now called from the authStore
  }, []);

  // Reset deck position if list length or mode changes
  useEffect(() => {
    setCurrentCardIndex(0);
  }, [potentialMatches.length, swipeMode]);

  const handleSwipeRight = React.useCallback(async (userId: string) => {
    console.log('=== FINDPAGE HANDLE SWIPE RIGHT CALLED ===');
    console.log('UserId:', userId);
    console.log('Current potential matches:', potentialMatches.map(u => ({id: u.id, name: u.name})));
    
    const swipedUser = potentialMatches.find((u) => u.id === userId);
    console.log('Found swiped user:', swipedUser);
    
    if (!swipedUser) {
      console.log('ERROR: Swiped user not found in potential matches!');
      return;
    }

    console.log('Calling swipeRight with userId:', userId);
    const { matched } = await swipeRight(userId);
    console.log('Swipe result - matched:', matched);
    
    if (matched) {
      console.log('IT\'S A MATCH! Showing animation');
      useMatchAnimationStore.getState().showMatchAnimation(swipedUser);
    }
    
    console.log('Adding user to swipe history:', userId);
    setSwipeHistory(prev => [...prev, userId]);
    
    console.log('Advancing card index...');
    setCurrentCardIndex(prev => {
      const newIndex = prev + 1;
      console.log('Advanced from', prev, 'to', newIndex);
      return newIndex;
    });
    
    // Fetch more profiles if running low
    if (currentCardIndex >= potentialMatches.length - 3) {
      console.log('Running low on profiles, fetching more...');
      fetchPotentialMatches();
    }
  }, [potentialMatches, swipeRight, currentCardIndex, fetchPotentialMatches]);

  const handleSwipeLeft = React.useCallback((userId: string) => {
    console.log('=== FINDPAGE HANDLE SWIPE LEFT CALLED ===');
    console.log('UserId:', userId);
    
    console.log('Calling swipeLeft with userId:', userId);
    swipeLeft(userId);
    
    console.log('Adding user to swipe history:', userId);
    setSwipeHistory(prev => [...prev, userId]);
    
    console.log('Advancing card index...');
    setCurrentCardIndex(prev => {
      const newIndex = prev + 1;
      console.log('Advanced from', prev, 'to', newIndex);
      return newIndex;
    });
    
    // Fetch more profiles if running low
    if (currentCardIndex >= potentialMatches.length - 3) {
      console.log('Running low on profiles, fetching more...');
      fetchPotentialMatches();
    }
  }, [swipeLeft, currentCardIndex, potentialMatches.length, fetchPotentialMatches]);

  const handleRewind = React.useCallback(async () => {
    const success = await rewind();
    if (success) {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
        setSwipeHistory(prev => prev.slice(0, -1));
      }
    } else {
      toast.error('You are out of rewinds for today!');
    }
  }, [rewind, currentCardIndex]);

  // Auto-refresh when running out of profiles
  useEffect(() => {
    if (currentCardIndex >= potentialMatches.length - 1 && potentialMatches.length > 0 && !isLoading) {
      console.log('Running low on profiles, fetching more...');
      fetchPotentialMatches();
    }
  }, [currentCardIndex, potentialMatches.length, isLoading, fetchPotentialMatches]);

  const handleApplyFilters = React.useCallback((newFilters: any) => setFilters(newFilters), []);

  const handleLikeBack = React.useCallback(async (userId: string) => {
    await createMatch(userId);
    await removeLike(userId);
  }, [createMatch, removeLike]);

  const getMissingFields = React.useCallback(() => {
    const missing = [];
    if (!profile?.bio) missing.push('Add a bio');
    if (!profile?.hereFor) missing.push('Set what you are here for');
    if (!profile?.photos || profile.photos.length < 1) missing.push('Upload at least one photo');
    return missing;
  }, [profile]);

  const acct = (profile as any)?.account_type || (profile as any)?.accountType || (profile as any)?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';
  
  // Debug logging
  console.log('DEBUG - FindPage account detection:');
  console.log('acct value:', acct);
  console.log('profile object:', profile);
  console.log('isVip:', isVip);
  console.log('isPro:', isPro);

  const headerBg = activeTab !== 'discover'
    ? isVip ? 'bg-black' : isPro ? 'bg-[#071521]' : 'bg-[#22090E]'
    : 'bg-transparent';

  if (isLoading) {
    return (
      <div className={`fixed inset-0 overflow-hidden text-white ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'} flex flex-col items-center justify-center`}>
        {isVip ? (
          <Ghost className="w-14 h-14 text-amber-300 animate-spin mb-4 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
        ) : isPro ? (
          <Ghost className="w-14 h-14 text-sky-300 animate-spin mb-4 drop-shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
        ) : (
          <Ghost className="w-14 h-14 text-pink-500 animate-spin mb-4 drop-shadow-[0_0_12px_rgba(236,72,153,0.9)]" />
        )}
        <p className="text-white/70 text-sm">{t('findingMatches') || 'Finding matches...'}</p>
      </div>
    );
  }

  // const missingFields = getMissingFields();
  // if (missingFields.length > 0) {
  //   return <ProfileCompletionWall missingFields={missingFields} />;
  // }





  const currentMatch = orderedPotentialMatches[currentCardIndex];
  
  // Debug: Log current state
  console.log('=== FINDPAGE RENDER ===');
  console.log('Current card index:', currentCardIndex);
  console.log('Swipe history length:', swipeHistory.length);
  console.log('Potential matches length:', potentialMatches.length);
  console.log('Current match:', currentMatch?.name, currentMatch?.id);

  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none text-white">
      {isMatchAnimationVisible && matchedUser && (
        <MatchAnimation matchedUser={matchedUser} onClose={hideMatchAnimation} />
      )}

      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-20 ${headerBg}`}>
        <div className="w-full max-w-md mx-auto flex items-center p-4 pt-safe-top">
          <button onClick={() => setIsFilterModalOpen(true)} className="p-2"><SlidersHorizontal className="w-6 h-6" /></button>
          <h1 className="text-2xl font-bold flex-1 text-center">{t('findTitle')}</h1>
          <Link to="/notifications" className="p-2 relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <div className={`absolute top-1 right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                isVip ? 'bg-amber-400 text-black' : isPro ? 'bg-[#ff7f50] text-black' : 'bg-pink-500'
              }`}>
                {unreadCount}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className={`absolute top-16 left-0 right-0 z-20 ${headerBg}`}>
        <div className="w-full max-w-md mx-auto px-4">
          <div className="flex justify-center items-center gap-8">
            <button
              onClick={() => { setActiveTab('views'); markViewsAsViewed(); }}
              className={`relative text-sm font-medium transition-all flex items-center gap-1 ${
                activeTab === 'views' 
                  ? `${isVip ? 'text-amber-400 border-amber-400' : isPro ? 'text-cyan-400 border-cyan-400' : 'text-pink-400 border-pink-400'} border-b-2 pb-1` 
                  : 'text-white/70 hover:text-white'
              }`}>
              {t('views')}
              {hasNewViews && usersWhoViewedMe.length > 0 && (
                <div className="absolute -top-1 -right-2 w-3 h-3 bg-yellow-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`text-sm font-medium transition-all ${
                activeTab === 'discover' 
                  ? `${isVip ? 'text-amber-400 border-amber-400' : isPro ? 'text-cyan-400 border-cyan-400' : 'text-pink-400 border-pink-400'} border-b-2 pb-1` 
                  : 'text-white/70 hover:text-white'
              }`}>{t('swipes')}</button>
            <button
              onClick={() => { setActiveTab('likes'); markLikesAsViewed(); }}
              className={`relative text-sm font-medium transition-all flex items-center gap-1 ${
                activeTab === 'likes' 
                  ? `${isVip ? 'text-amber-400 border-amber-400' : isPro ? 'text-cyan-400 border-cyan-400' : 'text-pink-400 border-pink-400'} border-b-2 pb-1` 
                  : 'text-white/70 hover:text-white'
              }`}>
              {t('likes')}
              {hasNewLikes && usersWhoLikedMe.length > 0 && (
                <div className="absolute -top-1 -right-2 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="absolute top-0 left-0 right-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] overflow-hidden">
        {activeTab === 'discover' && (
          <div className="h-full relative">
            {/* Photo Progress */}
            {currentMatch && (
              <div className="absolute bottom-2 left-4 right-4 z-20 flex space-x-1">
                {currentMatch.photos.map((_, index) => (
                  <div key={index} className="h-1.5 flex-1 rounded-full bg-white/30 backdrop-blur-sm">
                    <motion.div
                      className={`h-full rounded-full ${buttonStyle === 'white-clean' ? 'bg-white' : 'bg-yellow-500'}`}
                      initial={{ width: '0%' }}
                      animate={{ width: index === currentPhotoIndex ? '100%' : '0%' }}
                      transition={{ duration: 0.2, ease: 'linear' }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="absolute inset-0">
              <AnimatePresence initial={false}>
                {orderedPotentialMatches.slice(currentCardIndex).map((user, index) => (
                  <SwipeCard
                    key={user.id}
                    user={user}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onRewind={handleRewind}
                    onBoost={() => {}}
                    canSwipe={true}
                    isActive={index === 0}
                    currentPhotoIndex={currentPhotoIndex}
                    setCurrentPhotoIndex={setCurrentPhotoIndex}
                    canRewind={currentCardIndex > 0}
                    currentCardIndex={currentCardIndex}
                    swipeHistory={swipeHistory}
                  />
                ))}
              </AnimatePresence>

              {isFetching && orderedPotentialMatches.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="neon-spinner"></div>
                </div>
              )}

              {orderedPotentialMatches.length === 0 && !isFetching && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <h2 className="text-2xl font-bold mb-2">{t('noMoreProfiles')}</h2>
                  <p className="text-gray-300">{t('checkBackLater')}</p>
                  <button 
                    onClick={fetchPotentialMatches}
                    className={`mt-4 px-6 py-2 rounded-full font-medium transition-colors ${
                      isVip ? 'bg-amber-500 text-black hover:bg-amber-600' : 
                      isPro ? 'bg-cyan-500 text-black hover:bg-cyan-600' : 
                      'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    Load More Profiles
                  </button>
                </div>
              )}

              {currentCardIndex >= potentialMatches.length && !isLoading && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'}`}>
                  <h2 className="text-2xl font-bold mb-2">{t('noMoreProfiles')}</h2>
                  <p className="text-gray-300">{t('checkBackLater')}</p>
                  <button 
                    onClick={fetchPotentialMatches}
                    className={`mt-4 px-6 py-2 rounded-full font-medium transition-colors ${
                      isVip ? 'bg-amber-500 text-black hover:bg-amber-600' : 
                      isPro ? 'bg-cyan-500 text-black hover:bg-cyan-600' : 
                      'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    Load More Profiles
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'views' && (
          <div className={`h-full overflow-y-auto p-4 pb-20 mt-16 ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'}`}>
            <h2 className="text-xl font-bold mb-4">{t('views')}</h2>
            {usersWhoViewedMe.length === 0 ? (
              <p className="text-center text-gray-400 mt-8">No Views Yet</p>
            ) : (
              <div className="space-y-3">
                {usersWhoViewedMe.map((user) => (
                  <UserListItem key={user.id} user={user} type="view" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className={`h-full overflow-y-auto p-4 pb-20 mt-16 ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'}`}>
            <h2 className="text-xl font-bold mb-4">{t('likes')}</h2>
            {usersWhoLikedMe.length === 0 ? (
              <p className="text-center text-gray-400 mt-8">No Likes Yet</p>
            ) : (
              <div className="space-y-3">
                {usersWhoLikedMe.map((user) => (
                  <UserListItem 
                    key={user.id} 
                    user={user} 
                    type="like" 
                    onLikeBack={handleLikeBack}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyFilters} />
    </div>
  );
};

export default FindPage;
