/**
 * Validación server-side de tokens de Cloudflare Turnstile
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Si no está configurada la llave secreta en Railway / entorno, permitir paso para no romper flujos
  if (!secretKey) {
    return true;
  }

  // Si se usa la clave de prueba de Cloudflare
  if (secretKey === "1x0000000000000000000000000000000AA") {
    return true;
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return Boolean(data.success);
  } catch (error) {
    console.error("Error al validar token de Turnstile:", error);
    return false;
  }
}
