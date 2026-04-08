import { create } from 'zustand';
import { currentUser as initialUser } from '../data/mockData';
import { User } from '../types';

interface ProfileState {
  currentUser: User;
  updateCurrentUser: (data: Partial<User>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  currentUser: initialUser,
  updateCurrentUser: (data) =>
    set((state) => ({ currentUser: { ...state.currentUser, ...data } })),
}));