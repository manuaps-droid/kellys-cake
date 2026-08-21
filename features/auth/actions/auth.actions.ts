"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}

export async function signUpAction(data: {
  nombre: string;
  apellidos: string;
  email: string;
  celular: string;
  password: string;
}) {
  const supabase = await createClient();

  const { data: authData, error: signUpError } =
    await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nombre: data.nombre.trim(),
          apellidos: data.apellidos.trim(),
          full_name: `${data.nombre} ${data.apellidos}`.trim(),
          celular: data.celular.trim(),
        },
      },
    });

  if (signUpError) {
    return {
      success: false,
      message: signUpError.message,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      message: "No se pudo crear la cuenta.",
    };
  }

  return {
    success: true,
  };
}