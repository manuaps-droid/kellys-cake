"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";

import { savePreciosCantidadAction } from "../actions/producto-precio-cantidad.action";
import type { PrecioCantidadRow } from "../repositories/producto-precio-cantidad.repository";

type Props = {
  productoId: string;
  productoNombre: string;
  tiersIniciales: PrecioCantidadRow[];
};

type Tier = {
  cantidad_minima: string;
  precio: string;
};

export default function PrecioCantidadEditor({
  productoId,
  productoNombre,
  tiersIniciales,
}: Props) {
  const [tiers, setTiers] = useState<Tier[]>(
    tiersIniciales.length > 0
      ? tiersIniciales.map((t) => ({
          cantidad_minima: String(t.cantidad_minima),
          precio: String(t.precio),
        }))
      : [{ cantidad_minima: "", precio: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);


  function addTier() {
    setTiers((prev) => [...prev, { cantidad_minima: "", precio: "" }]);
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTier(index: number, field: keyof Tier, value: string) {
    setTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
    setSaved(false);
  }

  async function handleSave() {
    const validTiers = tiers
      .filter((t) => t.cantidad_minima.trim() && t.precio.trim())
      .map((t) => ({
        cantidad_minima: parseInt(t.cantidad_minima, 10),
        precio: parseFloat(t.precio),
      }))
      .sort((a, b) => a.cantidad_minima - b.cantidad_minima);

    setSaving(true);
    const result = await savePreciosCantidadAction(productoId, validTiers);
    setSaving(false);
    if (result.success) {
      setSaved(true);
    } else {
      alert("Error: " + result.message);
    }
  }

  return (
    <div className="rounded-xl border border-kc-sand bg-kc-cream/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-kc-charcoal">
          {productoNombre}
        </h4>
        <button
          type="button"
          onClick={addTier}
          className="flex items-center gap-1 rounded-lg bg-kc-rose-gold/10 px-2 py-1 text-xs text-kc-rose-gold transition hover:bg-kc-rose-gold/20"
        >
          <Plus className="h-3 w-3" />
          Agregar tier
        </button>
      </div>

      <div className="space-y-2">
        {tiers.map((tier, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                min="1"
                value={tier.cantidad_minima}
                onChange={(e) => updateTier(idx, "cantidad_minima", e.target.value)}
                placeholder="Cantidad mín. (ej: 25)"
                className="w-full rounded-lg border border-kc-sand bg-white px-2 py-1.5 text-xs outline-none focus:border-kc-rose-gold"
              />
            </div>
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-kc-mocha">
                  S/.
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tier.precio}
                  onChange={(e) => updateTier(idx, "precio", e.target.value)}
                  placeholder="Precio (ej: 15.00)"
                  className="w-full rounded-lg border border-kc-sand bg-white py-1.5 pl-9 pr-2 text-xs outline-none focus:border-kc-rose-gold"
                />
              </div>
            </div>
            {tiers.length > 1 && (
              <button
                type="button"
                onClick={() => removeTier(idx)}
                className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-kc-charcoal px-3 py-1.5 text-xs font-medium text-kc-cream transition hover:bg-kc-deep disabled:opacity-50"
        >
          <Save className="h-3 w-3" />
          {saving ? "Guardando..." : "Guardar precios"}
        </button>
        {saved && (
          <span className="text-xs text-emerald-600">
            ✓ Precios guardados
          </span>
        )}
      </div>
    </div>
  );
}
