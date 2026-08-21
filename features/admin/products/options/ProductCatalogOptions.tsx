"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getProductCatalogOptionsAction } from "../actions/get-product-catalog-options.action";
import { saveProductCatalogOptionsAction } from "../actions/save-product-catalog-options.action";

import ProductCatalogGroup, {
  type CatalogOption,
} from "./ProductCatalogGroup";

type Group = {
  tipo: string;
  label: string;
  items: CatalogOption[];
};

type RawOption = {
  id: string;
  tipo: string;
  nombre: string;
  descripcion: string | null;
  seleccionado: boolean;
  obligatorio: boolean;
  precio_extra: number;
};

const TIPO_LABELS: Record<string, string> = {
  celebration: "Celebraciones",
  flavor: "Sabores",
  filling: "Rellenos",
  frosting: "Coberturas",
  decoration: "Decoraciones",
  size: "Tamaños",
  extra: "Extras",
};

type Props = {
  productId: string;
};

export default function ProductCatalogOptions({
  productId,
}: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const data =
        await getProductCatalogOptionsAction(
          productId
        );

      const map = new Map<string, CatalogOption[]>();

      (data as RawOption[]).forEach((item) => {
        if (!map.has(item.tipo)) {
          map.set(item.tipo, []);
        }

        map.get(item.tipo)!.push({
          id: item.id,
          nombre: item.nombre,
          descripcion: item.descripcion,
          seleccionado: item.seleccionado,
          obligatorio: item.obligatorio,
          precio_extra: item.precio_extra,
        });
      });

      setGroups(
        Array.from(map.entries()).map(
          ([tipo, items]) => ({
            tipo,
            label:
              TIPO_LABELS[tipo] ??
              tipo.charAt(0).toUpperCase() +
                tipo.slice(1),
            items,
          })
        )
      );

      setLoading(false);
    }

    load();
  }, [productId]);

  async function save() {
    setSaving(true);

    const selected = groups
      .flatMap((g) => g.items)
      .filter((i) => i.seleccionado)
      .map((i) => ({
        catalogo_id: i.id,
        obligatorio: i.obligatorio,
        precio_extra: i.precio_extra,
      }));

    const result =
      await saveProductCatalogOptionsAction(
        productId,
        selected
      );

    setSaving(false);

    if (result.success) {
      toast.success("Opciones guardadas.");
    } else {
      toast.error(
        result.message ?? "Error al guardar."
      );
    }
  }

  const totalSelected = groups
    .flatMap((g) => g.items)
    .filter((i) => i.seleccionado).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-kc-sand/50 bg-kc-cream/30 p-12">
        <div className="text-sm text-kc-mocha">
          Cargando catálogos...
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-kc-sand/50 bg-kc-cream/30 p-12 text-center">
        <p className="text-kc-mocha">
          No hay catálogos creados. Ve a{" "}
          <Link
            href="/admin/catalogos"
            className="text-kc-rose-gold hover:underline"
          >
            Catálogos
          </Link>{" "}
          para crear opciones de personalización.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-kc-sand/50 bg-kc-cream/50 px-5 py-3">
        <span className="text-sm text-kc-mocha">
          {totalSelected} opción(es) seleccionada(s)
        </span>
      </div>

      {groups.map((group, index) => (
        <ProductCatalogGroup
          key={group.tipo}
          title={group.label}
          items={group.items}
          onChange={(items) => {
            const next = [...groups];
            next[index] = {
              ...group,
              items,
            };
            setGroups(next);
          }}
        />
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-kc-charcoal px-6 py-3 text-sm font-medium text-kc-cream transition hover:bg-kc-deep disabled:opacity-50"
        >
          {saving
            ? "Guardando..."
            : "Guardar opciones"}
        </button>
      </div>
    </div>
  );
}
