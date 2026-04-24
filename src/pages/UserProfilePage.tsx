import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Heart, MoreVertical, Flag, Ban, X, Crown, Shield, MapPin, Ghost, Check } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useMatchStore } from '../stores/matchStore.tsx';
import MatchAnimation from '../components/modals/MatchAnimation';
import { useMatchAnimationStore } from '../stores/matchAnimationStore';
import toast from 'react-hot-toast';
import { useLikesStore } from '../stores/likesStore';
import { reportService } from '../services/reportService';
import { blockService } from '../services/blockService';
import { viewService } from '../services/viewService';
import FullScreenImageViewer from '../components/common/FullScreenImageViewer';
import ReportUserModal from '../components/modals/ReportUserModal';
import VerificationBadge from '../components/VerificationBadge';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';

const UserProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const VIBES = ['Normal', 'Playful', 'Chill', 'Creative', 'Curious', 'Naughty', 'Mellow', 'Energetic', 'Wanna go out', 'Cooking', 'Travelling', 'Inter-racial dating'];
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
  const { userId } = useParams<{ userId: string }>();
  const { theme } = useThemeStore();
  const { user: authUser, profile: currentProfile } = useAuthStore();
  const { createMatch, matches, selectMatch } = useMatchStore();
  const { usersWhoLikedMe, fetchUsersWhoLikedMe } = useLikesStore();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { isMatchAnimationVisible, matchedUser, showMatchAnimation, hideMatchAnimation } = useMatchAnimationStore();
  const [likedSent, setLikedSent] = useState(false);
  const [isBlockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isSendingLike, setIsSendingLike] = useState(false);

  const acct = (currentProfile as any)?.account_type || (currentProfile as any)?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';

  const calculateAge = (dob: string | Date) => {
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.ceil(Math.max(1, distance / 1000)); // Convert to km and ensure minimum 1km
  };


  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, age, date_of_birth, dob, photos, bio, location, location_name, interests, hereFor, height, religion, education, drinking, smoking, firstdate, love_language, kids, occupation, account_type, subscription, last_active_at, is_verified')
          .eq('id', userId)
          .single();
        if (error) throw error;

        let processed: any = { 
          ...data,
          lastActive: data.last_active_at || data.lastActive,
          account_type: data.account_type || data.subscription,
        };
        if (processed.location && typeof processed.location === 'string') {
          const pointRegex = /POINT\(([-\d.]+) ([-\d.]+)\)/;
          const match = (processed.location as string).match(pointRegex);
          if (match) {
            processed.location = {
              name: processed.location_name || '',
              longitude: parseFloat(match[1]),
              latitude: parseFloat(match[2]),
            };
          } else if (processed.location_name) {
            processed.location = {
              name: processed.location_name,
              longitude: null,
              latitude: null,
            };
          }
        } else if (processed.location_name && (!processed.location || typeof processed.location !== 'object')) {
          processed.location = {
            name: processed.location_name,
            longitude: null,
            latitude: null,
          };
        }

        setUser(processed);

        try {
          // Hydrate "likedSent" if current user already liked this profile
          if (authUser && processed?.id && authUser.id !== processed.id) {
            const { data: likeRow, error: likeErr } = await supabase
              .from('likes')
              .select('id')
              .match({ liker_id: authUser.id, liked_id: processed.id })
              .limit(1)
              .maybeSingle();
            if (!likeErr && likeRow) {
              setLikedSent(true);
            }
          }

          let km: number | null = null;
          const cu: any = currentProfile;
          const target: any = processed;
          const hasCoords =
            cu?.location &&
            typeof cu.location.latitude === 'number' && Number.isFinite(cu.location.latitude) &&
            typeof cu.location.longitude === 'number' && Number.isFinite(cu.location.longitude) &&
            target?.location &&
            typeof target.location.latitude === 'number' && Number.isFinite(target.location.latitude) &&
            typeof target.location.longitude === 'number' && Number.isFinite(target.location.longitude);

          if (hasCoords) {
            km = calculateDistance(
              cu.location.latitude,
              cu.location.longitude,
              target.location.latitude,
              target.location.longitude
            );
          } else if (authUser?.id) {
            const near = await supabase.rpc('find_profiles_near_user', { p_user_id: authUser.id });
            if (!near.error && Array.isArray(near.data)) {
              const found = near.data.find((p: any) => p.id === processed.id);
              const meters = found?.distance_meters ?? found?.distance;
              if (typeof meters === 'number' && Number.isFinite(meters)) {
                km = Math.max(1, Math.ceil(meters / 1000));
              }
            }
          }
          setDistanceKm(km);
        } catch (_) { /* no-op */ }

        // Record the profile view using the upsert logic
        if (authUser && authUser.id !== data.id) {
          viewService.addProfileView(data.id);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
    fetchUsersWhoLikedMe();
  }, [userId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMenu && !target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen text-white ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'}`}>
        {isVip ? (
          <>
            <Ghost className="w-14 h-14 text-amber-400 animate-spin mb-3 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
            <p className="text-white/70 text-sm">{t('profile.loading')}</p>
          </>
        ) : isPro ? (
          <>
            <Ghost className="w-14 h-14 text-cyan-400 animate-spin mb-3 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
            <p className="text-white/70 text-sm">{t('profile.loading')}</p>
          </>
        ) : (
          <>
            <Ghost className="w-14 h-14 text-pink-500 animate-spin mb-3 drop-shadow-[0_0_12px_rgba(236,72,153,0.9)]" />
            <p className="text-white/70 text-sm">{t('profile.loading')}</p>
          </>
        )}
      </div>
    );
  }

  if (!user) {
    return <div className="p-4 text-center">{t('profile.notFound')}</div>;
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsViewerOpen(true);
  };

  const handleMessage = () => {
    if (!authUser || !user) return;

    const existingMatch = matches.find(
      m => (m.user1.id === authUser.id && m.user2.id === user.id) || (m.user1.id === user.id && m.user2.id === authUser.id)
    );

    if (existingMatch) {
      selectMatch(existingMatch);
    } else {
      createMatch(user.id);
    }
    navigate('/chat');
  };
  
  const handleSendMessageRequestProfile = async () => {
    if (!authUser || !user) return;
    try {
      await supabase.from('message_requests').insert({ sender_id: authUser.id, receiver_id: (user as any).id, status: 'pending' });
      await supabase.from('notifications').insert({
        user_id: (user as any).id,
        type: 'message-request',
        title: 'Message Request',
        message: 'Someone wants to chat with you',
        actor_id: authUser.id,
      });
      toast.success(t('toast.messageRequest.sent'));
    } catch (e) {
      console.error('Error sending message request:', e);
      toast.error(t('toast.messageRequest.error'));
    }
  };
  
  const handleSendLikeProfile = async () => {
    if (!authUser || !user || isSendingLike) return;

    setIsSendingLike(true);
    try {
      // Use upsert to prevent duplicate likes
      await supabase
        .from('likes')
        .upsert(
          { liker_id: authUser.id, liked_id: (user as any).id },
          { onConflict: 'liker_id,liked_id' }
        );
      setLikedSent(true);
      const { data: reciprocal } = await supabase
        .from('likes')
        .select('id')
        .match({ liker_id: (user as any).id, liked_id: authUser.id })
        .limit(1)
        .maybeSingle();
      if (reciprocal) {
        await createMatch((user as any).id);
        showMatchAnimation(user);
      } else {
        // Create a notification for the liked user
        await supabase.from('notifications').insert({
          user_id: (user as any).id,
          actor_id: authUser.id,
          type: 'new_like',
          title: 'You have a new like!',
          message: `${currentProfile?.name || 'Someone'} liked your profile.`
        });
      }
    } catch (err) {
      console.error('Unexpected error sending like:', err);
    } finally {
      setIsSendingLike(false);
    }
  };

  const handleBlockUser = async () => {
    if (!authUser || !user) return;
    
    try {
      await blockService.blockUser(authUser.id, user.id);
      toast.success(t('toast.block.success'));
      setShowMenu(false);
      navigate('/find');
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error(t('toast.block.error'));
    }
  };

  const handleReportUser = async (reason: string, _details?: string) => {
    if (!authUser || !user) {
      console.error('No current user or target user found');
      toast.error(t('error.userInfoUnavailable'));
      return;
    }
    
    try {
      await reportService.createUserReport(authUser.id, user.id, reason);
      toast.success(t('toast.report.success'));
      setShowReportModal(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error(t('toast.report.error'));
    }
  };

  const isDark = theme === 'dark';

  const DetailItem = ({ label, value, capitalize = false }) => {
    if (!value) return null;
    return (
      <div>
        <p className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{label}</p>
        <p className={`${capitalize ? 'capitalize' : ''} ${isDark ? 'text-white' : 'text-white'}`}>{value}</p>
      </div>
    );
  };

  const getProfileTheme = (profile) => {
    if (!profile) return 'free';
    const accountType = profile.account_type || profile.accountType || profile.subscription;
    if (accountType === 'vip') return 'vip';
    if (accountType === 'pro') return 'pro';
    return 'free';
  };

  const viewedProfileTheme = getProfileTheme(user);
  const isVipProfile = viewedProfileTheme === 'vip';
  const isProProfile = viewedProfileTheme === 'pro';
  return (
    <div className={`min-h-screen relative ${isVipProfile ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isProProfile ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]'}`}>
      {/* Back Arrow & Menu */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <Link to="/find" className={`p-2 rounded-full ${isDark ? 'bg-gray-800/50 text-white' : 'bg-black/20 text-white'} backdrop-blur-md`}>
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        {/* 3 Dots Menu */}
        <div className="relative menu-container">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-full ${isDark ? 'bg-gray-800/50 text-white' : 'bg-black/20 text-white'} backdrop-blur-md`}
          >
            <MoreVertical className="w-6 h-6" />
          </button>
          
          {showMenu && (
            <div className={`absolute right-0 top-12 w-48 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => { setShowMenu(false); setBlockDialogOpen(true); }}
                className={`w-full px-4 py-3 text-left flex items-center ${isDark ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'} transition-colors`}
              >
                <Ban className="w-4 h-4 mr-3" />
                {t('profile.blockUser')}
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className={`w-full px-4 py-3 text-left flex items-center ${isDark ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'} transition-colors`}
              >
                <Flag className="w-4 h-4 mr-3" />
                {t('profile.reportUser')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 p-6 pt-16 pb-28">
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(user.photos || []).map((photo, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => handleImageClick(index)}>
              <img src={photo} alt={`${user.name} photo ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="mt-8">
          {(() => {
            const dob = (user as any).date_of_birth || (user as any).dob || (user as any).birthdate || (user as any).dateOfBirth || (user as any).birthday;
            const age = calculateAge(dob);
            
            // Debug logging for accountType
            console.log('User object:', user);
            console.log('User accountType:', user.accountType);
            console.log('Available user fields:', Object.keys(user));
            
            // Check for accountType in different possible field names
            const accountType = user.accountType || user.account_type || user.membership_type || user.membershipType;
            console.log('Resolved accountType:', accountType);
            
            const isPremium = accountType === 'pro' || accountType === 'vip';
            // Resolve user's vibe: if viewing self and has a local dailyVibe, use it; otherwise deterministic by id
            let vibe: string = assignedVibeForId((user as any).id);
            try {
              if (authUser?.id && authUser.id === (user as any).id) {
                const raw = localStorage.getItem('dailyVibe');
                const now = Date.now();
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed?.value && parsed?.expiresAt && parsed.expiresAt > now) {
                    vibe = parsed.value;
                  }
                }
              }
            } catch {}
            return (
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>
                  {user.name} {age}
                </h3>
                  {accountType === 'vip' && (
                    <div className="relative w-5 h-5" title="VIP User">
                      <Shield className="absolute w-full h-full text-amber-400" fill="currentColor" />
                      <Check className="absolute w-3 h-3 top-1 left-1 text-black" strokeWidth={3} />
                    </div>
                  )}
                  {accountType === 'pro' && (
                    <div className="relative w-5 h-5" title="Pro User">
                      <Shield className="absolute w-full h-full text-blue-800" fill="currentColor" />
                      <Check className="absolute w-3 h-3 top-1 left-1 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <VerificationBadge profile={user} />
                </div>
                
                {/* Location row */}
                {(user.location?.name || distanceKm !== null) && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    {user.location?.name && (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>{user.location.name}</span>
                      </>
                    )}
                    {distanceKm !== null && (
                      <span className="text-gray-400">
                        {user.location?.name ? '• ' : ''}{t('distance.kmAway', { count: distanceKm })}
                      </span>
                    )}
                  </div>
                )}

                {/* Badges row */}
                <div className="flex items-center gap-2 mt-1">
                  {isPremium && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      accountType === 'pro' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-black text-white'
                    }`}>
                      {accountType.toLowerCase()}
                    </span>
                  )}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-200 border border-orange-500/30">
                    {vibe}
                  </div>
                </div>
              </div>
            );
          })()}

          <p className={`${isDark ? 'text-gray-300' : 'text-white/90'} mt-2`}>{user.bio}</p>
        </div>

        <div className="mt-8">
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-white'}`}>{t('profile.sections.interests')}</h3>
          <div className="flex flex-wrap gap-2">
            {(user.interests || []).map(interest => (
              <span key={interest} className={`px-3 py-1 rounded-full text-sm ${
                isVipProfile ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                : isProProfile ? 'bg-cyan-500/20 text-cyan-200'
                : 'bg-rose-800/80 text-rose-200'
              }`}>
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-white'}`}>{t('profile.sections.hereFor')}</h3>
          <div className="flex flex-wrap gap-2">
            {(user.hereFor || []).map(purpose => (
              <span key={purpose} className={`px-3 py-1 rounded-full text-sm ${
                isVipProfile ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                : isProProfile ? 'bg-cyan-500/20 text-cyan-200'
                : 'bg-rose-800/80 text-rose-200'
              }`}>
                {purpose}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <DetailItem label={t('height')} value={user.height ? `${user.height} cm` : null} />
          <DetailItem label={t('education')} value={user.education} capitalize={true} />
          <DetailItem label={t('religion')} value={user.religion} />
          <DetailItem label={t('profile.details.firstDate')} value={user.firstDate?.replace('-',' ')} capitalize={true} />
          <DetailItem label={t('profile.details.drinking')} value={user.drinking} capitalize={true} />
          <DetailItem label={t('profile.details.smoking')} value={user.smoking} capitalize={true} />
          <DetailItem label={t('profile.details.kids')} value={user.aboutMe?.kids} />
          <DetailItem label={t('profile.details.occupation')} value={user.occupation || user.aboutMe?.occupation} />
          <DetailItem label={t('profile.details.loveLanguage')} value={user.loveLanguage} />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          {!likedSent && (
            <button onClick={handleSendLikeProfile} className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 ${
                isVipProfile
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600'
                : isProProfile
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600'
                  : 'bg-gradient-to-r from-rose-700 to-rose-800 text-white hover:from-rose-800 hover:to-rose-900'
            }`}>
              <Heart className={`w-5 h-5 inline mr-2 ${isVipProfile ? 'text-black' : ''}`} />
              {t('profile.sendLike')}
            </button>
          )}
          {(() => {
            const self: any = currentProfile || {};
            const other: any = user || {};
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
            const threshold = Number(localStorage.getItem('compatThreshold') || 3);
            const compatibleScore = (interestsOverlap >= 2 ? 1 : 0) + (hereOverlap >= 1 ? 1 : 0) + (drinkMatch ? 1 : 0) + (smokeMatch ? 1 : 0) + (ageClose ? 1 : 0);
            const showMessage = compatibleScore >= threshold;
            return showMessage ? (
              <button onClick={handleSendMessageRequestProfile} className={`flex-1 py-3 rounded-full font-semibold border-2 ${
                isVipProfile
                  ? 'border-amber-400 text-amber-300 hover:bg-amber-500 hover:text-black'
                  : isProProfile
                    ? 'border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-white'
                    : 'border-rose-700 text-rose-400 hover:bg-rose-700 hover:text-white'
              }`}>{t('profile.message')}</button>
            ) : null;
          })()}
        </div>
      </div>

      {isViewerOpen && (
        <FullScreenImageViewer 
          images={user.photos || []}
          user={user} // Pass the user object
          initialIndex={selectedImageIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
      
      {isMatchAnimationVisible && matchedUser && (
        <MatchAnimation matchedUser={matchedUser} onClose={hideMatchAnimation} />
      )}

      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={(reason, details) => handleReportUser(reason, details)}
      />

      <AnimatePresence>
        {isBlockDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setBlockDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gradient-to-br from-[#1a0f14] to-[#2E0C13] rounded-2xl p-6 mx-4 max-w-sm w-full border border-pink-500/30 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`absolute inset-0 rounded-2xl blur-xl ${isVipProfile ? 'bg-gradient-to-r from-amber-400/10 to-yellow-500/10' : isProProfile ? 'bg-gradient-to-r from-cyan-400/10 to-blue-500/10' : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10'}`}></div>
              <h3 className="text-lg font-semibold mb-2 text-white relative z-10">{t('chat.block.title')}</h3>
              <p className="text-gray-300 mb-4 relative z-10">{t('chat.block.body', { name: (user as any)?.name || '' })}</p>
              <div className="flex gap-3 justify-end relative z-10">
                <button
                  onClick={() => setBlockDialogOpen(false)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/10 text-white"
                >
                  {t('chat.block.cancel')}
                </button>
                <button
                  onClick={handleBlockUser}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition text-white shadow-lg shadow-red-500/25"
                >
                  {t('chat.block.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfilePage;
