import { redirect } from "next/navigation";

import { getCurrentClient } from "./getCurrentUser";
import { isCurrentDeviceAuthorized } from "./authorized-devices";

export async function getCurrentAdmin() {
  const { supabase, user, cliente } = await getCurrentClient();

  if (!cliente.activo) {
    redirect("/");
  }

  if (cliente.rol !== "admin") {
    redirect("/");
  }

  // Verificación estricta de dispositivo de hardware (máx 3 equipos autorizados)
  const deviceCheck = await isCurrentDeviceAuthorized();
  if (!deviceCheck.authorized) {
    redirect("/autorizar-dispositivo?redirect=/admin");
  }

  return {
    supabase,
    user,
    cliente,
    dispositivo: deviceCheck.device,
  };
}