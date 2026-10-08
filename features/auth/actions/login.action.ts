"use server";

import { createClient } from "@/lib/supabase/server";
import {
  checkLoginAttempts,
  registerFailedLoginAttempt,
  resetLoginAttempts,
} from "@/lib/auth/rate-limit-auth";

export type LoginActionResult = {
  success: boolean;
  message?: string;
  isBlocked?: boolean;
  remainingAttempts?: number;
};

export async function loginWithRateLimitAction(formData: {
  email: string;
  password: string;
}): Promise<LoginActionResult> {
  const email = formData.email?.trim().toLowerCase();
  const password = formData.password;

  if (!email || !password) {
    return {
      success: false,
      message: "Por favor ingresa tu correo y contraseña.",
    };
  }

  // 1. Verificar si la cuenta/IP está bloqueada por exceso de intentos
  const status = checkLoginAttempts(email);
  if (!status.allowed) {
    const minutos = Math.ceil((status.retryAfterSeconds || 60) / 60);
    return {
      success: false,
      isBlocked: true,
      message: `Has superado el límite de intentos permitidos (5 intentos). Por motivos de seguridad tu acceso ha sido bloqueado temporalmente. Intenta nuevamente en ${minutos} minutos.`,
    };
  }

  // 2. Intentar autenticación con Supabase
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // 3. Registrar fallo
    const failStatus = registerFailedLoginAttempt(email);

    if (failStatus.isBlocked) {
      return {
        success: false,
        isBlocked: true,
        message: `Has alcanzado el límite máximo de 5 intentos fallidos. Tu acceso ha sido bloqueado por 15 minutos por seguridad.`,
      };
    }

    return {
      success: false,
      remainingAttempts: failStatus.remainingAttempts,
      message: `Correo o contraseña incorrectos. Te quedan ${failStatus.remainingAttempts} intento(s) antes del bloqueo de seguridad.`,
    };
  }

  // 4. Éxito: limpiar intentos previos
  resetLoginAttempts(email);
  return {
    success: true,
  };
}
