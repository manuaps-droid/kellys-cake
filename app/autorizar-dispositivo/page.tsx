import { Suspense } from "react";
import AutorizarDispositivoClient from "./AutorizarDispositivoClient";
import { getSeguridadDispositivosConfig, isCurrentDeviceAuthorized } from "@/lib/auth/authorized-devices";

export const metadata = {
  title: "Autorización de Dispositivo | Kelly's Cake",
  description: "Control de seguridad para equipos autorizados a Admin y FoodOS.",
};

export default async function AutorizarDispositivoPage() {
  const config = await getSeguridadDispositivosConfig();
  const currentCheck = await isCurrentDeviceAuthorized();

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
