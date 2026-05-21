import { create } from 'zustand';

export type AppStatus = 'initializing' | 'authenticating' | 'loading-data' | 'ready' | 'error';

interface AppState {
  status: AppStatus;
  error: string | null;
  setStatus: (status: AppStatus) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  status: 'initializing',
  error: null,
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
}));
