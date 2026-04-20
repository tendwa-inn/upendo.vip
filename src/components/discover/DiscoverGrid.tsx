import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../stores/authStore';
import usePresenceStore from '../../stores/presenceStore';
import { User } from '../../types';
import { MapPin, MessageSquare, Lock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMatchStore } from '../../stores/matchStore.tsx';
import { useMatchAnimationStore } from '../../stores/matchAnimationStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const DiscoverGrid: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<string>('');
  const { onlineUsers } = usePresenceStore();
  const { createMatch } = useMatchStore();
  const { showMatchAnimation } = useMatchAnimationStore.getState();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const { user: currentUser, profile, messageRequestsSent, messageRequestResetDate, incrementMessageRequests } = useAuthStore();
  const { t } = useTranslation();

  const VIBES = ['Normal', 'Playful', 'Chill', 'Creative', 'Curious', 'Naughty', 'Mellow', 'Energetic', 'Wanna go out', 'Cooking', 'Travelling', 'Inter-racial dating'];
  const FREE_VIBES = ['Normal', 'Playful', 'Chill', 'Creative', 'Curious', 'Mellow'];
  const DAILY_MS = 24 * 60 * 60 * 1000;
  const isPremium =
    profile?.subscription === 'pro' ||
    profile?.subscription === 'vip' ||
    (profile as any)?.accountType === 'pro' ||
    (profile as any)?.accountType === 'vip';
  const COMPATIBILITY_THRESHOLD = Number(localStorage.getItem('compatThreshold') || 3);

  const todaySeed = () => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  };
  const hashString = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };
  const seededIndex = (key: string, modulo: number) => hashString(`${todaySeed()}|${key}`) % modulo;
  const assignedVibeForId = (id: string) => VIBES[seededIndex(id, VIBES.length)];
  const effectiveVibeForUser = (u: any) => {
    const expiresAt = u?.daily_vibe_expires_at || u?.dailyVibeExpiresAt;
    const value = u?.daily_vibe || u?.dailyVibe;
    const now = Date.now();
    if (value && expiresAt && new Date(expiresAt).getTime() > now) return value;
    return assignedVibeForId(u?.id || '');
  };
  const seededShuffle = <T,>(arr: T[], seedKey: string) => {
    const a = [...arr];
    let seed = hashString(`${todaySeed()}|${seedKey}`);
    for (let i = a.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  useEffect(() => {
    // Prefer persisted profile vibe if present and valid
    const now = Date.now();
    const persistedValue = (profile as any)?.dailyVibe;
    const persistedExpires = (profile as any)?.dailyVibeExpiresAt;
    if (persistedValue && persistedExpires && new Date(persistedExpires).getTime() > now) {
      setSelectedVibe(!isPremium && !FREE_VIBES.includes(persistedValue) ? 'Normal' : persistedValue);
      return;
    }
    // Fallback to localStorage
    const key = 'dailyVibe';
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.value && parsed.expiresAt && parsed.expiresAt > now) {
          let valueToUse = parsed.value;
          if (!isPremium && !FREE_VIBES.includes(valueToUse)) valueToUse = 'Normal';
          setSelectedVibe(valueToUse);
          return;
        }
      } catch {}
    }
    // Default
    setSelectedVibe('Normal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, isPremium, (profile as any)?.dailyVibe, (profile as any)?.dailyVibeExpiresAt]);

  const setVibeForToday = async (v: string) => {
    const key = 'dailyVibe';
    const now = Date.now();
    const raw = localStorage.getItem(key);
    if (!isPremium && !FREE_VIBES.includes(v)) {
      toast.error(t('discover.vibes.upgradeToast'));
      return;
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        let { windowStart, changeCount, expiresAt } = parsed;
        if (!windowStart || now - windowStart >= DAILY_MS) {
          windowStart = now;
          changeCount = 0;
          expiresAt = now + DAILY_MS;
        }
        const limit = isPremium ? 5 : 1;
        if (changeCount >= limit) {
          const suffix = limit > 1 ? 's' : '';
          toast.error(t('discover.vibes.changeLimit', { count: limit, suffix }));
          return;
        }
        if (!isPremium && !FREE_VIBES.includes(parsed.value)) {
          // Normalize invalid stored value for free users
          parsed.value = 'Normal';
        }
        const next = { value: v, expiresAt, windowStart, changeCount: changeCount + 1 };
        localStorage.setItem(key, JSON.stringify(next));
        setSelectedVibe(v);
        // Persist to Supabase so others see it
        const expiresIso = new Date(expiresAt).toISOString();
        await useAuthStore.getState().updateUserProfile({ dailyVibe: v, dailyVibeExpiresAt: expiresIso });
        return;
      } catch {}
    }
    // Fallback create record
    const initialCount = 1;
    const record = { value: v, expiresAt: now + DAILY_MS, windowStart: now, changeCount: initialCount };
    localStorage.setItem(key, JSON.stringify(record));
    setSelectedVibe(v);
    // Persist to Supabase
    const expiresIso = new Date(now + DAILY_MS).toISOString();
    await useAuthStore.getState().updateUserProfile({ dailyVibe: v, dailyVibeExpiresAt: expiresIso });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      const { data, error } = await supabase.rpc('get_discover_users', { current_user_id: currentUser.id, count: 15 });

      if (error) {
        console.error('Error fetching discover users:', error);
        return;
      }
      const usersWithPhotos = (data as User[]).filter(user => user.photos && user.photos.length > 0);
      setUsers(usersWithPhotos);
      // Hydrate likedIds so the heart stays hidden after navigation
      try {
        const likedIdList = usersWithPhotos.map(u => u.id);
        if (likedIdList.length > 0) {
          const { data: likesRows, error: likesErr } = await supabase
            .from('likes')
            .select('liked_id')
            .eq('liker_id', currentUser.id)
            .in('liked_id', likedIdList);
          if (!likesErr && likesRows) {
            setLikedIds(new Set(likesRows.map((r: any) => r.liked_id)));
          }
        }
      } catch (e) {
        console.warn('Could not hydrate likedIds:', e);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const canSendMessageRequest = () => {
    if (!profile) return false;
    if (profile.subscription === 'pro' || profile.subscription === 'vip') return true;

    const now = new Date();
    if (messageRequestResetDate && now < messageRequestResetDate) {
      return messageRequestsSent < 5;
    } else {
      // Reset the count if the reset date has passed
      // This should ideally be handled by a backend job, but we can do it here for now
      return true;
    }
  };

  const getCity = (location: any) => {
    if (!location) return "Unknown";
    if (typeof location === "string") return location;
    return location.city || location.name || "Unknown";
  };

  const calculateAge = (dob: string | Date) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDistance = (distanceInMeters: number | null) => {
    if (distanceInMeters === null || typeof distanceInMeters === 'undefined') {
      return null;
    }
    const km = Math.max(1, Math.ceil(distanceInMeters / 1000));
    return t('distance.kmAway', { count: km });
  };

  const handleSendMessageRequest = (userId: string) => {
    // Per-tier message request limits in Discovery
    const tier = getAccountTier();
    const msgLimit = tier === 'vip' ? 15 : tier === 'pro' ? 7 : 3;
    const key = 'discoveryMsgWindow';
    const now = Date.now();
    const raw = localStorage.getItem(key);
    let windowStart = now;
    let count = 0;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.windowStart && now - parsed.windowStart < 24 * 60 * 60 * 1000) {
          windowStart = parsed.windowStart;
          count = parsed.count || 0;
        }
      } catch {}
    }
    if (count >= msgLimit) {
      toast.error(t('discover.messageRequest.limitReached', { count: msgLimit }));
      return;
    }
    console.log(`Sending message request to ${userId}`);
    incrementMessageRequests();
    if (!currentUser) return;
    // Create a pending message request and notify the receiver
    supabase
      .from('message_requests')
      .insert({ sender_id: currentUser.id, receiver_id: userId, status: 'pending' })
      .then();
    supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'message-request',
        title: 'Message Request',
        message: 'Someone wants to chat with you',
        actor_id: currentUser.id,
      })
      .then();
    toast.success(t('toast.messageRequest.sent'));
    // Record local window count
    localStorage.setItem(key, JSON.stringify({ windowStart, count: count + 1 }));
  };

  const getAccountTier = (): 'free' | 'pro' | 'vip' => {
    const t = (profile?.subscription || (profile as any)?.accountType || 'free') as string;
    if (t === 'vip') return 'vip';
    if (t === 'pro') return 'pro';
    return 'free';
  };

  const getLikeLimitByTier = () => {
    const tier = getAccountTier();
    if (tier === 'vip') return 75;
    if (tier === 'pro') return 50;
    return 10; // free
  };

  const canLikeInDiscovery = () => {
    const limit = getLikeLimitByTier();
    const key = 'discoveryLikesWindow';
    const now = Date.now();
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.windowStart || now - parsed.windowStart >= 24 * 60 * 60 * 1000) {
          localStorage.setItem(key, JSON.stringify({ windowStart: now, count: 0 }));
          return true;
        }
        return parsed.count < limit;
      } catch {}
    }
    localStorage.setItem(key, JSON.stringify({ windowStart: now, count: 0 }));
    return true;
  };

  const recordDiscoveryLike = () => {
    const key = 'discoveryLikesWindow';
    const now = Date.now();
    const raw = localStorage.getItem(key);
    let windowStart = now;
    let count = 0;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.windowStart && now - parsed.windowStart < 24 * 60 * 60 * 1000) {
          windowStart = parsed.windowStart;
          count = (parsed.count || 0) + 1;
        }
      } catch {}
    } else {
      count = 1;
    }
    localStorage.setItem(key, JSON.stringify({ windowStart, count }));
  };

  const getDiscoveryLikesRemaining = () => {
    const limit = getLikeLimitByTier();
    if (!isFinite(limit)) return Infinity;
    const key = 'discoveryLikesWindow';
    const now = Date.now();
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.windowStart || now - parsed.windowStart >= 24 * 60 * 60 * 1000) {
          return limit;
        }
        const used = parsed.count || 0;
        return Math.max(0, limit - used);
      } catch {
        return limit;
      }
    }
    return limit;
  };

  const handleLikeUser = async (targetId: string) => {
    const current = currentUser;
    if (!current) return;
    if (!canLikeInDiscovery()) {
      toast.error(t('discover.likes.limitReached'));
      return;
    }
    try {
      await supabase.from('likes').insert({ liker_id: current.id, liked_id: targetId });
      recordDiscoveryLike();
      setLikedIds(prev => {
        const next = new Set(prev);
        next.add(targetId);
        return next;
      });
      // Check for mutual like -> create match
      const { data: reciprocal } = await supabase
        .from('likes')
        .select('id')
        .match({ liker_id: targetId, liked_id: current.id })
        .limit(1)
        .maybeSingle();
      if (reciprocal) {
        await createMatch(targetId);
        const matchedUser = users.find(u => u.id === targetId) || { id: targetId, name: 'Someone', photos: [] };
        showMatchAnimation(matchedUser);
      } else {
        toast.success(t('discover.likes.sent'));
      }
    } catch (e) {
      console.error('Error sending like:', e);
      toast.error(t('discover.likes.error'));
    }
  };
  const acct = (profile?.subscription || (profile as any)?.accountType) as string | undefined;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';
  return (
    <div>
      <h2 className={`text-2xl font-bold mb-2 ${isVip ? 'text-amber-400' : isPro ? 'text-[#ff7f50]' : 'text-white'}`}>{isVip ? t('discover.dailyVibes.titleVip') : isPro ? t('discover.dailyVibes.titlePro') : t('discover.dailyVibes.title')}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {VIBES.map(v => {
          const locked = !isPremium && !FREE_VIBES.includes(v);
          return (
            <button
              key={v}
              onClick={() => !locked && setVibeForToday(v)}
              className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${
                selectedVibe === v && !locked
                  ? ((profile as any)?.accountType === 'vip'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-400'
                      : ((profile as any)?.accountType === 'pro'
                          ? 'bg-[#ff7f50] text-white border-[#ff5e57]'
                          : 'bg-pink-600 text-white border-pink-500'))
                  : locked
                    ? 'bg-white/5 text-white/40 border-white/10'
                    : 'bg-white/10 text-white/80 border-white/20'
              } ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              title={locked ? t('discover.vibes.tooltip.locked') : t('discover.vibes.tooltip.setToday')}
            >
              {locked && <Lock className="w-3 h-3" />}
              <span>
                {v === 'Normal' ? t('discover.vibes.normal')
                  : v === 'Playful' ? t('discover.vibes.playful')
                  : v === 'Chill' ? t('discover.vibes.chill')
                  : v === 'Creative' ? t('discover.vibes.creative')
                  : v === 'Curious' ? t('discover.vibes.curious')
                  : v === 'Naughty' ? t('discover.vibes.naughty')
                  : v === 'Mellow' ? t('discover.vibes.mellow')
                  : v === 'Energetic' ? t('discover.vibes.energetic')
                  : v === 'Wanna go out' ? t('discover.vibes.wannaGoOut')
                  : v === 'Cooking' ? t('discover.vibes.cooking')
                  : v === 'Travelling' ? t('discover.vibes.travelling')
                  : v === 'Inter-racial dating' ? t('discover.vibes.interRacialDating')
                  : v}
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {seededShuffle(
          users
            .filter(u => {
              const distM = (u as any).distance_meters ?? null;
              const within = distM === null ? true : (distM >= 5000 && distM <= 40000);
              const uv = effectiveVibeForUser(u);
              const vibeMatch = selectedVibe ? uv === selectedVibe : true;
              return within && vibeMatch;
            }),
          currentUser?.id || 'seed'
        ).map((user) => (
          <Link to={`/user/${user.id}`} key={user.id} className="relative flex flex-col items-center space-y-2">
            <div className={`relative w-16 h-16 rounded-full overflow-hidden ${
              (profile as any)?.accountType === 'vip'
                ? 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                : ((profile as any)?.accountType === 'pro' ? 'ring-2 ring-[#ff7f50]/60' : '')
            }`}>
              <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
              {onlineUsers.hasOwnProperty(user.id) && (
                <div className={`absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 ${
                  (profile as any)?.accountType === 'vip' ? 'border-amber-300' : 'border-white'
                }`}></div>
              )}
            </div>
            <div className="text-center">
              <h3 className={`font-bold text-xs ${isVip ? 'text-white' : isPro ? 'text-[#ffecd3]' : 'text-white'}`}>{user.name}, {calculateAge(user.dateOfBirth || (user as any).dob)}</h3>
              <div className="flex items-center justify-center text-white/80 text-xs mt-1">
                <span>{formatDistance((user as any).distance_meters || 0)}</span>
              </div>
            </div>
            {(() => {
              const likesRemaining = getDiscoveryLikesRemaining();
              const isProVipLocal =
                profile?.subscription === 'pro' ||
                profile?.subscription === 'vip' ||
                (profile as any)?.accountType === 'pro' ||
                (profile as any)?.accountType === 'vip';
              const canShowLike = isProVipLocal || likesRemaining > 0;

              const self = profile as any || {};
              const other = user as any || {};
              const interestsSelf: string[] = self?.interests || [];
              const interestsOther: string[] = other?.interests || [];
              const interestsOverlap = interestsSelf.filter((i: string) => interestsOther.includes(i)).length;
              const hereForSelf: string[] = self?.hereFor || [];
              const hereForOther: string[] = other?.hereFor || [];
              const hereOverlap = hereForSelf.filter((h: string) => hereForOther.includes(h)).length;
              const drinkMatch = self?.drinking && other?.drinking && self.drinking === other.drinking;
              const smokeMatch = self?.smoking && other?.smoking && self.smoking === other.smoking;
              const ageSelf = calculateAge(self?.dateOfBirth || self?.dob);
              const ageOther = calculateAge(other?.dateOfBirth || other?.dob);
              const ageClose = (typeof ageSelf === 'number' && typeof ageOther === 'number') ? Math.abs(ageSelf - ageOther) <= 3 : false;
              const compatibleScore = (interestsOverlap >= 2 ? 1 : 0) + (hereOverlap >= 1 ? 1 : 0) + (drinkMatch ? 1 : 0) + (smokeMatch ? 1 : 0) + (ageClose ? 1 : 0);
              const highlyCompatible = compatibleScore >= 3;

              return (
                <>
                  {canShowLike && !likedIds.has(user.id) && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLikeUser(user.id);
                      }}
                      className={`absolute top-0 left-0 w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-50 ${
                        (profile as any)?.accountType === 'vip'
                          ? 'bg-amber-500/30 text-amber-300'
                          : ((profile as any)?.accountType === 'pro'
                              ? 'bg-[#ff7f50]/20 text-[#ff7f50]'
                              : 'bg-white/20 backdrop-blur-lg text-white')
                      }`}
                      title={isProVipLocal ? t('discover.likes.tooltip.like') : likesRemaining > 0 ? t('discover.likes.tooltip.likeRemaining', { count: likesRemaining }) : t('discover.likes.tooltip.limit')}
                      disabled={likedIds.has(user.id)}
                    >
                      <Heart
                        size={16}
                        className={(profile as any)?.accountType === 'vip' ? 'text-amber-300' : ((profile as any)?.accountType === 'pro' ? 'text-[#ff7f50]' : 'text-pink-500')}
                        fill={likedIds.has(user.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  )}
                  {highlyCompatible && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendMessageRequest(user.id);
                      }}
                      className={`absolute top-0 right-0 w-7 h-7 rounded-full flex items-center justify-center ${
                        (profile as any)?.accountType === 'vip'
                          ? 'bg-amber-500/30 text-amber-300'
                          : ((profile as any)?.accountType === 'pro'
                              ? 'bg-[#ff7f50]/20 text-[#ff7f50]'
                              : 'bg-white/20 backdrop-blur-lg text-white')
                      }`}
                      title={t('discover.messageRequest.tooltip')}
                    >
                      <MessageSquare size={16} />
                    </button>
                  )}
                </>
              );
            })()}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DiscoverGrid;
