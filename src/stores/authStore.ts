
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Session, User as SupabaseUser, createClient } from '@supabase/supabase-js';
import { User } from '../types';
import { wordFilterService } from '../services/wordFilterService';

interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  isAdmin: boolean;
  loading: boolean;
  isSuspended: boolean;
  messageRequestsSent: number;
  messageRequestResetDate: Date | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: User | null) => void;
  checkUser: () => Promise<void>;
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
  messageRequestsSent: 0,
  messageRequestResetDate: null,
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

        if (!profile) {
          set({ profile: null });
          return; 
        }

        const processedProfile: User = { ...profile } as User;

        if ((processedProfile as any).is_banned) {
          toast.error('Your account has been banned due to a policy violation.');
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

        set({ 
          profile: processedProfile, 
          isAdmin: (processedProfile as any).role === 'admin',
          isSuspended: false,
          messageRequestsSent: (processedProfile as any).message_requests_sent || 0,
          messageRequestResetDate: (processedProfile as any).message_request_reset_date ? new Date((processedProfile as any).message_request_reset_date) : null
        });
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

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed. Please try again.");
    } else {
      set({ session: null, user: null, profile: null, isAdmin: false });
    }
  },

  updateUserProfile: async (updateData: any, onSuccess?: () => void) => {
    const { user } = get();
    if (!user) return toast.error("You must be logged in to update your profile.");

    const { error } = await supabase
      .from('profiles')
      .update({ ...updateData })
      .eq('id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      if (onSuccess) await onSuccess();
      else toast.success("Profile updated!");
      await get().checkUser();
    }
  },

  createProfile: async (formData: any, user: SupabaseUser) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase.rpc('create_new_user_profile', { /* ...formData */ });
    if (error) throw error;
    await get().checkUser();
  },

  incrementMessageRequests: () => {
    set((state) => ({ messageRequestsSent: state.messageRequestsSent + 1 }));
  },

  applyPromoCode: async (promoCode: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return toast.error("Authentication error. Please log in again.");
    }

    try {
      // 1. Find the active promo code by its text code
      const { data: promoData, error: promoError } = await supabase
        .from('promo_codes')
        .select('id, name, duration_days')
        .eq('code', promoCode)
        .single();

      if (promoError || !promoData) {
        return toast.error('This promo code is invalid or has expired.');
      }

      // 2. Calculate the expiration date for the user's redemption
      const expires_at = promoData.duration_days 
        ? new Date(Date.now() + promoData.duration_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // 3. Insert the redemption record. RLS policy will automatically check for uniqueness.
      const { error: insertError } = await supabase
        .from('user_promos')
        .insert([{
          user_id: user.id,          // This must match auth.uid() for RLS
          promo_code_id: promoData.id,
          expires_at: expires_at
        }]);

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
