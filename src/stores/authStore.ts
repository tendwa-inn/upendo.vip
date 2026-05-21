import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Session, User as SupabaseUser, RealtimeChannel } from '@supabase/supabase-js';
import { User } from '../types';
import { wordFilterService } from '../services/wordFilterService';
import { recordUserActivity } from '../services/popularityService';
import { initOneSignal } from '../lib/onesignal';

import { useNotificationStore } from './notificationStore';
import { useMatchStore } from './matchStore';
import { useDiscoveryStore } from './discoveryStore';
import { useLikesStore } from './likesStore';
import { useViewsStore } from './viewsStore';
import { useSwipeStore } from './swipeStore';
import { useOnboardingStore } from './onboardingStore';
import { systemMessengerService } from '../services/systemMessengerService';

interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  isProfileComplete: boolean;
  hasAllRequiredFields: boolean;
  isAdmin: boolean;
  loading: boolean;
  isSuspended: boolean;
  isPro: boolean;
  isVip: boolean;
  messageRequestsSent: number;
  messageRequestResetDate: Date | null;
  channel: RealtimeChannel | null;
  isInitialized: boolean;
  profileLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: User | null) => void;
  checkUser: () => Promise<void>;
  fetchInitialData: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updateData: any, onSuccess?: () => void) => Promise<void>;
  createProfile: (formData: any) => Promise<void>;
  incrementMessageRequests: () => void;
  signUpWithEmail: (email, password) => Promise<any>;
  applyPromoCode: (promoCode: string) => Promise<void>;
  reset: () => void;
}

let isChecking = false;

const initialState = {
  session: null,
  user: null,
  profile: null,
  isProfileComplete: false,
  hasAllRequiredFields: false,
  isAdmin: false,
  loading: true,
  isSuspended: false,
  isPro: false,
  isVip: false,
  messageRequestsSent: 0,
  messageRequestResetDate: null,
  channel: null,
  isInitialized: false,
  profileLoading: true,
};

const _calculateIsProfileComplete = (profile: User | null): boolean => {
  if (!profile) return false;
  return !!profile && !!profile.name && !!profile.gender && (profile as any).onboarding_completed === true;
};

const _hasAllRequiredFields = (profile: User | null): boolean => {
  if (!profile) return false;
  
  // Check required fields
  const hasBio = !!profile.bio && profile.bio.trim().length > 0;
  const hasHereFor = Array.isArray(profile.hereFor) && profile.hereFor.length > 0;
  const hasPhotos = Array.isArray(profile.photos) && profile.photos.length >= 3;
  const hasLocation = !!profile.location?.name;
  
  return hasBio && hasHereFor && hasPhotos && hasLocation;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile, isProfileComplete: _calculateIsProfileComplete(profile), hasAllRequiredFields: _hasAllRequiredFields(profile) }),
  reset: () => set(initialState),

  checkUser: async () => {
    if (isChecking) return;
    isChecking = true;

    try {
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {

        set({
          session: null,
          user: null,
          profile: null,
          isProfileComplete: false,
          hasAllRequiredFields: false,
          isAdmin: false,
          loading: false,
          isInitialized: true,
          profileLoading: false
        });
        return;
      }
      
      // Set session and mark auth as initialized, but keep profile loading
      set({
        session: freshSession,
        user: freshSession?.user ?? null,
        loading: true,
        profileLoading: true
      });
      
      if (freshSession?.user) {
        // Also record user activity for popularity score
        recordUserActivity(freshSession.user.id);
        
        // Add timeout for profile loading to prevent infinite waiting
        const profileTimeout = setTimeout(() => {
  
          set({ profileLoading: false });
        }, 10000); // 10 second timeout
        
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', freshSession.user.id)
            .maybeSingle();

          clearTimeout(profileTimeout);

          if (profileError) {

            set({ profile: null, isProfileComplete: false, hasAllRequiredFields: false, loading: false, profileLoading: false, isInitialized: true });
            return;
          }

    

          if (!profile) {
            set({ profile: null, isProfileComplete: false, hasAllRequiredFields: false, loading: false, profileLoading: false, isInitialized: true });
            return;
          }

          const processedProfile: User = {
            ...profile,
            lastActive: profile.last_active_at || profile.lastActive || new Date(),
            account_type: profile.account_type || profile.subscription || 'free',
            // Ensure required properties exist with safe defaults
            bio: profile.bio || '',
            hereFor: profile.here_for || profile.hereFor || [],
            photos: profile.photos || [],
            onboarding_completed: profile.onboarding_completed || (profile as any).onboarded || false,
            // Handle strikes safely
            strikes: profile.strikes || 0,
            firstDate: profile.first_date || profile.firstDate || '',
            occupation: profile.occupation || '',
            kids: profile.kids || '',
          } as User;

        if ((profile.strikes || 0) >= 3) {
          toast.error('Your account has been banned.');
          get().signOut();
          return;
        }

        if (processedProfile.location && typeof processedProfile.location === 'string') {
          const pointRegex = /POINT\\(([-\\d.]+) ([-\\d.]+)\\)/;
          const match = (processedProfile.location as string).match(pointRegex);
          if (match) {
            processedProfile.location = {
              name: (processedProfile as any).location_name || '',
              longitude: parseFloat(match[1]),
              latitude: parseFloat(match[2]),
            };
          } else if ((processedProfile as any).location_name) {
            processedProfile.location = {
              name: (processedProfile as any).location_name,
              longitude: null,
              latitude: null,
            };
          }
        } else if ((processedProfile as any).location_name) {
            processedProfile.location = {
              name: (processedProfile as any).location_name,
              longitude: null,
              latitude: null,
            };
        }

        if ((processedProfile as any).dob) {
          processedProfile.dateOfBirth = new Date((processedProfile as any).dob);
        }

        // Check subscription expiry — promo-granted tiers expire, permanent ones have null expiry
        const subExpiry = (processedProfile as any).subscription_expires_at;
        const subscriptionExpired = subExpiry ? new Date(subExpiry) <= new Date() : false;
        const effectiveAccountType = subscriptionExpired ? 'free' : ((processedProfile as any).account_type || 'free');
        const isVip = effectiveAccountType === 'vip';
        const isPro = effectiveAccountType === 'pro';

        // Auto-revert expired subscription in DB
        if (subscriptionExpired && (processedProfile as any).account_type !== 'free') {
          supabase.from('profiles').update({ account_type: 'free', subscription_expires_at: null }).eq('id', freshSession.user.id).then();
          (processedProfile as any).account_type = 'free';
        }

        // Initialize OneSignal after successful authentication
        try {
          await initOneSignal(freshSession.user.id);
        } catch (onesignalError) {

          // Continue even if OneSignal fails - don't block the app
        }

        // Initialize realtime listeners early after login
        try {
          useMatchStore.getState().initializeRealtime();
        } catch (realtimeError) {

          // Continue even if realtime fails - don't block the app
        }

        set({
          profile: processedProfile,
          isProfileComplete: _calculateIsProfileComplete(processedProfile),
          hasAllRequiredFields: _hasAllRequiredFields(processedProfile),
          isAdmin: (processedProfile as any).role === 'admin',
          isSuspended: false,
          isPro,
          isVip,
          messageRequestsSent: (processedProfile as any).message_requests_sent || 0,
          messageRequestResetDate: (processedProfile as any).message_request_reset_date ? new Date((processedProfile as any).message_request_reset_date) : null,
          loading: false,
          profileLoading: false,
          isInitialized: true
        });

        // Set up a real-time listener for the user's profile, if one doesn't exist
        if (!get().channel) {
          get().fetchInitialData();

          const channel = supabase.channel(`profile:${processedProfile.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${processedProfile.id}` }, payload => {
              // Process location data properly for local state
              const updatedProfile = { ...payload.new };
              if (updatedProfile.location && typeof updatedProfile.location === 'string') {
                const pointRegex = /POINT\(([-\d.]+) ([-\d.]+)\)/;
                const match = (updatedProfile.location as string).match(pointRegex);
                if (match) {
                  updatedProfile.location = {
                    name: (updatedProfile as any).location_name || '',
                    longitude: parseFloat(match[1]),
                    latitude: parseFloat(match[2]),
                  };
                } else if ((updatedProfile as any).location_name) {
                  updatedProfile.location = {
                    name: (updatedProfile as any).location_name,
                    longitude: null,
                    latitude: null,
                  };
                }
              } else if ((updatedProfile as any).location_name) {
                updatedProfile.location = {
                  name: (updatedProfile as any).location_name,
                  longitude: null,
                  latitude: null,
                };
              }
              
              set((state) => {
                const newProfile = {
                  ...state.profile,
                  ...updatedProfile,
                } as User;
                return {
                  profile: newProfile,
                  isProfileComplete: _calculateIsProfileComplete(newProfile),
                  hasAllRequiredFields: _hasAllRequiredFields(newProfile),
                };
              });
            })
            .subscribe();
          set({ channel });
        }
        } catch (profileError) {

          set({ profile: null, isProfileComplete: false, hasAllRequiredFields: false, loading: false, profileLoading: false, isInitialized: true });
        }

      } else {
        set({
          profile: null,
          isProfileComplete: false,
          hasAllRequiredFields: false,
          isAdmin: false,
          loading: false,
          profileLoading: false,
          isInitialized: true,
          session: null,
          user: null
        });
      }

      isChecking = false;
    } catch (error) {
      console.error('Error in checkUser:', error);
      isChecking = false;
      set({
        profile: null,
        isProfileComplete: false,
        hasAllRequiredFields: false,
        loading: false,
        profileLoading: false,
        isInitialized: true,
      });
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) toast.error(error.message);
  },

  signUpWithEmail: async (email: string, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    await get().checkUser();
    return data;
  },

  fetchInitialData: async () => {
    await useNotificationStore.getState().fetchNotifications();
    // Setup realtime notification subscription
    useNotificationStore.getState().subscribeToNotifications();
    await useMatchStore.getState().fetchMatches();
    await useDiscoveryStore.getState().fetchPotentialMatches();
    await useLikesStore.getState().fetchUsersWhoLikedMe();
    await useLikesStore.getState().fetchLikedUserIds();
    await useViewsStore.getState().fetchUsersWhoViewedMe();
    await useSwipeStore.getState().loadSwipeState();
    useLikesStore.getState().listenForNewLikes();
  },

  signOut: async () => {
    try {
      const { channel } = get();

      if (channel) {
        await channel.unsubscribe();
      }

      // Unsubscribe from notifications
      useNotificationStore.getState().unsubscribeFromNotifications();

      // Use global logout to ensure complete session termination
      await supabase.auth.signOut({
        scope: 'global',
      });

      // Reset onboarding store so next user starts fresh
      useOnboardingStore.getState().reset();

      // Reset state after sign-out is complete
      set({
        ...initialState,
        loading: false,
        profileLoading: false,
        isInitialized: true,
      });

    } catch (error) {

    }
  },

  updateUserProfile: async (updateData: any, onSuccess?: () => void) => {
    const { user, profile } = get();
    if (!user || !profile) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    const processedUpdateData = { ...updateData };
    if (updateData.location && typeof updateData.location === 'object' && updateData.location.name && updateData.location.longitude && updateData.location.latitude) {
      processedUpdateData.location = `POINT(${updateData.location.longitude} ${updateData.location.latitude})`;
      processedUpdateData.location_name = updateData.location.name;
    }
    if (updateData.firstDate && typeof updateData.firstDate === 'object' && updateData.firstDate.value) {
      processedUpdateData.firstDate = updateData.firstDate.value;
    }
    if (updateData.loveLanguage && typeof updateData.loveLanguage === 'object' && updateData.loveLanguage.value) {
      processedUpdateData.loveLanguage = updateData.loveLanguage.value;
    }
    if (updateData.date_of_birth) {
      processedUpdateData.dob = updateData.date_of_birth;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...processedUpdateData })
      .eq('id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      // Optimistically update the local state
      const newProfile = { ...profile, ...processedUpdateData };
      
      // Handle location data properly for local state
      if (updateData.location && typeof updateData.location === 'object' && updateData.location.name && updateData.location.longitude && updateData.location.latitude) {
        newProfile.location = {
          name: updateData.location.name,
          longitude: updateData.location.longitude,
          latitude: updateData.location.latitude
        };
      }
      
      set({
        profile: newProfile,
        isProfileComplete: _calculateIsProfileComplete(newProfile),
        hasAllRequiredFields: _hasAllRequiredFields(newProfile),
        isPro: (() => { const exp = (newProfile as any).subscription_expires_at; return exp && new Date(exp) <= new Date() ? false : newProfile.account_type === 'pro'; })(),
        isVip: (() => { const exp = (newProfile as any).subscription_expires_at; return exp && new Date(exp) <= new Date() ? false : newProfile.account_type === 'vip'; })(),
      });

      if (onSuccess) await onSuccess();
      else toast.success("Profile updated!");
    }
    return;
  },

  createProfile: async (formData: any) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabase.rpc('create_new_user_profile', {
      p_user_id: user.id,
      p_name: formData.name,
      p_birthday: formData.date_of_birth,
      p_gender: formData.gender,
      p_looking_for: formData.looking_for, // Add this line
      p_location_name: formData.location?.name || '',
      p_longitude: formData.location?.coordinates?.[0] || null,
      p_latitude: formData.location?.coordinates?.[1] || null
    });
    
    if (error) throw error;
    await get().checkUser();
    const { profile, isProfileComplete } = get();

    
    // Send welcome messages to new user after successful profile creation
    if (isProfileComplete && profile && (profile as any).onboarding_completed) {
      try {
        await systemMessengerService.sendWelcomeMessagesToNewUser(user.id);
      } catch (welcomeError) {

        // Don't throw error here, as profile creation was successful
      }
    }
  },

  incrementMessageRequests: () => {
    set((state) => ({ messageRequestsSent: state.messageRequestsSent + 1 }));
  },

  applyPromoCode: async (promoCode: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      toast.error("You must be logged in to apply a promo code.");
      return;
    }
    const user = session.user;

    try {
      const normalizedCode = promoCode.trim().toUpperCase();

      const { data: promoData, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', normalizedCode)
        .maybeSingle();

      if (promoError || !promoData) {
        toast.error('Invalid or expired promo code');
        return;
      }

      // 2. Calculate the expiration date for the user's redemption
      const expires_at = promoData.duration_days
        ? new Date(Date.now() + promoData.duration_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

  

      // 3. Call the secure RPC function to redeem the promo code.
      const { error: insertError } = await supabase.rpc('redeem_promo', {
        promo_id: promoData.id,
        expiry: expires_at
      });

      if (insertError) {
        // The unique constraint will throw an error if the user has already redeemed it
        if (insertError.code === '23505') { // Unique violation error code
          toast.error('Sorry, you cannot enter the same promo code twice, buddy.');
          return;
        }
        toast.error(insertError.message || 'Failed to apply promo code.');
        return;
      }

      toast.success(`Promo '${promoData.name}' applied successfully!`);
      await get().checkUser(); // Refresh profile to show new benefits

    } catch (error) {
      toast.error('An unexpected error occurred while applying the code.');
    }
    return;
  },
}));