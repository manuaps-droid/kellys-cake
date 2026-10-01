"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

import { getCurrentClient } from "@/features/auth/services/auth.server";

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

  const admin = createAdminClient();

  let precio: number | null = null;

  if (input.catalogoImagenId) {
    const { data: diseno } = await admin
      .from("catalogo_imagenes")
      .select("precio")
      .eq("id", input.catalogoImagenId)
      .maybeSingle();

    precio = diseno?.precio != null ? Number(diseno.precio) : null;
  }

  if (precio == null) {
    const { data: producto } = await admin
      .from("foodos_productos")
      .select("precio")
      .eq("id", input.productoId)
      .maybeSingle();

    precio = producto?.precio != null ? Number(producto.precio) : null;
  }

  if (precio == null || precio <= 0) {
    return {
      success: false,
      message: "No se pudo calcular el precio del topper.",
    };
  }

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
