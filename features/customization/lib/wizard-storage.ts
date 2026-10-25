import type { CustomizationData } from "../types/customization.types";

// Borrador del wizard de personalización.
// Vive en sessionStorage: sobrevive a un refresh accidental a mitad
// del proceso (misma pestaña), pero NO sobrevive al cerrar la pestaña
// ni a una visita posterior. Así, al empezar el proceso otra vez —
// tanto si se terminó (resetWizard lo limpia) como si se dejó a medio
// camino — los campos arrancan limpios.
const STORAGE_KEY = "kellys-cake-customization";

export function saveWizard(
  data: CustomizationData
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch {
    // Modo privado o storage lleno: continuar sin borrador
  }
}

export function loadWizard() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const data =
      window.sessionStorage.getItem(STORAGE_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearWizard() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
    // Limpieza de posibles borradores antiguos de localStorage
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silenciar en modo privado
  }
}