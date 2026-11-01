"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { crearMaquinaVending } from "@/features/vending/actions/vending-actions";

type Props = {
  onCrear?: (data: {
    nombre: string;
    ubicacion: string;
    tipo_ubicacion: string;
    formato: string;
    capacidad_slots: number;
  }) => Promise<unknown>;
};

export default function NuevaMaquinaForm({ onCrear }: Props) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState("");
  const [nuevaCapacidad, setNuevaCapacidad] = useState("10");
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  const agregarMaquina = async () => {
    if (!nuevoNombre.trim() || !nuevaUbicacion.trim()) return;
    setGuardando(true);
    try {
      const data = {
        nombre: nuevoNombre.trim(),
        ubicacion: nuevaUbicacion.trim(),
        tipo_ubicacion: "otro",
        formato: "pantalla_tactil",
        capacidad_slots: Number(nuevaCapacidad) || 10,
      };

      const res = onCrear
        ? await onCrear(data)
        : await crearMaquinaVending(data);

      const resultado = res as { success?: boolean; error?: string };
      if (resultado && resultado.success === false) {
        toast.error(resultado.error || "No se pudo registrar la máquina.");
        return;
      }

      toast.success(`Máquina "${data.nombre}" registrada.`);
      setNuevoNombre("");
      setNuevaUbicacion("");
      setNuevaCapacidad("10");
      router.refresh();
    } catch {
      toast.error("Error inesperado al registrar la máquina.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-kc-blush/40 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-kc-mocha">
        Registrar nueva máquina expendedora
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-kc-mocha">
            Nombre
          </label>
          <input
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Ej: Vending Clínica San Pablo"
            className="w-full rounded-lg border border-kc-blush/60 bg-white px-3 py-2 text-sm text-kc-charcoal"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-kc-mocha">
            Ubicación
          </label>
          <input
            type="text"
            value={nuevaUbicacion}
            onChange={(e) => setNuevaUbicacion(e.target.value)}
            placeholder="Ej: Av. Ejército 810, Cayma"
            className="w-full rounded-lg border border-kc-blush/60 bg-white px-3 py-2 text-sm text-kc-charcoal"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-kc-mocha">
            Capacidad (slots)
          </label>
          <input
            type="number"
            min={0}
            value={nuevaCapacidad}
            onChange={(e) => setNuevaCapacidad(e.target.value)}
            className="w-full rounded-lg border border-kc-blush/60 bg-white px-3 py-2 text-sm text-kc-charcoal"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={agregarMaquina}
        disabled={guardando || !nuevoNombre.trim() || !nuevaUbicacion.trim()}
        className="mt-4 rounded-xl border border-kc-gold/30 bg-kc-charcoal px-5 py-2.5 text-sm font-bold text-kc-cream shadow-md transition hover:bg-kc-deep disabled:opacity-50"
      >
        🤖 {guardando ? "Guardando..." : "Registrar máquina"}
      </button>
    </div>
  );
}
