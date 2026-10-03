"use server";

import { revalidatePath } from "next/cache";
import { getCurrentClient } from "@/features/auth/services/auth.server";

export type AddImpresionInput = {
  hojas: number;
  archivoUrl: string;
  archivoNombre: string;
  fechaEntrega: string;
  horaEntrega?: string;
  tipoPapel?: string;
  notas?: string;
};

export async function addImpresionToCartAction(input: AddImpresionInput) {
  const hojas = Math.max(1, Math.floor(input.hojas || 1));
  const precioUnitario = 15; // 15 soles por hoja A4

  if (!input.archivoUrl) {
    return {
      success: false,
      message: "Debes subir un archivo para tu impresión comestible.",
    };
  }

  if (!input.fechaEntrega) {
    return {
      success: false,
      message: "Por favor selecciona la fecha de entrega deseada.",
    };
  }

  const { supabase, cliente } = await getCurrentClient();

  // Obtener o crear carrito del cliente
  let { data: carrito } = await supabase
    .from("carrito")
    .select("id")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (!carrito) {
    const { data: nuevoCarrito, error: errCarrito } = await supabase
      .from("carrito")
      .insert({ cliente_id: cliente.id })
      .select("id")
      .single();

    if (errCarrito || !nuevoCarrito) {
      return {
        success: false,
        message: errCarrito?.message ?? "No se pudo acceder al carrito.",
      };
    }
    carrito = nuevoCarrito;
  }

  const tipoPapel = input.tipoPapel?.trim() || "Papel de Azúcar A4";
  const detalles: string[] = [
    `${hojas} hoja(s) formato A4 (${tipoPapel})`,
    `Archivo: ${input.archivoNombre}`,
    `Fecha de entrega: ${input.fechaEntrega}${input.horaEntrega ? ` (${input.horaEntrega})` : ""}`,
  ];

  if (input.notas?.trim()) {
    detalles.push(`Indicaciones: ${input.notas.trim()}`);
  }

  const descripcion = detalles.join(" · ");
  const previewImage = input.archivoUrl.match(/\.(png|jpe?g|webp)$/i)
    ? input.archivoUrl
    : "/images/hero/cake-gold.jpg.png";

  const { error: insertError } = await supabase.from("carrito_items").insert({
    carrito_id: carrito.id,
    producto_id: null,
    cantidad: hojas,
    precio_unitario: precioUnitario,
    nombre: "Impresión Comestible A4",
    descripcion,
    imagen: previewImage,
  });

  if (insertError) {
    console.error("Error al insertar impresión en carrito:", insertError);
    return { success: false, message: insertError.message };
  }

  revalidatePath("/carrito");

  return {
    success: true,
    total: hojas * precioUnitario,
  };
}
