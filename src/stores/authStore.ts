import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  isAdmin: boolean;
  loading: boolean;
  messageRequestsSent: number;
  messageRequestResetDate: Date | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: User | null) => void;
  checkUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updateData: any, onSuccess?: () => void) => Promise<void>;
  createProfile: (formData: any) => Promise<void>;
  incrementMessageRequests: () => void;
  signUpWithEmail: (email, password) => Promise<any>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  messageRequestsSent: 0,
  messageRequestResetDate: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),

  checkUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, isAdmin: false });
      if (session?.user) {
        let profiles = null;
        let profileError = null;
        
        // Retry logic for profile fetch
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const result = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id);
            
            profiles = result.data;
            profileError = result.error;
            
            if (!profileError) break; // Success, exit retry loop
            
            console.warn(`Profile fetch attempt ${attempt} failed:`, profileError);
            if (attempt < 3) {
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          } catch (retryError) {
            console.warn(`Profile fetch attempt ${attempt} threw error:`, retryError);
            profileError = retryError;
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }

        if (profileError) {
          console.error("Error fetching profile after retries:", profileError);
          // Don't set profile to null on connection errors - keep existing state
          const isConnectionError = 
            profileError.message?.includes('Failed to fetch') ||
            profileError.message?.includes('ERR_CONNECTION_RESET') ||
            profileError.message?.includes('ERR_ABORTED') ||
            profileError.code === 'PGRST200' ||
            profileError.code === 'ECONNRESET';
            
          if (isConnectionError) {
            console.warn('Connection error detected, keeping existing profile state');
            return;
          }
          set({ profile: null });
          return;
        }

        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        if (!profile) {
          set({ profile: null });
          return; 
        }

        // Create a new object for the profile to ensure reactivity
        const processedProfile: User = { ...profile } as User;

        if ((processedProfile as any).is_banned) {
          toast.error('Your account has been banned due to a policy violation.');
          get().signOut();
          return;
        }

        // Handle location data
        if (processedProfile.location && typeof processedProfile.location === 'string') {
          const pointRegex = /POINT\(([-\d.]+) ([-\d.]+)\)/;
          const match = (processedProfile.location as string).match(pointRegex);
          if (match) {
            processedProfile.location = {
              name: (processedProfile as any).location_name || '',
              longitude: parseFloat(match[1]),
              latitude: parseFloat(match[2]),
            };
          } else if ((processedProfile as any).location_name) {
            // Fallback if location is just a name
            processedProfile.location = {
              name: (processedProfile as any).location_name,
              longitude: null,
              latitude: null,
            };
          }
        } else if ((processedProfile as any).location_name) {
            // Fallback if location is just a name
            processedProfile.location = {
              name: (processedProfile as any).location_name,
              longitude: null,
              latitude: null,
            };
        }

        // Data transformations
        if ((processedProfile as any).relationship_intent !== undefined) {
          processedProfile.relationshipIntent = (processedProfile as any).relationship_intent;
          delete (processedProfile as any).relationship_intent;
        }
        if ((processedProfile as any).interested_in !== undefined) {
          processedProfile.lookingFor = (processedProfile as any).interested_in;
          delete (processedProfile as any).interested_in;
        }
        if ((processedProfile as any).dob) {
          processedProfile.dateOfBirth = new Date((processedProfile as any).dob);
        }
        if ((processedProfile as any).message_request_reset_date) {
          processedProfile.messageRequestResetDate = new Date((processedProfile as any).message_request_reset_date);
        }
        if ((processedProfile as any).message_requests_sent !== undefined) {
          processedProfile.messageRequestsSent = (processedProfile as any).message_requests_sent;
        }
        if ((processedProfile as any).account_type !== undefined) {
          processedProfile.accountType = (processedProfile as any).account_type;
          delete (processedProfile as any).account_type;
        }
        if ((processedProfile as any).ghost_mode_enabled !== undefined) {
          processedProfile.ghostModeEnabled = (processedProfile as any).ghost_mode_enabled;
          delete (processedProfile as any).ghost_mode_enabled;
        }
        if ((processedProfile as any).can_view_profiles_expires_at !== undefined) {
          processedProfile.canViewProfilesExpiresAt = (processedProfile as any).can_view_profiles_expires_at;
          delete (processedProfile as any).can_view_profiles_expires_at;
        }
        if ((processedProfile as any).daily_vibe !== undefined) {
          (processedProfile as any).dailyVibe = (processedProfile as any).daily_vibe;
          delete (processedProfile as any).daily_vibe;
        }
        if ((processedProfile as any).daily_vibe_expires_at !== undefined) {
          (processedProfile as any).dailyVibeExpiresAt = (processedProfile as any).daily_vibe_expires_at;
          delete (processedProfile as any).daily_vibe_expires_at;
        }
        if ((processedProfile as any).first_date !== undefined) {
          processedProfile.firstDate = (processedProfile as any).first_date;
          delete (processedProfile as any).first_date;
        }
        if ((processedProfile as any).love_language !== undefined) {
          processedProfile.loveLanguage = (processedProfile as any).love_language;
          delete (processedProfile as any).love_language;
        }

        // Fetch user promos to check for profile_views
        try {
          const { data: userPromos } = await supabase
            .from('user_promos')
            .select(`
              expires_at,
              promo_codes!inner (
                type
              )
            `)
            .eq('user_id', session.user.id)
            .eq('promo_codes.type', 'profile_views')
            .gt('expires_at', new Date().toISOString())
            .order('expires_at', { ascending: false })
            .limit(1);

          if (userPromos && userPromos.length > 0) {
            processedProfile.canViewProfilesExpiresAt = userPromos[0].expires_at;
          }
        } catch (err) {
          console.error('Error fetching user promos for profile views:', err);
        }

        let isAdmin = false;
        try {
          const { data: adminResult, error: adminError } = await supabase.rpc('is_admin');
          if (adminError) {
            console.error('Error checking admin status:', adminError);
          } else {
            isAdmin = Boolean(adminResult);
          }
        } catch (err) {
          console.error('Unexpected error checking admin status:', err);
        }

        set({ 
          profile: processedProfile, 
          isAdmin,
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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Logout failed. Please try again.");
        console.error("Error logging out:", error);
      } else {
        set({ session: null, user: null, profile: null, isAdmin: false });
      }
    } catch (error) {
      toast.error("An unexpected error occurred during logout.");
      console.error("Unexpected logout error:", error);
    }
  },

  updateUserProfile: async (updateData: any, onSuccess?: () => void) => {
    const { user } = get();
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    // Handle location data
    const processedUpdateData = { ...updateData };

    // Never allow the client profile editor to send privileged auth fields.
    delete processedUpdateData.role;
    delete processedUpdateData.is_banned;
    delete processedUpdateData.is_blocked;
    delete processedUpdateData.account_type;
    delete processedUpdateData.subscription_tier;
    delete processedUpdateData.can_view_profiles_expires_at;
    delete processedUpdateData.message_requests_sent;
    delete processedUpdateData.message_request_reset_date;
    if (updateData.location && typeof updateData.location === 'object' && updateData.location.name && updateData.location.longitude && updateData.location.latitude) {
      // Convert location object to PostGIS POINT format
      processedUpdateData.location = `POINT(${updateData.location.longitude} ${updateData.location.latitude})`;
      processedUpdateData.location_name = updateData.location.name;
    }

    // Convert relationshipIntent to relationship_intent
    if (updateData.relationshipIntent !== undefined) {
      processedUpdateData.relationship_intent = updateData.relationshipIntent;
      delete processedUpdateData.relationshipIntent;
    }

    // Convert lookingFor to interested_in
    if (updateData.lookingFor !== undefined) {
      processedUpdateData.interested_in = updateData.lookingFor;
      delete processedUpdateData.lookingFor;
    }

    // Convert accountType to account_type
    if (updateData.accountType !== undefined) {
      processedUpdateData.account_type = updateData.accountType;
      delete processedUpdateData.accountType;
    }

    // Convert ghostModeEnabled to ghost_mode_enabled
    if (updateData.ghostModeEnabled !== undefined) {
      processedUpdateData.ghost_mode_enabled = updateData.ghostModeEnabled;
      delete processedUpdateData.ghostModeEnabled;
    }

    // Convert canViewProfilesExpiresAt to can_view_profiles_expires_at
    if (updateData.canViewProfilesExpiresAt !== undefined) {
      processedUpdateData.can_view_profiles_expires_at = updateData.canViewProfilesExpiresAt;
      delete processedUpdateData.canViewProfilesExpiresAt;
    }
    if (updateData.dailyVibe !== undefined) {
      processedUpdateData.daily_vibe = updateData.dailyVibe;
      delete processedUpdateData.dailyVibe;
    }
    if (updateData.dailyVibeExpiresAt !== undefined) {
      processedUpdateData.daily_vibe_expires_at = updateData.dailyVibeExpiresAt;
      delete processedUpdateData.dailyVibeExpiresAt;
    }

    // Convert firstDate to first_date
    if (updateData.firstDate !== undefined) {
      processedUpdateData.first_date = updateData.firstDate;
      delete processedUpdateData.firstDate;
    }

    // Convert loveLanguage to love_language
    if (updateData.loveLanguage !== undefined) {
      processedUpdateData.love_language = updateData.loveLanguage;
      delete processedUpdateData.loveLanguage;
    }

    // Convert dateOfBirth to birthday
    if (updateData.dateOfBirth) {
      processedUpdateData.dob = updateData.dateOfBirth;
      delete processedUpdateData.dateOfBirth;
    } else if (updateData.dob) {
      processedUpdateData.dob = updateData.dob;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...processedUpdateData })
      .eq('id', user.id)
      .select();

    if (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message);
    } else {
      if (onSuccess) {
        await onSuccess();
      } else {
        toast.success("Profile updated!");
      }
      await get().checkUser();
    }
  },

  createProfile: async (formData: any) => {
    const { user } = get();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Handle location data
    const processedFormData = { ...formData };
    if (formData.location && typeof formData.location === 'object' && formData.location.name) {
      // Convert location object to PostGIS POINT format
      processedFormData.location = `POINT(${formData.location.longitude} ${formData.location.latitude})`;
      processedFormData.location_name = formData.location.name;
    }

    // Convert relationshipIntent to relationship_intent
    if (formData.relationshipIntent !== undefined) {
      processedFormData.relationship_intent = formData.relationshipIntent;
      delete processedFormData.relationshipIntent;
    }

    // Convert lookingFor to interested_in
    if (formData.lookingFor !== undefined) {
      processedFormData.interested_in = formData.lookingFor;
      delete processedFormData.lookingFor;
    }

    // Convert accountType to account_type
    if (formData.accountType !== undefined) {
      processedFormData.account_type = formData.accountType;
      delete processedFormData.accountType;
    }

    // Convert ghostModeEnabled to ghost_mode_enabled
    if (formData.ghostModeEnabled !== undefined) {
      processedFormData.ghost_mode_enabled = formData.ghostModeEnabled;
      delete processedFormData.ghostModeEnabled;
    }

    // Convert dateOfBirth to birthday
    if (formData.dateOfBirth) {
      processedFormData.birthday = formData.dateOfBirth;
      delete processedFormData.dateOfBirth;
    }

    const { error } = await supabase.rpc('create_new_user_profile', {
      p_user_id: user.id,
      p_name: processedFormData.name,
      p_birthday: processedFormData.dob,
      p_gender: processedFormData.gender,
      p_interested_in: processedFormData.interested_in,
      p_relationship_intent: processedFormData.relationship_intent,
      p_interests: processedFormData.interests,
      p_kids: processedFormData.kids,
      p_location: processedFormData.location,
    });

    if (error) {
      throw error;
    }

    await get().checkUser();
  },

  incrementMessageRequests: () => {
    set((state) => ({
      messageRequestsSent: state.messageRequestsSent + 1,
    }));
  },
}));
