"use server";

import { getCurrentClient } from "@/lib/auth/getCurrentUser";

export type ClientPrefillData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export async function getClientPrefillData(): Promise<ClientPrefillData | null> {
  try {
    const { cliente } = await getCurrentClient();

    return {
      firstName: cliente.nombre || "",
      lastName: cliente.apellidos || "",
      email: cliente.correo || "",
      phone: cliente.celular || "",
    };
  } catch {
    return null;
  }
}
