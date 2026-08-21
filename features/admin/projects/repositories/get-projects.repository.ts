import { createClient } from "@/lib/supabase/server";

import type { AdminProject } from "../types/project.type";

export async function getProjectsRepository(): Promise<
  AdminProject[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
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
