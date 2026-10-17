"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, BellRing, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

type Estado =
  | "cargando"
  | "listo"
  | "activo"
  | "denegado"
  | "no-soportado";

export default function ActivarNotificaciones({
  compacto = false,
}: {
  compacto?: boolean;
}) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const revisar = async () => {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        typeof Notification === "undefined" ||
        !VAPID_PUBLIC_KEY
      ) {
        setEstado("no-soportado");
        return;
      }

      if (Notification.permission === "granted") {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          const sub = reg
            ? await reg.pushManager.getSubscription()
            : null;
          setEstado(sub ? "activo" : "listo");
        } catch {
          setEstado("listo");
        }
      } else {
        setEstado("listo");
      }
    };

    void revisar();
  }, []);

  async function activar() {
    if (procesando || estado === "activo") return;

    setProcesando(true);

    try {
      const permiso = await Notification.requestPermission();

      if (permiso !== "granted") {
        setEstado("denegado");
        toast.info(
          "Permiso de notificaciones denegado en este navegador."
        );
        return;
      }

      let reg = await navigator.serviceWorker.getRegistration();

      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js");
      }

      const listo = await navigator.serviceWorker.ready;

      let sub = await listo.pushManager.getSubscription();

      if (!sub) {
        sub = await listo.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          dispositivoNombre: navigator.userAgent.slice(0, 100),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(
          data.message ??
            "No se pudieron activar las notificaciones en este equipo."
        );
        return;
      }

      setEstado("activo");
      toast.success("Notificaciones activadas en este equipo.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron activar las notificaciones.");
    } finally {
      setProcesando(false);
    }
  }

  const etiqueta =
    estado === "activo"
      ? "Notificaciones activas"
      : estado === "no-soportado"
        ? "Notificaciones no disponibles aquí"
        : estado === "denegado"
          ? "Permiso bloqueado en el navegador"
          : "Activar notificaciones";

  if (compacto) {
    return (
      <button
        type="button"
        onClick={activar}
        disabled={procesando || estado === "activo" || estado === "no-soportado"}
        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-white/80 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-60"
      >
        {procesando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : estado === "activo" ? (
          <BellRing className="h-4 w-4 text-emerald-400" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        <span>{etiqueta}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={activar}
      disabled={procesando || estado === "activo" || estado === "no-soportado"}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium transition hover:bg-gray-100 disabled:opacity-60 sm:text-sm"
      title={etiqueta}
    >
      {procesando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : estado === "activo" ? (
        <BellRing className="h-4 w-4 text-emerald-600" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{etiqueta}</span>
    </button>
  );
}
