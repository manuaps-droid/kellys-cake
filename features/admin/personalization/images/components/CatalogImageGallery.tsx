"use client";

import { useState } from "react";
import Image from "next/image";

import { updateCatalogImagePortadaAction } from "../actions/catalog-images.action";

type CatalogImage = {
  id: string;
  url: string;
  nombre: string;
  es_portada: boolean;
};

type Props = {
  catalogImages: CatalogImage[];
  catalogoId: string;
};

export default function CatalogImageGallery({
  catalogImages,
  catalogoId,
}: Props) {
  const handleSetPortada = async (imageId: string) => {
    const result = await updateCatalogImagePortadaAction(catalogoId, imageId, true);
    if (!result.success) {
      console.error("Error al establecer portada", result.message);
    }
  };

  return (
    <section className="bg-kc-cream py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalogImages.map((img) => (
            <div
              key={img.id}
              className="rounded-2xl border bg-white overflow-hidden shadow-md"
            >
              <div className="relative">
                <Image
                  src={img.url}
                  alt={img.nombre}
                  width={400}
                  height={400}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full object-cover"
                />
                {img.es_portada && (
                  <span className="absolute left-2 top-2 rounded-full bg-kc-rose-gold px-2 py-0.5 text-xs font-semibold text-white">
                    Portada
                  </span>
                )}
                <label
                  className="absolute left-2 bottom-2 flex items-center gap-2 rounded-lg border border-kc-sand bg-kc-cream/40 px-2 py-1 text-xs font-medium text-kc-mocha transition hover:bg-kc-cream"
                  onClick={() => handleSetPortada(img.id)}
                >
                  <input
                    type="checkbox"
                    checked={img.es_portada}
                    onChange={(e) => (e.target.checked && handleSetPortada(img.id))}
                    className="h-3 w-3 accent-kc-rose-gold"
                  />
                  <span>Portada</span>
                </label>
              </div>
              <p className="p-2 text-xs text-kc-mocha truncate">{img.nombre}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}