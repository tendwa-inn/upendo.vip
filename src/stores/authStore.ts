
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Session, User as SupabaseUser, RealtimeChannel } from '@supabase/supabase-js';
import { User } from '../types';
import { wordFilterService } from '../services/wordFilterService';
import { recordUserActivity } from '../services/popularityService';

import { useNotificationStore } from './notificationStore';
import { useMatchStore } from './matchStore';
import { useDiscoveryStore } from './discoveryStore';
import { useLikesStore } from './likesStore';
import { useViewsStore } from './viewsStore';
import { useSwipeStore } from './swipeStore';

interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
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
  createProfile: (formData: any, user: SupabaseUser) => Promise<void>;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  reset: () => set(initialState),

  checkUser: async () => {
    if (isChecking) return;
    isChecking = true;

    try {
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        set({ 
          session: null, 
          user: null, 
          profile: null, 
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
        isInitialized: true,
        loading: true,
        profileLoading: true 
      });
      
      if (freshSession?.user) {
        // Also record user activity for popularity score
        recordUserActivity(freshSession.user.id);
        
        // Add timeout for profile loading to prevent infinite waiting
        const profileTimeout = setTimeout(() => {
          console.warn('Profile loading timeout - proceeding without profile');
          set({ profileLoading: false });
        }, 10000); // 10 second timeout
        
        try {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', freshSession.user.id)
            .abortSignal(new AbortController().signal); // Add abort signal for better cancellation

          clearTimeout(profileTimeout);

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            set({ profile: null, loading: false, profileLoading: false });
            return;
          }

        try {
          const profile = profiles && profiles.length > 0 ? profiles[0] : null;
          console.log('[DEBUG] Raw profile keys from authStore:', profile ? Object.keys(profile) : 'No profile found');

          if (!profile) {
            set({ profile: null, loading: false, profileLoading: false });
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

        const isVip = (processedProfile as any).account_type === 'vip';
        const isPro = (processedProfile as any).account_type === 'pro';

        // Debugging authStore profile values
        console.log('AUTHSTORE DEBUG: processedProfile', processedProfile);
        console.log('AUTHSTORE DEBUG: processedProfile.account_type', (processedProfile as any).account_type);
        console.log('AUTHSTORE DEBUG: isVip', isVip);
        console.log('AUTHSTORE DEBUG: isPro', isPro);

        set({ 
          profile: processedProfile, 
          isAdmin: (processedProfile as any).role === 'admin',
          isSuspended: false,
          isPro,
          isVip,
          messageRequestsSent: (processedProfile as any).message_requests_sent || 0,
          messageRequestResetDate: (processedProfile as any).message_request_reset_date ? new Date((processedProfile as any).message_request_reset_date) : null,
          loading: false,
          profileLoading: false
        });

        // Set up a real-time listener for the user's profile, if one doesn't exist
        if (!get().channel) {
          get().fetchInitialData();
          const channel = supabase.channel(`profile:${processedProfile.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${processedProfile.id}` }, payload => {
              console.log('Profile updated via subscription:', payload);
              set((state) => ({
                profile: {
                  ...state.profile,
                  ...payload.new,
                } as User,
              }));
            })
            .subscribe();
          set({ channel });
        }
        } catch (profileError) {
          console.error("Error processing profile:", profileError);
          set({ profile: null, loading: false, profileLoading: false });
        }
        } catch (error) {
          console.error("Error in profile fetch block:", error);
          set({ profile: null, loading: false, profileLoading: false });
        }

      } else {
        set({ profile: null, isAdmin: false, loading: false, profileLoading: false });
      }
    } catch (error) {
      console.error("Error checking user:", error);
      set({ loading: false, profileLoading: false });
    } finally {
      isChecking = false;
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    if (error) toast.error(error.message);
  },

  signUpWithEmail: async (email, password) => {
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
    await useMatchStore.getState().fetchMatches();
    await useDiscoveryStore.getState().fetchPotentialMatches();
    await useLikesStore.getState().fetchUsersWhoLikedMe();
    await useViewsStore.getState().fetchUsersWhoViewedMe();
    await useSwipeStore.getState().loadSwipeState();
    useLikesStore.getState().listenForNewLikes();
  },

  signOut: async () => {
    const { channel } = get();
    if (channel) {
      try {
        await channel.unsubscribe();
      } catch (e) {
        console.warn('Error unsubscribing from channel', e);
      }
    }
    
    // Clear local session immediately to prevent UI issues
    try {
      // Clear local storage first
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('upendo-auth-token');
      }
      
      // Attempt signout - network errors are handled by the supabase client wrapper
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message?.includes('aborted') && !error.message?.includes('network')) {
        // Only show toast for non-network errors
        toast.error("Logout failed. Please try again.");
      }
      
    } catch (error: any) {
      console.warn('SignOut cleanup error:', error);
    }
  },

  updateUserProfile: async (updateData: any, onSuccess?: () => void) => {
    const { user, profile } = get();
    if (!user || !profile) return toast.error("You must be logged in to update your profile.");

    const processedUpdateData = { ...updateData };
    if (updateData.location && typeof updateData.location === 'object' && updateData.location.name && updateData.location.longitude && updateData.location.latitude) {
      processedUpdateData.location = `POINT(${updateData.location.longitude} ${updateData.location.latitude})`;
      processedUpdateData.location_name = updateData.location.name;
    }
    if (updateData.firstDate && typeof updateData.firstDate === 'object') {
      processedUpdateData.firstDate = updateData.firstDate.value;
    }
    if (updateData.loveLanguage && typeof updateData.loveLanguage === 'object') {
      processedUpdateData.loveLanguage = updateData.loveLanguage.value;
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
      set({
        profile: newProfile,
        isPro: newProfile.account_type === 'pro',
        isVip: newProfile.account_type === 'vip',
      });

      if (onSuccess) await onSuccess();
      else toast.success("Profile updated!");
    }
  },

  createProfile: async (formData: any, user: SupabaseUser) => {
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabase.rpc('create_new_user_profile', {
      p_user_id: user.id,
      p_name: formData.name,
      p_birthday: formData.date_of_birth,
      p_gender: formData.gender,
      p_location_name: formData.location?.name || '',
      p_longitude: formData.location?.coordinates?.[0],
      p_latitude: formData.location?.coordinates?.[1]
    });
    
    if (error) throw error;
    await get().checkUser();
  },

  incrementMessageRequests: () => {
    set((state) => ({ messageRequestsSent: state.messageRequestsSent + 1 }));
  },

  applyPromoCode: async (promoCode: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return toast.error("You must be logged in to apply a promo code.");
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
        return toast.error('Invalid or expired promo code');
      }

      // 2. Calculate the expiration date for the user's redemption
      const expires_at = promoData.duration_days 
        ? new Date(Date.now() + promoData.duration_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // DEBUG: Log the session to ensure it's not null
      console.log("SESSION BEFORE INSERT:", session);

      // 3. Call the secure RPC function to redeem the promo code.
      const { error: insertError } = await supabase.rpc('redeem_promo', { 
        promo_id: promoData.id, 
        expiry: expires_at 
      });

      if (insertError) {
        // The unique constraint will throw an error if the user has already redeemed it
        if (insertError.code === '23505') { // Unique violation error code
          return toast.error('You have already used this promo code.');
        }
        return toast.error(insertError.message || 'Failed to apply promo code.');
      }

      toast.success(`Promo '${promoData.name}' applied successfully!`);
      await get().checkUser(); // Refresh profile to show new benefits

    } catch (error) {
      toast.error('An unexpected error occurred while applying the code.');
    }
  },
}));
