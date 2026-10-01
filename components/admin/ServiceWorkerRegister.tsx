"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
        return;
      }

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);

          // Forzar verificación de actualizaciones al montar la app
          registration.update();

          // Comprobar actualizaciones periódicamente cada 5 minutos
          const interval = setInterval(() => {
            registration.update();
          }, 1000 * 60 * 5);

          // Si hay un service worker esperando para activarse, activarlo
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          // Escuchar cuando se instala un nuevo service worker
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // Nueva versión lista, mandar señal para activar
                  installingWorker.postMessage({ type: "SKIP_WAITING" });
                }
              };
            }
          };

          return () => clearInterval(interval);
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });

      // Recargar la página automáticamente cuando el nuevo Service Worker tome el control
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}
