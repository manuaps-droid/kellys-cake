"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // En entorno de desarrollo (localhost), DESACTIVAR el Service Worker
    // para evitar conflictos con HMR, Turbopack y Server Actions.
    const isDev =
      process.env.NODE_ENV !== "production" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      // Limpiar caches de desarrollo si existieran
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return;
    }

    // En producción: registrar el Service Worker de forma segura
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Actualizar periódicamente en segundo plano
        registration.update();
      })
      .catch((err) => {
        console.warn("PWA registration failed:", err);
      });
  }, []);

  return null;
}
