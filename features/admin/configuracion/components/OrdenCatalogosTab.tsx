"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Gift,
  GripVertical,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { saveCatalogosOrderAction } from "@/features/catalogs/actions/save-catalogos-order.action";
import {
  getConfigAction,
  updateConfigAction,
} from "@/features/admin/configuracion/actions/config.action";
import type { MarketingConfig } from "@/features/admin/configuracion/validations/config.schema";

export type CatalogoOrdenItem = {
  id: string;
  nombre: string;
  tipo: string;
  orden: number;
  activo: boolean | null;
  mostrar_en_productos: boolean | null;
};

/** Ítem sintético que representa el cuadro destacado "Arma tu caja". */
const ITEM_CAJA: CatalogoOrdenItem = {
  id: "__arma_tu_caja__",
  nombre: "Arma tu caja",
  tipo: "__especial__",
  orden: -1,
  activo: true,
  mostrar_en_productos: true,
};

const ES_ESPECIAL = (c: CatalogoOrdenItem) => c.tipo === "__especial__";

/**
 * Definición de los menús públicos donde se listan catálogos.
 * Para agregar un nuevo menú, añade una entrada aquí con su filtro.
 */
const MENUS: {
  key: string;
  label: string;
  href: string;
  descripcion: string;
  /** Id del ítem especial a insertar en este menú (si aplica). */
  itemEspecial?: CatalogoOrdenItem;
  pertenece: (c: CatalogoOrdenItem) => boolean;
}[] = [
  {
    key: "tienda_online",
    label: "Menú Tienda Online",
    href: "/productos",
    descripcion:
      "Cuadros que se muestran en /productos, incluido el destacado de 'Arma tu caja'.",
    itemEspecial: ITEM_CAJA,
    pertenece: (c) =>
      c.activo === true &&
      c.mostrar_en_productos === true &&
      ["categoria_producto", "coffee_break"].includes(c.tipo),
  },
];

type Props = {
  catalogos: CatalogoOrdenItem[];
  posicionArmaCaja: number | null;
  marketingConfig: Partial<MarketingConfig>;
};

type Cambio = { id: string; orden: number };

function ListaOrdenable({
  itemsIniciales,
  onGuardar,
}: {
  itemsIniciales: CatalogoOrdenItem[];
  onGuardar: (
    cambios: Cambio[],
    posicionCaja: number | null,
    aplicarLocal: (aplicar: (ordenOriginal: Map<string, number>) => void) => void
  ) => Promise<void>;
}) {
  const [items, setItems] = useState(itemsIniciales);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const ordenOriginal = useRef(
    new Map(
      itemsIniciales
        .filter((c) => !ES_ESPECIAL(c))
        .map((c) => [c.id, c.orden])
    )
  );

  function mover(desde: number, hasta: number) {
    if (hasta < 0 || hasta >= items.length || desde === hasta) return;
    setItems((prev) => {
      const copia = [...prev];
      const [item] = copia.splice(desde, 1);
      copia.splice(hasta, 0, item);
      return copia;
    });
  }

  function soltar(hasta: number) {
    if (dragIndex !== null) {
      mover(dragIndex, hasta);
      setDragIndex(null);
      setOverIndex(null);
    }
  }

  function guardar() {
    const idxCaja = items.findIndex(ES_ESPECIAL);
    const soloCatalogos = items.filter((c) => !ES_ESPECIAL(c));

    const cambios = soloCatalogos
      .map((item, index) => ({
        id: item.id,
        orden: index + 1,
        original: ordenOriginal.current.get(item.id),
      }))
      .filter((c) => c.orden !== c.original)
      .map(({ id, orden }) => ({ id, orden }));

    const posicionCaja = idxCaja >= 0 ? idxCaja : null;

    if (cambios.length === 0 && posicionCaja === null) {
      toast.info("El orden no ha cambiado.");
      return;
    }

    startTransition(async () => {
      await onGuardar(cambios, posicionCaja, (aplicar) =>
        aplicar(ordenOriginal.current)
      );
    });
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map((item, index) => {
          const especial = ES_ESPECIAL(item);
          return (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(index);
              }}
              onDragLeave={() =>
                setOverIndex((prev) => (prev === index ? null : prev))
              }
              onDrop={() => soltar(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`flex cursor-grab items-center gap-3 rounded-xl border px-4 py-3 transition-all active:cursor-grabbing ${
                dragIndex === index
                  ? "opacity-40"
                  : overIndex === index && dragIndex !== null
                    ? "border-cake-gold ring-2 ring-cake-gold/30"
                    : especial
                      ? "border-purple-300 bg-purple-50/60 hover:border-purple-400"
                      : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-400" />

              <span className="w-8 flex-shrink-0 text-center font-mono text-sm font-bold text-gray-400">
                {index + 1}
              </span>

              {especial && (
                <Gift className="h-4 w-4 flex-shrink-0 text-purple-600" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {item.nombre}
                  {especial && (
                    <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                      Cuadro destacado
                    </span>
                  )}
                </p>
                {!especial && (
                  <div className="mt-0.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {item.tipo}
                    </span>
                    {!item.activo && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                        <EyeOff className="h-3 w-3" /> Inactivo
                      </span>
                    )}
                    {item.mostrar_en_productos === false && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        Oculto en tienda
                      </span>
                    )}
                    {item.activo && item.mostrar_en_productos !== false && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                        <Eye className="h-3 w-3" /> Visible
                      </span>
                    )}
                  </div>
                )}
                {especial && (
                  <p className="mt-0.5 text-[10px] text-gray-500">
                    Su posición se guarda en Configuración → Marketing.
                  </p>
                )}
              </div>

              <div className="flex flex-shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label={`Subir ${item.nombre}`}
                  disabled={index === 0}
                  onClick={() => mover(index, index - 1)}
                  className="rounded-md border border-gray-200 p-1 text-gray-500 transition hover:border-cake-gold hover:text-cake-gold disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Bajar ${item.nombre}`}
                  disabled={index === items.length - 1}
                  onClick={() => mover(index, index + 1)}
                  className="rounded-md border border-gray-200 p-1 text-gray-500 transition hover:border-cake-gold hover:text-cake-gold disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        onClick={guardar}
        disabled={pending}
        className="mt-5 rounded-full px-8"
      >
        {pending ? (
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 inline h-4 w-4" />
        )}
        Guardar orden
      </Button>
    </>
  );
}

export default function OrdenCatalogosTab({
  catalogos,
  posicionArmaCaja,
  marketingConfig,
}: Props) {
  const router = useRouter();
  const [, startTransitionGlobal] = useTransition();

  const grupos = MENUS.map((menu) => {
    const base = catalogos
      .filter((c) => menu.pertenece(c))
      .sort((a, b) => a.orden - b.orden);

    // Insertar el ítem especial (si el menú tiene) en su posición guardada
    let items = base;
    if (menu.itemEspecial) {
      const pos = Math.min(
        Math.max(posicionArmaCaja ?? 0, 0),
        base.length
      );
      items = [...base];
      items.splice(pos, 0, menu.itemEspecial);
    }

    return { menu, items };
  });

  const totalPublicados = MENUS.reduce(
    (acc, menu) =>
      acc + catalogos.filter((c) => menu.pertenece(c)).length,
    0
  );

  async function guardarCambios(
    cambios: Cambio[],
    posicionCaja: number | null,
    aplicarLocal: (aplicar: (ordenOriginal: Map<string, number>) => void) => void
  ) {
    let ok = true;

    if (cambios.length > 0) {
      const result = await saveCatalogosOrderAction(cambios);
      if (!result.success) {
        toast.error(result.message ?? "No se pudo guardar el orden.");
        ok = false;
      }
    }

    if (
      ok &&
      posicionCaja !== null &&
      posicionCaja !== (posicionArmaCaja ?? 0)
    ) {
      // Leer la config de marketing fresca del servidor para no
      // pisar otros valores si el prop llegara incompleto.
      const actual = await getConfigAction("marketing");
      const base = (actual.success
        ? ((actual.data as Record<string, unknown>)?.marketing ?? {})
        : marketingConfig) as Partial<MarketingConfig>;

      const result = await updateConfigAction("marketing", {
        ...base,
        posicion_arma_caja: posicionCaja,
      });
      if (!result.success) {
        toast.error(result.message ?? "No se pudo guardar la posición.");
        ok = false;
      }
    }

    if (!ok) return;

    aplicarLocal((ordenOriginal) => {
      for (const cambio of cambios) {
        ordenOriginal.set(cambio.id, cambio.orden);
      }
    });
    toast.success("Orden actualizado.");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-gray-500">
        Define el orden de los cuadros dentro de cada menú público — incluido
        el cuadro destacado de &quot;Arma tu caja&quot;, que puedes colocar en
        cualquier posición. Arrastra o usa las flechas y guarda.
      </p>

      {grupos.map(({ menu, items }) => (
        <section
          key={menu.key}
          className="rounded-2xl border border-gray-200 p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-gray-900">
                {menu.label}{" "}
                <span className="text-sm font-normal text-gray-400">
                  ({items.length})
                </span>
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">{menu.descripcion}</p>
            </div>
            <Link
              href={menu.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Ver página ↗
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
              Ningún catálogo está marcado para aparecer en este menú todavía.
            </p>
          ) : (
            <ListaOrdenable
              key={items.map((i) => `${i.id}:${i.orden}`).join("|")}
              itemsIniciales={items}
              onGuardar={guardarCambios}
            />
          )}
        </section>
      ))}

      {catalogos.length > totalPublicados && (
        <p className="text-xs text-gray-400">
          {catalogos.length - totalPublicados} catálogos internos (tipos como
          flavor, filling, frosting, celebration…) no se muestran en los menús
          públicos y no requieren orden.
        </p>
      )}
    </div>
  );
}
