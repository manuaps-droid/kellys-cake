"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Detectar actualizaciones automáticamente
          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener("statechange", () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // Nueva versión disponible: auto-actualizar para que el cliente siempre tenga lo último
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("ServiceWorker registration failed:", err);
        });
    }
  }, []);

  return null;
}
