// Re-export from the TSX version to ensure a single Zustand store instance
// All components must use the same store for realtime to work
export { useMatchStore } from './matchStore.tsx';
