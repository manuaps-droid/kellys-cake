import { createAdminClient } from "@/lib/supabase/admin";

import type { AdminProject } from "../../types/project.type";

export async function getProjectsAdminRepository(
  estado?: string
): Promise<
  AdminProject[]
> {
  const supabase = createAdminClient();

  // Proyectos que provienen del flujo de catering (enlazados vía
  // cotizaciones_catering.proyecto_id) no se listan en Proyectos
  // Personalizados; su gestión completa vive en el admin de catering.
  const { data: cateringLinks } = await supabase
    .from("cotizaciones_catering")
    .select("proyecto_id")
    .not("proyecto_id", "is", null);

  const cateringProjectIds = new Set(
    (cateringLinks ?? [])
      .map((r) => r.proyecto_id)
      .filter(Boolean) as string[]
  );

  let query = supabase
    .from("proyectos_personalizados")
    .select(`
      id,
      descripcion,
      mensaje,
      personas,
      presupuesto,
      alergias,
      fecha_evento,
      hora_evento,
      tipo_entrega,
      direccion,
      referencia,
      latitud,
      longitud,
      estado,
      observaciones,
      autoriza_comunicacion,
      created_at,
      updated_at,
      clientes (
        id,
        nombre,
        apellidos,
        correo,
        celular
      )
    `);

  if (estado === "all" || !estado) {
    query = query.neq("estado", "finalizado");
  } else if (estado === "finalizado") {
    query = query.eq("estado", "finalizado");
  } else {
    query = query.eq("estado", estado);
  }

  query = query.order("created_at", {
    ascending: false,
  });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []).filter(
    (project: any) => !cateringProjectIds.has(project.id)
  );

  return rows.map(
    (project: any): AdminProject => ({
      id: project.id,
      descripcion: project.descripcion,
      mensaje: project.mensaje,
      personas: project.personas,
      presupuesto: project.presupuesto,
      alergias: project.alergias,
      fecha_evento: project.fecha_evento,
      hora_evento: project.hora_evento,
      tipo_entrega: project.tipo_entrega,
      direccion: project.direccion,
      referencia: project.referencia,
      latitud: project.latitud,
      longitud: project.longitud,
      estado: project.estado,
      observaciones: project.observaciones,
      autoriza_comunicacion: project.autoriza_comunicacion,
      created_at: project.created_at,
      updated_at: project.updated_at,
      cliente: Array.isArray(project.clientes)
        ? project.clientes[0]
        : project.clientes,
      catalogos: [],
      imagenes: [],
    })
  );
}
