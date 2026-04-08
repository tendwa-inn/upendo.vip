import { create } from 'zustand';

interface SignUpState {
  step: number;
  formData: any;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: any) => void;
  reset: () => void;
}

export const useSignUpStore = create<SignUpState>((set) => ({
  step: 1,
  formData: {},
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  reset: () => set({ step: 1, formData: {} }),
}));
