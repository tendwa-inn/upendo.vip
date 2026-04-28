import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useModalStore } from '../stores/modalStore';
import PopularityModal from '../components/modals/PopularityModal';
import { Sun, Moon, User, Camera, Settings, Crown, Shield, Phone, MapPin, Heart, LogOut, Edit3, CheckCircle, Star, Plus, BookOpen, Ruler, GlassWater, Cigarette, Briefcase, X, Slash, AlertTriangle, Ticket, CircleUserRound, Scale, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUiStore, ButtonStyle } from '../stores/uiStore';
import { useSwipeStore } from '../stores/swipeStore';
import { useProfileStore } from '../stores/profileStore';
import { useThemeStore } from '../stores/themeStore';
import toast from 'react-hot-toast';
import { useAppSettingsStore } from '../stores/appSettingsStore';
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
import CongratulationsModal from '../components/modals/CongratulationsModal';
import UpgradeModal from '../components/modals/UpgradeModal';
import VerificationBadge from '../components/VerificationBadge';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';

const ProfilePage: React.FC = () => {
  const { i18n } = useTranslation();


  const { user, profile, isAdmin, signOut, updateUserProfile, checkUser, isPro, isVip } = useAuthStore();
  const accountType = useAuthStore(state => state.profile?.account_type) || 'free';

  const { } = useSwipeStore();
  const { theme, toggleTheme } = useThemeStore();

  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const { openPopularityModal } = useModalStore();
  const { isPopularityModalOpen, closePopularityModal } = useModalStore();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentPhotoToCrop, setCurrentPhotoToCrop] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState(false);
  const [isPromoCodeModalOpen, setIsPromoCodeModalOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isCongratulationsModalOpen, setIsCongratulationsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [redeemedPromoDetails, setRedeemedPromoDetails] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState((profile as any)?.notifications_enabled ?? true);
  const [isLangMenuOpen, setLangMenuOpen] = useState(false);
  const [isLocationScopeMenuOpen, setLocationScopeMenuOpen] = useState(false);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  const isProfileComplete = React.useMemo(() => {
    return !!profile?.bio && !!profile?.location?.name && !!profile?.hereFor && (profile?.photos?.length || 0) >= 3;
  }, [profile]);


  const getLocationName = (location: any): string => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.name) return location.name;
    return 'Not specified';
  };

  // Removed automatic modal opening - now only opens on button click

  const { settings, getSettings } = useAppSettingsStore();

  React.useEffect(() => {
    getSettings();
  }, []);

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

      // Clean up old photo from storage
      const oldPhotoName = currentPhotoToCrop.split('/').pop();
      if (oldPhotoName) {
        await supabase.storage.from('avatars').remove([`${user.id}/${oldPhotoName}`]);
      }

      toast.success('Photo updated successfully!');
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Failed to update photo');
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
    // Prevent location fields from being updated through this generic function
    if (field === 'location' || field === 'location_name') {
      toast.error('Please use the dedicated location update button.');
      setEditingField(null);
      return;
    }

    try {
      await updateUserProfile({ [field]: value });
      // Success toast is handled by updateUserProfile function
    } catch (error) {
      toast.error('Failed to update profile.');
    }

    setEditingField(null);
  };

  const handleUpdateLocation = async () => {
    setIsLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const { user, checkUser } = useAuthStore.getState();

        if (!user) {
          toast.error("You must be logged in to update your location.");
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

          // Use the centralized updateUserProfile function
          await updateUserProfile({ location: locationData }, () => {
            toast.success("Location updated successfully!");
          });

          setIsLoading(false);
        } else {
          toast.error("Could not determine your location.");
          setIsLoading(false);
        }
      }, (error) => {
        toast.error(`Could not access your location: ${error.message}`);
        setIsLoading(false);
      });
    } catch (error) {
      toast.error("An unexpected error occurred while fetching location data.");
      setIsLoading(false);
    }
  };

  const ProfileField = ({ field, value, label, isRequired = false, alwaysEditable = false }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">{label}</h4>
        <div className="flex items-center gap-2">
          {!value && isRequired && (
            <span className="text-xs text-red-400">{i18n.t('required')}</span>
          )}
          <button onClick={() => setEditingField(field)} className="p-1.5 text-gray-400 hover:text-white" disabled={!alwaysEditable && !!value}>
            {value ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className="text-gray-300 leading-relaxed">{value || i18n.t('profile.noFieldValue', { field: label.toLowerCase() })}</p>
    </div>
  );

  const age = profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : null;

  const handleCompletionModalClose = async (answers?: any) => {
    if (answers && answers.looking_for) {
      try {
        const { error } = await supabase.rpc('update_user_looking_for', { 
          p_user_id: user.id,
          p_looking_for: answers.looking_for 
        });
        if (error) throw error;
        await checkUser(); // Refresh the user profile
        setIsCompletionModalOpen(false);
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error('Failed to save your preference. Please try again.');
      }
    } else {
      setIsCompletionModalOpen(false);
    }
  };

  const [livePopularityScore, setLivePopularityScore] = useState(profile?.popularity_score || 75);

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

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const currentSubscription = settings.find(s => s.account_type === (profile?.account_type || 'free')) || settings.find(s => s.account_type === 'free');
  const SubscriptionIcon = currentSubscription ? (currentSubscription.account_type === 'vip' ? Crown : Shield) : User;

  const tierHierarchy = { free: 0, pro: 1, vip: 2 };

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

  const { buttonStyle, setButtonStyle } = useUiStore();

  const handleSaveProfile = (updatedProfile) => {
    updateUserProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  const handlePhoneVerification = () => {
    toast.success('Phone verification initiated. Check your messages!');
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
    toast.success('Your account has been deactivated.');
    setIsDeactivationModalOpen(false);
    signOut();
  };

  const handleRefreshSubscription = async () => {
    try {
      await checkUser();
      toast.success('Subscription status refreshed!');
    } catch (error) {
      toast.error('Failed to refresh subscription status');
      console.error('Error refreshing subscription:', error);
    }
  };

  const handleApplyPromoCode = async (code: string) => {
    try {
      if (code.toUpperCase() === 'NLG36QM4FYR') {
        toast.error('This legacy admin promo path has been disabled for security.');
        setIsPromoCodeModalOpen(false);
        return;
      }

      const { data: promoCode, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (promoError || !promoCode) {
        return toast.error('Invalid promo code');
      }

      if (promoCode.max_uses !== null) {
        const { count, error: countError } = await supabase
          .from('user_promos')
          .select('*', { count: 'exact' })
          .eq('promo_code_id', promoCode.id);
        
        if (countError) throw countError;

        if (count >= promoCode.max_uses) {
          return toast.error('This promo code has reached its maximum uses.');
        }
      }

      const { data: existingRedemption, error: redemptionError } = await supabase
        .from('user_promos')
        .select('id')
        .eq('user_id', user.id)
        .eq('promo_code_id', promoCode.id)
        .maybeSingle();

      if (existingRedemption) {
        return toast.error('You have already used this promo code.');
      }

      const promoType = promoCode.type?.toLowerCase();

      // Check hierarchy to prevent downgrades
      const currentTier = tierHierarchy[profile.accountType || 'free'];
      const promoTier = tierHierarchy[promoType.replace('_account', '')] || 0;
      
      if (promoTier < currentTier) {
        return toast.error('You already have a higher tier subscription!');
      }

      // Calculate expiration date with stacking logic
      let expires_at = new Date();
      const currentExpiration = profile.subscriptionExpiresAt ? new Date(profile.subscriptionExpiresAt) : null;
      const now = new Date();

      // If current subscription is still active, stack on top of it
      if (currentExpiration && currentExpiration > now) {
        expires_at = new Date(currentExpiration.getTime() + promoCode.duration_days * 24 * 60 * 60 * 1000);
      } else {
        // Otherwise, start from today
        expires_at.setDate(expires_at.getDate() + promoCode.duration_days);
      }

      await promoService.applyPromoCode(user.id, promoCode.id, expires_at.toISOString());



    if (promoType === 'vip_account' || promoType === 'pro_account') {
      await updateUserProfile(
        { account_type: promoType.replace('_account', ''), subscription_expires_at: expires_at.toISOString() }
      );
      
      setRedeemedPromoDetails({ name: promoCode.name, description: promoCode.description });
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
        description: `${promoCode.description}. You can now view profiles and see who viewed yours for ${days} days!`
      });
      setIsCongratulationsModalOpen(true);
      checkUser();
      
      
    } else {
      setRedeemedPromoDetails({ name: promoCode.name, description: promoCode.description });
      setIsCongratulationsModalOpen(true);
      
    }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsPromoCodeModalOpen(false);
    }
  };

  const calculateProfileCompletion = () => {
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
      profile.loveLanguage,
      profile.drinking,
      profile.smoking,
      profile.firstDate,
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

  const profileCompletion = calculateProfileCompletion();
  const maxPhotos = (profile?.accountType === 'pro' || profile?.accountType === 'vip') ? 10 : 6;


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
                isVip
                  ? (isProfileComplete
                      ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-black shadow-lg shadow-amber-400/30 hover:from-amber-500 hover:to-orange-600'
                      : 'bg-blue-900/40 text-white/80 border border-blue-400/20 hover:bg-blue-900/60')
                  : (isPro
                      ? (isProfileComplete
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-red-600 text-white hover:bg-red-700')
                      : (isProfileComplete ? 'bg-green-600 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'))
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
            <h1 className="text-3xl font-bold text-white">{i18n.t('profile.myProfile')}</h1>
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
                className={`absolute bottom-0 right-0 p-2 rounded-full transition-all duration-300 ${
                isVip ? 'bg-amber-400 text-black hover:bg-amber-500' : (isPro ? 'bg-[#ff7f50] text-white hover:bg-[#ff5e57]' : 'bg-pink-600 text-white hover:bg-pink-700')
              }`}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
            
            <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>{profile.name}{age ? `, ${age}` : ''}</span>
                    <VerificationBadge profile={profile} />
                  </h2>
                </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300">{profile.location?.name || i18n.t('general.notSpecified')}</span>
                {!profile.location?.name && <span className="text-xs text-red-400">Required</span>}
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
              <h3 className="text-lg font-semibold text-white">{i18n.t('profile.myPhotos')}</h3>
              {(!profile.photos || profile.photos.length < 3) && (
                <span className="text-xs text-red-400">Required (3 minimum)</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {profile.photos && profile.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer" onClick={() => { setViewerStartIndex(index); setIsViewerOpen(true); }}>
                  <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
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
              <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center">
                  <button 
                  onClick={() => setIsPhotoUploaderOpen(true)}
                  className="w-full h-full flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(profile.photos?.length || 0) >= maxPhotos}
                >
                  <Plus className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">{i18n.t('aboutMe')}</h3>
              {!profile.bio && <span className="text-xs text-red-400 invisible">Required</span>}
            </div>
            <ProfileField field="bio" value={profile.bio} label={i18n.t('aboutMe')} isRequired={true} />
            <ProfileField field="hereFor" value={profile.hereFor} label={i18n.t('profile.sections.hereFor')} isRequired={true} alwaysEditable={true} />
            <ProfileField field="occupation" value={(profile as any).occupation} label={i18n.t('work')} isRequired={false} />
            <ProfileField field="education" value={profile.education} label={i18n.t('education')} isRequired={false} />
            <ProfileField field="height" value={profile.height} label={i18n.t('height')} isRequired={false} />
            <ProfileField field="religion" value={profile.religion} label={i18n.t('religion')} isRequired={false} />
            <ProfileField field="loveLanguage" value={profile.loveLanguage} label={i18n.t('profile.details.loveLanguage')} isRequired={false} />
            <ProfileField field="drinking" value={profile.drinking} label={i18n.t('profile.details.drinking')} isRequired={false} />
            <ProfileField field="smoking" value={profile.smoking} label={i18n.t('profile.details.smoking')} isRequired={false} />
            <ProfileField field="kids" value={(profile as any).kids} label={i18n.t('profile.details.kids')} isRequired={false} />
            <ProfileField field="firstDate" value={profile.firstDate} label={i18n.t('profile.details.firstDate')} isRequired={false} />
          </div>



        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{i18n.t('subscription')}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshSubscription}
                  className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300"
                  title="Refresh subscription status"
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
                      ? `${isVip ? 'border-amber-400' : isPro ? 'border-cyan-400' : 'border-pink-500'} bg-white/20`
                      : 'border-transparent bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon className={`w-5 h-5 text-white`} />
                    <h4 className="font-semibold text-white">{setting.account_type.toUpperCase()}</h4>
                    {isCurrent && <CheckCircle className={`w-5 h-5 ${isVip ? 'text-amber-400' : isPro ? 'text-cyan-400' : 'text-pink-500'}`} />}
                  </div>
                  
                  <ul className="space-y-1 mb-4">
                    <li className="text-sm text-gray-300 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{setting.swipes_per_week === -1 ? i18n.t('pricing.unlimited') : setting.swipes_per_week} {i18n.t('pricing.swipes')}</span>
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
                    <div className={`text-center py-2 text-sm font-medium ${isVip ? 'text-amber-400' : isPro ? 'text-cyan-400' : 'text-pink-400'}`}>{i18n.t('subscription.currentPlan')}</div>
                  ) : tierHierarchy[setting.account_type] > tierHierarchy[profile.accountType || 'free'] ? (
            <button
              onClick={() => setIsUpgradeModalOpen(true)} className={`w-full py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                isVip ? 'bg-amber-400 text-black hover:bg-amber-500' : (isPro ? 'bg-[#ff7f50] text-white hover:bg-[#ff5e57]' : 'bg-pink-600 text-white hover:bg-pink-700')
              }`}>{i18n.t('subscription.upgrade')}</button>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">{i18n.t('settings')}</h3>
          
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
                      {lang.name}
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
                    ? (isVip ? 'bg-amber-400 hover:bg-amber-500 text-black' : (isPro ? 'bg-[#ff7f50] hover:bg-[#ff5e57]' : 'bg-green-500 hover:bg-green-600'))
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
                <span className="text-white">Location Scope</span>
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
                className={`px-4 py-1 rounded-lg transition-colors duration-300 text-sm ${
                  isVip ? 'bg-amber-400 text-black hover:bg-amber-500' : (isPro ? 'bg-[#ff7f50] text-white hover:bg-[#ff5e57]' : 'bg-purple-500 text-white hover:bg-purple-600')
                }`}
              >
                {i18n.t('promo.enter')}
              </button>
            </div>



            <div className="flex items-center justify-between p-3 bg-white/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <Slash className="w-5 h-5 text-gray-300" />
                <span className="text-white">{i18n.t('deactivate.title')}</span>
              </div>
              <button
                onClick={() => setIsDeactivationModalOpen(true)}
                className={`px-4 py-1 rounded-lg transition-colors duration-300 text-sm ${
                  isVip ? 'bg-amber-400 text-black hover:bg-amber-500' : (isPro ? 'bg-[#ff7f50] text-white hover:bg-[#ff5e57]' : 'bg-red-500 text-white hover:bg-red-600')
                }`}
              >
                {i18n.t('deactivate.button')}
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
          <h3 className="text-xl font-bold text-white mb-4">{i18n.t('swipe.menu.buttonStyle')}</h3>
          <div className="flex justify-around">
            <button 
              onClick={() => setButtonStyle('upendo-color')}
              className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${
                buttonStyle === 'upendo-color'
                  ? (isVip ? 'bg-amber-500' : (isPro ? 'bg-[#ff7f50]' : 'bg-pink-500'))
                  : 'bg-white/20'
              }`}>{i18n.t('swipe.menu.upendoColor')}</button>
            <button 
              onClick={() => setButtonStyle('white-clean')}
              className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${buttonStyle === 'white-clean' ? (isVip ? 'bg-amber-500' : isPro ? 'bg-[#ff7f50]' : 'bg-pink-500') : 'bg-white/20'}`}>
              {i18n.t('swipe.menu.whiteClean')}
            </button>
            <button 
              onClick={() => setButtonStyle('vintage')}
              className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${buttonStyle === 'vintage' ? (isVip ? 'bg-amber-500' : isPro ? 'bg-[#ff7f50]' : 'bg-pink-500') : 'bg-white/20'}`}>
              {i18n.t('swipe.menu.vintage')}
            </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-6 w-full max-w-md text-white border border-white/10">
            <ProfilePhotoUploader maxPhotos={maxPhotos - (profile.photos?.length || 0)} />
            <button onClick={() => setIsPhotoUploaderOpen(false)} className="mt-4 w-full font-bold py-2 px-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-300">{i18n.t('general.close')}</button>
          </div>
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
          title="Crop Your Photo"
        />
      )}
      {isDeactivationModalOpen && (
        <DeactivationModal
          onClose={() => setIsDeactivationModalOpen(false)}
          onDeactivate={handleAccountDeactivate}
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
