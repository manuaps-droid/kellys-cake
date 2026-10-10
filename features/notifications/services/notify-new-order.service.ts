import { createAdminClient } from "@/lib/supabase/admin";

import { getConfigRepository } from "@/features/admin/configuracion/repositories/config.repository";

import { sendWhatsAppTextService } from "./whatsapp.service";

type PedidoNotificacion = {
  numero: number;
  total: number;
  clientes: { nombre: string } | { nombre: string }[] | null;
};

/**
 * Notifica al admin por WhatsApp cuando se registra un pedido
 * nuevo (checkout web o topper directo). Fire-and-forget: nunca
 * lanza errores para no interrumpir la creación del pedido.
 */
export async function notifyAdminNewOrderService(input: {
  orderId: string;
  origen?: string;
}): Promise<void> {
  try {
    const { notificaciones } = (await getConfigRepository(
      "notificaciones"
    )) as {
      notificaciones?: {
        notificar_pedido_whatsapp_admin?: boolean;
        whatsapp_admin?: string;
      };
    };

    const activo =
      notificaciones?.notificar_pedido_whatsapp_admin ?? false;
    const adminPhone = (
      notificaciones?.whatsapp_admin ?? ""
    ).replace(/[^0-9]/g, "");

    if (!activo || !adminPhone) return;

    const supabase = createAdminClient();

    const { data } = await supabase
      .from("pedidos")
      .select("numero, total, clientes (nombre)")
      .eq("id", input.orderId)
      .maybeSingle();

    const pedido = data as PedidoNotificacion | null;

    if (!pedido) return;

    const clienteNombre = Array.isArray(pedido.clientes)
      ? pedido.clientes[0]?.nombre
      : pedido.clientes?.nombre;

    const text = [
      "🎂 *Kelly's Cake — Nuevo pedido*",
      `Pedido #${pedido.numero}`,
      clienteNombre ? `Cliente: ${clienteNombre}` : null,
      `Total: S/ ${Number(pedido.total ?? 0).toFixed(2)}`,
      input.origen ? `Origen: ${input.origen}` : null,
      "Revisa la agenda de producción.",
    ]
      .filter(Boolean)
      .join("\n");

    await sendWhatsAppTextService(adminPhone, text);
  } catch (error) {
    console.error(
      "[whatsapp] No se pudo notificar el nuevo pedido:",
      error
    );
  }
}
