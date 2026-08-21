import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return {
    supabase,
    user,
  };
}

export async function getCurrentClient() {
  const { supabase, user } = await getCurrentUser();

  let { data: cliente, error } = await supabase
    .from("clientes")
    .select("*")
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
      .select("*")
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