import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';

const MODIFIERS: Record<string, number> = {
  free: 1,
  pro: 2,
  vip: 3,
  premium: 2,
  admin: 3,
};

export async function recalcVisibilityForCurrentUser(): Promise<void> {
  const user = useAuthStore.getState().user;
  const profile = useAuthStore.getState().profile as any;
  if (!user?.id) return;

  const tier = (profile?.accountType || profile?.subscription || 'free').toString().toLowerCase();
  const visibilityModifier = MODIFIERS[tier] ?? 1;

  const { error } = await supabase
    .from('profiles')
    .update({ visibility_modifier: visibilityModifier })
    .eq('id', user.id);

  if (error) {
    console.error('Error recalculating visibility:', error);
  }
}
