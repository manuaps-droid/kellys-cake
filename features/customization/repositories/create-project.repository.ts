import { createClient } from "@/lib/supabase/server";

import { ProjectData } from "../types/project.types";

export async function createProjectRepository(
  data: ProjectData
) {
  const supabase = await createClient();

  // Obtener usuario autenticado
  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error(
      "Usuario no autenticado."
    );
  }

  // Buscar cliente
  const {
    data: cliente,
    error: clienteError,
  } = await supabase
    .from("clientes")
    .select("id")
    .eq(
      "user_id",
      authData.user.id
    )
    .single();

  if (clienteError || !cliente) {
    throw new Error(
      "Cliente no encontrado."
    );
  }

  // Crear proyecto
  const {
    data: project,
    error: projectError,
  } = await supabase
    .from("proyectos_personalizados")
    .insert({
      cliente_id: cliente.id,

      descripcion:
        data.descripcion,

      mensaje:
        data.mensaje,

      personas:
        data.personas,

      presupuesto:
        data.presupuesto,

      alergias:
        data.alergias,

      fecha_evento:
        data.fechaEvento,

      hora_evento:
        data.horaEvento,

      tipo_entrega:
        data.tipoEntrega,

      direccion:
        data.direccion,

      referencia:
        data.referencia,

      latitud:
        data.latitud,

      longitud:
        data.longitud,

      observaciones:
        data.observaciones,

      autoriza_comunicacion:
        data.autorizaComunicacion,
    })
    .select()
    .single();

  if (projectError) {
    throw projectError;
  }

  // Guardar selecciones del catálogo
  if (data.catalogos.length > 0) {
    const registros =
      data.catalogos.map(
        (catalogoId) => ({
          proyecto_id:
            project.id,

          catalogo_id:
            catalogoId,
        })
      );

    const {
      error:
        catalogoError,
    } = await supabase
      .from(
        "proyecto_catalogos"
      )
      .insert(registros);

    if (catalogoError) {
      throw catalogoError;
    }
  }

  // Guardar imágenes del proyecto
  if (data.imagenes.length > 0) {
    const registros =
      data.imagenes.map(
        (mediaId, index) => ({
          proyecto_id:
            project.id,

          media_id: mediaId,

          orden: index,
        })
      );

    const {
      error: imagenesError,
    } = await supabase
      .from("proyecto_imagenes")
      .insert(registros);

    if (imagenesError) {
      throw imagenesError;
    }
  }

  return project;
}