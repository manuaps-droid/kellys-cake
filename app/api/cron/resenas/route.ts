import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend/client";

function emailResena(nombre: string, numero: number) {
  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Kelly%27s+Cake+Arequipa";

  return `
  <div style="font-family: Arial, sans-serif; background-color: #FFFCF7; padding: 32px 16px;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #EAD9C5;">
      <div style="background: #2C1810; padding: 28px 24px; text-align: center;">
        <h1 style="color: #FFFCF7; font-size: 20px; margin: 0;">Kelly's Cake 🎂</h1>
        <p style="color: #C8956C; font-size: 13px; margin: 6px 0 0;">Pastelería de autor en Arequipa</p>
      </div>

      <div style="padding: 28px 24px;">
        <p style="color: #2C1810; font-size: 15px; line-height: 1.6;">
          Hola ${nombre}, ¿cómo estuvo tu pedido <strong>#${numero}</strong>?
          Esperamos que haya sido el corazón dulce de tu celebración. 💛
        </p>

        <p style="color: #5C4A3D; font-size: 14px; line-height: 1.6;">
          Tu opinión ayuda a otras familias de Arequipa a encontrar la
          pastelería perfecta para sus momentos importantes. Nos tomaría
          menos de un minuto:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a
            href="${mapsUrl}"
            style="background: #C8956C; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 32px; border-radius: 999px; font-size: 14px; display: inline-block;"
          >
            ⭐ Calificar en Google
          </a>
        </div>

        <p style="color: #5C4A3D; font-size: 13px; line-height: 1.6;">
          Si publicas una reseña con <strong>foto de tu torta</strong>,
          nos alegrará el día entero. Y si algo no estuvo perfecto,
          escríbenos primero por WhatsApp al
          <a href="https://wa.me/51945262379" style="color: #C8956C;">945 262 379</a>
          y lo resolvemos al instante.
        </p>

        <p style="color: #9C8877; font-size: 12px; margin-top: 24px;">
          Gracias por celebrar con nosotros,<br />
          <strong style="color: #2C1810;">Kelly's Cake</strong>
        </p>
      </div>
    </div>
  </div>`;
}

export async function GET(request: Request) {
  // 1. Autorización del cron (Vercel envía: Bearer CRON_SECRET)
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        ok: true,
        enviados: 0,
        mensaje:
          "RESEND_API_KEY no configurada: los correos de reseña se omiten.",
      });
    }

    const supabase = createAdminClient();

    // Pedidos entregados hace exactamente 2 días (hora de Lima, UTC-5)
    const lima = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const objetivo = new Date(lima);
    objetivo.setUTCDate(objetivo.getUTCDate() - 2);
    const fechaObjetivo = objetivo.toISOString().slice(0, 10);

    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select(
        "id, numero, clientes (nombre, correo), resena_email_enviado"
      )
      .eq("fecha_entrega", fechaObjetivo)
      .in("estado", ["confirmado", "produccion", "listo", "entregado"])
      .is("resena_email_enviado", null)
      .limit(100);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    let enviados = 0;

    for (const pedido of pedidos ?? []) {
      const cliente = Array.isArray(pedido.clientes)
        ? (pedido.clientes as Array<{ nombre?: string; correo?: string }>)[0]
        : (pedido.clientes as { nombre?: string; correo?: string } | null);

      const correo = cliente?.correo?.trim();

      if (!correo) continue;

      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: correo,
          subject: `${cliente?.nombre ?? "Hola"}, ¿cómo estuvo tu pedido #${pedido.numero}? 🎂`,
          html: emailResena(cliente?.nombre ?? "", pedido.numero),
        });

        enviados += 1;

        await supabase
          .from("pedidos")
          .update({
            resena_email_enviado: new Date().toISOString(),
          })
          .eq("id", pedido.id);
      } catch (err) {
        console.error(
          `[cron-resenas] No se pudo escribir al pedido ${pedido.numero}:`,
          err
        );
      }
    }

    return NextResponse.json({
      ok: true,
      enviados,
      fechaObjetivo,
    });
  } catch (error) {
    console.error("[cron-resenas] Error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
