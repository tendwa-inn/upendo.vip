import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';

interface DiscoveryState {
  potentialMatches: any[];
  fetchPotentialMatches: () => Promise<void>;
  removePotentialMatch: (userId: string) => void;
}

const calculateAge = (dob?: string | Date) => {
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

const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  potentialMatches: [],

  fetchPotentialMatches: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    // 1. Run queries in parallel to save time
    const [matchesRes, swipedRes] = await Promise.all([
      supabase.rpc('find_profiles_near_user', { p_user_id: user.id }),
      supabase.from('likes').select('liked_id').eq('liker_id', user.id)
    ]);

    if (matchesRes.error) {
      console.error('RPC Error:', matchesRes.error);
      return;
    }

    const swipedIds = new Set(swipedRes.data?.map(s => s.liked_id) || []);

    // 2. Filter with console logs to see WHERE profiles are being dropped
    const raw = matchesRes.data || []; 
 
    console.log("🔥 RAW PROFILES FROM DB:", raw); 
 
    const baseMatches = raw.filter(p => { 
      console.log("➡️ Checking profile:", p.id); 
 
      const alreadySwiped = swipedIds.has(p.id); 
      const hasPhotos = Array.isArray(p.photos); 
      const photosCount = p.photos?.length || 0; 
 
      console.log({ 
        id: p.id, 
        alreadySwiped, 
        hasPhotos, 
        photosCount, 
        photosValue: p.photos 
      }); 
 
      return !alreadySwiped && hasPhotos && photosCount > 0; 
    });

    const ids = baseMatches.map(p => p.id);
    const profilesRes = ids.length
      ? await supabase.from('profiles').select('id,age,dob,date_of_birth,bio,relationship_intent,hereFor,height,religion,occupation,kids').in('id', ids)
      : { data: [], error: null };

    if ((profilesRes as any).error) {
      console.error('Profiles fetch error:', (profilesRes as any).error);
    }

    const extraById: Map<string, Record<string, any>> = new Map(
      ((profilesRes as any).data || []).map((row: any) => [row.id, row as Record<string, any>])
    );

    const enrichedMatches = baseMatches.map((p: Record<string, any>) => {
      const extra: Record<string, any> = extraById.get(p.id) || {};
      const merged: Record<string, any> = { ...p, ...extra };
      const dob = merged.date_of_birth || merged.dob || merged.dateOfBirth || merged.birthdate;
      return {
        ...merged,
        distance: merged.distance_meters,
        age: merged.age ?? calculateAge(dob),
      };
    });

    set({ potentialMatches: enrichedMatches });
  },

  removePotentialMatch: (userId: string) => {
    set(state => ({
      potentialMatches: state.potentialMatches.filter(match => match.id !== userId),
    }));
  },
}));



export { useDiscoveryStore };
