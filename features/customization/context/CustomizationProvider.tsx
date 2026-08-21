"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { initialCustomizationData } from "../constants/customization.constants";
import {
  loadWizard,
  clearWizard,
} from "../lib/wizard-storage";
import { useWizardStorage } from "../hooks/useWizardStorage";

import type { CustomizationData } from "../types/customization.types";

export const WIZARD_STEPS = [
  "welcome",
  "celebration",
  "idea",
  "inspiration",
  "people",
  "flavors",
  "fillings",
  "frostings",
  "schedule",
  "delivery",
  "summary",
] as const;

export const TOTAL_STEPS =
  WIZARD_STEPS.length;

type CustomizationContextType = {
  data: CustomizationData;

  currentStep: number;

  totalSteps: number;

  progress: number;

  nextStep: () => void;

  previousStep: () => void;

  goToStep: (
    step: number
  ) => void;

  updateData: (
    values: Partial<CustomizationData> | ((prev: CustomizationData) => Partial<CustomizationData>)
  ) => void;

  resetWizard: () => void;
};

const CustomizationContext =
  createContext<CustomizationContextType | null>(
    null
  );

type Props = {
  children: React.ReactNode;
};

export function CustomizationProvider({
  children,
}: Props) {
  const [data, setData] =
    useState(initialCustomizationData);

  const [currentStep, setCurrentStep] =
    useState(0);

  useEffect(() => {
    const saved =
      loadWizard();

    if (saved) {
      setData(saved);
    }
  }, []);

  useWizardStorage(data);

  const updateData = useCallback(
    (
      values: Partial<CustomizationData> | ((prev: CustomizationData) => Partial<CustomizationData>)
    ) => {
      setData((previous) => {
        const resolved =
          typeof values === "function"
            ? values(previous)
            : values;
        return {
          ...previous,
          ...resolved,
        };
      });
    },
    []
  );

  const nextStep = useCallback(() => {
    setCurrentStep((step) =>
      Math.min(
        step + 1,
        TOTAL_STEPS - 1
      )
    );
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep((step) =>
      Math.max(step - 1, 0)
    );
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
    },
    []
  );

  const resetWizard = useCallback(() => {
    setData(initialCustomizationData);
    setCurrentStep(0);
    clearWizard();
  }, []);

  const progress =
    ((currentStep + 1) /
      TOTAL_STEPS) *
    100;

  const value = useMemo(
    () => ({
      data,
      currentStep,
      totalSteps: TOTAL_STEPS,
      progress,
      nextStep,
      previousStep,
      goToStep,
      updateData,
      resetWizard,
    }),
    [
      data,
      currentStep,
      progress,
      nextStep,
      previousStep,
      goToStep,
      updateData,
      resetWizard,
    ]
  );

  return (
    <CustomizationContext.Provider
      value={value}
    >
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const context = useContext(
    CustomizationContext
  );

  if (!context) {
    throw new Error(
      "useCustomization debe usarse dentro de CustomizationProvider."
    );
  }

  return context;
}
