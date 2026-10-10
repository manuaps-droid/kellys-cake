"use server";

import {
  registerCurrentDevice,
  revokeDevice,
  updateClaveMaestra,
  toggleRestriccionDispositivos,
  getSeguridadDispositivosConfig,
} from "@/lib/auth/authorized-devices";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function registrarDispositivoAction(formData: {
  nombre: string;
  claveMaestra: string;
  tipo?: "pc" | "android" | "otro";
}) {
  // Gated por clave maestra (se usa antes de tener sesión de admin)
  return await registerCurrentDevice(formData);
}

export async function revocarDispositivoAction(deviceId: string) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }
  return await revokeDevice(deviceId);
}

export async function actualizarClaveMaestraAction(nuevaClave: string) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }
  return await updateClaveMaestra(nuevaClave);
}

export async function toggleRestriccionAction(activar: boolean) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }
  return await toggleRestriccionDispositivos(activar);
}

export async function getDispositivosAction() {
  if (!(await checkIsAdmin())) {
    return null;
  }
  return await getSeguridadDispositivosConfig();
}
