import { createClient } from "@/lib/supabase/server";

import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: cliente } = await supabase
      .from("clientes")
      .select("rol, activo")
      .eq("user_id", user.id)
      .maybeSingle();

    isAdmin = Boolean(
      cliente?.activo && (cliente as { rol?: string }).rol === "admin"
    );
  }

  return (
    <NavbarClient
      user={user}
      isAdmin={isAdmin}
    />
  );
}
