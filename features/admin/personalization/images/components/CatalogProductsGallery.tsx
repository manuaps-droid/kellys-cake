"use client";

import { useState } from "react";
import Image from "next/image";

import { setProductImageAsPortadaAction } from "../actions/catalog-images.action";

type ProductImage = {
  producto_id: string;
  producto_nombre: string;
  media_id: string;
  url: string;
  nombre: string;
  es_portada: boolean;
};

type Props = {
  productos: ProductImage[];
  catalogoId: string;
};

export default function CatalogProductsGallery({
  productos,
  catalogoId,
}: Props) {
  const [portadaMediaId, setPortadaMediaId] = useState<string | null>(
    productos.find((p) => p.es_portada)?.media_id ?? null
  );
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSetPortada(mediaId: string) {
    setSaving(mediaId);
    setPortadaMediaId(mediaId);
    const result = await setProductImageAsPortadaAction(catalogoId, mediaId);
    if (!result.success) {
      alert("Error al establecer portada: " + result.message);
      setPortadaMediaId(productos.find((p) => p.es_portada)?.media_id ?? null);
    }
    setSaving(null);
  }

  return (
    <section className="bg-kc-cream py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-kc-mocha text-sm mb-6">Imagenes referenciales</p>

        {productos.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-gray-500">
            No hay productos en este catálogo todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((producto) => {
              const esPortada = portadaMediaId === producto.media_id;
              const isSaving = saving === producto.media_id;

              return (
                <div
                  key={producto.producto_id}
                  className="rounded-2xl border bg-white overflow-hidden shadow-md"
                >
                  <div className="relative">
                    {producto.url ? (
                      <Image
                        src={producto.url}
                        alt={producto.producto_nombre}
                        width={400}
                        height={400}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-gray-100 text-4xl">
                        🍰
                      </div>
                    )}

                    {esPortada && (
                      <span className="absolute left-2 top-2 rounded-full bg-kc-rose-gold px-2 py-0.5 text-xs font-semibold text-white">
                        Portada
                      </span>
                    )}

                    <label
                      className={`absolute left-2 bottom-2 flex items-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium transition ${
                        esPortada
                          ? "border-kc-rose-gold bg-kc-cream text-kc-rose-gold"
                          : "border-kc-sand bg-kc-cream/40 text-kc-mocha hover:bg-kc-cream"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={esPortada}
                        disabled={isSaving}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleSetPortada(producto.media_id);
                          }
                        }}
                        className="h-3 w-3 accent-kc-rose-gold"
                      />
                      <span>
                        {isSaving
                          ? "Guardando..."
                          : "Foto de portada"}
                      </span>
                    </label>
                  </div>

                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-kc-charcoal">
                      {producto.producto_nombre}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
