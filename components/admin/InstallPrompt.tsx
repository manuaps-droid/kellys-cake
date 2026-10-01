"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-kc-sand bg-white p-4 shadow-2xl lg:bottom-4 lg:left-auto lg:right-4">
      <div className="flex items-center gap-4">
        <span className="text-3xl">🍰</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-kc-charcoal">
            Instalar Kelly&apos;s Cake Admin
          </p>
          <p className="text-xs text-kc-mocha">
            Accede rápido desde tu pantalla de inicio
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg px-3 py-2 text-xs text-kc-mocha hover:bg-kc-sand"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-kc-rose-gold px-4 py-2 text-xs font-semibold text-white hover:bg-kc-gold"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
