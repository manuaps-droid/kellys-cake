"use client";

import {
  useCustomization,
} from "../context/CustomizationProvider";

export default function WizardProgress() {
  const {
    currentStep,
    totalSteps,
    progress,
  } = useCustomization();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#D8B07A]">
            Paso {currentStep} de{" "}
            {totalSteps - 1}
          </span>

          <span className="text-sm text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#D8B07A] transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </header>
  );
}