export enum CheckoutStep {
  CUSTOMER = 0,
  DELIVERY = 1,
  ADDRESS = 2,
  PAYMENT = 3,
  REVIEW = 4,
}

export interface WizardState {
  currentStep: CheckoutStep;
}

export interface WizardActions {
  next: () => void;
  previous: () => void;
  goTo: (step: CheckoutStep) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}