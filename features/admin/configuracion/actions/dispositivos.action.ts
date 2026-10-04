"use server";

import {
  registerCurrentDevice,
  revokeDevice,
  updateClaveMaestra,
  toggleRestriccionDispositivos,
  getSeguridadDispositivosConfig,
} from "@/lib/auth/authorized-devices";

export async function registrarDispositivoAction(formData: {
  nombre: string;
  claveMaestra: string;
  tipo?: "pc" | "android" | "otro";
}) {
  return await registerCurrentDevice(formData);
}

export async function revocarDispositivoAction(deviceId: string) {
  return await revokeDevice(deviceId);
}

export async function actualizarClaveMaestraAction(nuevaClave: string) {
  return await updateClaveMaestra(nuevaClave);
}

export async function toggleRestriccionAction(activar: boolean) {
  return await toggleRestriccionDispositivos(activar);
}

export async function getDispositivosAction() {
  return await getSeguridadDispositivosConfig();
}
