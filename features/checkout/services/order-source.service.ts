import { createAdminClient } from "@/lib/supabase/admin";

export type CotizacionEntrega = {
  fechaEntrega: string | null;
  horaEntrega: string | null;
  tipoEntrega: string | null;
};

/**
 * Obtiene datos de entrega desde una cotización vinculada.
 * Si la cotización proviene de un proyecto personalizado, usa su
 * hora_evento y tipo_entrega. Para catering usa la fecha_evento.
 */
export async function getCotizacionEntregaInfo(
  cotizacionId: string
): Promise<CotizacionEntrega> {
  const supabase = createAdminClient();

  const { data: cotizacion } = await supabase
    .from("cotizaciones")
    .select("id, fecha_evento, catering_id, proyecto_id")
    .eq("id", cotizacionId)
    .maybeSingle();

  if (!cotizacion) {
    return { fechaEntrega: null, horaEntrega: null, tipoEntrega: null };
  }

  let horaEntrega: string | null = null;
  let tipoEntrega: string | null = null;

  if (cotizacion.proyecto_id) {
    const { data: proyecto } = await supabase
      .from("proyectos_personalizados")
      .select("hora_evento, tipo_entrega")
      .eq("id", cotizacion.proyecto_id)
      .maybeSingle();

    horaEntrega = proyecto?.hora_evento ?? null;
    tipoEntrega = proyecto?.tipo_entrega ?? null;
  }

  return {
    fechaEntrega: cotizacion.fecha_evento ?? null,
    horaEntrega,
    tipoEntrega,
  };
}

/**
 * Archiva la solicitud origen de una cotización una vez que el pedido
 * se confirma y paga. Marca 'finalizado' en cotizaciones_catering y/o
 * proyectos_personalizados para evitar duplicados y sacarlas de las
 * áreas activas.
 */
export async function archivarSolicitudOrigen(
  cotizacionId: string
): Promise<void> {
  const supabase = createAdminClient();

  const { data: cotizacion } = await supabase
    .from("cotizaciones")
    .select("id, catering_id, proyecto_id")
    .eq("id", cotizacionId)
    .maybeSingle();

  if (!cotizacion) return;

  if (cotizacion.catering_id) {
    await supabase
      .from("cotizaciones_catering")
      .update({ estado: "finalizado" })
      .eq("id", cotizacion.catering_id);
  }

  if (cotizacion.proyecto_id) {
    await supabase
      .from("proyectos_personalizados")
      .update({ estado: "finalizado" })
      .eq("id", cotizacion.proyecto_id);
  }
}
