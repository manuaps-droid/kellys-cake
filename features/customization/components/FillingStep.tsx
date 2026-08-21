"use client";

import CatalogSelectionStep from "./shared/CatalogSelectionStep";

import { getFillingsAction } from "../actions/get-fillings.action";
import { useCustomization } from "../context/CustomizationProvider";
import { useCatalogSelection } from "../hooks/useCatalogSelection";

const MAX_FILLINGS = 2;

export default function FillingStep() {
  const {
    data,
    updateData,
    nextStep,
    previousStep,
    totalSteps,
  } = useCustomization();

  const options = useCatalogSelection({
    loader: getFillingsAction,
    key: "fillings",
  });

  function toggle(id: string) {
    updateData((prev) => ({
      fillings: prev.fillings.includes(id)
        ? prev.fillings.filter((item) => item !== id)
        : prev.fillings.length < MAX_FILLINGS
        ? [...prev.fillings, id]
        : prev.fillings,
    }));
  }

  return (
    <CatalogSelectionStep
      step={6}
      totalSteps={totalSteps - 1}
      title="¿Qué rellenos prefieres?"
      description=""
      maxSelected={MAX_FILLINGS}
      options={options}
      selected={data.fillings}
      onToggle={toggle}
      onBack={previousStep}
      onNext={nextStep}
    />
  );
}
