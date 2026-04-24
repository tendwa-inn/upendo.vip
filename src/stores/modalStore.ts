
import { create } from 'zustand';

interface ModalState {
  isPopularityModalOpen: boolean;
  openPopularityModal: () => void;
  closePopularityModal: () => void;

  isStrikeInfoModalOpen: boolean;
  openStrikeInfoModal: () => void;
  closeStrikeInfoModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isPopularityModalOpen: false,
  openPopularityModal: () => set({ isPopularityModalOpen: true }),
  closePopularityModal: () => set({ isPopularityModalOpen: false }),

  isStrikeInfoModalOpen: false,
  openStrikeInfoModal: () => set({ isStrikeInfoModalOpen: true }),
  closeStrikeInfoModal: () => set({ isStrikeInfoModalOpen: false }),
}));
