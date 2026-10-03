"use server";

import { revalidatePath } from "next/cache";
import { getCurrentClient } from "@/features/auth/services/auth.server";

export type AddCortadorInput = {
  tema: string;
  tamano: string;
  tipoCortador?: string;
  cantidad: number;
  archivoUrl?: string;
  archivoNombre?: string;
  fechaEntrega?: string;
  notas?: string;
};

export async function addCortadorToCartAction(input: AddCortadorInput) {
  const tema = input.tema?.trim();
  if (!tema) {
    return {
      success: false,
      message: "Ingresa el tema o descripción para tu cortador.",
    };
  }

  const cantidad = Math.max(1, Math.floor(input.cantidad || 1));
  const precioUnitario = 18; // Precio base referencial para cortadores 3D personalizados

  const { supabase, cliente } = await getCurrentClient();

  // Obtener o crear carrito
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

  const tamano = input.tamano || "Estándar (7-8 cm)";
  const tipoCortador = input.tipoCortador || "Cortador de silueta + marcador";

  const detalles: string[] = [
    `Tema: «${tema}»`,
    `Medida: ${tamano}`,
    `Tipo: ${tipoCortador}`,
  ];

  if (input.archivoNombre) {
    detalles.push(`Referencia: ${input.archivoNombre}`);
  }

  if (input.fechaEntrega) {
    detalles.push(`Entrega estimada: ${input.fechaEntrega}`);
  }

  if (input.notas?.trim()) {
    detalles.push(`Nota: ${input.notas.trim()}`);
  }

  const descripcion = detalles.join(" · ");
  const previewImage = input.archivoUrl?.match(/\.(png|jpe?g|webp)$/i)
    ? input.archivoUrl
    : "/images/hero/wedding-cake.jpg";

  const { error: insertError } = await supabase.from("carrito_items").insert({
    carrito_id: carrito.id,
    producto_id: null,
    cantidad,
    precio_unitario: precioUnitario,
    nombre: `Cortador 3D Personalizado`,
    descripcion,
    imagen: previewImage,
  });

  if (insertError) {
    console.error("Error al insertar cortador en carrito:", insertError);
    return { success: false, message: insertError.message };
  }

  revalidatePath("/carrito");

  return {
    success: true,
    total: cantidad * precioUnitario,
  };
}
