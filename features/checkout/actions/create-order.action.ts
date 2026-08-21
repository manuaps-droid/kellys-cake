"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderService } from "@/features/checkout/services/checkout.service";
import { getItemNombre, getItemUnitPrice } from "@/features/cart/types/cart.types";
import { revalidatePath } from "next/cache";

export async function createOrder(paymentData?: {
  paymentMethod: string;
  paymentToken?: string;
  paymentReference?: string;
  deliveryFee?: number;
  tipoPago?: "total" | "abono";
  montoPagado?: number;
}) {
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

    const estadoPago = paymentData?.paymentReference
      ? "pagado"
      : "pendiente";

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
      fecha_entrega: null as string | null,
      hora_entrega: null as string | null,
      tipo_entrega: null as string | null,
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

    // Pedido ya existía (idempotente): también lo tratamos como éxito
    revalidatePath("/carrito");
    revalidatePath("/mi-cuenta/pedidos");

    return {
      success: true,
      orderId: result.pedido_id ?? null,
      alreadyExists: result.already_exists === true,
    };
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Error inesperado.";

    return {
      success: false,
      message,
    };
  }
}
