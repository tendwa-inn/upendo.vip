import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useModalStore } from '../stores/modalStore';
import PopularityModal from '../components/modals/PopularityModal';
import { Sun, Moon, User, Camera, Settings, Crown, Shield, Phone, MapPin, Heart, LogOut, Edit3, CheckCircle, Star, Plus, BookOpen, Ruler, GlassWater, Cigarette, Briefcase, X, Slash, AlertTriangle, Ticket, CircleUserRound, Scale, RefreshCw, Palette, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUiStore, ButtonStyle } from '../stores/uiStore';
import { useSwipeStore } from '../stores/swipeStore';
import { useProfileStore } from '../stores/profileStore';
import { useThemeStore } from '../stores/themeStore';
import { useColorThemeStore, useCurrentTheme } from '../stores/colorThemeStore';
import { getAvailableThemes, THEME_MAP } from '../styles/theme';
import toast from 'react-hot-toast';
import { useAppSettingsStore } from '../stores/appSettingsStore';
import { flareService } from '../services/flareService';
import { getPopularityScore } from '../services/popularityService';
import { promoService } from '../services/promoService';
import { supabase } from '../utils/supabase';
import SavedPromos from '../components/SavedPromos';
import PromoCodeModal from '../components/modals/PromoCodeModal';
import ProfileCompletionModal from '../components/modals/ProfileCompletionModal';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';
import IndividualEditModal from '../components/modals/IndividualEditModal';
import PhotoCropModal from '../components/PhotoCropModal';
import DeactivationModal from '../components/modals/DeactivationModal';
import DeleteAccountModal from '../components/modals/DeleteAccountModal';
import CongratulationsModal from '../components/modals/CongratulationsModal';
import UpgradeModal from '../components/modals/UpgradeModal';
import VerificationBadge from '../components/VerificationBadge';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';
import UpendoStore from '../components/store/UpendoStore';

// Theme Selector Component
const ThemeSelector: React.FC<{ accountType: string; isVip: boolean; isPro: boolean; userId: string }> = ({ accountType, isVip, isPro, userId }) => {
  const { t } = useTranslation();
  const { selectedThemeId, setTheme, resetToDefault } = useColorThemeStore();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [promoThemeIds, setPromoThemeIds] = useState<string[]>([]);
  const [storeThemeIds, setStoreThemeIds] = useState<string[]>([]);
  let availableThemes = getAvailableThemes(accountType);
  const currentThemeId = selectedThemeId || (isVip ? 'royal-gold' : isPro ? 'midnight-ocean' : 'upendo-original');

  // Fetch active theme promos and store purchases so they stay available even after switching away
  const fetchUnlockedThemes = async () => {
    if (!userId) return;

    try {
      // Promo-granted themes
      const { data: promoData } = await supabase
        .from('user_promos')
        .select('*, promo_codes(*)')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString());
      if (promoData) {
        const themeIds = promoData
          .filter((row: any) => row.promo_codes?.type === 'theme')
          .map((row: any) => row.promo_codes?.effect?.theme_id)
          .filter((id: any): id is string => !!id && !!THEME_MAP[id]);
        setPromoThemeIds(themeIds);
      }
    } catch {
      // Silently handle auth errors
    }

    try {
      // Store-purchased themes (only still-valid ones)
      const { data: purchases } = await supabase
        .from('store_purchases')
        .select('store_item_id, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (purchases && purchases.length > 0) {
        const itemIds = purchases.map((p: any) => p.store_item_id);
        const { data: items } = await supabase
          .from('store_items')
          .select('id, category, effect')
          .in('id', itemIds);

        if (items) {
          const now = Date.now();
          const validThemeIds: string[] = [];

          for (const purchase of purchases) {
            const item = items.find((i: any) => i.id === purchase.store_item_id);
            if (!item || item.category !== 'themes' || !item.effect?.theme_id) continue;
            if (!THEME_MAP[item.effect.theme_id]) continue;

            const durationDays = item.effect?.duration_days;
            if (!durationDays) {
              validThemeIds.push(item.effect.theme_id);
              continue;
            }

            const purchaseTime = new Date(purchase.created_at).getTime();
            const expiryTime = purchaseTime + durationDays * 24 * 60 * 60 * 1000;
            if (now < expiryTime) {
              validThemeIds.push(item.effect.theme_id);
            }
          }

          setStoreThemeIds(validThemeIds);
        }
      }
    } catch {
      // Silently handle auth errors
    }
  };

  useEffect(() => {
    fetchUnlockedThemes();
  }, [userId, selectedThemeId]);

  // Include all promo-granted themes in the picker
  for (const tid of promoThemeIds) {
    if (!availableThemes.some(t => t.id === tid)) {
      availableThemes = [...availableThemes, THEME_MAP[tid]];
    }
  }

  // Include all store-purchased themes in the picker
  for (const tid of storeThemeIds) {
    if (!availableThemes.some(t => t.id === tid)) {
      availableThemes = [...availableThemes, THEME_MAP[tid]];
    }
  }

  // Always include the currently selected theme (handles case where user bought it but fetch missed it)
  if (selectedThemeId && THEME_MAP[selectedThemeId] && !availableThemes.some(t => t.id === selectedThemeId)) {
    availableThemes = [...availableThemes, THEME_MAP[selectedThemeId]];
  }

  return (
    <div className="p-3 bg-white/20 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Palette className="w-5 h-5 text-gray-300" />
          <span className="text-white">{t('profile.themeLabel')}</span>
        </div>
        <button
          onClick={() => {
            const opening = !isThemeMenuOpen;
            setIsThemeMenuOpen(opening);
            if (opening) fetchUnlockedThemes();
          }}
          className="px-4 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
        >
          {availableThemes.find(th => th.id === currentThemeId)?.name || t('profile.selectTheme')}
        </button>
      </div>

      {isThemeMenuOpen && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableThemes.map(theme => {
            const isSelected = theme.id === currentThemeId;
            const isFromStore = storeThemeIds.includes(theme.id);
            return (
              <button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id, userId);
                  setIsThemeMenuOpen(false);
                  toast.success(t('profile.themeChanged', { name: theme.name }));
                }}
                className={`relative p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-white/60 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                {/* Theme preview */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.preview.accent }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.preview.bubble }}
                  />
                </div>
                <span className="text-xs text-white/80 block text-left">{theme.name}</span>
                {isFromStore && (
                  <span className="text-[9px] text-orange-400/70 block text-left mt-0.5">Store</span>
                )}
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Locked themes indicator */}
          {!isVip && (
            <div className="p-3 rounded-xl border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center opacity-60">
              <Lock className="w-5 h-5 text-white/40 mb-1" />
              <span className="text-xs text-white/40 text-center">
                {isPro ? t('profile.vipThemes') : t('profile.moreThemes')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, isAdmin, signOut, updateUserProfile, checkUser, isPro, isVip } = useAuthStore();
  const accountType = useAuthStore(state => state.profile?.account_type) || 'free';
  const colorTheme = useCurrentTheme(accountType);
  const { } = useSwipeStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const { openPopularityModal, isPopularityModalOpen, closePopularityModal } = useModalStore();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentPhotoToCrop, setCurrentPhotoToCrop] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isCongratulationsModalOpen, setIsCongratulationsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [redeemedPromoDetails, setRedeemedPromoDetails] = useState({ name: '', description: '', expiresAt: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState((profile as any)?.notifications_enabled ?? true);
  const [isLangMenuOpen, setLangMenuOpen] = useState(false);
  const [isLocationScopeMenuOpen, setLocationScopeMenuOpen] = useState(false);
  const { settings, getSettings } = useAppSettingsStore();
  const [livePopularityScore, setLivePopularityScore] = useState(profile?.popularity_score || 75);
  const { buttonStyle, setButtonStyle } = useUiStore();

  useEffect(() => {
    getSettings();
  }, []);

  useEffect(() => {
    if (isPopularityModalOpen) {
      const fetchScore = async () => {
        if (user?.id) {
          const score = await getPopularityScore(user.id);
          setLivePopularityScore(score);
        }
      };
      fetchScore();
    }
  }, [isPopularityModalOpen, user?.id]);

  const isProfileComplete = React.useMemo(() => {
    if (!profile) return false;
    return !!profile?.bio && !!profile?.location?.name && !!profile?.hereFor && (profile?.photos?.length || 0) >= 3;
  }, [profile]);

  const getLocationName = (location: any): string => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.name) return location.name;
    return 'Not specified';
  };

  const handleOpenCropper = (photoUrl: string) => {
    setCurrentPhotoToCrop(photoUrl);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!currentPhotoToCrop) return;

    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const newPhotos = profile.photos?.map(p => p === currentPhotoToCrop ? publicUrl : p) || [];
      await updateUserProfile({ photos: newPhotos });

      const oldPhotoName = currentPhotoToCrop.split('/').pop();
      if (oldPhotoName) {
        await supabase.storage.from('avatars').remove([`${user.id}/${oldPhotoName}`]);
      }

      toast.success(t('toast.photoUpdated'));
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error(t('toast.photoUpdateFailed'));
    } finally {
      setIsCropModalOpen(false);
      setCurrentPhotoToCrop(null);
    }
  };

  const handleSetDP = (photoUrl: string) => {
    const newPhotos = [photoUrl, ...(profile.photos?.filter(p => p !== photoUrl) || [])];
    updateUserProfile({ photos: newPhotos });
  };

  const handleEditPhoto = (photoUrl: string) => {
    setIsViewerOpen(false);
    handleOpenCropper(photoUrl);
  };

  const handleDeletePhoto = (photoUrl: string) => {
    const newPhotos = profile.photos?.filter(p => p !== photoUrl) || [];
    updateUserProfile({ photos: newPhotos });
  };

  const handleIndividualSave = async (field: string, value: any) => {
    if (field === 'location' || field === 'location_name') {
      toast.error(t('toast.useLocationButton'));
      setEditingField(null);
      return;
    }

    try {
      await updateUserProfile({ [field]: value });
    } catch (error) {
      toast.error(t('toast.profileUpdateFailed'));
    }

    setEditingField(null);
  };

  const handleUpdateLocation = async () => {
    setIsLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const { user } = useAuthStore.getState();

        if (!user) {
          toast.error(t('toast.notLoggedInLocation'));
          setIsLoading(false);
          return;
        }

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data && data.address) {
          const city = data.address.city || data.address.town || '';
          const locationName = city ? `${city}, ${data.address.country}` : data.address.country;
          const locationData = {
            name: locationName,
            longitude,
            latitude,
          };

          await updateUserProfile({ location: locationData });
          
          // Add a small delay to ensure the subscription updates are processed
          setTimeout(() => {
            setIsLoading(false);
            toast.success(t('toast.locationUpdated'));
          }, 500);
        } else {
          toast.error(t('toast.locationFailed'));
          setIsLoading(false);
        }
      }, (error) => {
        toast.error(t('toast.locationError'));
        setIsLoading(false);
      });
    } catch (error) {
      toast.error(t('toast.locationError'));
      setIsLoading(false);
    }
  };

  const handleCompletionModalClose = async (answers?: any) => {
    if (answers && answers.looking_for) {
      try {
        const { error } = await supabase.rpc('update_user_looking_for', { 
          p_user_id: user.id,
          p_looking_for: answers.looking_for 
        });
        if (error) throw error;
        await checkUser();
        setIsCompletionModalOpen(false);
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error(t('toast.preferenceFailed'));
      }
    } else {
      setIsCompletionModalOpen(false);
    }
  };

  const getDaysUntilExpiration = () => {
    if (!profile?.subscriptionExpiresAt) return null;
    const expiresAt = new Date(profile.subscriptionExpiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubscriptionStatus = () => {
    const daysLeft = getDaysUntilExpiration();
    if (daysLeft === null) return '';
    if (daysLeft < 0) return ` (Expired ${Math.abs(daysLeft)} days ago)`;
    if (daysLeft === 0) return ' (Expires today)';
    if (daysLeft === 1) return ' (Expires tomorrow)';
    return ` (Expires in ${daysLeft} days)`;
  };

  const handleSaveProfile = (updatedProfile) => {
    updateUserProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(t('toast.loggedOut'));
  };

  const handlePhoneVerification = () => {
    toast.success(t('toast.phoneVerification'));
  };

  const handleDeactivate = () => {
    toast('Deactivation functionality to be implemented.');
  };

  const handleReportProblem = () => {
    toast('Problem reporting functionality to be implemented.');
  };

  const handlePromoCode = () => {
    toast('Promo code functionality to be implemented.');
  };

  const toggleNotifications = async () => {
    const newStatus = !notificationsEnabled;
    setNotificationsEnabled(newStatus);
    await updateUserProfile({ notifications_enabled: newStatus });
    toast.success(`Notifications ${newStatus ? 'enabled' : 'disabled'}`);
  };

  const handleAccountDeactivate = async (reason: string) => {
    await updateUserProfile({
      is_deactivated: true,
      deactivated_at: new Date().toISOString(),
    });
    toast.success(t('toast.accountDeactivated'));
    setIsDeactivationModalOpen(false);
    signOut();
  };

  const handleAccountDelete = async (reason: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('delete_user_data', { p_user_id: user.id });

      if (error) {
        console.error('Account deletion error:', error);
        toast.error(t('toast.deleteAccountFailed'));
        return;
      }

      setIsDeleteModalOpen(false);
      toast.success(t('toast.accountDeleted'));

      // Clear all local state — auth user is already deleted server-side
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error(t('toast.deleteAccountFailed'));
    }
  };

  const handleRefreshSubscription = async () => {
    try {
      await checkUser();
      toast.success(t('toast.subscriptionRefreshed'));
    } catch (error) {
      toast.error(t('toast.subscriptionRefreshFailed'));
      console.error('Error refreshing subscription:', error);
    }
  };

  const handleApplyPromoCode = async (code: string) => {
    try {
      if (code.toUpperCase() === 'NLG36QM4FYR') {
        toast.error(t('toast.legacyAdminDisabled'));
        setIsPromoCodeModalOpen(false);
        return;
      }

      const { data: promoCode, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (promoError || !promoCode) {
        return toast.error(t('toast.invalidPromo'));
      }

      if (promoCode.max_uses !== null) {
        const { count, error: countError } = await supabase
          .from('user_promos')
          .select('*', { count: 'exact' })
          .eq('promo_code_id', promoCode.id);
        
        if (countError) throw countError;

        if (count >= promoCode.max_uses) {
          return toast.error(t('toast.promoMaxUses'));
        }
      }

      const { data: existingRedemption, error: redemptionError } = await supabase
        .from('user_promos')
        .select('id')
        .eq('user_id', user.id)
        .eq('promo_code_id', promoCode.id)
        .maybeSingle();

      if (existingRedemption) {
        return toast.error(t('toast.promoDuplicate'));
      }

      const promoType = promoCode.type?.toLowerCase();

      // Theme promos don't affect subscription tier
      if (promoType === 'theme') {
        const effect = promoCode.effect || {};
        let themeId = effect.theme_id;

        // Fallback: if effect column was empty (promo created before migration),
        // try to match theme by promo name
        if (!themeId) {
          const promoNameLower = (promoCode.name || '').toLowerCase();
          const allThemes = Object.values(THEME_MAP);
          const matched = allThemes.find(t =>
            promoNameLower.includes(t.name.toLowerCase()) || promoNameLower.includes(t.id.toLowerCase())
          );
          if (matched) {
            themeId = matched.id;
          }
        }

        if (!themeId) {
          toast.error(t('toast.promoMissingTheme'));
          return;
        }

        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + (promoCode.duration_days || 30));

        await promoService.applyPromoCode(user.id, promoCode.id, expires_at.toISOString());

        // Update local theme store and sync selected_theme_id to Supabase
        useColorThemeStore.getState().setTheme(themeId, user.id);

        setRedeemedPromoDetails({
          name: promoCode.name,
          description: promoCode.description,
          expiresAt: expires_at.toISOString(),
        });
        setIsCongratulationsModalOpen(true);
        checkUser();
      } else {
        const tierHierarchy = { free: 0, pro: 1, vip: 2 };
        const currentTier = tierHierarchy[profile.accountType || 'free'];
        const promoTier = tierHierarchy[promoType.replace('_account', '')] || 0;

        if (promoTier < currentTier) {
          return toast.error(t('toast.alreadyHigherTier'));
        }

        let expires_at = new Date();
        const currentExpiration = profile.subscriptionExpiresAt ? new Date(profile.subscriptionExpiresAt) : null;
        const now = new Date();

        if (currentExpiration && currentExpiration > now) {
          expires_at = new Date(currentExpiration.getTime() + promoCode.duration_days * 24 * 60 * 60 * 1000);
        } else {
          expires_at.setDate(expires_at.getDate() + promoCode.duration_days);
        }

        await promoService.applyPromoCode(user.id, promoCode.id, expires_at.toISOString());

        if (promoType === 'vip_account' || promoType === 'pro_account') {
          await updateUserProfile(
            { account_type: promoType.replace('_account', ''), subscription_expires_at: expires_at.toISOString() }
          );

          setRedeemedPromoDetails({ name: promoCode.name, description: promoCode.description, expiresAt: expires_at.toISOString() });
          setIsCongratulationsModalOpen(true);
        } else if (promoType === 'profile_views') {
          const effect = promoCode.effect || {};
          const days = effect.days || promoCode.duration_days || 7;

          const profileViewsExpires = new Date();
          profileViewsExpires.setDate(profileViewsExpires.getDate() + days);

          await updateUserProfile(
            { can_view_profiles_expires_at: profileViewsExpires.toISOString() }
          );

          setRedeemedPromoDetails({
            name: promoCode.name,
            description: `${promoCode.description}. You can now view profiles and see who viewed yours for ${days} days!`,
            expiresAt: profileViewsExpires.toISOString(),
          });
          setIsCongratulationsModalOpen(true);
          checkUser();
        } else if (promoType === 'popularity_boost') {
          const effect = promoCode.effect || {};
          const boostAmount = effect.boost_amount || 0;
          if (boostAmount > 0) {
            const { error: boostError } = await supabase.rpc('increment_popularity_score', {
              p_user_id: user.id,
              p_amount: boostAmount,
            });
            if (boostError) {
              console.error('Failed to apply popularity boost:', boostError);
            }
          }
          setRedeemedPromoDetails({
            name: promoCode.name,
            description: promoCode.description,
            expiresAt: expires_at.toISOString(),
          });
          setIsCongratulationsModalOpen(true);
          checkUser();
        } else if (promoType === 'flares') {
          const effect = promoCode.effect || {};
          const flareAmount = effect.flare_amount || 0;
          if (flareAmount > 0) {
            const result = await flareService.addFlares(user.id, flareAmount, 'promo_bonus');
            if (!result.success) {
              toast.error(t('toast.addFlaresFailed') + ': ' + (result.error || 'Unknown error'));
              return;
            }
          }
          setRedeemedPromoDetails({
            name: promoCode.name,
            description: `+${flareAmount} flares added to your balance!`,
            expiresAt: expires_at.toISOString(),
          });
          setIsCongratulationsModalOpen(true);
          checkUser();
        } else {
          // limited_swipes, unlimited_swipes, message_requests — benefit is enforced at runtime via promoBonusService
          const effect = promoCode.effect || {};
          let desc = promoCode.description;
          if (promoType === 'limited_swipes' && effect.swipe_count) {
            desc += ` (+${effect.swipe_count} bonus swipes/day)`;
          } else if (promoType === 'unlimited_swipes') {
            desc += ' (unlimited swipes activated!)';
          } else if (promoType === 'message_requests' && effect.request_count) {
            desc += ` (+${effect.request_count} bonus message requests)`;
          }
          setRedeemedPromoDetails({ name: promoCode.name, description: desc, expiresAt: expires_at.toISOString() });
          setIsCongratulationsModalOpen(true);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsPromoCodeModalOpen(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const weights = {
      photos: 35,
      details: 45,
      interests: 10,
      activity: 10,
    };

    const photoCount = profile.photos?.length || 0;
    const photoScore = Math.min(photoCount / 6, 1) * weights.photos;

    const detailFields = [
      profile.bio,
      (profile as any).occupation,
      profile.education,
      profile.height,
      profile.religion,
      profile.drinking,
      profile.smoking,
    ];
    const filledDetails = detailFields.filter(Boolean).length;
    const detailScore = (filledDetails / detailFields.length) * weights.details;

    const hasInterests = (profile.interests?.length || 0) > 0;
    const interestsScore = hasInterests ? weights.interests : 0;

    const hoursSinceLastActivity = profile.lastActive ? (new Date().getTime() - new Date(profile.lastActive).getTime()) / (1000 * 60 * 60) : Infinity;
    let activityScore = weights.activity;
    if (hoursSinceLastActivity > 72) { 
      activityScore *= 0.2;
    } else if (hoursSinceLastActivity > 24) { 
      activityScore *= 0.5;
    }

    const totalScore = photoScore + detailScore + interestsScore + activityScore;
    return Math.round(totalScore);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const ProfileField = ({ field, value, label, isRequired = false, alwaysEditable = false }) => {
    const isEmpty = !value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '');
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-300">{label}</h4>
          <div className="flex items-center gap-2">
            {isEmpty && isRequired && (
              <span className="text-xs text-red-400">{i18n.t('required')}</span>
            )}
            <button onClick={() => setEditingField(field)} className="p-1.5 text-gray-400 hover:text-white" disabled={!alwaysEditable && !isEmpty}>
              {isEmpty ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">{isEmpty ? i18n.t('profile.noFieldValue', { field: label.toLowerCase() }) : value}</p>
      </div>
    );
  };

  // Helper for theme-based button classes
  const btnPrimary = colorTheme.button.primary;
  const btnPrimaryHover = colorTheme.button.primaryHover;

  const age = profile.dateOfBirth ? (() => {
    const today = new Date();
    const birthDate = new Date(profile.dateOfBirth);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred yet this year, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
    return calculatedAge;
  })() : null;
  const profileCompletion = calculateProfileCompletion();
  const maxPhotos = (profile?.accountType === 'pro' || profile?.accountType === 'vip') ? 10 : 6;
  const currentSubscription = settings.find(s => s.account_type === (profile?.account_type || 'free')) || settings.find(s => s.account_type === 'free');
  const SubscriptionIcon = currentSubscription ? (currentSubscription.account_type === 'vip' ? Crown : Shield) : User;
  const tierHierarchy = { free: 0, pro: 1, vip: 2 };

  return (
    <div className="p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 mb-6"
        >
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
              <div>
              <p className="text-sm text-gray-300">{i18n.t('profile.completion')}</p>
                <p className="text-lg font-bold text-white">{profileCompletion}%</p>
              </div>
            </div>
            <button
              onClick={() => setIsCompletionModalOpen(true)}
              className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                isProfileComplete
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : `${btnPrimary} ${btnPrimaryHover} text-white`
              }`}>
              {isProfileComplete ? i18n.t('profile.completed') : i18n.t('profile.completeProfile')}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">{i18n.t('profile.myProfile')}</h1>
            <div className="flex items-center gap-2">

              <button
                onClick={toggleTheme}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={openPopularityModal}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isVip
                    ? 'bg-amber-400 text-black hover:bg-amber-500'
                    : isPro
                    ? 'bg-cyan-400 text-black hover:bg-cyan-500'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Scale className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6 mb-6">
            <div className="relative w-24 h-24 rounded-full mb-4 bg-gray-800 flex items-center justify-center">
              {profile.photos?.[0] ? (
                <img src={profile.photos[0]} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                                <CircleUserRound
                  className={`w-16 h-16 ${
                    isVip
                      ? 'text-amber-400'
                      : isPro
                      ? 'text-sky-500'
                      : 'text-pink-600'
                  }`}
                />
              )}
              <button
                onClick={() => setIsPhotoUploaderOpen(true)}
                className={`absolute bottom-0 right-0 p-2 rounded-full transition-all duration-300 ${btnPrimary} ${btnPrimaryHover} text-white`}
              >
                <Camera className="w-4 h-4" />
              </button>
          </div>
            
            <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{profile.name}{age ? `, ${age}` : ''}</span>
                    <VerificationBadge profile={profile} />
                  </h2>
                </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300">{profile.location?.name || i18n.t('general.notSpecified')}</span>
                {!profile.location?.name && <span className="text-xs text-red-400">{i18n.t('required')}</span>}
                <button onClick={handleUpdateLocation} disabled={isLoading || !!(profile.location && profile.location.name)} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50">
                  {isLoading ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <Edit3 className="w-4 h-4" />}
                </button>
              </div>

              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20`}>
                <SubscriptionIcon className={`w-4 h-4 text-white`} />
                <span className={`text-sm font-medium text-white`}>
                  {currentSubscription?.account_type}{getSubscriptionStatus()}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-base font-semibold text-white">{i18n.t('profile.myPhotos')}</h3>
              {(!profile.photos || profile.photos.length < 3) && (
                <span className="text-xs text-red-400">{i18n.t('profile.requiredPhotos', { count: 3 })}</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profile.photos && profile.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer" onClick={() => { setViewerStartIndex(index); setIsViewerOpen(true); }}>
                  <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetDP(photo); }}
                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/75 transition-all duration-300 z-10"
                  >
                    <Star className={`w-4 h-4 ${profile.photos?.[0] === photo ? 'text-yellow-400' : 'text-white'}`} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenCropper(photo); }}
                    className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/75 transition-all duration-300 z-10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="absolute top-2 left-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/75 transition-all duration-300 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(profile.photos?.length || 0) < maxPhotos && (
                <button
                  onClick={() => setIsPhotoUploaderOpen(true)}
                  className={`relative aspect-square rounded-xl border-2 border-dashed ${colorTheme.accent.border.replace('/30', '/40')} flex flex-col items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all duration-300 group`}
                >
                  <div className={`${btnPrimary} p-3 rounded-full transition-transform duration-300 group-hover:scale-110`}>
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">Add Photo</span>
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-white">{i18n.t('aboutMe')}</h3>
              {!profile.bio && <span className="text-xs text-red-400 invisible">Required</span>}
            </div>
            <ProfileField field="bio" value={profile.bio} label={i18n.t('aboutMe')} isRequired={true} alwaysEditable={true} />
            <ProfileField field="hereFor" value={profile.hereFor} label={i18n.t('profile.sections.hereFor')} isRequired={true} alwaysEditable={true} />
            <ProfileField field="occupation" value={(profile as any).occupation} label={i18n.t('work')} isRequired={false} />
            <ProfileField field="education" value={profile.education} label={i18n.t('education')} isRequired={false} />
            <ProfileField field="height" value={profile.height} label={i18n.t('height')} isRequired={false} />
            <ProfileField field="religion" value={profile.religion} label={i18n.t('religion')} isRequired={false} />

            <ProfileField field="drinking" value={profile.drinking} label={i18n.t('profile.details.drinking')} isRequired={false} />
            <ProfileField field="smoking" value={profile.smoking} label={i18n.t('profile.details.smoking')} isRequired={false} />
            <ProfileField field="kids" value={(profile as any).kids} label={i18n.t('profile.details.kids')} isRequired={false} />

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{i18n.t('subscription')}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshSubscription}
                  className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300"
                  title={t('profile.refreshSubscription')}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[...settings].sort((a, b) => tierHierarchy[a.account_type] - tierHierarchy[b.account_type]).map(setting => {
              const Icon = setting.account_type === 'vip' ? Crown : setting.account_type === 'pro' ? Shield : User;
              const isCurrent = accountType === setting.account_type;
              
              return (
                <div
                  key={setting.account_type}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isCurrent
                      ? `${colorTheme.accent.border} bg-white/20`
                      : 'border-transparent bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon className={`w-5 h-5 text-white`} />
                    <h4 className="font-semibold text-white">{setting.account_type.toUpperCase()}</h4>
                    {isCurrent && <CheckCircle className={`w-5 h-5 ${colorTheme.primary}`} />}
                  </div>
                  
                  <ul className="space-y-1 mb-4">
                    <li className="text-sm text-gray-300 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{setting.swipes_per_day === -1 ? i18n.t('pricing.unlimited') : setting.swipes_per_day} {i18n.t('pricing.swipes')}</span>
                    </li>
                    <li className="text-sm text-gray-300 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{setting.rewind_count === -1 ? i18n.t('pricing.unlimited') : setting.rewind_count} {i18n.t('pricing.rewinds')}</span>
                    </li>
                    {(setting.account_type === 'pro' || setting.account_type === 'vip') && (
                      <>
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>{i18n.t('pricing.ghostMode')}</span>
                        </li>
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>{i18n.t('pricing.readReceipts')}</span>
                        </li>
                      </>
                    )}
                    {setting.account_type === 'vip' && (
                      <>
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>18+</span>
                        </li>
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>{i18n.t('pricing.unlimitedMessageRequests')}</span>
                        </li>
                      </>
                    )}
                    {setting.price && setting.account_type !== 'free' && (
                        <li className="text-sm text-gray-300 flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="font-bold text-base">{setting.price}</span>
                        </li>
                    )}
                  </ul>
                  
                  {isCurrent ? (
                    <div className={`text-center py-2 text-sm font-medium ${colorTheme.primary}`}>{i18n.t('subscription.currentPlan')}</div>
                  ) : tierHierarchy[setting.account_type] > tierHierarchy[profile.accountType || 'free'] ? (
            <button
              onClick={() => setIsUpgradeModalOpen(true)} className={`w-full py-2 rounded-xl transition-all duration-300 text-sm font-medium ${btnPrimary} ${btnPrimaryHover} text-white`}>{i18n.t('subscription.upgrade')}</button>
                  ) : (
                    <button className="w-full py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 text-sm font-medium">
                      {i18n.t('subscription.downgrade')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upendo Store */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-6"
        >
          <UpendoStore userId={profile?.id || ''} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">{i18n.t('settings')}</h3>
          
          <div className="space-y-4">

            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl relative">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-300" />
                <span className="text-white">{i18n.t('settings.language')}</span>
              </div>
              <button
                onClick={() => setLangMenuOpen(!isLangMenuOpen)}
                className="px-4 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-300 text-sm"
              >
                {i18n.language?.toUpperCase() || 'EN'}
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-3 top-full mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-xl p-2 text-left z-10">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'fr', name: 'French' },
                    { code: 'ar', name: 'Arabic' },
                    { code: 'zh', name: 'Chinese' },
                    { code: 'bem', name: 'Ichibemba' },
                    { code: 'sw', name: 'Swahili' },
                    { code: 'ny', name: 'Chichewa' },
                    { code: 'xh', name: 'Xhosa' },
                    { code: 'af', name: 'Afrikaans' },
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        try { localStorage.setItem('lang', lang.code); } catch {}
                        setLangMenuOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors ${i18n.language === lang.code ? 'bg-white/20' : ''}`}
                    >
                                                              {t(lang.name)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            
            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-300" />
                <span className="text-white">{i18n.t('settings.notifications')}</span>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`px-4 py-1 rounded-lg text-white transition-colors duration-300 text-sm ${
                  notificationsEnabled
                    ? `${btnPrimary} ${btnPrimaryHover} text-white`
                    : 'bg-red-500 hover:bg-red-600'
                }`}>
                {notificationsEnabled ? i18n.t('general.enabled') : i18n.t('general.disabled')}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-300" />
                <span className="text-white">{i18n.t('settings.swipeMode')}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { try { localStorage.setItem('swipeMode','smart'); } catch {}; toast.success(i18n.t('swipe.toast.smart') || i18n.t('swipe.mode.smart')); }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    (localStorage.getItem('swipeMode') || 'smart') === 'smart'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {i18n.t('swipe.mode.smart') || 'Smart'}
                </button>
                <button
                  onClick={() => { try { localStorage.setItem('swipeMode','random'); } catch {}; toast.success(i18n.t('swipe.toast.random') || i18n.t('swipe.mode.random')); }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    localStorage.getItem('swipeMode') === 'random'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {i18n.t('swipe.mode.random') || 'Random'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl relative">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-300" />
                <span className="text-white">{i18n.t('settings.locationScope')}</span>
              </div>
              <button
                onClick={() => setLocationScopeMenuOpen(!isLocationScopeMenuOpen)}
                className="px-4 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-300 text-sm capitalize"
              >
                {localStorage.getItem('locationScope') || 'nearby'}
              </button>
              {isLocationScopeMenuOpen && (
                <div className="absolute right-3 top-full mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-xl p-2 text-left z-10">
                  {['nearby', 'country', 'global'].map(scope => (
                    <button
                      key={scope}
                      onClick={() => {
                        try { localStorage.setItem('locationScope', scope); } catch {};
                        toast.success(`Location scope set to ${scope}`);
                        setLocationScopeMenuOpen(false);
                      }}
                      disabled={(scope === 'country' && !isPro && !isVip) || (scope === 'global' && !isVip)}
                      className={`block w-full text-left px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors capitalize ${
                        localStorage.getItem('locationScope') === scope ? 'bg-white/20' : ''
                      } ${((scope === 'country' && !isPro && !isVip) || (scope === 'global' && !isVip)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Ticket className="w-5 h-5 text-gray-300" />
                <span className="text-white">{i18n.t('promo.title')}</span>
              </div>
              <button
                onClick={() => setIsPromoCodeModalOpen(true)}
                className={`px-4 py-1 rounded-lg transition-colors duration-300 text-sm ${btnPrimary} ${btnPrimaryHover} text-white`}
              >
                {i18n.t('promo.enter')}
              </button>
            </div>

            {/* Theme Selector */}
            <ThemeSelector accountType={accountType} isVip={isVip} isPro={isPro} userId={user.id} />

            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Slash className="w-5 h-5 text-gray-300" />
                <span className="text-white">{i18n.t('deactivate.title')}</span>
              </div>
              <button
                onClick={() => setIsDeactivationModalOpen(true)}
                className={`px-4 py-1 rounded-lg transition-colors duration-300 text-sm ${btnPrimary} ${btnPrimaryHover} text-white`}
              >
                {i18n.t('deactivate.button')}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-white">{t('deactivate.button')}</span>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-1 rounded-lg transition-colors duration-300 text-sm bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>

            {isAdmin && (
              <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-300" />
                  <span className="text-white">{i18n.t('admin.dashboard')}</span>
                </div>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm"
                >
                  Back to Admin
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">{i18n.t('swipe.menu.buttonStyle')}</h3>
          <div className="flex justify-around">
            {(['upendo-color', 'white-clean', 'vintage', 'upendo-205'] as ButtonStyle[]).map(style => (
              <button
                key={style}
                onClick={() => setButtonStyle(style)}
                className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${
                  buttonStyle === style ? btnPrimary : 'bg-white/20'
                }`}>
                {i18n.t(`swipe.menu.${style.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())}`)}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>{i18n.t('logout')}</span>
          </button>
        </motion.div>
      </div>
      
      {isPhotoUploaderOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${colorTheme.background} rounded-2xl p-6 w-full max-w-md text-white border ${colorTheme.accent.border} shadow-2xl`}
          >
            <ProfilePhotoUploader maxPhotos={maxPhotos - (profile.photos?.length || 0)} />
            <button onClick={() => setIsPhotoUploaderOpen(false)} className={`mt-4 w-full py-2.5 px-4 rounded-xl transition-all duration-300 text-sm font-medium bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10`}>
              {i18n.t('general.close')}
            </button>
          </motion.div>
        </div>
      )}
      {editingField && (
        <IndividualEditModal
          field={editingField}
          value={profile[editingField]}
          onSave={handleIndividualSave}
          onClose={() => setEditingField(null)}
        />
      )}
      {isViewerOpen && (
        <PhotoViewerModal
          photos={profile.photos}
          startIndex={viewerStartIndex}
          onClose={() => setIsViewerOpen(false)}
          onSetDP={handleSetDP}
          onEdit={handleEditPhoto}
          onAddPhoto={() => {
            setIsViewerOpen(false);
            setIsPhotoUploaderOpen(true);
          }}
          onDelete={(photoUrl) => {
            handleDeletePhoto(photoUrl);
            setIsViewerOpen(false);
          }}
        />
      )}
      {isCropModalOpen && currentPhotoToCrop && (
        <PhotoCropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          imageUrl={currentPhotoToCrop}
          aspectRatio={1}
          circularCrop={false}
          title={t('profile.cropPhoto')}
        />
      )}
      {isDeactivationModalOpen && (
        <DeactivationModal
          onClose={() => setIsDeactivationModalOpen(false)}
          onDeactivate={handleAccountDeactivate}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteAccountModal
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleAccountDelete}
        />
      )}
      {isPromoCodeModalOpen && (
        <PromoCodeModal
          onClose={() => setIsPromoCodeModalOpen(false)}
          onApply={handleApplyPromoCode}
        />
      )}

      <CongratulationsModal
        isOpen={isCongratulationsModalOpen}
        onClose={() => setIsCongratulationsModalOpen(false)}
        promoName={redeemedPromoDetails.name}
        promoDescription={redeemedPromoDetails.description}
        expiresAt={redeemedPromoDetails.expiresAt}
      />

      {isCompletionModalOpen && (
        <ProfileCompletionModal
          profile={profile}
          onClose={() => setIsCompletionModalOpen(false)}
        />
      )}

      {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} />}

      <PopularityModal 
        isOpen={isPopularityModalOpen}
        onClose={closePopularityModal}
        popularityScore={livePopularityScore}
        strikes={profile.strikes || 0}
        accountType={accountType}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8"
      >
        <SavedPromos />
      </motion.div>
    </div>
  );
};

export default ProfilePage;
