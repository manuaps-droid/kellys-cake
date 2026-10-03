"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderService } from "@/features/checkout/services/checkout.service";
import { getItemNombre, getItemUnitPrice } from "@/features/cart/types/cart.types";
import { revalidatePath } from "next/cache";

export type CreateOrderPaymentData = {
  paymentMethod: string;
  paymentToken?: string;
  paymentReference?: string;
  deliveryFee?: number;
  tipoPago?: "total" | "abono";
  montoPagado?: number;
  fechaEntrega?: string;
  horaEntrega?: string;
  tipoEntrega?: string;
};

export async function createOrder(paymentData?: CreateOrderPaymentData) {
  try {
    const {
      clienteId,
      items,
      subtotal,
      envio,
      total,
    } = await createOrderService(paymentData?.deliveryFee ?? 0);

    const cotizacionId =
      items.find((item) => item.cotizacion_id)?.cotizacion_id ?? null;

    // Determinar si el pedido está pagado
    const isPaid =
      Boolean(paymentData?.paymentReference) ||
      paymentData?.paymentMethod === "culqi" ||
      (paymentData?.paymentMethod === "mercadopago" && Boolean(paymentData?.paymentReference));

    const estadoPago = isPaid ? "pagado" : "pendiente";
    // REGLA: Todo pedido pagado debe estar confirmado para agendarse en producción de inmediato
    const estadoPedido = isPaid ? "confirmado" : "pendiente";

    // Extraer fecha y hora de entrega seleccionadas por el cliente
    let fechaEntrega = paymentData?.fechaEntrega || null;
    let horaEntrega = paymentData?.horaEntrega || null;
    const tipoEntrega = paymentData?.tipoEntrega || null;

    // Si no vino fecha explícita, rastrear si algún ítem tiene fecha indicada en su descripción
    if (!fechaEntrega) {
      for (const item of items) {
        if (item.descripcion) {
          const mDate = item.descripcion.match(/(?:Fecha(?: de entrega| requerida)?:?|Entrega:?)\s*(\d{4}-\d{2}-\d{2})/i);
          if (mDate?.[1]) {
            fechaEntrega = mDate[1];
            if (!horaEntrega) {
              if (item.descripcion.includes("Mañana")) horaEntrega = "09:00 - 11:00";
              else if (item.descripcion.includes("Tarde")) horaEntrega = "14:00 - 16:00";
            }
            break;
          }
        }
      }
    }

    const idempotencyKey =
      paymentData?.paymentReference ??
      (paymentData?.paymentMethod
        ? `${paymentData.paymentMethod}:${clienteId}:${Date.now()}`
        : null);

    const payload = {
      cliente_id: clienteId,
      subtotal,
      envio,
      total,
      metodo_pago: paymentData?.paymentMethod || "cash",
      referencia_pago: paymentData?.paymentReference || null,
      estado_pago: estadoPago,
      tipo_pago: paymentData?.tipoPago ?? null,
      monto_pagado: paymentData?.montoPagado ?? null,
      cotizacion_id: cotizacionId,
      fecha_entrega: fechaEntrega,
      hora_entrega: horaEntrega,
      tipo_entrega: tipoEntrega,
      idempotency_key: idempotencyKey,
      items: items.map((item) => ({
        carrito_item_id: item.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio: getItemUnitPrice(item),
        nombre: getItemNombre(item),
        descripcion: item.descripcion ?? item.productos?.descripcion ?? null,
        imagen: item.imagen ?? item.productos?.imagen ?? null,
      })),
    };

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .rpc("create_order", { p_payload: payload });

    if (error) {
      throw error;
    }

    const result = (data ?? {}) as {
      pedido_id?: string;
      already_exists?: boolean;
      success?: boolean;
      error?: string;
    };

    // Función reportó error
    if (result.success === false) {
      return {
        success: false,
        message: result.error ?? "No se pudo crear el pedido.",
      };
    }

    // Asegurar persistencia de estado confirmado, estado de pago y fecha/hora programada
    if (result.pedido_id) {
      const updateData: Record<string, any> = {};
      if (isPaid) {
        updateData.estado = "confirmado";
        updateData.estado_pago = "pagado";
      }
      if (fechaEntrega) {
        updateData.fecha_entrega = fechaEntrega;
      }
      if (horaEntrega) {
        updateData.hora_entrega = horaEntrega;
      }
      if (tipoEntrega) {
        updateData.tipo_entrega = tipoEntrega;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from("pedidos")
          .update(updateData)
          .eq("id", result.pedido_id);
      }
    }

    // Revalidar todas las rutas afectadas: tienda, cuenta de cliente y administración de pedidos y agenda
    revalidatePath("/carrito");
    revalidatePath("/mi-cuenta/pedidos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/agenda");

    return {
      success: true,
      orderId: result.pedido_id ?? null,
      alreadyExists: result.already_exists === true,
    };
  } catch (error) {
    console.error("Error al crear pedido:", error);

    const message =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Error inesperado al crear el pedido.";

    return {
      success: false,
      message,
    };
  }
}
