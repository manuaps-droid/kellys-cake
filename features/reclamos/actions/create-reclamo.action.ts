"use server";

import { createAdminClient } from "@/lib/supabase/admin";

import type { LibroReclamacionesSchema } from "@/features/reclamos/validations/libro-reclamaciones.schema";

/**
 * Registra una solicitud en el Libro de Reclamaciones y devuelve
 * el número correlativo asignado (formato LR-AÑO-####).
 */
export async function createReclamoAction(values: LibroReclamacionesSchema) {
  const supabase = createAdminClient();

  // Número correlativo: LR-<año>-<consecutivo global>
  const { count, error: countError } = await supabase
    .from("libro_reclamaciones")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return {
      success: false as const,
      message: "No se pudo registrar la solicitud. Inténtalo de nuevo.",
    };
  }

  const numero = `LR-${new Date().getFullYear()}-${String(
    (count ?? 0) + 1
  ).padStart(4, "0")}`;

  const { data, error } = await supabase
    .from("libro_reclamaciones")
    .insert({
      numero,
      tipo: values.tipo,
      nombres: values.nombres.trim(),
      apellidos: values.apellidos.trim(),
      tipo_documento: values.tipo_documento,
      numero_documento: values.numero_documento.trim(),
      direccion: values.direccion.trim(),
      email: values.email.trim().toLowerCase(),
      telefono: values.telefono.trim(),
      producto_servicio: values.producto_servicio.trim(),
      monto_reclamado: values.monto_reclamado,
      fecha_compra: values.fecha_compra ? values.fecha_compra : null,
      descripcion: values.descripcion.trim(),
      peticion: values.peticion.trim(),
    })
    .select("numero")
    .single();

  if (error || !data) {
    return {
      success: false as const,
      message:
        "No se pudo registrar la solicitud. Por favor inténtalo nuevamente.",
    };
  }

  return { success: true as const, numero: data.numero };
}
