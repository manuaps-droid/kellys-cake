"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export type VentaVendingInput = {
  producto: string;
  cantidad: number;
  precio_unitario: number;
  fecha: string;
};

/**
 * Registra una venta del canal Vending como pedido directo
 * (canal = 'vending'). Cuando las máquinas automáticas entren
 * en operación, este endpoint será llamado por su telemetría.
 */
export async function registrarVentaVendingAction(
  input: VentaVendingInput
) {
  try {
    const { tenantId } = await getFoodOSSession();

    if (!tenantId) {
      return { error: "No autorizado." };
    }

    const producto = (input.producto ?? "").trim();
    const cantidad = Math.max(1, Math.floor(Number(input.cantidad) || 1));
    const precio = Math.abs(Number(input.precio_unitario) || 0);
    const fechaLimpia = /^\d{4}-\d{2}-\d{2}$/.test(input.fecha)      ? input.fecha
      : new Date(Date.now() - 5 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

    if (producto.length < 2) {
      return { error: "Escribe el nombre del producto." };
    }

    if (precio <= 0) {
      return { error: "Ingresa un precio válido." };
    }

    const admin = createAdminClient();

    const total = Math.round(cantidad * precio * 100) / 100;

    const { error } = await admin.from("pedidos").insert({
      canal: "vending",
      subtotal: total,
      envio: 0,
      total,
      metodo_pago: "vending",
      estado: "entregado",
      estado_pago: "pagado",
      observaciones: null,
      fecha_entrega: fechaLimpia,
    });

    if (error) {
      return { error: "No se pudo registrar la venta Vending." };
    }

    revalidatePath("/foodos/pulso");
    revalidatePath("/foodos");

    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}
