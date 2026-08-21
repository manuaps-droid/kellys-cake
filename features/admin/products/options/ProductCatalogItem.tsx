"use client";

type Props = {
  nombre: string;
  descripcion?: string | null;
  seleccionado: boolean;
  obligatorio: boolean;
  precio_extra: number;
  onSelectedChange(value: boolean): void;
  onObligatorioChange(value: boolean): void;
  onPrecioChange(value: number): void;
};

export default function ProductCatalogItem({
  nombre,
  descripcion,
  seleccionado,
  obligatorio,
  precio_extra,
  onSelectedChange,
  onObligatorioChange,
  onPrecioChange,
}: Props) {
  return (
    <div className="flex items-center gap-6 px-6 py-4 transition hover:bg-kc-cream/30">
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            seleccionado
              ? "text-kc-charcoal"
              : "text-kc-mocha"
          }`}
        >
          {nombre}
        </p>
        {descripcion && (
          <p className="mt-0.5 text-xs text-kc-mocha/70">
            {descripcion}
          </p>
        )}
      </div>

      <div className="flex items-center gap-8">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={seleccionado}
            onChange={(e) =>
              onSelectedChange(e.target.checked)
            }
            className="h-4 w-4 rounded border-kc-sand text-kc-rose-gold focus:ring-kc-rose-gold/20"
          />
          <span className="text-xs text-kc-mocha">
            Disponible
          </span>
        </label>

        <label
          className={`flex items-center gap-2 ${
            seleccionado
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-40"
          }`}
        >
          <input
            type="checkbox"
            checked={obligatorio}
            disabled={!seleccionado}
            onChange={(e) =>
              onObligatorioChange(
                e.target.checked
              )
            }
            className="h-4 w-4 rounded border-kc-sand text-kc-rose-gold focus:ring-kc-rose-gold/20"
          />
          <span className="text-xs text-kc-mocha">
            Obligatorio
          </span>
        </label>

        <div className="w-28">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-kc-mocha">
              S/
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={precio_extra}
              disabled={!seleccionado}
              onChange={(e) =>
                onPrecioChange(
                  Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-kc-sand bg-white py-1.5 pl-7 pr-3 text-xs outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
