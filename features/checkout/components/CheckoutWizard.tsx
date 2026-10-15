"use client";

import { useEffect, useRef } from "react";

import { CheckoutStep } from "../types/wizard.types";

import { useWizard } from "../hooks/useWizard";
import { useCheckout } from "../hooks/useCheckout";
import { useWizardStore } from "../store/wizard.store";

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
  pagoNumero?: string | null;
};

function renderStep(step: CheckoutStep, pagoNumero?: string | null) {
  switch (step) {
    case CheckoutStep.CUSTOMER:
      return <StepCustomer />;

    case CheckoutStep.DELIVERY:
      return <StepDelivery />;

    case CheckoutStep.ADDRESS:
      return <StepAddress />;

    case CheckoutStep.PAYMENT:
      return <StepPayment pagoNumero={pagoNumero} />;

    case CheckoutStep.REVIEW:
      return <StepReview />;

    default:
      return null;
  }
}

export default function CheckoutWizard({ clientData, pagoNumero }: Props) {
  const { currentStep } = useWizard();
  const { checkout, reset, updateCustomer } = useCheckout();
  const resetWizard = useWizardStore((s) => s.reset);

  // Ref para ejecutar el reset solo en el primer montaje del componente.
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Siempre resetear al entrar al checkout para evitar que datos de
    // otro usuario persistan desde el localStorage.
    reset();
    resetWizard();

    // Si el servidor devolvió datos del cliente actual, pre-llenar con ellos.
    if (clientData) {
      updateCustomer({
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {renderStep(currentStep, pagoNumero)}
      </div>

      <WizardFooter />
    </div>
  );
}
