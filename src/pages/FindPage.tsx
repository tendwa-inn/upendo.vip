import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSwipeStore } from '../stores/swipeStore';
import { useMatchStore } from '../stores/matchStore.tsx';

import { useDiscoveryStore } from '../stores/discoveryStore';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { DELUXE_BUTTONS } from '../config/deluxeButtons';
import { useNotificationStore } from '../stores/notificationStore';
import { useLikesStore } from '../stores/likesStore';
import { useViewsStore } from '../stores/viewsStore';
import usePresenceStore from '../stores/presenceStore';
import SwipeCard from '../components/swipe/SwipeCard';
import AdCard from '../components/swipe/AdCard';
import EngagementAdModal from '../components/modals/EngagementAdModal';
import UserListItem from '../components/UserListItem';
import { adService, Ad } from '../services/adService';
import FilterModal from '../components/modals/FilterModal';
import { SlidersHorizontal, Bell, Eye, Heart, Loader2, Ghost, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recalcVisibilityForCurrentUser } from '../services/visibilityService';
import { useCurrentTheme } from '../stores/colorThemeStore';
import PhotoWall from '../components/PhotoWall';
import ProfileCompletionWall from '../components/ProfileCompletionWall';
import MatchAnimation from '../components/modals/MatchAnimation';
import { useMatchAnimationStore } from '../stores/matchAnimationStore';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator';

const FindPage: React.FC = () => {
  const { swipeRight, swipeLeft, loadSwipeState, rewind } = useSwipeStore();
  const { potentialMatches, fetchPotentialMatches, isFetching } = useDiscoveryStore();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<string[]>([]);
  const previousCardIndexRef = useRef(0);
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

  // Ad system state
  const [swipeAds, setSwipeAds] = useState<Ad[]>([]);
  const [engagementAds, setEngagementAds] = useState<Ad[]>([]);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [selectedEngagementAd, setSelectedEngagementAd] = useState<Ad | null>(null);
  const [bonusSwipes, setBonusSwipes] = useState(0);
  const acct = (profile as any)?.account_type || (profile as any)?.subscription || 'free';
  const isFreeUser = acct === 'free';

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    try {
      // Refresh potential matches
      await fetchPotentialMatches();
      
      // Refresh notifications
      await fetchNotifications();
      
      // Refresh likes and views
      await Promise.all([
        fetchUsersWhoLikedMe(),
        fetchUsersWhoViewedMe(),
      ]);
      
      toast.success(t('toast.contentRefreshed'));
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error(t('toast.contentRefreshFailed'));
    }
  };

  const { pullState, getPullStyles, getRefreshIndicatorProps, containerRef } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: activeTab !== 'discover',
  });

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

  // Age calculation utility
  const calcAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const now = new Date();
    let a = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
      a--;
    }
    return a;
  };





  useEffect(() => {
    if (!currentUser) return;

    // Load swipe state
    loadSwipeState();

    // Fetch initial data
    Promise.all([
      fetchPotentialMatches(),
      fetchUsersWhoLikedMe(),
      fetchUsersWhoViewedMe(),
      fetchNotifications()
    ]).then(() => {
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [currentUser, fetchPotentialMatches, fetchUsersWhoLikedMe, fetchUsersWhoViewedMe, fetchNotifications]);

  // Load ads and bonus swipes
  useEffect(() => {
    if (!currentUser) return;
    const loadAds = async () => {
      try {
        const [swipe, engagement, bonus] = await Promise.all([
          adService.getActiveSwipeAds(),
          adService.getActiveEngagementAds(),
          adService.getTotalBonusSwipes(currentUser.id),
        ]);
        setSwipeAds(swipe);
        setEngagementAds(engagement);
        setBonusSwipes(bonus);
      } catch (err) {
        console.error('Failed to load ads:', err);
      }
    };
    loadAds();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    if (activeTab === 'likes') {
      fetchUsersWhoLikedMe();
    }

    if (activeTab === 'discover') {
      fetchPotentialMatches();
    }
  }, [activeTab, currentUser]);

  // Auto-refill: fetch more profiles when running low, reset index when exhausted
  useEffect(() => {
    if (isFetching || potentialMatches.length === 0) return;

    if (currentCardIndex >= potentialMatches.length - 3) {
      fetchPotentialMatches();
    }

    if (currentCardIndex >= potentialMatches.length) {
      setCurrentCardIndex(0);
      setSwipeHistory([]);
    }
  }, [currentCardIndex, potentialMatches.length, isFetching, fetchPotentialMatches]);

  // Augmented deck: interleave ads every N swipes (no cap — ads repeat throughout)
  const augmentedDeck = useMemo(() => {
    if (swipeAds.length === 0) return potentialMatches.map(u => ({ type: 'user' as const, data: u }));
    const deck: { type: 'user' | 'ad'; data: any }[] = [];
    let userCount = 0;
    let adIndex = 0;
    const freq = swipeAds[0]?.frequency || 5;
    for (const user of potentialMatches) {
      deck.push({ type: 'user', data: user });
      userCount++;
      if (userCount % freq === 0) {
        deck.push({ type: 'ad', data: swipeAds[adIndex % swipeAds.length] });
        adIndex++;
      }
    }
    return deck;
  }, [potentialMatches, swipeAds]);

  const handleAdDismiss = React.useCallback(() => {
    setCurrentCardIndex(prev => prev + 1);
  }, []);

  const handleWatchAd = React.useCallback((ad: Ad) => {
    setSelectedEngagementAd(ad);
    setShowEngagementModal(true);
  }, []);

  const handleEngagementComplete = React.useCallback(async () => {
    if (!currentUser || !selectedEngagementAd) return;
    try {
      await adService.recordCompletion(currentUser.id, selectedEngagementAd.id);
      await adService.grantRewardSwipes(currentUser.id, selectedEngagementAd.id, selectedEngagementAd.reward_swipes);
      const newTotal = await adService.getTotalBonusSwipes(currentUser.id);
      setBonusSwipes(newTotal);
      toast.success(`You earned ${selectedEngagementAd.reward_swipes} free swipes!`);
    } catch (err) {
      toast.error(t('toast.completionFailed'));
    }
    setShowEngagementModal(false);
    setSelectedEngagementAd(null);
  }, [currentUser, selectedEngagementAd]);


  const handleSwipeRight = React.useCallback(async (userId: string) => {
    const swipedUser = potentialMatches.find((u) => u.id === userId);
    if (!swipedUser) return;

    // Check if free user has swipes left (including bonus)
    const { swipeCount } = useSwipeStore.getState();
    const LIMITS = { free: 35, pro: 150, vip: 300 };
    const limit = LIMITS[acct as keyof typeof LIMITS] || LIMITS.free;
    if (isFreeUser && swipeCount >= limit && bonusSwipes <= 0) {
      // Show engagement ads if available
      if (engagementAds.length > 0) {
        const available = engagementAds[0];
        handleWatchAd(available);
      } else {
        toast.error(t('toast.noMoreSwipes'));
      }
      return;
    }

    // Use bonus swipe if over limit
    if (isFreeUser && swipeCount >= limit && bonusSwipes > 0) {
      const used = await adService.useBonusSwipe(currentUser!.id);
      if (used) setBonusSwipes(prev => Math.max(0, prev - 1));
    }

    const { matched, matchId } = await swipeRight(userId);

    if (matched) {
      if (matchId) {
        useMatchAnimationStore.getState().showMatchAnimation(swipedUser, matchId);
      }
    }

    setSwipeHistory(prev => [...prev, userId]);
    setCurrentCardIndex(prev => prev + 1);
  }, [potentialMatches, swipeRight, currentCardIndex, swipeHistory, acct, isFreeUser, bonusSwipes, engagementAds, handleWatchAd, currentUser]);

  const handleSwipeLeft = React.useCallback((userId: string) => {
    swipeLeft(userId);
    setSwipeHistory(prev => [...prev, userId]);
    setCurrentCardIndex(prev => prev + 1);
  }, [swipeLeft, currentCardIndex, potentialMatches.length, swipeHistory]);

  const handleRewind = React.useCallback(async () => {
    const success = await rewind();
    if (success) {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
        setSwipeHistory(prev => prev.slice(0, -1));
      }
    } else {
      toast.error(t('toast.noMoreRewinds'));
    }
  }, [rewind, currentCardIndex]);

  const handleApplyFilters = React.useCallback((newFilters: any) => setFilters(newFilters), []);

  const handleLikeBack = React.useCallback(async (userId: string) => {
    await createMatch(userId);
    await removeLike(userId);
    useDiscoveryStore.getState().removePotentialMatch(userId);
  }, [createMatch, removeLike]);

  const getMissingFields = React.useCallback(() => {
    const missing = [];
    if (!profile?.bio) missing.push('Add a bio');
    if (!profile?.hereFor) missing.push('Set what you are here for');
    if (!profile?.photos || profile.photos.length < 1) missing.push('Upload at least one photo');
    return missing;
  }, [profile]);

  const theme = useCurrentTheme(acct || 'free');

  const headerBg = activeTab !== 'discover'
    ? theme.stickyHeader
    : 'bg-transparent';

  if (isLoading) {
    return (
      <div className={`fixed inset-0 overflow-hidden text-white ${theme.background} flex flex-col items-center justify-center`}>
        <div className={`animate-spin mb-4 ${theme.accent.loading}`}>
          <Ghost className="w-14 h-14" />
        </div>
        <p className="text-white/70 text-sm">{t('findingMatches') || 'Finding matches...'}</p>
      </div>
    );
  }

  // Check profile completeness
  const missingFields = getMissingFields();
  
  // Temporarily bypass profile completion wall for debugging
  // if (missingFields.length > 0) {
  //   return <ProfileCompletionWall missingFields={missingFields} />;
  // }





  const currentDeckItem = swipeAds.length > 0 && augmentedDeck.length > 0
    ? augmentedDeck[Math.min(currentCardIndex, augmentedDeck.length - 1)]
    : null;
  const isCurrentAd = currentDeckItem?.type === 'ad';

  // For photo progress bar: only show for user cards (not ads)
  // When using augmented deck, find the user from the deck item data
  const currentMatch = !isCurrentAd && currentDeckItem?.type === 'user'
    ? currentDeckItem.data
    : !isCurrentAd && potentialMatches.length > 0
      ? potentialMatches[Math.min(currentCardIndex, potentialMatches.length - 1)]
      : null;

  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none text-white">
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator 
        pullDistance={pullState.pullDistance}
        isRefreshing={pullState.isRefreshing}
        threshold={80}
      />
      
      {isMatchAnimationVisible && matchedUser && (
        <MatchAnimation matchedUser={matchedUser} onClose={hideMatchAnimation} />
      )}

      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-20 ${headerBg}`}>
        <div className="w-full max-w-md mx-auto flex items-center p-4 pt-safe-top">
          <button onClick={() => setIsFilterModalOpen(true)} className="p-2"><SlidersHorizontal className="w-6 h-6" /></button>
          <h1 className="text-xl font-bold flex-1 text-center">{t('findTitle')}</h1>
          <Link to="/notifications" className="p-2 relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 bg-red-500 text-white z-10">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
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
                  ? `${theme.primary} border-b-2 border-current pb-1`
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
                  ? `${theme.primary} border-b-2 border-current pb-1`
                  : 'text-white/70 hover:text-white'
              }`}>{t('swipes')}</button>
            <button
              onClick={() => { setActiveTab('likes'); markLikesAsViewed(); }}
              className={`relative text-sm font-medium transition-all flex items-center gap-1 ${
                activeTab === 'likes'
                  ? `${theme.primary} border-b-2 border-current pb-1`
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
      <div className="absolute top-0 left-0 right-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] overflow-hidden pt-safe-top">
        {activeTab === 'discover' && (
          <div ref={containerRef} className="h-full relative pull-refresh-container" style={getPullStyles()}>
            {/* Photo Progress */}
            {currentMatch && !isCurrentAd && (() => {
              const seekColors: Record<string, string> = {
                'white-clean': 'bg-white',
                'upendo-color': 'bg-yellow-500',
                'vintage': 'bg-white',
                'upendo-205': 'bg-yellow-500',
                'neon-cyber': 'bg-fuchsia-400',
                'neon-violet': 'bg-purple-400',
                'neon-ice': 'bg-cyan-400',
                'neon-solar': 'bg-amber-400',
                'neon-midnight': 'bg-violet-400',
                'neon-tangerine': 'bg-orange-400',
                'neon-flamingo': 'bg-pink-400',
                'neon-lime': 'bg-lime-400',
                'classic-glass': 'bg-white/60',
                'classic-chrome': 'bg-gray-300',
                'classic-copper': 'bg-amber-500',
                'classic-mono': 'bg-white',
                'classic-slate': 'bg-slate-400',
                'classic-gold': 'bg-amber-400',
                'glowy-aurora': 'bg-emerald-400',
                'glowy-ember': 'bg-red-400',
                'glowy-ocean': 'bg-cyan-400',
                'glowy-rose': 'bg-rose-400',
                'pop-bubble': 'bg-pink-400',
                'pop-confetti': 'bg-emerald-400',
              };

              // Deluxe styles use config-driven seek bar
              const isDeluxe = buttonStyle.startsWith('deluxe-');
              let seekColor = seekColors[buttonStyle] || 'bg-yellow-500';
              let seekHeight = 'h-1.5';
              let seekRounded = 'rounded-full';
              let seekGlow = '';
              let seekTrackColor = 'bg-white/30';

              if (isDeluxe) {
                const deluxe = DELUXE_BUTTONS[buttonStyle];
                if (deluxe?.seek) {
                  seekColor = deluxe.seek.color;
                  seekHeight = deluxe.seek.height || 'h-1';
                  seekRounded = deluxe.seek.rounded || 'rounded-full';
                  seekGlow = deluxe.seek.glow || '';
                  seekTrackColor = deluxe.seek.trackColor || 'bg-white/20';
                }
              }

              return (
                <div className="absolute bottom-2 left-4 right-4 z-20 flex space-x-1">
                  {currentMatch.photos.map((_, index) => (
                    <div key={index} className={`${seekHeight} flex-1 ${seekRounded} ${seekTrackColor} backdrop-blur-sm`}>
                      <motion.div
                        className={`h-full ${seekRounded} ${seekColor} ${seekGlow}`}
                        initial={{ width: '0%' }}
                        animate={{ width: index === currentPhotoIndex ? '100%' : '0%' }}
                        transition={{ duration: 0.2, ease: 'linear' }}
                      />
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="absolute inset-0">
              <AnimatePresence initial={false}>
                {swipeAds.length > 0
                  ? augmentedDeck.slice(currentCardIndex).map((item, index) =>
                      item.type === 'ad' ? (
                        <AdCard
                          key={`ad-${item.data.id}-${currentCardIndex + index}`}
                          ad={item.data}
                          onDismiss={handleAdDismiss}
                          isActive={index === 0}
                        />
                      ) : (
                        <SwipeCard
                          key={item.data.id}
                          user={item.data}
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
                      )
                    )
                  : potentialMatches.slice(currentCardIndex).map((user, index) => (
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
                    ))
                }
              </AnimatePresence>

              {isFetching && potentialMatches.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
                  <div className={`animate-spin mb-4 ${theme.accent.loading}`}>
                    <Ghost className="w-14 h-14" />
                  </div>
                  <p className="text-white/70 text-sm">{t('findingMatches') || 'Finding matches...'}</p>
                </div>
              )}

              {potentialMatches.length === 0 && !isFetching && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <h2 className="text-xl font-bold mb-2">{t('noMoreProfiles')}</h2>
                  <p className="text-gray-300">{t('checkBackLater')}</p>
                  <button
                    onClick={() => fetchPotentialMatches()}
                    className={`mt-4 px-6 py-2 rounded-full font-medium transition-colors ${theme.button.primary} ${theme.button.primaryHover} text-white`}
                  >
                    Load More Profiles
                  </button>
                </div>
              )}

              {currentCardIndex >= potentialMatches.length && !isLoading && potentialMatches.length > 0 && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 ${theme.background}`}>
                  <h2 className="text-xl font-bold mb-2">{t('noMoreProfiles')}</h2>
                  <p className="text-gray-300">{t('checkBackLater')}</p>
                  {isFreeUser && engagementAds.length > 0 && (
                    <button
                      onClick={() => handleWatchAd(engagementAds[0])}
                      className="mt-4 px-6 py-3 rounded-full font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-600 hover:to-amber-600 transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
                    >
                      Watch Ad for Free Swipes
                    </button>
                  )}
                  <button
                    onClick={() => fetchPotentialMatches()}
                    className={`mt-3 px-6 py-2 rounded-full font-medium transition-colors ${theme.button.primary} ${theme.button.primaryHover} text-white`}
                  >
                    Load More Profiles
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'views' && (
          <div className={`h-full overflow-y-auto p-4 pb-20 mt-16 ${theme.background}`}>
            <h2 className="text-lg font-bold mb-4">{t('views')}</h2>
            {usersWhoViewedMe.length === 0 ? (
              <p className="text-center text-gray-400 mt-8">{t('find.noViewsYet')}</p>
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
          <div className={`h-full overflow-y-auto p-4 pb-20 mt-16 ${theme.background}`}>
            <h2 className="text-lg font-bold mb-4">{t('likes')}</h2>
            {usersWhoLikedMe.length === 0 ? (
              <p className="text-center text-gray-400 mt-8">{t('find.noLikesYet')}</p>
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

      {/* Engagement Ad Modal */}
      {selectedEngagementAd && (
        <EngagementAdModal
          isOpen={showEngagementModal}
          ad={selectedEngagementAd}
          onClose={() => { setShowEngagementModal(false); setSelectedEngagementAd(null); }}
          onComplete={handleEngagementComplete}
        />
      )}

      {/* Bonus Swipe Indicator */}
      {isFreeUser && bonusSwipes > 0 && activeTab === 'discover' && (
        <div className="absolute top-[4.5rem] right-4 z-30 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">{bonusSwipes} bonus</span>
        </div>
      )}
    </div>
  );
};

export default FindPage;
