"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "kc_vid";

function getOrSetVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let vid = localStorage.getItem(STORAGE_KEY);
    if (!vid) {
      vid =
        "v_" +
        Math.random().toString(36).substring(2, 10) +
        Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, vid);
    }
    return vid;
  } catch {
    return "";
  }
}

/**
 * Componente ligero y no invasivo para contar visitas y usuarios únicos por día.
 * Ignora accesos a /admin, /api y bots conocidos.
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // No trackear rutas internas, APIs ni panel administrativo
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next")
    ) {
      return;
    }

    // Evitar duplicar tracking por re-renders inmediatos en el mismo path
    if (lastTrackedRef.current === pathname) {
      return;
    }
    lastTrackedRef.current = pathname;

    const visitorId = getOrSetVisitorId();
    const isMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (typeof window !== "undefined" && window.innerWidth < 768);

    const payload = JSON.stringify({
      path: pathname,
      visitorId,
      isMobile,
    });

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Silencioso para no interferir con la navegación del usuario
    }
  }, [pathname]);

  return null;
}
