"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Printer, AlertTriangle, CheckCircle2, XCircle, Sparkles, Loader2, Info } from "lucide-react";

import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateConfigAction } from "@/features/admin/configuracion/actions/config.action";
import type { ProductosConfig } from "@/features/admin/configuracion/validations/config.schema";

interface Props {
  initialConfig: Partial<ProductosConfig>;
}

export default function ConfigProductosTab({ initialConfig }: Props) {
  const [pending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  const [papelAzucarActivo, setPapelAzucarActivo] = useState(
    initialConfig.papel_azucar_activo ?? true
  );
  const [papelArrozActivo, setPapelArrozActivo] = useState(
    initialConfig.papel_arroz_activo ?? true
  );
  const [papelAzucarAviso, setPapelAzucarAviso] = useState(
    initialConfig.papel_azucar_aviso ?? "Papel de Azúcar temporalmente sin stock."
  );
  const [papelArrozAviso, setPapelArrozAviso] = useState(
    initialConfig.papel_arroz_aviso ?? "Papel de Arroz temporalmente sin stock."
  );

  const handleSave = () => {
    startTransition(async () => {
      const payload: ProductosConfig = {
        papel_azucar_activo: papelAzucarActivo,
        papel_arroz_activo: papelArrozActivo,
        papel_azucar_aviso: papelAzucarAviso.trim() || "Papel de Azúcar temporalmente sin stock.",
        papel_arroz_aviso: papelArrozAviso.trim() || "Papel de Arroz temporalmente sin stock.",
      };

      const result = await updateConfigAction("productos", payload);
      if (result.success) {
        toast.success("¡Disponibilidad de insumos actualizada correctamente!");
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      } else {
        toast.error(result.message ?? "No se pudo guardar la configuración.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
            <Printer className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Insumos para Impresiones Comestibles
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Control de Stock en Tiempo Real
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Controla la disponibilidad del <strong>Papel de Azúcar</strong> y del <strong>Papel de Arroz</strong>. 
              Si desactivas una opción por falta de stock, la tienda pública mostrará un aviso inmediato al cliente en el catálogo de productos y bloqueará su compra hasta que repongas stock.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Insumos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Papel de Azúcar */}
        <div
          className={`relative rounded-2xl border-2 p-6 transition-all ${
            papelAzucarActivo
              ? "border-emerald-200 bg-white shadow-xs"
              : "border-rose-200 bg-rose-50/20 shadow-xs"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h3 className="text-base font-bold text-gray-900">
                  Papel de Azúcar A4
                </h3>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Colores más vivos, flexible, calidad fotográfica premium para tortas húmedas.
              </p>
            </div>

            <Switch
              checked={papelAzucarActivo}
              onCheckedChange={setPapelAzucarActivo}
            />
          </div>

          {/* Estado de Stock */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado actual:
              </span>
              {papelAzucarActivo ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  En Stock (Disponible)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  Agotado (Sin Stock)
                </span>
              )}
            </div>

            {/* Aviso configurable al cliente */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700">
                Aviso mostrado al cliente cuando esté sin stock:
              </label>
              <Input
                type="text"
                value={papelAzucarAviso}
                onChange={(e) => setPapelAzucarAviso(e.target.value)}
                placeholder="Papel de Azúcar temporalmente sin stock."
                className="mt-1.5 h-9 text-xs"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Se mostrará en una alerta amarilla/roja cuando el cliente abra la opción de impresiones.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Papel de Arroz */}
        <div
          className={`relative rounded-2xl border-2 p-6 transition-all ${
            papelArrozActivo
              ? "border-emerald-200 bg-white shadow-xs"
              : "border-rose-200 bg-rose-50/20 shadow-xs"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌾</span>
                <h3 className="text-base font-bold text-gray-900">
                  Papel de Arroz / Oblea A4
                </h3>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Textura ligera y rígida clásica, ideal para galletas, gelatinas y decoraciones secas.
              </p>
            </div>

            <Switch
              checked={papelArrozActivo}
              onCheckedChange={setPapelArrozActivo}
            />
          </div>

          {/* Estado de Stock */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado actual:
              </span>
              {papelArrozActivo ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  En Stock (Disponible)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  Agotado (Sin Stock)
                </span>
              )}
            </div>

            {/* Aviso configurable al cliente */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700">
                Aviso mostrado al cliente cuando esté sin stock:
              </label>
              <Input
                type="text"
                value={papelArrozAviso}
                onChange={(e) => setPapelArrozAviso(e.target.value)}
                placeholder="Papel de Arroz temporalmente sin stock."
                className="mt-1.5 h-9 text-xs"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Se mostrará en una alerta amarilla/roja cuando el cliente intente seleccionarlo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa de cómo lo ve el cliente */}
      {(!papelAzucarActivo || !papelArrozActivo) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Previsualización de Alerta Activa para Clientes en la Tienda:
              </h4>
              <div className="mt-2 space-y-1 text-xs text-amber-800">
                {!papelAzucarActivo && (
                  <p className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                    <strong>Papel de Azúcar:</strong> {papelAzucarAviso}
                  </p>
                )}
                {!papelArrozActivo && (
                  <p className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                    <strong>Papel de Arroz:</strong> {papelArrozAviso}
                  </p>
                )}
                {!papelAzucarActivo && !papelArrozActivo && (
                  <p className="mt-1 font-semibold text-red-600">
                    ⚠️ Ambos tipos de papel están desactivados. El formulario de pedidos informará que el servicio se encuentra temporalmente en pausa por reposición de inventario.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Guardado */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <Button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando stock...
            </>
          ) : justSaved ? (
            "¡Guardado correctamente! ✓"
          ) : (
            "Guardar disponibilidad de productos"
          )}
        </Button>
        <p className="text-xs text-gray-400">
          Los cambios se actualizan de inmediato en la tienda pública sin recargar.
        </p>
      </div>
    </div>
  );
}
