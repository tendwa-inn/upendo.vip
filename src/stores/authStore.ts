
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
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),

  checkUser: async () => {
    const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      set({ session: null, user: null, profile: null, isAdmin: false, loading: false });
      return;
    }
    
    set({ session: freshSession, user: freshSession?.user ?? null });
    
    try {
      if (freshSession?.user) {
        // Also record user activity for popularity score
        recordUserActivity(freshSession.user.id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', freshSession.user.id);

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          set({ profile: null });
          return;
        }

        const profile = profiles && profiles.length > 0 ? profiles[0] : null;
        console.log('[DEBUG] Raw profile keys from authStore:', profile ? Object.keys(profile) : 'No profile found');

        if (!profile) {
          set({ profile: null });
          return; 
        }

        const processedProfile: User = { 
          ...profile,
          lastActive: profile.last_active_at || profile.lastActive,
          account_type: profile.account_type || profile.subscription,
        } as User;

        if (profile.strikes >= 3) {
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
          messageRequestResetDate: (processedProfile as any).message_request_reset_date ? new Date((processedProfile as any).message_request_reset_date) : null
        });

        get().fetchInitialData();

        // Set up a real-time listener for the user's profile, if one doesn't exist
        if (!get().channel) {
          const channel = supabase.channel(`profile:${processedProfile.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${processedProfile.id}` }, payload => {
              console.log('Profile change detected, refetching profile...', payload);
              get().checkUser();
            })
            .subscribe();
          set({ channel });
        }

      } else {
        set({ profile: null, isAdmin: false });
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      set({ loading: false });
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
      await channel.unsubscribe();
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed. Please try again.");
    } else {
      set({ session: null, user: null, profile: null, isAdmin: false, channel: null });
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
