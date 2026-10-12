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
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setCurrentUrl(window.location.origin);
    setIsMobile(/android|iphone|ipad|ipod/i.test(navigator.userAgent));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const adminUrl = `${currentUrl || "http://localhost:3000"}/admin`;
  const tiendaUrl = currentUrl || "http://localhost:3000";

  const qrAdminImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=2C1810&bgcolor=FFFFFF&data=${encodeURIComponent(
    adminUrl
  )}`;
  const qrTiendaImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=2C1810&bgcolor=FFFFFF&data=${encodeURIComponent(
    tiendaUrl
  )}`;

  // Instalación PWA de la TIENDA (botón secundario, para clientes)
  const handleInstallTienda = async () => {
    if (!deferredPrompt) {
      toast.info(
        "Para instalar la tienda, abre el menú de opciones (⋮) y selecciona «Instalar aplicación»."
      );
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // Acceso directo de escritorio que abre el ADMIN en ventana de aplicación
  const handleDescargarAccesoDirectoAdmin = () => {
    const batchContent = `@echo off
title Kellys Cake Admin
echo Iniciando el Panel de Administracion de Kelly's Cake...
start msedge --app=${adminUrl}
if %errorlevel% neq 0 (
  start chrome --app=${adminUrl}
)
exit
`;
    const blob = new Blob([batchContent], { type: "application/bat" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Iniciar-Kellys-Cake-ADMIN.bat";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      "¡Acceso directo del Admin descargado! Muévelo a tu Escritorio y haz doble clic."
    );
  };

  // Acceso directo de escritorio que abre la TIENDA en ventana de aplicación
  const handleDescargarAccesoDirectoTienda = () => {
    const batchContent = `@echo off
title Kellys Cake
echo Iniciando Kellys Cake en modo aplicacion...
start msedge --app=${tiendaUrl}
if %errorlevel% neq 0 (
  start chrome --app=${tiendaUrl}
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

  return (
    <div className="min-h-screen bg-[#FFFCF7] text-[#2C1810] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Centro de
            Instalación · Gestión y Tienda
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Instalar el <span className="text-amber-700">Admin</span> de
            Kelly&apos;s Cake
          </h1>
          <p className="mt-3 text-base text-stone-600 max-w-2xl mx-auto">
            El <strong className="text-stone-900">Admin</strong> es la app de
            control logístico del proyecto: pedidos, agenda de producción,
            clientes y configuración. Se instala como aplicación propia y{" "}
            <strong className="text-stone-900">
              abre directamente en el panel
            </strong>
            , sin pasar por la tienda web. Incluye también el acceso a FoodOS
            (inventario, producción y compras) dentro de la misma ventana.
          </p>
        </div>

        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-bold text-xs text-stone-900">
                Siempre actualizado
              </h4>
              <p className="text-[11px] text-stone-500">
                Pedidos y agenda siempre frescos (network-first).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-bold text-xs text-stone-900">
                3 Equipos Autorizados
              </h4>
              <p className="text-[11px] text-stone-500">
                Protege el panel con tu control de dispositivos.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-bold text-xs text-stone-900">
                PC y celulares
              </h4>
              <p className="text-[11px] text-stone-500">
                Misma app con su propio ícono en cada equipo.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN PRINCIPAL: APP DEL ADMIN */}
        <div className="rounded-3xl border-2 border-stone-800 bg-gradient-to-b from-stone-900 via-stone-900 to-[#1F140B] p-6 sm:p-8 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <Laptop className="h-4 w-4" /> App del Admin
            </span>
            <span className="text-[11px] font-semibold text-stone-400">
              Control logístico · Se abre directo en el panel
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-amber-50 mb-2">
            Instalación del Panel de Administración
          </h3>
          <p className="text-xs text-stone-400 mb-6 leading-relaxed max-w-2xl">
            Instálala en cada equipo desde la página del admin (
            <strong className="text-amber-100">{adminUrl}</strong>) con tu
            sesión iniciada: el navegador instalará{" "}
            <strong className="text-amber-100">«KC Admin»</strong>, una app con
            ícono propio que abre directo el panel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {/* QR Admin */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/95 border border-stone-700">
              <Image
                src={qrAdminImageUrl}
                alt="Código QR para instalar el Admin"
                width={150}
                height={150}
                className="rounded-lg"
                unoptimized
              />
              <span className="text-[11px] font-semibold text-stone-500 mt-3 text-center">
                Escanea con tus celulares y abre{" "}
                <strong>{adminUrl}</strong>
              </span>
            </div>

            {/* PC */}
            <div className="p-5 rounded-2xl bg-white/5 border border-stone-700 flex flex-col">
              <h4 className="text-sm font-bold text-amber-50 mb-3 flex items-center gap-2">
                <Laptop className="h-4 w-4 text-amber-400" /> En esta PC
              </h4>
              <div className="space-y-2.5 text-[11px] text-stone-300 flex-1">
                <p>
                  <strong className="text-amber-100">Método 1 (1 clic):</strong>{" "}
                  descarga el acceso directo y ejecútalo: abre el admin en
                  ventana de aplicación inmediatamente.
                </p>
                <p>
                  <strong className="text-amber-100">Método 2:</strong> entra a{" "}
                  {adminUrl} en Chrome/Edge y toca el ícono de instalación en
                  la barra de direcciones.
                </p>
              </div>
              <div className="space-y-2 mt-4">
                <Button
                  onClick={handleDescargarAccesoDirectoAdmin}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                >
                  <Download className="mr-2 h-4 w-4" /> Descargar Acceso Directo
                  Admin
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-stone-600 bg-transparent text-amber-50 hover:bg-white/10 font-bold py-2.5 rounded-xl text-xs"
                >
                  <Link href="/admin">
                    Abrir el Admin <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Celulares */}
            <div className="p-5 rounded-2xl bg-white/5 border border-stone-700 flex flex-col">
              <h4 className="text-sm font-bold text-amber-50 mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-amber-400" /> En tus
                celulares
              </h4>
              <div className="space-y-2.5 text-[11px] text-stone-300 flex-1">
                <p>
                  <strong className="text-amber-100">Android:</strong> escanea
                  el QR, inicia sesión y en Chrome toca{" "}
                  <strong>⋮ → Instalar aplicación</strong>.
                </p>
                <p>
                  <strong className="text-amber-100">iPhone:</strong> abre el
                  enlace en Safari, inicia sesión y toca{" "}
                  <strong>Compartir → Agregar a pantalla de inicio</strong>.
                </p>
                <p>
                  El ícono «KC Admin» abrirá el panel directamente, sin la
                  tienda.
                </p>
              </div>
              {isMobile && (
                <Button
                  asChild
                  className="mt-4 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                >
                  <Link href="/admin">
                    Abrir el Admin en este celular
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="pt-5 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-stone-400">
              <Share2 className="inline h-3.5 w-3.5 mr-1" />
              Ya instalaste antes la app de la tienda y abre la web:
              desinstálala y vuelve a instalar desde {adminUrl} — son dos apps
              distintas.
            </span>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-stone-600 bg-transparent text-amber-50 hover:bg-white/10 font-bold rounded-xl"
            >
              <Link href="/autorizar-dispositivo">
                <Lock className="mr-1.5 h-3.5 w-3.5" /> Autorizar Equipo
              </Link>
            </Button>
          </div>
        </div>

        {/* SECCIÓN SECUNDARIA: APP DE LA TIENDA PARA CLIENTES */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200">
              <Smartphone className="h-4 w-4" /> App de la Tienda (clientes)
            </span>
            <span className="text-[11px] font-semibold text-stone-400">
              Opcional · catálogo y compras
            </span>
          </div>

          <p className="text-xs text-stone-600 mb-6 leading-relaxed max-w-2xl">
            La tienda también se instala como app para tus clientes: abre el
            catálogo, no el panel. Solo instálala si la necesitas; tu control
            logístico vive en la app del Admin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/40 to-white border border-stone-200">
              <h4 className="text-sm font-bold text-stone-900 mb-3">
                Celulares (QR de la tienda)
              </h4>
              <div className="flex flex-col items-center">
                {currentUrl ? (
                  <Image
                    src={qrTiendaImageUrl}
                    alt="Código QR para instalar la tienda"
                    width={120}
                    height={120}
                    className="rounded-lg"
                    unoptimized
                  />
                ) : (
                  <QrCode className="h-24 w-24 text-stone-300" />
                )}
                <span className="text-[11px] font-semibold text-stone-500 mt-3 text-center">
                  Abre {tiendaUrl} en Chrome → ⋮ → Instalar aplicación
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/40 to-white border border-stone-200 flex flex-col">
              <h4 className="text-sm font-bold text-stone-900 mb-3">
                En esta PC
              </h4>
              <div className="space-y-2 flex-1">
                <Button
                  onClick={handleInstallTienda}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  <Download className="mr-2 h-4 w-4" /> Instalar Tienda (PWA)
                </Button>
                <Button
                  onClick={handleDescargarAccesoDirectoTienda}
                  variant="outline"
                  className="w-full border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-900 font-bold py-2.5 rounded-xl text-xs"
                >
                  <Laptop className="mr-2 h-4 w-4 text-amber-700" /> Acceso
                  Directo Windows
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
