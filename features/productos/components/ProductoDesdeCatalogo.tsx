"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, PackagePlus } from "lucide-react";

import type { ProductoTiendaItem } from "../queries/get-productos-tienda";
import { crearProductoConReceta } from "../actions/producto-actions";
import {
  buscarIngredientesAction,
  crearIngredienteRapidoAction,
  type IngredienteOpcionAutocomplete,
} from "@/features/ingredientes/actions/ingrediente-actions";

type Fila = {
  uid: string;
  ingrediente: IngredienteOpcionAutocomplete | null;
  cantidad: string;
  mermaExtra: string;
};

let contadorFilas = 0;

function nuevaFila(): Fila {
  contadorFilas += 1;
  return {
    uid: `f${contadorFilas}`,
    ingrediente: null,
    cantidad: "",
    mermaExtra: "0",
  };
}

const CLASE_INPUT =
  "mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";

function FilaIngrediente({
  fila,
  onChange,
  onRemove,
}: {
  fila: Fila;
  onChange: (fila: Fila) => void;
  onRemove: () => void;
}) {
  const [texto, setTexto] = useState(fila.ingrediente?.nombre ?? "");
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
    if (fila.ingrediente && texto === fila.ingrediente.nombre) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const consulta = texto.trim();

    debounceRef.current = setTimeout(() => {
      if (consulta.length < 1) {
        setSugerencias([]);
        return;
      }

      void buscar(consulta);
    }, 300);
  }, [texto, fila.ingrediente, buscar]);

  function seleccionar(
    ing: IngredienteOpcionAutocomplete
  ) {
    setTexto(ing.nombre);
    setDropdownAbierto(false);
    setFormNuevoAbierto(false);
    onChange({ ...fila, ingrediente: ing });
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
        porcentaje_merma_estandar:
          Number(nuevo.porcentaje_merma_estandar) || 0,
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
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <label className="block text-[10px] font-bold uppercase text-gray-500">
            Ingrediente
          </label>
          <input
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              if (fila.ingrediente) {
                onChange({ ...fila, ingrediente: null });
              }
              setDropdownAbierto(true);
              setFormNuevoAbierto(false);
            }}
            onFocus={() => {
              setDropdownAbierto(true);
              if (sugerencias.length === 0 && texto.trim().length >= 1) {
                void buscar(texto.trim());
              }
            }}
            placeholder="Escribe para buscar (ej: harina)…"
            className={CLASE_INPUT}
            autoComplete="off"
          />

          {fila.ingrediente && (
            <span className="absolute right-2 top-7 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              S/ {fila.ingrediente.costo_por_unidad_uso.toFixed(4)} /
              {fila.ingrediente.unidad_uso}
            </span>
          )}

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
                    <span className="font-medium text-gray-800">
                      {ing.nombre}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      S/ {ing.costo_por_unidad_uso.toFixed(4)}/{ing.unidad_uso}
                    </span>
                  </button>
                ))}

                {!buscando &&
                  texto.trim().length >= 2 &&
                  !coincideExacto && (
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
        </div>

        <div className="w-24">
          <label className="block text-[10px] font-bold uppercase text-gray-500">
            Cantidad
          </label>
          <input
            type="number"
            step="any"
            value={fila.cantidad}
            onChange={(e) => onChange({ ...fila, cantidad: e.target.value })}
            placeholder="0"
            className={CLASE_INPUT}
          />
        </div>

        <div className="w-20">
          <label className="block text-[10px] font-bold uppercase text-gray-500">
            Unidad
          </label>
          <input
            readOnly
            value={fila.ingrediente?.unidad_uso ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 p-2 text-sm text-gray-500"
          />
        </div>

        <div className="w-20">
          <label className="block text-[10px] font-bold uppercase text-gray-500">
            Merma %
          </label>
          <input
            type="number"
            step="any"
            value={fila.mermaExtra}
            onChange={(e) => onChange({ ...fila, mermaExtra: e.target.value })}
            className={CLASE_INPUT}
            title="Merma extra específica para esta receta"
          />
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded p-2 text-red-500 hover:bg-red-50"
          aria-label="Quitar ingrediente"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {formNuevoAbierto && (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50/60 p-3">
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

export function ProductoDesdeCatalogo({
  productos,
}: {
  productos: ProductoTiendaItem[];
}) {
  const router = useRouter();

  const categorias = useMemo(() => {
    const unicas = [...new Set(productos.map((p) => p.categoria))];
    return ["Todos", ...unicas];
  }, [productos]);

  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  const [diseno, setDiseno] = useState<ProductoTiendaItem | null>(
    null
  );

  const [modoManual, setModoManual] = useState(false);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [rendimiento, setRendimiento] = useState("1");

  const [filas, setFilas] = useState<Fila[]>([nuevaFila()]);
  const [enviando, setEnviando] = useState(false);

  const productosVisibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productos.filter((p) => {
      if (categoriaActiva !== "Todos" && p.categoria !== categoriaActiva) {
        return false;
      }

      if (texto && !p.nombre.toLowerCase().includes(texto)) {
        return false;
      }

      return true;
    });
  }, [productos, categoriaActiva, busqueda]);

  const costoTotal = useMemo(() => {
    return filas.reduce((acc, f) => {
      if (!f.ingrediente) return acc;

      const cantidad = Number(f.cantidad) || 0;
      if (cantidad <= 0) return acc;

      const merma =
        (f.ingrediente.porcentaje_merma_estandar +
          (Number(f.mermaExtra) || 0)) /
        100;
      const factor = 1 - (merma >= 1 ? 0.99 : merma);

      return acc + (cantidad / factor) * f.ingrediente.costo_por_unidad_uso;
    }, 0);
  }, [filas]);

  const costoUnitario =
    costoTotal / Math.max(1, Number(rendimiento) || 1);

  const precioVenta = Number(precio) || 0;
  const margen = precioVenta > 0 ? precioVenta - costoUnitario : 0;
  const margenPct =
    precioVenta > 0 ? (margen / precioVenta) * 100 : 0;

  function elegirDiseno(item: ProductoTiendaItem) {
    setDiseno(item);
    setModoManual(false);
    setNombre(item.nombre || "");
    setPrecio(item.precio != null ? String(item.precio) : "");
  }

  async function handleSubmit() {
    const nombreLimpio = nombre.trim();

    if (nombreLimpio.length < 2) {
      toast.error("Ponle nombre al producto (mín. 2 letras).");
      return;
    }

    setEnviando(true);

    try {
      const items = filas
        .filter(
          (f) => f.ingrediente && Number(f.cantidad) > 0
        )
        .map((f) => ({
          ingrediente_id: f.ingrediente!.id,
          cantidad: Number(f.cantidad),
          unidad: f.ingrediente!.unidad_uso,
          merma_porcentaje: Number(f.mermaExtra) || 0,
        }));

      const conCantidadSinIngrediente = filas.some(
        (f) => !f.ingrediente && Number(f.cantidad) > 0
      );

      if (conCantidadSinIngrediente) {
        toast.error(
          "Hay una fila con cantidad pero sin ingrediente: selecciónalo o quítala."
        );
        return;
      }

      const res = await crearProductoConReceta({
        nombre: nombreLimpio,
        precio_venta: Number(precio) || 0,
        rendimiento: Number(rendimiento) || 1,
        items,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        items.length > 0
          ? "Producto creado con su receta. ¡Listo para vender!"
          : "Producto creado. Podrás asignarle la receta después."
      );

      router.push("/foodos/productos");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Paso 1: productos de la tienda */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              1 · Elige el producto de tu tienda
            </h2>
            <p className="text-xs text-gray-500">
              Todos los productos del menú Productos del admin. El que elijas
              será tu producto en FoodOS.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setModoManual(true);
              setDiseno(null);
              setNombre("");
              setPrecio("");
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Prefiero escribirlo manualmente
          </button>
        </div>

        {productos.length === 0 ? (
          <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-700">
            No hay productos en la tienda todavía. Puedes crear el producto
            manualmente.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoriaActiva(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    cat === categoriaActiva
                      ? "bg-slate-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto…"
              className="mb-3 w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {productosVisibles.length === 0 ? (
              <p className="text-sm text-gray-400">
                No hay productos con ese filtro.
              </p>
            ) : (
              <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                {productosVisibles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => elegirDiseno(item)}
                    className={`group relative overflow-hidden rounded-lg border-2 text-left transition ${
                      diseno?.id === item.id
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <div className="relative aspect-square bg-gray-100">
                      {item.url && (
                        <Image
                          src={item.url}
                          alt={item.nombre}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                        />
                      )}
                      {item.precio != null && (
                        <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          S/ {item.precio.toFixed(2)}
                        </span>
                      )}
                      {item.estado !== "publicado" && (
                        <span className="absolute left-1.5 top-1.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                          {item.estado}
                        </span>
                      )}
                    </div>
                    <p className="truncate px-2 py-1.5 text-xs font-medium text-gray-700">
                      {item.nombre}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Paso 2: datos del producto */}
      {(diseno || modoManual) && (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            2 · Datos del producto
          </h2>

          <div className="flex flex-wrap gap-5">
            {diseno && (
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={diseno.url}
                  alt={diseno.nombre}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid flex-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del producto
                </label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Torta de Chocolate de 15 porciones"
                  className={CLASE_INPUT}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio de venta (S/)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className={CLASE_INPUT}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rendimiento (porciones)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rendimiento}
                  onChange={(e) => setRendimiento(e.target.value)}
                  className={CLASE_INPUT}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md bg-blue-50 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase text-blue-600">
                      Costo unitario
                    </p>
                    <p className="text-lg font-black text-blue-900">
                      S/ {costoUnitario.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase text-emerald-600">
                      Margen
                    </p>
                    <p className="text-lg font-black text-emerald-900">
                      S/ {margen.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-100 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-600">
                      % Margen
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {margenPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Paso 3: receta */}
      {(diseno || modoManual) && (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                3 · Receta y costeo
              </h2>
              <p className="text-xs text-gray-500">
                Escribe cada ingrediente: si ya existe en tu base, se
                autocompleta; si no, lo registras aquí mismo con su precio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilas((prev) => [...prev, nuevaFila()])}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Añadir ingrediente
            </button>
          </div>

          <div className="space-y-3">
            {filas.map((fila) => (
              <FilaIngrediente
                key={fila.uid}
                fila={fila}
                onChange={(actualizada) =>
                  setFilas((prev) =>
                    prev.map((f) =>
                      f.uid === fila.uid ? actualizada : f
                    )
                  )
                }
                onRemove={() =>
                  setFilas((prev) =>
                    prev.filter((f) => f.uid !== fila.uid)
                  )
                }
              />
            ))}

            {filas.length === 0 && (
              <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
                Sin ingredientes todavía — agrega el primero con el botón azul.
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end border-t pt-4">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={enviando}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PackagePlus className="h-4 w-4" />
              )}
              {enviando
                ? "Guardando producto y receta…"
                : "Crear producto con su receta"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
