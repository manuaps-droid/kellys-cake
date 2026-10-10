"use server";

import { revalidatePath } from "next/cache";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { resolveTopperPrecioService } from "@/features/customization/services/topper-price.service";

export type AddTopperInput = {
  productoId: string;
  nombre: string;
  descripcion?: string;
  imagen: string;
  catalogoImagenId?: string;
};

/**
 * Agrega un topper personalizado al carrito como LÃNEA PROPIA
 * (cada topper es Ãºnico y nunca se fusiona con otro). El precio
 * se resuelve en el servidor: si el cliente eligiÃ³ un diseÃ±o base
 * del catÃ¡logo se usa el precio de esa imagen; si subiÃ³ su propia
 * imagen se usa el precio del producto topper.
 */
export async function addTopperToCartAction(input: AddTopperInput) {
  const nombre = input.nombre?.trim();

  if (!nombre) {
    return {
      success: false,
      message: "Ingresa el nombre para tu topper.",
    };
  }

  if (!input.imagen || input.imagen.startsWith("blob:")) {
    return {
      success: false,
      message: "Sube una imagen para diseÃ±ar tu topper.",
    };
  }

  const precio = await resolveTopperPrecioService({
    productoId: input.productoId,
    catalogoImagenId: input.catalogoImagenId,
  });

  const { supabase, cliente } = await getCurrentClient();

  let { data: carrito } = await supabase
    .from("carrito")
    .select("id")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (!carrito) {
    const { data: nuevoCarrito, error } = await supabase
      .from("carrito")
      .insert({ cliente_id: cliente.id })
      .select("id")
      .single();

    if (error || !nuevoCarrito) {
      return {
        success: false,
        message: error?.message ?? "No se pudo crear el carrito.",
      };
    }

    carrito = nuevoCarrito;
  }

  if (!carrito) {
    return { success: false, message: "Carrito no disponible." };
  }

  const { error } = await supabase.from("carrito_items").insert({
    carrito_id: carrito.id,
    producto_id: input.productoId,
    cantidad: 1,
    precio_unitario: Math.round(precio * 100) / 100,
    nombre: "Topper personalizado",
    descripcion: input.descripcion ?? nombre,
    imagen: input.imagen,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/carrito");

  return { success: true };
}
