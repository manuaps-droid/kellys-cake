import { redirect } from "next/navigation";

import { getCurrentClient } from "./getCurrentUser";

export async function getCurrentAdmin() {
  const { supabase, user, cliente } = await getCurrentClient();

  if (!cliente.activo) {
    redirect("/");
  }

  if (cliente.rol !== "admin") {
    redirect("/");
  }

  return {
    supabase,
    user,
    cliente,
  };
}