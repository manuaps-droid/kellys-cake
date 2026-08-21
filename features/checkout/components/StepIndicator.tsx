import { CheckoutStep } from "../types/wizard.types";

interface StepIndicatorProps {
  currentStep: CheckoutStep;
  steps: CheckoutStep[];
}

const STEP_LABELS: Record<CheckoutStep, string> = {
  [CheckoutStep.CUSTOMER]: "Cliente",
  [CheckoutStep.DELIVERY]: "Entrega",
  [CheckoutStep.ADDRESS]: "Dirección",
  [CheckoutStep.PAYMENT]: "Pago",
  [CheckoutStep.REVIEW]: "Resumen",
};

export default function StepIndicator({
  currentStep,
  steps,
}: StepIndicatorProps) {
  const visibleSteps = steps.map((s) => ({
    step: s,
    label: STEP_LABELS[s],
  }));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {visibleSteps.map(({ step, label }, index) => {
          const active = step === currentStep;
          const completed = step < currentStep;

          return (
            <div
              key={label}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all
                    ${completed
                      ? "border-cake-gold bg-cake-gold text-white"
                      : active
                      ? "border-cake-espresso bg-cake-espresso text-white"
                      : "border-gray-300 bg-white text-gray-500"
                    }
                  `}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <span
                  className={`mt-2 text-xs font-medium ${
                    active
                      ? "text-cake-espresso"
                      : completed
                      ? "text-cake-gold"
                      : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>

              {index < visibleSteps.length - 1 && (
                <div
                  className={`mx-2 h-1 flex-1 rounded ${
                    completed
                      ? "bg-cake-gold"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
