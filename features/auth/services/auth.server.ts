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

import { createAdminClient } from "@/lib/supabase/admin";

export async function getCurrentClient() {
  const {
    supabase,
    user,
  } = await requireCurrentUser();

  let {
    data: cliente,
  } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Si no se encuentra por user_id, buscar por correo (ej. clientes creados previo al registro)
  if (!cliente && user.email) {
    const adminClient = createAdminClient();
    const { data: clientePorCorreo } = await adminClient
      .from("clientes")
      .select("*")
      .ilike("correo", user.email.trim())
      .maybeSingle();

    if (clientePorCorreo) {
      // Vincular el user_id para futuros accesos directos
      const { data: vinculado, error: updateError } = await adminClient
        .from("clientes")
        .update({ user_id: user.id })
        .eq("id", clientePorCorreo.id)
        .select("*")
        .single();

      if (!updateError && vinculado) {
        cliente = vinculado;
      } else {
        cliente = clientePorCorreo;
      }
    }
  }

  // Si aún no existe el perfil de cliente, crearlo automáticamente
  if (!cliente) {
    const adminClient = createAdminClient();
    const nombre =
      user.user_metadata?.nombre ||
      user.user_metadata?.full_name?.split(" ")[0] ||
      "Cliente";
    const apellidos =
      user.user_metadata?.apellidos ||
      user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
      "";

    const { data: nuevo, error: insertError } = await adminClient
      .from("clientes")
      .insert({
        user_id: user.id,
        nombre: nombre || "Cliente",
        apellidos: apellidos || "",
        correo: user.email || "",
        celular: user.user_metadata?.celular || "",
        rol: "cliente",
        activo: true,
      })
      .select("*")
      .single();

    if (insertError || !nuevo) {
      console.error("Error al crear cliente automático:", insertError);
      throw new Error(
        `Cliente no encontrado. (${insertError?.message ?? "sin detalle"})`
      );
    }

    cliente = nuevo;
  }

  return {
    supabase,
    user,
    cliente: {
      ...cliente,
      ruleta_girada: Boolean((cliente as any)?.ruleta_girada ?? false),
    },
  };
}