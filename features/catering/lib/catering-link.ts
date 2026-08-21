// Utilidad para enlazar una solicitud de catering con un pastel personalizado.
// Solo se usa cuando el usuario viene del formulario de catering.

export const CATERING_LINK_KEY = "catering_pending";

export type CateringPending = {
  // Datos del formulario de catering ya completados
  tipo_evento: string;
  nombre: string;
  email: string;
  celular: string;
  fecha_evento: string;
  num_invitados: number;
  descripcion: string;
  presupuesto: string;
  // ID del proyecto personalizado que se crea después (lo llena CustomizationWizard)
  proyecto_id?: string;
  // Resumen breve del pastel para inyectar en la descripción al volver
  pastel_resumen?: string;
};

export function saveCateringPending(data: CateringPending) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CATERING_LINK_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function loadCateringPending(): CateringPending | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CATERING_LINK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CateringPending;
  } catch {
    return null;
  }
}

export function updateCateringPending(patch: Partial<CateringPending>) {
  if (typeof window === "undefined") return;
  const current = loadCateringPending();
  if (!current) return;
  saveCateringPending({ ...current, ...patch });
}

export function clearCateringPending() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CATERING_LINK_KEY);
  } catch {
    /* ignore */
  }
}
