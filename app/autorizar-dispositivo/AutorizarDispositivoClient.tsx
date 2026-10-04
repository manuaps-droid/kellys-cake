"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Laptop,
  Lock,
  KeyRound,
  ArrowRight,
  Home,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registrarDispositivoAction } from "@/features/admin/configuracion/actions/dispositivos.action";
import type {
  SeguridadDispositivosConfig,
  DispositivoItem,
} from "@/features/admin/configuracion/validations/config.schema";

interface Props {
  config: SeguridadDispositivosConfig;
  isAlreadyAuthorized: boolean;
  currentDevice?: DispositivoItem;
}

export default function AutorizarDispositivoClient({
  config,
  isAlreadyAuthorized,
  currentDevice,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const [nombre, setNombre] = useState("");
  const [claveMaestra, setClaveMaestra] = useState("");
  const [tipoDetectado, setTipoDetectado] = useState<"pc" | "android" | "otro">("pc");
  const [pending, startTransition] = useTransition();

  // Auto-detectar dispositivo del usuario
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) {
        setTipoDetectado("android");
        setNombre("Celular Android");
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        setTipoDetectado("otro");
        setNombre("Dispositivo Móvil");
      } else {
        setTipoDetectado("pc");
        setNombre("PC Principal (Windows)");
      }
    }
  }, []);

  const activos = config.dispositivos.filter((d) => d.activo !== false);
  const cuposDisponibles = Math.max(0, config.max_dispositivos - activos.length);
  const limiteAlcanzado = cuposDisponibles === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error("Por favor ingresa un nombre para identificar este equipo.");
      return;
    }

    if (!claveMaestra.trim()) {
      toast.error("Ingresa la Clave Maestra de Seguridad.");
      return;
    }

    startTransition(async () => {
      const res = await registrarDispositivoAction({
        nombre: nombre.trim(),
        claveMaestra: claveMaestra.trim(),
        tipo: tipoDetectado,
      });

      if (res.success) {
        toast.success("¡Dispositivo vinculado con éxito!");
        // Redirigir a la ruta solicitada
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 1000);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white">
      <div className="w-full max-w-lg">
        {/* Header de Seguridad */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-2xl shadow-amber-500/20 mb-4">
            <div className="h-full w-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              {isAlreadyAuthorized ? (
                <ShieldCheck className="h-10 w-10 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-10 w-10 text-amber-400" />
              )}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Seguridad de Acceso Kelly&apos;s Cake
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            El acceso al panel <span className="text-amber-400 font-semibold">Admin</span> y a{" "}
            <span className="text-blue-400 font-semibold">FoodOS</span> está restringido
            exclusivamente a los <span className="text-white font-bold">3 equipos autorizados</span> de la empresa.
          </p>
        </div>

        {/* Si ya está autorizado este equipo */}
        {isAlreadyAuthorized ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">¡Este equipo ya está autorizado!</h2>
            <p className="text-xs text-emerald-200/80 mt-1">
              Dispositivo registrado como: <strong className="text-white">{currentDevice?.nombre || "Equipo Autorizado"}</strong>
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push(redirectPath)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Continuar al Sistema <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Ir a la Tienda
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Formulario de Vinculación */
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            {/* Monitor de Cupos de Dispositivos (1, 2, 3) */}
            <div className="mb-6 pb-6 border-b border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold mb-3">
                <span className="text-slate-400">Cupos de Equipos Autorizados:</span>
                <span className="text-amber-400">
                  {activos.length} de {config.max_dispositivos} ocupados ({cuposDisponibles} disponible{cuposDisponibles !== 1 ? "s" : ""})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((idx) => {
                  const dev = activos[idx];
                  const isAndroid = dev?.tipo === "android";
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                        dev
                          ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                          : "border-dashed border-slate-700 bg-slate-800/40 text-slate-500"
                      }`}
                    >
                      {dev ? (
                        <>
                          {isAndroid ? (
                            <Smartphone className="h-5 w-5 mb-1 text-emerald-400" />
                          ) : (
                            <Laptop className="h-5 w-5 mb-1 text-emerald-400" />
                          )}
                          <span className="text-[11px] font-bold truncate max-w-full block">
                            {dev.nombre}
                          </span>
                          <span className="text-[9px] text-emerald-500/80 mt-0.5">Activo</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mb-1 text-slate-500" />
                          <span className="text-[11px] font-medium">Cupo {idx + 1}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">Disponible</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {limiteAlcanzado ? (
              /* Caso: Ya se ocuparon los 3 cupos */
              <div className="text-center py-4">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <h3 className="font-bold text-base text-white">Límite de 3 Equipos Alcanzado</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Ya se encuentran registrados los 3 equipos autorizados de la empresa. Para vincular este dispositivo,
                  debes ingresar desde uno de tus equipos autorizados y revocar un cupo en{" "}
                  <strong className="text-amber-300">Admin → Configuración → Dispositivos</strong>.
                </p>
                <div className="mt-6">
                  <Button
                    asChild
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 font-medium"
                  >
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" /> Volver a la Tienda Pública
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* Caso: Hay cupo disponible para autorizar */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre o etiqueta para este equipo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      {tipoDetectado === "android" ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Laptop className="h-4 w-4" />
                      )}
                    </span>
                    <Input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: PC Principal, Celular 1, Celular 2"
                      className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Detectado:{" "}
                    <strong className="text-amber-300 capitalize">
                      {tipoDetectado === "android" ? "Celular Android" : "Computadora (PC)"}
                    </strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Clave Maestra de Seguridad
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <Input
                      type="password"
                      required
                      value={claveMaestra}
                      onChange={(e) => setClaveMaestra(e.target.value)}
                      placeholder="Ingresa la clave maestra"
                      className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-400 font-mono tracking-wider"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Clave de fábrica predeterminada: <code className="text-amber-400 font-bold">KELLY-2026-SEGURA</code> (puedes cambiarla luego en el Admin).
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={pending}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verificando y autorizando...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Autorizar y Vincular Este Equipo
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/"
                    className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
                  >
                    <Home className="h-3.5 w-3.5" /> Volver a la Tienda Principal
                  </Link>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-500">
          Kelly&apos;s Cake Platform &bull; Protocolo de Seguridad por Hardware v2.0
        </div>
      </div>
    </div>
  );
}
