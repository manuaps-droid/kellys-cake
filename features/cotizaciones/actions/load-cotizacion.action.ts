"use server";

import { revalidatePath } from "next/cache";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { getOrCreateCart } from "@/features/cart/services/cart.service";
import { createAdminClient } from "@/lib/supabase/admin";

function isRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}

export async function loadCotizacionToCartAction(token: string) {
  try {
    const { supabase } = await getCurrentClient();
    const { carrito } = await getOrCreateCart();

    const admin = createAdminClient();

    const { data: cotizacion, error } = await admin
      .from("cotizaciones")
      .select("id, items, estado")
      .eq("token", token)
      .maybeSingle();

    if (error || !cotizacion) {
      return {
        success: false,
        message: "Cotización no encontrada.",
      };
    }

    if (cotizacion.estado !== "enviada" && cotizacion.estado !== "aceptada") {
      return {
        success: false,
        message: "Esta cotización ya no está disponible.",
      };
    }

    const items = (cotizacion.items ?? []) as Array<{
      tipo: string;
      nombre: string;
      descripcion: string;
      cantidad: number;
      precio_unitario: number;
      imagen: string | null;
    }>;

    if (items.length === 0) {
      return {
        success: false,
        message: "La cotización no tiene productos.",
      };
    }

    // Eliminar items previos de la misma cotización para evitar duplicados
    const { error: deleteError } = await supabase
      .from("carrito_items")
      .delete()
      .eq("carrito_id", carrito.id)
      .eq("cotizacion_id", cotizacion.id);

    if (deleteError) {
      throw deleteError;
    }

    const rows = items.map((item) => ({
      carrito_id: carrito.id,
      producto_id: null,
      cantidad: Math.max(1, Math.round(item.cantidad)),
      precio_unitario: item.precio_unitario ?? 0,
      nombre: item.nombre,
      descripcion: item.descripcion,
      imagen: item.imagen,
      cotizacion_id: cotizacion.id,
    }));

    const { error: insertError } = await supabase
      .from("carrito_items")
      .insert(rows);

    if (insertError) {
      throw insertError;
    }

    revalidatePath("/carrito");

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error(error);
    return {
      success: false,
      message: "Error al cargar la cotización en tu carrito.",
    };
  }
}
