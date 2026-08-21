import { createAdminClient } from "@/lib/supabase/admin";

import type { AdminProject, AdminProjectCatalog, AdminProjectImage } from "../../types/project.type";

export async function getProjectByIdAdminRepository(
  id: string
): Promise<AdminProject | null> {
  const supabase = createAdminClient();

  const { data: raw, error } = await supabase
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
    `)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  const cliente = Array.isArray(raw.clientes)
    ? raw.clientes[0]
    : raw.clientes;

  const { data: linkRows } = await supabase
    .from("proyecto_catalogos")
    .select("catalogo_id")
    .eq("proyecto_id", id);

  let catalogos: AdminProjectCatalog[] = [];

  if (linkRows && linkRows.length > 0) {
    const catalogoIds = linkRows.map((r) => r.catalogo_id);

    const { data: catRows } = await supabase
      .from("catalogo_personalizacion")
      .select("id, nombre, tipo")
      .in("id", catalogoIds);

    catalogos = (catRows ?? []).map((r) => ({
      id: r.id,
      nombre: r.nombre,
      tipo: r.tipo,
    }));
  }

  const { data: imagenesRows } = await supabase
    .from("proyecto_imagenes")
    .select(`
      id,
      media_id,
      orden,
      media (
        url,
        nombre
      )
    `)
    .eq("proyecto_id", id)
    .order("orden");

  const imagenes: AdminProjectImage[] = (imagenesRows ?? []).map(
    (r: Record<string, unknown>) => {
      const media = Array.isArray(r.media)
        ? (r.media as Array<Record<string, unknown>>)[0]
        : (r.media as Record<string, unknown> | null);

      return {
        id: r.id as string,
        media_id: r.media_id as string,
        orden: r.orden as number,
        url: (media?.url as string) ?? null,
        nombre: (media?.nombre as string) ?? null,
      };
    }
  );

  return {
    id: raw.id,
    descripcion: raw.descripcion ?? "",
    mensaje: raw.mensaje,
    personas: raw.personas,
    presupuesto: raw.presupuesto,
    alergias: raw.alergias,
    fecha_evento: raw.fecha_evento,
    hora_evento: raw.hora_evento,
    tipo_entrega: raw.tipo_entrega,
    direccion: raw.direccion,
    referencia: raw.referencia,
    latitud: raw.latitud,
    longitud: raw.longitud,
    estado: raw.estado as AdminProject["estado"],
    observaciones: raw.observaciones,
    autoriza_comunicacion: raw.autoriza_comunicacion,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    cliente,
    catalogos,
    imagenes,
  };
}
