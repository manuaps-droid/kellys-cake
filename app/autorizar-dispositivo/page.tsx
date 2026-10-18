import { Suspense } from "react";
import { redirect } from "next/navigation";
import AutorizarDispositivoClient from "./AutorizarDispositivoClient";
import { getSeguridadDispositivosConfig, isCurrentDeviceAuthorized } from "@/lib/auth/authorized-devices";

export const metadata = {
  title: "Autorización de Dispositivo | Kelly's Cake",
  description: "Control de seguridad para equipos autorizados a Admin y FoodOS.",
};

export default async function AutorizarDispositivoPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const config = await getSeguridadDispositivosConfig();
  const currentCheck = await isCurrentDeviceAuthorized();

  // Equipo ya autorizado con destino válido: acceso inmediato,
  // sin pantalla intermedia.
  if (currentCheck.authorized) {
    const destino = params.redirect;

    if (
      destino &&
      destino.startsWith("/") &&
      !destino.startsWith("//")
    ) {
      redirect(destino);
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-300">Cargando verificación de seguridad...</div>}>
      <AutorizarDispositivoClient
        config={config}
        isAlreadyAuthorized={currentCheck.authorized}
        currentDevice={currentCheck.device}
      />
    </Suspense>
  );
}
