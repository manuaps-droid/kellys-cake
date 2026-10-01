import { resend, EMAIL_FROM } from "@/lib/resend/client";
import { WelcomeEmail } from "../../../emails/templates/WelcomeEmail";
import React from "react";

export async function sendWelcomeEmail(to: string, nombre: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "¡Bienvenido a Kelly's Cake! 🎂 (Tienes un regalo)",
      react: React.createElement(WelcomeEmail, { nombre }),
    });

    if (error) {
      console.error("Error al enviar email de bienvenida:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Excepción enviando email de bienvenida:", error);
    return { success: false, error };
  }
}
