import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  setOnline: () => void;
  setOffline: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: navigator.onLine,
  setOnline: () => set({ isOnline: true }),
  setOffline: () => set({ isOnline: false }),
}));
