import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook de Mercado Pago.
 *
 * MP notifica cambios de estado de pago a esta URL. El flujo:
 *   1. Recibimos { type: 'payment', data: { id } } o
 *      { topic: 'merchant_order', data: { id } }.
 *   2. Insertamos/actualizamos `pago_webhooks` (idempotente
 *      por UNIQUE(fuente, external_reference)).
 *   3. Si el pago está aprobado y existe un pedido con
 *      coincidencia `referencia_pago == payment_id`, lo marcamos
 *      pagado.
 *   4. Respondemos 200 siempre (MP reintenta si no es 2xx).
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      // Sin token no podemos verificar; devolvemos 200 para que
      // MP no siga reintentando inútilmente.
      return NextResponse.json({ ok: true, ignored: true });
    }

    const body = await request.json().catch(() => ({}));
    const topic: string | undefined = body?.topic ?? body?.type;
    const rawId: string | undefined = body?.data?.id ?? body?.id;

    if (!rawId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const supabase = createAdminClient();

    // Para 'payment', consultamos la API de MP para obtener el
    // estado real (no confiamos en el webhook). Idempotente.
    if (topic === "payment") {
      const mpRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${rawId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }
      );

      if (!mpRes.ok) {
        return NextResponse.json(
          { ok: false, error: "MP API error" },
          { status: 502 }
        );
      }

      const payment = (await mpRes.json()) as {
        id: number | string;
        status: string;
        external_reference?: string;
        order?: { id?: number | string };
      };

      const externalReference = String(payment.id);

      // Upsert idempotente del webhook
      const { data: existing } = await supabase
        .from("pago_webhooks")
        .select("id, procesado")
        .eq("fuente", "mercadopago")
        .eq("external_reference", externalReference)
        .maybeSingle();

      if (existing?.procesado) {
        return NextResponse.json({ ok: true, duplicated: true });
      }

      // localizar pedido cuyo referencia_pago es el payment.id
      const pedidoRef = String(payment.id);
      const { data: pedido } = await supabase
        .from("pedidos")
        .select("id, estado_pago, referencia_pago")
        .eq("referencia_pago", pedidoRef)
        .maybeSingle();

      const isApproved = payment.status === "approved";

      const payload = {
        fuente: "mercadopago",
        external_reference: externalReference,
        topic: "payment",
        payment_id: String(payment.id),
        status: payment.status,
        raw: payment,
        procesado: true,
        pedido_id: pedido?.id ?? null,
      };

      if (existing) {
        await supabase
          .from("pago_webhooks")
          .update(payload)
          .eq("id", existing.id);
      } else {
        await supabase.from("pago_webhooks").insert(payload);
      }

      // Si existe el pedido y el pago está aprobado, marcar pagado.
      if (pedido && isApproved && pedido.estado_pago !== "pagado") {
        await supabase
          .from("pedidos")
          .update({ estado_pago: "pagado" })
          .eq("id", pedido.id);
      }

      return NextResponse.json({ ok: true, approved: isApproved });
    }

    // merchant_order u otros: guardamos como pendiente de revisión.
    await supabase
      .from("pago_webhooks")
      .upsert(
        {
          fuente: "mercadopago",
          external_reference: String(rawId),
          topic: topic ?? "unknown",
          payment_id: String(rawId),
          raw: body,
          procesado: false,
        },
        { onConflict: "fuente,external_reference" }
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("MP webhook error:", error);
    // Siempre 200 para evitar reintentos infinitos ante payload inesperado.
    return NextResponse.json({ ok: true, error: "internal" });
  }
}

export async function GET() {
  // MP valida la URL a veces con GET. Responder 200.
  return NextResponse.json({ ok: true });
}
