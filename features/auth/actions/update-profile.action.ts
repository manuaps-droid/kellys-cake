"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  try {
    const { supabase, cliente } = await getCurrentClient();

    const nombre = formData.get("nombre") as string;
    const apellidos = formData.get("apellidos") as string;
    const celular = formData.get("celular") as string;

    if (!nombre || !apellidos) {
      return { error: "Los nombres y apellidos son obligatorios." };
    }

    const { error } = await supabase
      .from("clientes")
      .update({
        nombre,
        apellidos,
        celular: celular || null,
      })
      .eq("id", cliente.id);

    if (error) {
      console.error("Error updating profile:", error);
      return { error: "Ocurrió un error al actualizar el perfil." };
    }

    revalidatePath("/mi-cuenta/perfil");
    revalidatePath("/mi-cuenta");
    
    return { success: true };
  } catch (error) {
    console.error("Server error updating profile:", error);
    return { error: "Error interno del servidor." };
  }
}
