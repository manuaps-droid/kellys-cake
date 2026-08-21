"use client";

import OptionCard from "./OptionCard";
import StepHeader from "./StepHeader";
import StepLayout from "./StepLayout";
import StepNavigation from "./StepNavigation";

import type { CatalogOption } from "../../types/catalog.types";

type CatalogSelectionStepProps = {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  options: CatalogOption[];
  selected: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  maxSelected?: number;
};

export default function CatalogSelectionStep({
  step,
  totalSteps,
  title,
  description,
  options,
  selected,
  onToggle,
  onBack,
  onNext,
  maxSelected,
}: CatalogSelectionStepProps) {
  const limitHint = maxSelected
    ? ` (máximo ${maxSelected})`
    : "";

  return (
    <StepLayout>
      <StepHeader
        step={step}
        total={totalSteps}
        title={title}
        description={(description + limitHint).trim()}
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            title={option.nombre}
            description={
              option.descripcion ?? undefined
            }
            selected={selected.includes(
              option.id
            )}
            disabled={
              !!maxSelected &&
              !selected.includes(option.id) &&
              selected.length >= maxSelected
            }
            onClick={() =>
              onToggle(option.id)
            }
          />
        ))}
      </div>

      <StepNavigation
        onBack={onBack}
        onNext={onNext}
        nextDisabled={
          selected.length === 0
        }
      />
    </StepLayout>
  );
}