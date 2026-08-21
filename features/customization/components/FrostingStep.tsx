"use client";

import CatalogSelectionStep from "./shared/CatalogSelectionStep";

import { getFrostingsAction } from "../actions/get-frostings.action";
import { useCustomization } from "../context/CustomizationProvider";
import { useCatalogSelection } from "../hooks/useCatalogSelection";

const MAX_FROSTINGS = 1;

export default function FrostingStep() {
  const {
    data,
    updateData,
    nextStep,
    previousStep,
    totalSteps,
  } = useCustomization();

  const options = useCatalogSelection({
    loader: getFrostingsAction,
    key: "frostings",
  });

  function toggle(id: string) {
    updateData((prev) => ({
      frostings: prev.frostings.includes(id)
        ? prev.frostings.filter((item) => item !== id)
        : prev.frostings.length < MAX_FROSTINGS
        ? [...prev.frostings, id]
        : prev.frostings,
    }));
  }

  return (
    <CatalogSelectionStep
      step={7}
      totalSteps={totalSteps - 1}
      title="¿Qué cobertura prefieres?"
      description=""
      maxSelected={MAX_FROSTINGS}
      options={options}
      selected={data.frostings}
      onToggle={toggle}
      onBack={previousStep}
      onNext={nextStep}
    />
  );
}
