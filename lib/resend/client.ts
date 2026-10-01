import { Resend } from "resend";

// Usar API Key desde las variables de entorno, o un fallback vacío para desarrollo
const resendApiKey = process.env.RESEND_API_KEY || "re_test_key";

export const resend = new Resend(resendApiKey);

// Correo desde donde se enviarán las notificaciones
export const EMAIL_FROM = process.env.EMAIL_FROM || "Kellys Cake <hola@kellyscake.pe>";
