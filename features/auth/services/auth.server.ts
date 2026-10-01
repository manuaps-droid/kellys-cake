import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: error ? null : user,
  };
}

export async function requireCurrentUser() {
  const result = await getCurrentUser();

  if (!result.user) {
    redirect("/auth/login");
  }

  return result as { supabase: typeof result.supabase; user: NonNullable<typeof result.user> };
}

export async function getCurrentClient() {
  const {
    supabase,
    user,
  } = await requireCurrentUser();

  let {
    data: cliente,
    error,
  } = await supabase
    .from("clientes")
    .select("id, ruleta_girada")
    .eq("user_id", user.id)
    .single();

  if (error || !cliente) {
    const nombre = user.user_metadata?.full_name?.split(" ")[0] || "";
    const apellidos = user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "";

    const { data: nuevo, error: insertError } = await supabase
      .from("clientes")
      .insert({
        user_id: user.id,
        nombre: nombre || "Cliente",
        apellidos: apellidos || "",
        correo: user.email || "",
        celular: "",
        rol: "cliente",
        activo: true,
      })
      .select("id, ruleta_girada")
      .single();

    if (insertError || !nuevo) {
      throw new Error("Cliente no encontrado.");
    }

    cliente = nuevo;
  }

  return {
    supabase,
    user,
    cliente,
  };
}