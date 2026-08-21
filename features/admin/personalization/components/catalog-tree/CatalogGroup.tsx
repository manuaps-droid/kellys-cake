import Link from "next/link";
import CatalogItem from "./CatalogItem";

import type { AdminCatalog } from "../../types/catalog.type";

type Props = {
  tipo: string;
  items: AdminCatalog[];
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

export default function CatalogGroup({
  tipo,
  items,
}: Props) {
  const label =
    TIPO_LABELS[tipo] ??
    tipo.charAt(0).toUpperCase() + tipo.slice(1);

  return (
    <section className="rounded-2xl border border-kc-sand/50 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-kc-charcoal">
            {label}
          </h3>
          <p className="text-sm text-kc-mocha">
            {items.length} elemento(s)
          </p>
        </div>

        <Link
          href={`/admin/catalogos/nuevo?tipo=${tipo}`}
          className="rounded-lg bg-kc-charcoal px-4 py-2 text-sm font-medium text-kc-cream transition hover:bg-kc-deep"
        >
          Agregar
        </Link>
      </div>

      <div className="space-y-2">
        {items
          .sort((a, b) => a.orden - b.orden)
          .map((item) => (
            <CatalogItem
              key={item.id}
              id={item.id}
              nombre={item.nombre}
              orden={item.orden}
              activo={item.activo}
            />
          ))}
      </div>
    </section>
  );
}
