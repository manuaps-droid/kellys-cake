"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import {
  buscarIngredientesAction,
  crearIngredienteRapidoAction,
  type IngredienteOpcionAutocomplete,
} from "../actions/ingrediente-actions";

type Props = {
  value: string;
  nombreSeleccionado?: string;
  onSelect: (ingrediente: IngredienteOpcionAutocomplete) => void;
  placeholder?: string;
};

const CLASE_INPUT =
  "mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";

export default function IngredienteAutocomplete({
  value,
  nombreSeleccionado,
  onSelect,
  placeholder = "Escribe para buscar (ej: harina)…",
}: Props) {
  const [texto, setTexto] = useState(nombreSeleccionado ?? "");
  const [sugerencias, setSugerencias] = useState<
    IngredienteOpcionAutocomplete[]
  >([]);
  const [buscando, setBuscando] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [formNuevoAbierto, setFormNuevoAbierto] = useState(false);
  const [creando, setCreando] = useState(false);

  const [nuevo, setNuevo] = useState({
    unidad_compra: "kg",
    costo_unitario: "",
    factor_conversion: "1000",
    unidad_uso: "g",
    porcentaje_merma_estandar: "0",
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincronizar el texto visible cuando cambia el ingrediente seleccionado
  const ultimaSeleccionRef = useRef<string>("");

  useEffect(() => {
    if (nombreSeleccionado && ultimaSeleccionRef.current !== value) {
      ultimaSeleccionRef.current = value;
      setTexto(nombreSeleccionado);
    }
  }, [value, nombreSeleccionado]);

  const buscar = useCallback(async (consulta: string) => {
    setBuscando(true);
    try {
      const res = await buscarIngredientesAction(consulta);
      setSugerencias(res.ingredientes);
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const consulta = texto.trim();

    debounceRef.current = setTimeout(() => {
      if (consulta.length < 1) {
        setSugerencias([]);
        return;
      }
      void buscar(consulta);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [texto, buscar]);

  function seleccionar(ing: IngredienteOpcionAutocomplete) {
    setTexto(ing.nombre);
    setDropdownAbierto(false);
    setFormNuevoAbierto(false);
    onSelect(ing);
  }

  async function crearNuevo() {
    const nombreLimpio = texto.trim();

    if (nombreLimpio.length < 2) {
      toast.error("Escribe el nombre del ingrediente (mín. 2 letras).");
      return;
    }

    setCreando(true);

    try {
      const res = await crearIngredienteRapidoAction({
        nombre: nombreLimpio,
        unidad_compra: nuevo.unidad_compra || "kg",
        unidad_uso: nuevo.unidad_uso || "g",
        factor_conversion: Number(nuevo.factor_conversion) || 1,
        costo_unitario: Number(nuevo.costo_unitario) || 0,
        porcentaje_rendimiento: 100,
        porcentaje_merma_estandar: Number(nuevo.porcentaje_merma_estandar) || 0,
      });

      if (!res.success || !res.ingrediente) {
        toast.error(res.error ?? "No se pudo registrar el ingrediente.");
        return;
      }

      toast.success(`"${nombreLimpio}" registrado en tu base de ingredientes.`);
      seleccionar(res.ingrediente);
    } finally {
      setCreando(false);
    }
  }

  const coincideExacto = sugerencias.some(
    (s) => s.nombre.toLowerCase() === texto.trim().toLowerCase()
  );

  return (
    <div className="relative">
      <input
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setDropdownAbierto(true);
          setFormNuevoAbierto(false);
        }}
        onFocus={() => {
          setDropdownAbierto(true);
          if (sugerencias.length === 0 && texto.trim().length >= 1) {
            void buscar(texto.trim());
          }
        }}
        placeholder={placeholder}
        className={CLASE_INPUT}
        autoComplete="off"
      />

      {dropdownAbierto && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setDropdownAbierto(false)}
          />
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {buscando && (
              <p className="flex items-center gap-2 p-3 text-xs text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando…
              </p>
            )}

            {!buscando && sugerencias.length === 0 && (
              <p className="p-3 text-xs text-gray-400">
                Sin coincidencias todavía.
              </p>
            )}

            {sugerencias.map((ing) => (
              <button
                key={ing.id}
                type="button"
                onClick={() => seleccionar(ing)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-blue-50"
              >
                <span className="font-medium text-gray-800">{ing.nombre}</span>
                <span className="text-[11px] text-gray-500">
                  S/ {ing.costo_por_unidad_uso.toFixed(4)}/{ing.unidad_uso}
                </span>
              </button>
            ))}

            {!buscando && texto.trim().length >= 2 && !coincideExacto && (
              <button
                type="button"
                onClick={() => {
                  setFormNuevoAbierto(true);
                  setDropdownAbierto(false);
                }}
                className="w-full border-t border-gray-100 bg-emerald-50 px-3 py-2.5 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                + Registrar «{texto.trim()}» como ingrediente nuevo
              </button>
            )}
          </div>
        </>
      )}

      {formNuevoAbierto && (
        <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="mb-2 text-xs font-bold text-emerald-800">
            Registrar «{texto.trim()}» en tu base de ingredientes
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500">
                Unidad de compra
              </label>
              <input
                value={nuevo.unidad_compra}
                onChange={(e) =>
                  setNuevo({ ...nuevo, unidad_compra: e.target.value })
                }
                placeholder="kg, litro, unidad…"
                className={CLASE_INPUT}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500">
                Costo por unidad de compra (S/)
              </label>
              <input
                type="number"
                step="any"
                value={nuevo.costo_unitario}
                onChange={(e) =>
                  setNuevo({ ...nuevo, costo_unitario: e.target.value })
                }
                placeholder="Ej: 4.50"
                className={CLASE_INPUT}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500">
                Factor de conversión
              </label>
              <input
                type="number"
                step="any"
                value={nuevo.factor_conversion}
                onChange={(e) =>
                  setNuevo({ ...nuevo, factor_conversion: e.target.value })
                }
                title="Cuántas unidades de uso salen de 1 unidad de compra (kg → g: 1000)"
                className={CLASE_INPUT}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500">
                Unidad de uso
              </label>
              <input
                value={nuevo.unidad_uso}
                onChange={(e) =>
                  setNuevo({ ...nuevo, unidad_uso: e.target.value })
                }
                placeholder="g, ml, unidad…"
                className={CLASE_INPUT}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500">
                Merma estándar %
              </label>
              <input
                type="number"
                step="any"
                value={nuevo.porcentaje_merma_estandar}
                onChange={(e) =>
                  setNuevo({
                    ...nuevo,
                    porcentaje_merma_estandar: e.target.value,
                  })
                }
                className={CLASE_INPUT}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => void crearNuevo()}
                disabled={creando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {creando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Registrar y usar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
