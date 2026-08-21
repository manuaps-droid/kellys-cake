"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createCatalogAction } from "../actions/create-catalog.action";
import { createBulkCatalogAction } from "../actions/create-bulk-catalog.action";
import { updateCatalogAction } from "../actions/update-catalog.action";

import type { AdminCatalog } from "../types/catalog.type";

type Props = {
  catalog?: AdminCatalog;
  defaultTipo?: string;
};

const TIPOS_SUGERIDOS = [
  "categoria_producto",
  "celebration",
  "flavor",
  "filling",
  "frosting",
  "decoration",
  "size",
  "extra",
  "coffee_break",
];

export default function CatalogForm({
  catalog,
  defaultTipo,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [tipo, setTipo] = useState(
    catalog?.tipo ?? defaultTipo ?? ""
  );
  const [nombre, setNombre] = useState(
    catalog?.nombre ?? ""
  );
  const [descripcion, setDescripcion] = useState(
    catalog?.descripcion ?? ""
  );
  const [orden, setOrden] = useState(
    catalog?.orden ?? 1
  );
  const [activo, setActivo] = useState(
    catalog?.activo ?? true
  );
  const [mostrarEnProductos, setMostrarEnProductos] = useState(
    (catalog as unknown as Record<string, unknown>)?.mostrar_en_productos as boolean ?? false
  );
  const [mostrarEnCategorias, setMostrarEnCategorias] = useState(
    (catalog as unknown as Record<string, unknown>)?.mostrar_en_categorias as boolean ?? false
  );
  const [precio, setPrecio] = useState<string>(() => {
    const raw = (catalog as unknown as Record<string, unknown>)?.precio;
    if (raw === null || raw === undefined) return "";
    return String(raw);
  });

  const [customTipo, setCustomTipo] = useState(
    !TIPOS_SUGERIDOS.includes(
      catalog?.tipo ?? defaultTipo ?? ""
    )
  );

  const isEditing = !!catalog;

  const [bulkItems, setBulkItems] = useState<
    { nombre: string; descripcion: string }[]
  >([{ nombre: "", descripcion: "" }]);

  function addBulkItem() {
    setBulkItems((prev) => [
      ...prev,
      { nombre: "", descripcion: "" },
    ]);
  }

  function removeBulkItem(index: number) {
    setBulkItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function updateBulkItem(
    index: number,
    field: "nombre" | "descripcion",
    value: string
  ) {
    setBulkItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);

    if (!tipo.trim()) {
      alert("Selecciona o escribe un tipo de catálogo.");
      setLoading(false);
      return;
    }

    let result;

    if (isEditing) {
      result = await updateCatalogAction(catalog.id, {
        tipo,
        nombre,
        descripcion,
        orden,
        activo,
        mostrar_en_productos: mostrarEnProductos,
        mostrar_en_categorias: mostrarEnCategorias,
        precio: tipo === "coffee_break" && precio ? parseFloat(precio) : null,
      });
    } else {
      const validItems = bulkItems
        .filter((item) => item.nombre.trim())
        .map((item) => ({
          nombre: item.nombre.trim(),
          descripcion: item.descripcion.trim() || undefined,
        }));

      if (validItems.length === 0) {
        alert("Agrega al menos un elemento.");
        setLoading(false);
        return;
      }

      if (validItems.length === 1) {
        result = await createCatalogAction({
          tipo,
          nombre: validItems[0].nombre,
          descripcion: validItems[0].descripcion ?? "",
          orden,
          activo,
        });
      } else {
        result = await createBulkCatalogAction({
          tipo,
          activo,
          items: validItems,
        });
      }
    }

    setLoading(false);

    if (!result.success) {
      alert(result.message);
      return;
    }

    router.push("/admin/catalogos");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-kc-charcoal">
          Tipo de catálogo
        </label>

        {!customTipo ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {TIPOS_SUGERIDOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    tipo === t
                      ? "border-kc-rose-gold bg-kc-rose-gold text-white"
                      : "border-kc-sand text-kc-mocha hover:border-kc-rose-gold hover:text-kc-rose-gold"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCustomTipo(true)}
              className="text-sm text-kc-rose-gold hover:underline"
            >
              + Crear tipo personalizado
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value)
              }
              placeholder="Ej: decoration, size, extra..."
              className="w-full rounded-xl border border-kc-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
              required
            />
            <button
              type="button"
              onClick={() => {
                setCustomTipo(false);
                if (
                  TIPOS_SUGERIDOS.includes(tipo)
                ) {
                  /* keep it */
                } else {
                  setTipo("");
                }
              }}
              className="text-sm text-kc-mocha hover:underline"
            >
              ← Volver a tipos predefinidos
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-kc-charcoal">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Ej: Cumpleaños, Chocolate, Fondant..."
              className="w-full rounded-xl border border-kc-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-kc-charcoal">
              Descripción
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
              placeholder="Descripción opcional..."
              className="w-full rounded-xl border border-kc-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-kc-charcoal">
                Orden
              </label>
              <input
                type="number"
                min={0}
                value={orden}
                onChange={(e) =>
                  setOrden(Number(e.target.value))
                }
                className="w-full rounded-xl border border-kc-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-kc-charcoal">
                Estado
              </label>
              <button
                type="button"
                onClick={() => setActivo(!activo)}
                className={`flex h-[46px] w-full items-center gap-3 rounded-xl border px-4 text-sm font-medium transition ${
                  activo
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-kc-sand bg-gray-50 text-kc-mocha"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                    activo
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {activo && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                {activo ? "Activo" : "Inactivo"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={mostrarEnProductos}
                onChange={(e) => setMostrarEnProductos(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-kc-rose-gold focus:ring-kc-rose-gold"
              />
              <span className="text-sm font-medium text-kc-charcoal">
                Mostrar en Productos
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={mostrarEnCategorias}
                onChange={(e) => setMostrarEnCategorias(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-kc-rose-gold focus:ring-kc-rose-gold"
              />
              <span className="text-sm font-medium text-kc-charcoal">
                Mostrar en Categorías
              </span>
            </label>
          </div>

          {tipo === "coffee_break" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-kc-charcoal">
                Precio (S/)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej: 25.00"
                className="w-full rounded-xl border border-kc-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
              />
              <p className="mt-1 text-xs text-kc-mocha">
                Precio unitario en soles. Solo para items de Coffee Break.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="rounded-xl border border-kc-sand bg-kc-cream/30 p-4">
            <p className="mb-1 text-sm font-medium text-kc-charcoal">
              Agrega uno o varios elementos de <span className="font-semibold text-kc-rose-gold">{tipo || "este tipo"}</span>
            </p>
            <p className="text-xs text-kc-mocha">
              Cada nombre se creará como un elemento independiente.
            </p>
          </div>

          <div className="space-y-3">
            {bulkItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3"
              >
                <div className="flex-1 space-y-2">
                  <input
                    value={item.nombre}
                    onChange={(e) =>
                      updateBulkItem(
                        index,
                        "nombre",
                        e.target.value
                      )
                    }
                    placeholder="Nombre (ej: Chocolate, Vainilla...)"
                    className="w-full rounded-xl border border-kc-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
                  />
                  <input
                    value={item.descripcion}
                    onChange={(e) =>
                      updateBulkItem(
                        index,
                        "descripcion",
                        e.target.value
                      )
                    }
                    placeholder="Descripción (opcional)"
                    className="w-full rounded-xl border border-kc-sand bg-white px-4 py-3 text-xs text-kc-mocha outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
                  />
                </div>

                {bulkItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeBulkItem(index)
                    }
                    className="mt-2 rounded-lg p-2 text-kc-mocha transition hover:bg-red-50 hover:text-red-500"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addBulkItem}
            className="flex items-center gap-2 text-sm font-medium text-kc-rose-gold transition hover:text-kc-charcoal"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar otro elemento
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium text-kc-charcoal">
                Estado
              </label>
              <button
                type="button"
                onClick={() => setActivo(!activo)}
                className={`flex h-[46px] w-full items-center gap-3 rounded-xl border px-4 text-sm font-medium transition ${
                  activo
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-kc-sand bg-gray-50 text-kc-mocha"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                    activo
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {activo && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                {activo ? "Activo" : "Inactivo"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-kc-charcoal px-6 py-3 text-sm font-medium text-kc-cream transition hover:bg-kc-deep disabled:opacity-50"
        >
          {loading
            ? "Guardando..."
            : isEditing
            ? "Actualizar"
            : bulkItems.filter((i) => i.nombre.trim()).length > 1
            ? `Crear ${bulkItems.filter((i) => i.nombre.trim()).length} elementos`
            : "Crear catálogo"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/admin/catalogos")
          }
          className="rounded-xl border border-kc-sand px-6 py-3 text-sm font-medium text-kc-mocha transition hover:bg-kc-sand/50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
