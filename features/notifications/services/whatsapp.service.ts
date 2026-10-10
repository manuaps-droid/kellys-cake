/**
 * Envía un mensaje de WhatsApp a través de CallMeBot (servicio
 * gratuito orientado a notificaciones personales del dueño del
 * negocio). Requiere configurar WHATSAPP_CALLMEBOT_APIKEY tras
 * el registro inicial desde el teléfono del admin.
 */
export async function sendWhatsAppTextService(
  to: string,
  text: string
): Promise<boolean> {
  const apikey = process.env.WHATSAPP_CALLMEBOT_APIKEY;

  if (!apikey) {
    console.warn(
      "[whatsapp] WHATSAPP_CALLMEBOT_APIKEY no configurada: notificación omitida."
    );
    return false;
  }

  try {
    const phone = to.replace(/[^0-9]/g, "");

    const params = new URLSearchParams({
      phone,
      text,
      apikey,
    });

    const res = await fetch(
      `https://api.callmebot.com/whatsapp.php?${params.toString()}`,
      { signal: AbortSignal.timeout(10_000) }
    );

    if (!res.ok) {
      console.error(
        `[whatsapp] CallMeBot respondió ${res.status}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[whatsapp] Error enviando notificación:",
      error
    );
    return false;
  }
}
