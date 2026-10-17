import webpush from "web-push";

import { createAdminClient } from "@/lib/supabase/admin";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT =
  process.env.NEXT_PUBLIC_VAPID_SUBJECT ??
  "mailto:hola@kellyscake.pe";

let vapidConfigurado: boolean | null = null;

function configurarVapid(): boolean {
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    return true;
  }

  return false;
}

/**
 * Envía una notificación push a todos los equipos de
 * administración suscritos (los 3 dispositivos autorizados).
 * Fire-and-forget: nunca lanza errores al emisor del evento.
 */
export async function notificarAdminsPush(
  titulo: string,
  cuerpo: string,
  url: string = "/admin"
): Promise<void> {
  try {
    if (vapidConfigurado === null) {
      vapidConfigurado = configurarVapid();
    }

    if (!vapidConfigurado) {
      console.warn(
        "[push] Claves VAPID no configuradas: notificación omitida."
      );
      return;
    }

    const supabase = createAdminClient();

    const { data: suscripciones, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");

    if (error) {
      console.error("[push] Error leyendo suscripciones:", error.message);
      return;
    }

    const payload = JSON.stringify({
      title: titulo,
      body: cuerpo,
      url,
    });

    for (const sub of suscripciones ?? []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number })
          ?.statusCode;

        // Suscripción muerta o cancelada: limpiar
        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    }
  } catch (error) {
    console.error("[push] No se pudo enviar la notificación:", error);
  }
}
