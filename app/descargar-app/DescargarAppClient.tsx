"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  Laptop,
  Download,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Share2,
  ExternalLink,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function DescargarAppClient() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin);
      setIsMobile(/android|iphone|ipad|ipod/i.test(navigator.userAgent));

      // Verificar si ya está corriendo en modo standalone (instalada)
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }

      // Escuchar el evento oficial PWA beforeinstallprompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info(
        "Para instalar en tu navegador, abre el menú de opciones (⋮) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'."
      );
      return;
    }

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      toast.success("¡Kelly's Cake instalada con éxito!");
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Crear archivo de acceso directo de escritorio para Windows
  const handleDescargarAccesoDirectoWindows = () => {
    const url = currentUrl || "http://localhost:3000";
    const batchContent = `@echo off
title Kellys Cake
echo Iniciando Kellys Cake en modo aplicacion...
start msedge --app=${url}
if %errorlevel% neq 0 (
  start chrome --app=${url}
)
exit
`;
    const blob = new Blob([batchContent], { type: "application/bat" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Iniciar-Kellys-Cake.bat";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("¡Acceso directo descargado! Puedes moverlo a tu Escritorio.");
  };

  // URL para el código QR (preferir la IP local o el origen actual)
  const qrTargetUrl = currentUrl || "http://localhost:3000";
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=2C1810&bgcolor=FFFFFF&data=${encodeURIComponent(
    qrTargetUrl
  )}`;

  return (
    <div className="min-h-screen bg-[#FFFCF7] text-[#2C1810] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Banner Superior Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Instalación Oficial Multidispositivo
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Instalar <span className="text-amber-700">Kelly&apos;s Cake</span>
          </h1>
          <p className="mt-3 text-base text-stone-600 max-w-2xl mx-auto">
            Aplicación nativa de alta velocidad para esta computadora y tus 2 celulares Android, con{" "}
            <strong className="text-stone-900">actualizaciones 100% automáticas</strong> ante cualquier cambio.
          </p>
        </div>

        {/* 3 Beneficios Clave */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-bold text-xs text-stone-900">Auto-actualizable</h4>
              <p className="text-[11px] text-stone-500">Cualquier cambio se refleja en vivo al instante.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-bold text-xs text-stone-900">3 Equipos Autorizados</h4>
              <p className="text-[11px] text-stone-500">Protege Admin y FoodOS de accesos externos.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-bold text-xs text-stone-900">Pantalla Completa</h4>
              <p className="text-[11px] text-stone-500">Sin barra de navegación, como app de Google Play.</p>
            </div>
          </div>
        </div>

        {/* Bloques de Instalación: PC vs Android */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Bloque 1: Celulares Android (Tus 2 equipos) */}
          <div className="rounded-3xl border-2 border-emerald-300/80 bg-gradient-to-b from-emerald-50/40 via-white to-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <Smartphone className="h-4 w-4" /> Para tus 2 Celulares Android
                </span>
                <span className="text-[11px] font-semibold text-stone-400">WebAPK Nativo</span>
              </div>

              <h3 className="text-xl font-extrabold text-stone-900 mb-2">
                Instalación en Celular Android
              </h3>
              <p className="text-xs text-stone-600 mb-5 leading-relaxed">
                Escanea el código QR desde la cámara de tu celular Android para abrir e instalar la app de inmediato.
              </p>

              {/* Contenedor Código QR */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs mb-5">
                <div className="relative h-48 w-48 bg-white p-2 rounded-xl border border-stone-100 shadow-inner flex items-center justify-center">
                  {currentUrl ? (
                    <Image
                      src={qrCodeImageUrl}
                      alt="Código QR para instalar en Android"
                      width={180}
                      height={180}
                      className="rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <QrCode className="h-32 w-32 text-stone-300" />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-stone-500 mt-3 text-center">
                  Apunta con la cámara de tus 2 celulares a este código
                </span>
                <span className="text-[10px] text-stone-400 font-mono mt-0.5 truncate max-w-xs">
                  {qrTargetUrl}
                </span>
              </div>

              {/* Pasos en Celular */}
              <div className="space-y-2.5 text-xs text-stone-700 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/70">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    1
                  </span>
                  <span>Abre el enlace en <strong>Google Chrome</strong> o <strong>Samsung Internet</strong> en tu celular.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    2
                  </span>
                  <span>Toca los <strong>3 puntos (⋮)</strong> arriba a la derecha.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    3
                  </span>
                  <span>Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-stone-100">
              {isMobile ? (
                <Button
                  onClick={handleInstallClick}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-md transition"
                >
                  <Download className="mr-2 h-4 w-4" /> Instalar en Este Celular Ahora
                </Button>
              ) : (
                <div className="text-center">
                  <span className="text-xs text-stone-500">
                    Al instalarla en Android, la app aparecerá en el cajón de aplicaciones con el logo oficial de Kelly&apos;s Cake.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bloque 2: Esta Computadora (PC Windows) */}
          <div className="rounded-3xl border-2 border-amber-300/80 bg-gradient-to-b from-amber-50/40 via-white to-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                  <Laptop className="h-4 w-4" /> Para Esta Computadora (PC)
                </span>
                <span className="text-[11px] font-semibold text-stone-400">Windows Desktop</span>
              </div>

              <h3 className="text-xl font-extrabold text-stone-900 mb-2">
                Instalación en Esta Máquina
              </h3>
              <p className="text-xs text-stone-600 mb-5 leading-relaxed">
                Ejecuta Kelly&apos;s Cake como una aplicación de escritorio nativa en Windows, sin barras de pestañas ni distracciones.
              </p>

              {/* Botón PWA Oficial si el navegador lo soporta */}
              <div className="space-y-4 mb-6">
                <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-800">Método 1: Aplicación PWA (Edge / Chrome)</span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">Recomendado</span>
                  </div>
                  <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                    Instala directamente en el sistema operativo Windows mediante el motor de aplicaciones de tu navegador.
                  </p>
                  <Button
                    onClick={handleInstallClick}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-xs"
                  >
                    <Download className="mr-2 h-4 w-4" /> Instalar en Esta PC
                  </Button>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-800">Método 2: Acceso Directo de Escritorio (.bat)</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">1 Clic</span>
                  </div>
                  <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                    Descarga el iniciador que abre automáticamente Kelly&apos;s Cake en ventana de aplicación independiente.
                  </p>
                  <Button
                    onClick={handleDescargarAccesoDirectoWindows}
                    variant="outline"
                    className="w-full border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-900 font-bold py-2.5 rounded-xl"
                  >
                    <Laptop className="mr-2 h-4 w-4 text-amber-700" /> Descargar Acceso Directo Windows
                  </Button>
                </div>
              </div>
            </div>

            {/* Enlace para Autorizar el Dispositivo */}
            <div className="mt-6 pt-5 border-t border-stone-100 bg-stone-50/80 -mx-6 -mb-6 p-6 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-600" /> ¿Acceso a Admin y FoodOS?
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Autoriza este equipo dentro de tus 3 cupos de seguridad.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  <Link href="/autorizar-dispositivo">
                    Autorizar Equipo <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
