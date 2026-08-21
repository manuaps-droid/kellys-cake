import type { CustomizationData } from "../types/customization.types";

const STORAGE_KEY =
  "kellys-cake-customization";

export function saveWizard(
  data: CustomizationData
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

export function loadWizard() {
  if (typeof window === "undefined") {
    return null;
  }

  const data =
    localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearWizard() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}