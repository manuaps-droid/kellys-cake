import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook de Culqi para órdenes de pago (billeteras móviles como Plin).
 * Culqi notifica el evento `order.status.changed`. Verificamos el estado
 * real consultando la API de Culqi (nunca confiamos en el payload) y, si
 * la orden está pagada, marcamos el pedido correspondiente como pagado.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.CULQI_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const body = (await request.json().catch(() => ({}))) as {
      data?: { id?: string; object?: { id?: string } };
      order?: { id?: string };
      id?: string;
    };

    // Intentamos extraer el id de la orden del payload
    const orderId: string | undefined =
      body?.data?.id ?? body?.data?.object?.id ?? body?.order?.id ?? body?.id;

    if (!orderId || typeof orderId !== "string" || !orderId.startsWith("ord_")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Verificar el estado real de la orden contra la API de Culqi
    const res = await fetch(
      `https://api.culqi.com/v2/orders/${encodeURIComponent(orderId)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Culqi API error" }, { status: 502 });
    }

    const order = (await res.json()) as {
      id: string;
      state?: string;
      amount?: number;
    };

    const supabase = createAdminClient();

    // Registrar el evento para auditoría (idempotente por external_reference)
    const { data: existing } = await supabase
      .from("pago_webhooks")
      .select("id, procesado")
      .eq("fuente", "culqi")
      .eq("external_reference", orderId)
      .maybeSingle();

    const isPaid = order.state === "paid";

    const { data: pedido } = await supabase
      .from("pedidos")
      .select("id")
      .eq("referencia_pago", orderId)
      .maybeSingle();

    const payload = {
      fuente: "culqi",
      external_reference: orderId,
      topic: "order.status.changed",
      payment_id: orderId,
      status: order.state ?? null,
      raw: body,
      procesado: true,
      pedido_id: pedido?.id ?? null,
    };

    if (existing) {
      await supabase.from("pago_webhooks").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("pago_webhooks").insert(payload);
    }

    if (isPaid && pedido) {
      await supabase
        .from("pedidos")
        .update({ estado_pago: "pagado", estado: "confirmado" })
        .eq("id", pedido.id);
    }

    return NextResponse.json({ ok: true, paid: isPaid });
  } catch (error) {
    console.error("Culqi webhook error:", error);
    // 200 para que Culqi no reintente en loop ante errores inesperados
    return NextResponse.json({ ok: true, error: "internal" });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
