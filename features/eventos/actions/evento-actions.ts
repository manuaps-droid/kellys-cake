"use server";

import { revalidatePath } from "next/cache";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export async function crearEvento(data: {
  nombre: string;
  cliente?: string;
  fecha_evento?: string;
  monto_cobrado: number;
  notas?: string;
}) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    const { data: evento, error } = await supabase
      .from("foodos_eventos")
      .insert({
        tenant_id: tenantId,
        nombre: data.nombre,
        cliente: data.cliente || null,
        fecha_evento: data.fecha_evento || null,
        monto_cobrado: data.monto_cobrado,
        notas: data.notas || null
      })
      .select()
      .single();

    if (error) {
      console.error("Error creando evento:", error);
      return { error: "No se pudo crear el evento." };
    }

    revalidatePath("/foodos/eventos");
    return { success: true, eventoId: evento.id };
  } catch (err) {
    console.error("Exception en crearEvento:", err);
    return { error: "No autorizado o error interno del servidor." };
  }
}

export async function agregarGasto(data: {
  evento_id: string;
  concepto: string;
  monto: number;
  categoria?: string;
  es_tercerizado?: boolean;
  fuente?: string;
  referencia_factura?: string;
  notas?: string;
}) {
  try {
    const { supabase } = await getFoodOSSession();

    const { error } = await supabase
      .from("foodos_evento_gastos")
      .insert({
        evento_id: data.evento_id,
        concepto: data.concepto,
        monto: data.monto,
        categoria: data.categoria || "general",
        es_tercerizado: data.es_tercerizado || false,
        fuente: data.fuente || "manual",
        referencia_factura: data.referencia_factura || null,
        notas: data.notas || null
      });

    if (error) {
      console.error("Error agregando gasto:", error);
      return { error: "No se pudo registrar el gasto." };
    }

    revalidatePath("/foodos/eventos/" + data.evento_id);
    revalidatePath("/foodos/eventos");
    return { success: true };
  } catch (err) {
    console.error("Exception en agregarGasto:", err);
    return { error: "No autorizado o error interno al registrar gasto." };
  }
}

export async function agregarGastosDesdeFactura(data: {
  evento_id: string;
  items: Array<{
    concepto: string;
    monto: number;
    es_tercerizado: boolean;
    categoria?: string;
  }>;
  referencia_factura?: string;
}) {
  try {
    const { supabase } = await getFoodOSSession();

    const rows = data.items.map(item => ({
      evento_id: data.evento_id,
      concepto: item.concepto,
      monto: item.monto,
      categoria: item.categoria || "insumos",
      es_tercerizado: item.es_tercerizado,
      fuente: "factura_ocr",
      referencia_factura: data.referencia_factura || null
    }));

    const { error } = await supabase.from("foodos_evento_gastos").insert(rows);
    if (error) {
      console.error("Error agregando gastos desde factura:", error);
      return { error: "No se pudieron registrar los gastos de la factura." };
    }

    revalidatePath("/foodos/eventos/" + data.evento_id);
    revalidatePath("/foodos/eventos");
    return { success: true };
  } catch (err) {
    console.error("Exception en agregarGastosDesdeFactura:", err);
    return { error: "No autorizado o error al registrar gastos de factura." };
  }
}

export async function eliminarGasto(gastoId: string, eventoId: string) {
  try {
    const { supabase } = await getFoodOSSession();
    await supabase.from("foodos_evento_gastos").delete().eq("id", gastoId);
    revalidatePath("/foodos/eventos/" + eventoId);
    revalidatePath("/foodos/eventos");
    return { success: true };
  } catch (err) {
    console.error("Exception en eliminarGasto:", err);
    return { error: "No autorizado para eliminar gasto." };
  }
}

export async function cambiarEstadoEvento(eventoId: string, estado: string) {
  try {
    const { supabase } = await getFoodOSSession();
    await supabase.from("foodos_eventos").update({ estado }).eq("id", eventoId);
    revalidatePath("/foodos/eventos/" + eventoId);
    revalidatePath("/foodos/eventos");
    return { success: true };
  } catch (err) {
    console.error("Exception en cambiarEstadoEvento:", err);
    return { error: "No autorizado para cambiar estado del evento." };
  }
}
