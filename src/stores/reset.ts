import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import { useMatchStore } from './matchStore.tsx';
import { useUiStore } from './uiStore';
import { useAppSettingsStore } from './appSettingsStore';

import { useLikeStore } from './likeStore';

export const resetAllStores = () => {
  useAuthStore.getState().setSession(null);
  useAuthStore.getState().setProfile(null);
  useNotificationStore.getState().reset();
  useMatchStore.getState().clearMatches();
  useUiStore.getState().reset();
  useAppSettingsStore.getState().reset();
  useLikeStore.getState().reset();
};
