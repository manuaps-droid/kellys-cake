"use client";

import { useEffect } from "react";

import {
  saveWizard,
} from "../lib/wizard-storage";

import type { CustomizationData } from "../types/customization.types";

export function useWizardStorage(
  data: CustomizationData
) {
  useEffect(() => {
    saveWizard(data);
  }, [data]);
}