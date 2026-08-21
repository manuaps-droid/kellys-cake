"use client";

import CatalogSelectionStep from "./shared/CatalogSelectionStep";

import { getFlavorsAction } from "../actions/get-flavors.action";
import { useCustomization } from "../context/CustomizationProvider";
import { useCatalogSelection } from "../hooks/useCatalogSelection";

const MAX_FLAVORS = 2;

export default function FlavorStep() {
  const {
    data,
    updateData,
    nextStep,
    previousStep,
    totalSteps,
  } = useCustomization();

  const options = useCatalogSelection({
    loader: getFlavorsAction,
    key: "flavors",
  });

  function toggle(id: string) {
    updateData((prev) => ({
      flavors: prev.flavors.includes(id)
        ? prev.flavors.filter((item) => item !== id)
        : prev.flavors.length < MAX_FLAVORS
        ? [...prev.flavors, id]
        : prev.flavors,
    }));
  }

  return (
    <CatalogSelectionStep
      step={5}
      totalSteps={totalSteps - 1}
      title="¿Qué sabores te gustan?"
      description=""
      maxSelected={MAX_FLAVORS}
      options={options}
      selected={data.flavors}
      onToggle={toggle}
      onBack={previousStep}
      onNext={nextStep}
    />
  );
}
