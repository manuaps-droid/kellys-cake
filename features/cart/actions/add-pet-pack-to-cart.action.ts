"use server";

import { revalidatePath } from "next/cache";
import { getCurrentClient } from "@/features/auth/services/auth.server";

export type AddPetPackInput = {
  nombreMascota?: string;
  esGato?: boolean;
  observaciones?: string;
};

const PET_PACK_PRECIO = 69.0;
const PET_PACK_NOMBRE = "Pack Celebración Pet (100% Pet-Safe)";
const PET_PACK_IMAGEN = "/images/pets/pack-celebracion-pet.jpg";

/**
 * Agrega el Pack Celebración para Mascotas directamente al carrito
 * como ítem con precio y descripción personalizada, permitiendo que
 * avance por todo el flujo de entrega, carrito y pasarela de pago.
 */
export async function addPetPackToCartAction(input: AddPetPackInput = {}) {
  const { supabase, cliente } = await getCurrentClient();

  // Obtener o crear carrito del cliente
  let { data: carrito } = await supabase
    .from("carrito")
    .select("id")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (!carrito) {
    const { data: nuevoCarrito, error: errNuevo } = await supabase
      .from("carrito")
      .insert({ cliente_id: cliente.id })
      .select("id")
      .single();

    if (errNuevo || !nuevoCarrito) {
      return {
        success: false,
        message: errNuevo?.message ?? "No se pudo crear el carrito.",
      };
    }
    carrito = nuevoCarrito;
  }

  if (!carrito) {
    return { success: false, message: "Carrito no disponible." };
  }

  const detalles = [];
  if (input.nombreMascota?.trim()) {
    detalles.push(`Mascota: ${input.nombreMascota.trim()}`);
  }
  detalles.push(input.esGato ? "Tipo: Gatito" : "Tipo: Perrito");
  detalles.push("Incluye: Pastel con 2 rellenos + Topper Happy Birthday + 2 pupcakes + 6 galletitas huesito");
  if (input.observaciones?.trim()) {
    detalles.push(`Nota: ${input.observaciones.trim()}`);
  }

  const descripcionCompleta = detalles.join(" · ");

  // Insertar en carrito_items con precio fijo garantizado
  const { error: insertError } = await supabase.from("carrito_items").insert({
    carrito_id: carrito.id,
    producto_id: null,
    cantidad: 1,
    precio_unitario: PET_PACK_PRECIO,
    nombre: PET_PACK_NOMBRE,
    descripcion: descripcionCompleta,
    imagen: PET_PACK_IMAGEN,
  });

  if (insertError) {
    return { success: false, message: insertError.message };
  }

  revalidatePath("/carrito");

  return { success: true };
}
