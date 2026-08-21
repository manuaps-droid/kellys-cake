"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import { saveCotizacionAction } from "../actions/save-cotizacion.action";
import { calcularSubtotal } from "../lib/parse-items";
import ItemImageUploader from "./ItemImageUploader";

import type { CotizacionItem } from "../types/cotizacion.types";

const WHATSAPP_BUSINESS = "945262379";

function fmtSoles(n: number): string {
  return n.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });
}

function nuevoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

type Props = {
  cateringId?: string;
  proyectoId?: string;
  clienteNombre: string;
  initialItems: CotizacionItem[];
  existingId?: string;
};

export default function CotizacionEditor({
  cateringId,
  proyectoId,
  clienteNombre,
  initialItems,
  existingId,
}: Props) {
  const [items, setItems] = useState<CotizacionItem[]>(initialItems);
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ numero: number; token: string } | null>(null);

  const subtotal = useMemo(() => calcularSubtotal(items), [items]);

  function updateItem(id: string, patch: Partial<CotizacionItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: nuevoId(),
        tipo: "otro",
        nombre: "Nuevo producto",
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
        imagen: null,
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function handleSave() {
    setSaving(true);

    try {
      const itemsToSave = items.map((item) => {
        if (item.tipo === "pastel") {
          const partes = [
            item.sabores && `Sabores: ${item.sabores}`,
            item.rellenos && `Rellenos: ${item.rellenos}`,
            item.decoracion && `Decoración: ${item.decoracion}`,
            item.observaciones && `Observaciones: ${item.observaciones}`,
          ].filter(Boolean) as string[];

          return {
            ...item,
            descripcion: partes.join("\n") || item.descripcion,
            cantidad: 1,
          };
        }

        return item;
      });

      const result = await saveCotizacionAction({
        cateringId,
        proyectoId,
        items: itemsToSave,
        subtotal,
        notas,
        id: existingId,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setSaved({ numero: result.numero ?? 0, token: result.token ?? "" });
      toast.success("Cotización guardada");
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado al guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (saved?.token) {
    const publicUrl = `/cotizacion/${saved.token}`;
    const whatsappMessage = encodeURIComponent(
      `Hola Kelly's Cake, les comparto la cotización ${clienteNombre ? "para " + clienteNombre : ""}: ${window.location.origin}${publicUrl}`
    );

    return (
      <div className="space-y-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
        <div className="text-center">
          <div className="text-5xl">✅</div>
          <h2 className="mt-3 text-2xl font-bold text-emerald-800">
            Cotización COT-{String(saved.numero).padStart(4, "0")} guardada
          </h2>
          <p className="mt-2 text-emerald-700">
            Comparte el enlace con el cliente. Puede verla, imprimirla y cargarla a su carrito para pagar.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            👁 Ver cotización pública
          </a>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(`${window.location.origin}${publicUrl}`);
                toast.success("Enlace copiado");
              }}
            >
              Copiar enlace
            </Button>
            <a
              href={`https://wa.me/${WHATSAPP_BUSINESS}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              💬 Enviar por WhatsApp
            </a>
          </div>
          <button
            type="button"
            onClick={() => setSaved(null)}
            className="text-sm text-emerald-700 underline"
          >
            Editar cotización nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {existingId ? "Editar cotización" : "Nueva cotización"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Ajusta los precios, cantidades e imágenes de cada producto. El total se calcula automáticamente.
            </p>
          </div>
          <div className="rounded-full bg-cake-gold/10 px-4 py-2 text-sm font-semibold text-cake-gold">
            Total: {fmtSoles(subtotal)}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item) =>
            item.tipo === "pastel" ? (
              <div key={item.id} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Item</Label>
                      <Input
                        value={item.nombre}
                        onChange={(e) => updateItem(item.id, { nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sabores</Label>
                      <Input
                        value={item.sabores ?? ""}
                        onChange={(e) => updateItem(item.id, { sabores: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Rellenos</Label>
                      <Input
                        value={item.rellenos ?? ""}
                        onChange={(e) => updateItem(item.id, { rellenos: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Decoración</Label>
                      <Input
                        value={item.decoracion ?? ""}
                        onChange={(e) => updateItem(item.id, { decoracion: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Observaciones</Label>
                      <Input
                        value={item.observaciones ?? ""}
                        onChange={(e) => updateItem(item.id, { observaciones: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Precio (S/)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        value={item.precio_unitario || ""}
                        placeholder="0.00"
                        onChange={(e) =>
                          updateItem(item.id, {
                            precio_unitario: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <ItemImageUploader
                        value={item.imagen}
                        onChange={(url) => updateItem(item.id, { imagen: url })}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                      {fmtSoles(item.precio_unitario)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-medium text-red-500 transition hover:text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={item.id} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[180px] flex-1 space-y-1">
                    <Label className="text-xs">Item</Label>
                    <Input
                      value={item.nombre}
                      onChange={(e) => updateItem(item.id, { nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <ItemImageUploader
                      value={item.imagen}
                      onChange={(url) => updateItem(item.id, { imagen: url })}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.cantidad}
                      onChange={(e) =>
                        updateItem(item.id, {
                          cantidad: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                    />
                  </div>
                  <div className="w-36 space-y-1">
                    <Label className="text-xs">Precio unitario (S/)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.5"
                      value={item.precio_unitario || ""}
                      placeholder="0.00"
                      onChange={(e) =>
                        updateItem(item.id, {
                          precio_unitario: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="w-28 text-center">
                    <Label className="text-xs">Total</Label>
                    <span className="block rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold">
                      {fmtSoles(item.precio_unitario * item.cantidad)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="mb-2 text-xs font-medium text-red-500 transition hover:text-red-700"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            )
          )}

          <Button type="button" variant="outline" onClick={addItem} className="w-full">
            + Agregar producto
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-8">
        <Label className="text-base font-semibold">Notas internas (opcional)</Label>
        <p className="mt-1 text-sm text-gray-500">
          Estas notas se guardan en la solicitud de catering para el equipo interno.
        </p>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          placeholder="Notas para el equipo de cocina o ventas..."
          className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-cake-gold focus:ring-2 focus:ring-cake-gold/20"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => void handleSave()}
          disabled={saving || items.length === 0}
          className="bg-cake-gold px-8 py-3 text-base text-white hover:bg-[#b8860b]"
        >
          {saving ? "Guardando..." : existingId ? "Actualizar cotización" : "Generar cotización"}
        </Button>
      </div>
    </div>
  );
}
