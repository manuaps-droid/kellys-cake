"use server";

import { after } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { notificarAdminsPush } from "@/features/notifications/services/push.service";

interface CateringRequest {
  tipo_evento: string;
  nombre: string;
  email: string;
  celular: string;
  fecha_evento: string;
  num_invitados: number;
  descripcion: string;
  presupuesto: string;
  proyecto_id?: string;
}

export async function submitCateringRequest(data: CateringRequest) {
  try {
    const supabase = await createClient();

    const insertData: Record<string, unknown> = {
      tipo_evento: data.tipo_evento,
      nombre: data.nombre.trim(),
      email: data.email.trim(),
      celular: data.celular.trim(),
      fecha_evento: data.fecha_evento,
      num_invitados: data.num_invitados,
      descripcion: data.descripcion.trim(),
      presupuesto: data.presupuesto || null,
      estado: "pendiente",
    };

    if (data.proyecto_id) {
      insertData.proyecto_id = data.proyecto_id;
    }

    const { data: inserted, error } = await supabase
      .from("cotizaciones_catering")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      console.error("Error saving catering request:", error);
      return {
        success: false,
        message: error.message,
      };
    }

    after(() =>
      notificarAdminsPush(
        "Nueva solicitud de catering",
        `${data.nombre.trim()} pidió cotización para un evento (${data.tipo_evento}) el ${data.fecha_evento}.`,
        "/admin/catering"
      )
    );

    return { success: true, id: inserted?.id };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      message: "Error inesperado al enviar la solicitud.",
    };
  }
}
