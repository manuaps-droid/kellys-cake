"use client";

import ProductCatalogItem from "./ProductCatalogItem";

export type CatalogOption = {
  id: string;
  nombre: string;
  descripcion: string | null;
  seleccionado: boolean;
  obligatorio: boolean;
  precio_extra: number;
};

type Props = {
  title: string;
  items: CatalogOption[];
  onChange(items: CatalogOption[]): void;
};

export default function ProductCatalogGroup({
  title,
  items,
  onChange,
}: Props) {
  function updateItem(
    index: number,
    changes: Partial<CatalogOption>
  ) {
    const next = [...items];
    next[index] = {
      ...next[index],
      ...changes,
    };
    onChange(next);
  }

  const selectedCount = items.filter(
    (i) => i.seleccionado
  ).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-kc-sand/50 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-kc-sand/50 bg-kc-cream/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-kc-charcoal">
            {title}
          </h4>
          <span className="rounded-full bg-kc-sand px-2.5 py-0.5 text-xs font-medium text-kc-mocha">
            {selectedCount}/{items.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-kc-sand/30">
        {items.map((item, index) => (
          <ProductCatalogItem
            key={item.id}
            nombre={item.nombre}
            descripcion={item.descripcion}
            seleccionado={item.seleccionado}
            obligatorio={item.obligatorio}
            precio_extra={item.precio_extra}
            onSelectedChange={(value) =>
              updateItem(index, {
                seleccionado: value,
              })
            }
            onObligatorioChange={(value) =>
              updateItem(index, {
                obligatorio: value,
              })
            }
            onPrecioChange={(value) =>
              updateItem(index, {
                precio_extra: value,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
