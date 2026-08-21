import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CheckoutStep } from "../types/wizard.types";

interface WizardStore {
  currentStep: CheckoutStep;

  next: () => void;

  previous: () => void;

  goTo: (step: CheckoutStep) => void;

  reset: () => void;
}

export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      currentStep: CheckoutStep.CUSTOMER,

      next: () =>
        set((state) => ({
          currentStep:
            state.currentStep < CheckoutStep.REVIEW
              ? (state.currentStep + 1) as CheckoutStep
              : state.currentStep,
        })),

      previous: () =>
        set((state) => ({
          currentStep:
            state.currentStep > CheckoutStep.CUSTOMER
              ? (state.currentStep - 1) as CheckoutStep
              : state.currentStep,
        })),

      goTo: (step) =>
        set({
          currentStep: step,
        }),

      reset: () =>
        set({
          currentStep: CheckoutStep.CUSTOMER,
        }),
    }),
    {
      name: "checkout-wizard",
    }
  )
);