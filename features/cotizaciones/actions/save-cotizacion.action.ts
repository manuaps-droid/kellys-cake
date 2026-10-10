"use server";

import { randomBytes } from "crypto";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

import type { CotizacionItem } from "../types/cotizacion.types";

type SaveCotizacionInput = {
  cateringId?: string;
  proyectoId?: string;
  items: CotizacionItem[];
  subtotal: number;
  notas?: string;
  id?: string;
};

export async function saveCotizacionAction(input: SaveCotizacionInput) {
  if (!(await checkIsAdmin())) {
    return {
      success: false,
      message: "No autorizado.",
    };
  }

  try {
    const supabase = createAdminClient();

    let cliente: {
      id: string;
      nombre: string;
      email: string | null;
      celular: string | null;
      tipo_evento: string | null;
      fecha_evento: string | null;
      num_invitados: number | null;
    } | null = null;

    if (input.cateringId) {
      const { data: catering, error: cateringError } = await supabase
        .from("cotizaciones_catering")
        .select("id, nombre, email, celular, tipo_evento, fecha_evento, num_invitados")
        .eq("id", input.cateringId)
        .single();

      if (cateringError || !catering) {
        return {
          success: false,
          message: "No se encontró la solicitud de catering.",
        };
      }

      cliente = catering;
    } else if (input.proyectoId) {
      const { data: proyecto, error: proyectoError } = await supabase
        .from("proyectos_personalizados")
        .select(`
          id,
          fecha_evento,
          personas,
          clientes ( nombre, correo, celular )
        `)
        .eq("id", input.proyectoId)
        .single();

      if (proyectoError || !proyecto) {
        return {
          success: false,
          message: "No se encontró el proyecto personalizado.",
        };
      }

      const clienteData = Array.isArray(proyecto.clientes)
        ? proyecto.clientes[0]
        : proyecto.clientes;

      cliente = {
        id: proyecto.id,
        nombre: clienteData?.nombre ?? "Cliente",
        email: clienteData?.correo ?? null,
        celular: clienteData?.celular ?? null,
        tipo_evento: "otro",
        fecha_evento: proyecto.fecha_evento ?? null,
        num_invitados: proyecto.personas ?? null,
      };
    } else {
      return {
        success: false,
        message: "Falta la solicitud o el proyecto de origen.",
      };
    }

    const items = input.items.map((item) => ({
      tipo: item.tipo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      imagen: item.imagen,
      sabores: item.sabores,
      rellenos: item.rellenos,
      decoracion: item.decoracion,
      observaciones: item.observaciones,
    }));

    let cotizacion: { id: string; numero: number; token: string } | null = null;
    let error: unknown = null;

    if (input.id) {
      // Actualizar cotización existente (conserva número y token)
      const { data, error: updateError } = await supabase
        .from("cotizaciones")
        .update({
          items,
          subtotal: input.subtotal,
          total: input.subtotal,
          estado: "enviada",
        })
        .eq("id", input.id)
        .select("id, numero, token")
        .single();

      cotizacion = data ?? null;
      error = updateError;
    } else {
      const token = randomBytes(12).toString("hex");

      const { data, error: insertError } = await supabase
        .from("cotizaciones")
        .insert({
          catering_id: input.cateringId ?? null,
          proyecto_id: input.proyectoId ?? null,
          nombre: cliente.nombre,
          email: cliente.email,
          celular: cliente.celular,
          tipo_evento: cliente.tipo_evento,
          fecha_evento: cliente.fecha_evento,
          num_invitados: cliente.num_invitados,
          items,
          subtotal: input.subtotal,
          total: input.subtotal,
          estado: "enviada",
          token,
        })
        .select("id, numero, token")
        .single();

      cotizacion = data ?? null;
      error = insertError;
    }

    if (error) {
      console.error(error);
      return {
        success: false,
        message: (error as Error).message,
      };
    }

    const updateError = await (async () => {
      if (input.cateringId) {
        const { error } = await supabase
          .from("cotizaciones_catering")
          .update({ estado: "cotizado", notas_admin: input.notas ?? null })
          .eq("id", input.cateringId);
        return error;
      }

      if (input.proyectoId) {
        const { error } = await supabase
          .from("proyectos_personalizados")
          .update({ estado: "cotizacion_enviada" })
          .eq("id", input.proyectoId);
        return error;
      }

      return null;
    })();

    if (updateError) {
      console.error(updateError);
    }

    if (input.cateringId) {
      revalidatePath("/admin/catering");
      revalidatePath(`/admin/catering/${input.cateringId}`);
    }
    if (input.proyectoId) {
      revalidatePath("/admin/proyectos");
      revalidatePath(`/admin/proyectos/${input.proyectoId}`);
    }

    return {
      success: true,
      cotizacionId: cotizacion?.id,
      numero: cotizacion?.numero,
      token: cotizacion?.token,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error inesperado al guardar la cotización.",
    };
  }
}
