"use client";

import { useState, useTransition } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Trash2,
  KeyRound,
  Lock,
  QrCode,
  Check,
  Loader2,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";

import {
  revocarDispositivoAction,
  actualizarClaveMaestraAction,
  toggleRestriccionAction,
  registrarDispositivoAction,
} from "@/features/admin/configuracion/actions/dispositivos.action";
import type {
  SeguridadDispositivosConfig,
} from "@/features/admin/configuracion/validations/config.schema";

interface Props {
  initialConfig: Partial<SeguridadDispositivosConfig>;
}

export default function DispositivosSeguridadTab({ initialConfig }: Props) {
  const [config, setConfig] = useState<SeguridadDispositivosConfig>({
    restringir_acceso: initialConfig.restringir_acceso ?? true,
    clave_maestra: initialConfig.clave_maestra ?? "KELLY-2026-SEGURA",
    max_dispositivos: initialConfig.max_dispositivos ?? 3,
    dispositivos: initialConfig.dispositivos ?? [],
  });

  const [nuevaClave, setNuevaClave] = useState(config.clave_maestra);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [pending, startTransition] = useTransition();

  const activos = config.dispositivos.filter((d) => d.activo !== false);
  const cuposDisponibles = Math.max(0, config.max_dispositivos - activos.length);

  // Alternar restricción global
  const handleToggleRestriccion = (activo: boolean) => {
    startTransition(async () => {
      const res = await toggleRestriccionAction(activo);
      if (res.success) {
        setConfig((p) => ({ ...p, restringir_acceso: activo }));
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  // Revocar un equipo
  const handleRevocar = (deviceId: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de desvincular el equipo "${nombre}"? Perderá el acceso inmediato a Admin y FoodOS.`)) {
      return;
    }

    startTransition(async () => {
      const res = await revocarDispositivoAction(deviceId);
      if (res.success) {
        setConfig((p) => ({
          ...p,
          dispositivos: p.dispositivos.filter((d) => d.id !== deviceId),
        }));
        toast.success(`Equipo "${nombre}" desvinculado con éxito.`);
      } else {
        toast.error(res.message);
      }
    });
  };

  // Actualizar clave maestra
  const handleActualizarClave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaClave.trim().length < 4) {
      toast.error("La clave maestra debe tener al menos 4 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await actualizarClaveMaestraAction(nuevaClave.trim());
      if (res.success) {
        setConfig((p) => ({ ...p, clave_maestra: nuevaClave.trim() }));
        toast.success("¡Clave maestra actualizada correctamente!");
      } else {
        toast.error(res.message);
      }
    });
  };

  // Autorizar este equipo directamente
  const handleAutorizarEsteEquipo = () => {
    if (cuposDisponibles <= 0) {
      toast.error("Ya se alcanzó el límite de 3 equipos. Desvincula uno primero.");
      return;
    }

    startTransition(async () => {
      const res = await registrarDispositivoAction({
        nombre: nombreNuevo.trim() || "Este Equipo (PC Admin)",
        claveMaestra: config.clave_maestra,
      });

      if (res.success && res.device) {
        setConfig((p) => ({
          ...p,
          dispositivos: [...p.dispositivos, res.device!],
        }));
        setNombreNuevo("");
        toast.success("¡Este equipo ha sido vinculado y autorizado con éxito!");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Tarjeta de Control Principal */}
      <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-200/60">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900">
                  Control de Acceso por Hardware (3 Equipos Autorizados)
                </h3>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {activos.length} / {config.max_dispositivos} Equipos Vinculados
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Restringe el ingreso a las áreas críticas (<strong className="text-amber-800">Admin</strong> y{" "}
                <strong className="text-blue-800">FoodOS</strong>) exclusivamente a esta PC y tus 2 celulares Android.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-xs font-bold text-gray-700">Restricción Activa:</span>
            <Switch
              checked={config.restringir_acceso}
              onCheckedChange={handleToggleRestriccion}
              disabled={pending}
            />
          </div>
        </div>

        {/* 3 Slots Visuales de Equipos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {[0, 1, 2].map((idx) => {
            const dev = activos[idx];
            const isAndroid = dev?.tipo === "android";

            return (
              <div
                key={idx}
                className={`rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                  dev
                    ? "bg-white border-emerald-300 ring-2 ring-emerald-500/10"
                    : "bg-gray-50/60 border-dashed border-gray-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Slot {idx + 1} de 3
                    </span>
                    {dev ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <Check className="h-3 w-3" /> Autorizado
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        Disponible
                      </span>
                    )}
                  </div>

                  {dev ? (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                          {isAndroid ? (
                            <Smartphone className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <Laptop className="h-5 w-5 text-blue-400" />
                          )}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 truncate">
                            {dev.nombre}
                          </h4>
                          <span className="text-[11px] text-gray-500 capitalize">
                            {dev.tipo === "android" ? "Celular Android" : "Computadora (PC)"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <p>
                          <strong>IP:</strong> {dev.ip || "Local"}
                        </p>
                        <p>
                          <strong>Vinculado:</strong>{" "}
                          {new Date(dev.creadoEn).toLocaleDateString("es-PE")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <Lock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-xs font-semibold text-gray-600">Cupo Disponible</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Listo para vincular tu celular Android o esta PC.
                      </p>
                    </div>
                  )}
                </div>

                {dev && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevocar(dev.id, dev.nombre)}
                      disabled={pending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-medium"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Desvincular
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarjeta de Vinculación y Clave Maestra */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cambiar Clave Maestra de Seguridad */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-bold text-sm text-gray-900">
                Clave Maestra de Autorización
              </h4>
              <p className="text-xs text-gray-500">
                Esta clave se solicita en la pantalla de autorización para vincular cada equipo.
              </p>
            </div>
          </div>

          <form onSubmit={handleActualizarClave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Clave Maestra Actual / Nueva
              </label>
              <Input
                type="text"
                value={nuevaClave}
                onChange={(e) => setNuevaClave(e.target.value)}
                placeholder="Ingresa una clave segura"
                className="bg-gray-50 font-mono font-bold text-gray-800"
              />
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Clave Maestra"
              )}
            </Button>
          </form>
        </div>

        {/* Vincular Este Equipo / Descargar App Celulares */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <QrCode className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  Instaladores y Vinculación en Celulares Android
                </h4>
                <p className="text-xs text-gray-500">
                  Instala la app en tus 2 celulares y vincúlalos en 1 solo paso con código QR.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Abre el centro de instalación para escanear el código QR desde tus celulares Android o
              instalar la app PWA en esta máquina.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button
              asChild
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              <Link href="/descargar-app">
                <QrCode className="h-4 w-4 mr-2" /> Ver Instaladores & QR
              </Link>
            </Button>

            {cuposDisponibles > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAutorizarEsteEquipo}
                disabled={pending}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" /> Vincular Esta PC Ahora
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
