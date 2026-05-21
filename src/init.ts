import { useAuthStore } from './stores/authStore';
import { useAppSettingsStore } from './stores/appSettingsStore';
import { useMatchStore } from './stores/matchStore';
import { useDiscoveryStore } from './stores/discoveryStore';
import { useLikesStore } from './stores/likesStore';
import { useViewsStore } from './stores/viewsStore';
import { useSwipeStore } from './stores/swipeStore';
import { useAppStore } from './stores/appStore';

export const init = async () => {
  const { setStatus, setError } = useAppStore.getState();

  // ABSOLUTE FAILSAFE: always set ready after 10 seconds no matter what
  setTimeout(() => {
    const currentStatus = useAppStore.getState().status;
    if (currentStatus !== 'ready') {
      console.warn('[Init] Failsafe triggered — forcing ready status');
      useAppStore.getState().setStatus('ready');
    }
  }, 10000);

  try {
    setStatus('authenticating');

    // Wrap checkUser in a timeout
    try {
      const authPromise = useAuthStore.getState().checkUser();
      const timeoutPromise = new Promise<void>((resolve) => setTimeout(() => resolve(), 8000));
      await Promise.race([authPromise, timeoutPromise]);
    } catch (e) {
      console.warn('[Init] Auth check failed or timed out:', e);
    }

    const user = useAuthStore.getState().user;

    if (user) {
      setStatus('loading-data');
      // Each fetch catches its own errors
      await Promise.allSettled([
        useAppSettingsStore.getState().getSettings().catch(() => {}),
        useMatchStore.getState().fetchMatches().catch(() => {}),
        useDiscoveryStore.getState().fetchPotentialMatches().catch(() => {}),
        useLikesStore.getState().fetchUsersWhoLikedMe().catch(() => {}),
        useLikesStore.getState().fetchLikedUserIds().catch(() => {}),
        useViewsStore.getState().fetchUsersWhoViewedMe().catch(() => {}),
        useSwipeStore.getState().loadSwipeState().catch(() => {}),
      ]);
    }

    setStatus('ready');
  } catch (error: any) {
    console.error("[Init] Initialization failed:", error);
    setError(error.message);
    setStatus('ready');
  }
};
