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
    const baseMatches = (matchesRes.data || []).filter(p => {
      const hasPhotos = p.photos?.length > 0;
      const hasLocation = !!p.location_name;
      const alreadySwiped = swipedIds.has(p.id);

      // Debugging Tip: Uncomment the line below to see why users are hidden
      // console.log(`User ${p.id}: Photos:${hasPhotos}, Loc:${hasLocation}, Swiped:${alreadySwiped}`);

      return hasPhotos && hasLocation && !alreadySwiped;
    });

    const ids = baseMatches.map(p => p.id);
    const profilesRes = ids.length
      ? await supabase.from('profiles').select('id,age,dob,date_of_birth,bio').in('id', ids)
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
