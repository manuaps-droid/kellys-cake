import { CheckoutStep } from "../types/wizard.types";
import { useWizardStore } from "../store/wizard.store";

export function useWizard() {
  const {
    currentStep,
    next,
    previous,
    goTo,
  } = useWizardStore();

  return {
    currentStep,

    next,

    previous,

    goTo,

    isFirstStep:
      currentStep === CheckoutStep.CUSTOMER,

    isLastStep:
      currentStep === CheckoutStep.REVIEW,
  };
}