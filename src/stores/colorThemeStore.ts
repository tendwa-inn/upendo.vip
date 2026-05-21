import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAvailableThemes, getTheme, ThemeDefinition, THEME_MAP, resolveTheme } from '../styles/theme';
import { supabase } from '../lib/supabaseClient';

interface ColorThemeState {
  selectedThemeId: string | null;
  setTheme: (themeId: string, userId?: string) => void;
  resetToDefault: (userId?: string) => void;
}

export const useColorThemeStore = create<ColorThemeState>()(
  persist(
    (set) => ({
      selectedThemeId: null,
      setTheme: (themeId: string, userId?: string) => {
        set({ selectedThemeId: themeId });
        // Sync to database if userId provided
        if (userId) {
          supabase.from('profiles').update({ selected_theme_id: themeId }).eq('id', userId).then();
        }
      },
      resetToDefault: (userId?: string) => {
        set({ selectedThemeId: null });
        if (userId) {
          supabase.from('profiles').update({ selected_theme_id: null }).eq('id', userId).then();
        }
      },
    }),
    {
      name: 'upendo-color-theme',
    }
  )
);

// Reactive hook for current user's theme
export const useCurrentTheme = (accountType: string): ThemeDefinition => {
  const selectedThemeId = useColorThemeStore(state => state.selectedThemeId);
  // Trust any valid theme in the map — could be tier-unlocked OR promo-granted
  if (selectedThemeId && THEME_MAP[selectedThemeId]) {
    return resolveTheme(THEME_MAP[selectedThemeId]);
  }
  return resolveTheme(getTheme(accountType));
};

// Get a theme for any user based on their account type and selected theme
export const getUserTheme = (accountType: string, selectedThemeId?: string | null): ThemeDefinition => {
  // Trust any valid theme — could be promo-granted regardless of tier
  if (selectedThemeId && THEME_MAP[selectedThemeId]) {
    return THEME_MAP[selectedThemeId];
  }
  return getTheme(accountType);
};

// Non-reactive helper for current user
export const getCurrentTheme = (accountType: string): ThemeDefinition => {
  const { selectedThemeId } = useColorThemeStore.getState();
  if (selectedThemeId && THEME_MAP[selectedThemeId]) {
    const available = getAvailableThemes(accountType);
    if (available.some(t => t.id === selectedThemeId)) {
      return THEME_MAP[selectedThemeId];
    }
  }
  return getTheme(accountType);
};
