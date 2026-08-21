"use client";

import { useEffect } from "react";

import { CheckoutStep } from "../types/wizard.types";

import { useWizard } from "../hooks/useWizard";
import { useCheckout } from "../hooks/useCheckout";

import StepIndicator from "./StepIndicator";
import WizardFooter from "./WizardFooter";

import StepCustomer from "./steps/StepCustomer";
import StepDelivery from "./steps/StepDelivery";
import StepAddress from "./steps/StepAddress";
import StepPayment from "./steps/StepPayment";
import StepReview from "./steps/StepReview";

import type { ClientPrefillData } from "../actions/get-client-prefill.action";

type Props = {
  clientData: ClientPrefillData | null;
};

function renderStep(step: CheckoutStep) {
  switch (step) {
    case CheckoutStep.CUSTOMER:
      return <StepCustomer />;

    case CheckoutStep.DELIVERY:
      return <StepDelivery />;

    case CheckoutStep.ADDRESS:
      return <StepAddress />;

    case CheckoutStep.PAYMENT:
      return <StepPayment />;

    case CheckoutStep.REVIEW:
      return <StepReview />;

    default:
      return null;
  }
}

export default function CheckoutWizard({ clientData }: Props) {
  const { currentStep } = useWizard();
  const { checkout, prefillCustomer } = useCheckout();

  useEffect(() => {
    if (clientData) {
      prefillCustomer(clientData);
    }
  }, [clientData, prefillCustomer]);

  const steps =
    checkout.deliveryMethod === "pickup"
      ? [
          CheckoutStep.CUSTOMER,
          CheckoutStep.DELIVERY,
          CheckoutStep.PAYMENT,
          CheckoutStep.REVIEW,
        ]
      : [
          CheckoutStep.CUSTOMER,
          CheckoutStep.DELIVERY,
          CheckoutStep.ADDRESS,
          CheckoutStep.PAYMENT,
          CheckoutStep.REVIEW,
        ];

  return (
    <div className="space-y-8">
      <StepIndicator
        currentStep={currentStep}
        steps={steps}
      />

      <div className="min-h-[450px]">
        {renderStep(currentStep)}
      </div>

      <WizardFooter />
    </div>
  );
}
