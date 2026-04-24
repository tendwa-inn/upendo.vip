import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  step: number;
  formData: any;
  onboardingCompleted: boolean;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: any) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      formData: {
        name: '',
        dob: '',
        gender: '',
        interested_in: '',
        relationship_intent: '',
        interests: [],
        kids: '',
        location: null,
      },
      onboardingCompleted: false,
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: state.step - 1 })),
      updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
      reset: () => set({ step: 1, formData: {}, onboardingCompleted: false }),
      completeOnboarding: () => {
        console.log('[ZUSTAND_completeOnboarding] Onboarding complete!');
        set({ onboardingCompleted: true });
      },
    }),
    {
      name: 'onboarding-storage', // name of the item in the storage (must be unique)
    }
  )
);
