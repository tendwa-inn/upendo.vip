import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import { useAppSettingsStore } from '../stores/appSettingsStore';

// Fallback modifiers if app_settings unavailable
const FALLBACK_MODIFIERS: Record<string, number> = {
  free: 50,
  pro: 75,
  vip: 100,
  premium: 75,
  admin: 100,
};

export async function recalcVisibilityForCurrentUser(): Promise<void> {
  const user = useAuthStore.getState().user;
  const profile = useAuthStore.getState().profile as any;
  if (!user?.id) return;

  const tier = (profile?.accountType || profile?.subscription || 'free').toString().toLowerCase();

  // Try to get visibility_rate from app_settings
  const tierSettings = useAppSettingsStore.getState().getSettingForTier(tier);
  const visibilityModifier = tierSettings?.visibility_rate ?? FALLBACK_MODIFIERS[tier] ?? 50;

  const { error } = await supabase
    .from('profiles')
    .update({ visibility_modifier: visibilityModifier })
    .eq('id', user.id);

  if (error) {
    console.error('Error recalculating visibility:', error);
  }
}
