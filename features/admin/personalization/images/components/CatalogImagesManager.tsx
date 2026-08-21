"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/Button";

import {
  getCatalogImagesAction,
  addCatalogImageAction,
  deleteCatalogImageAction,
  updateCatalogImageLabelAction,
  updateCatalogImagePortadaAction,
} from "../actions/catalog-images.action";

import { getMediaAction } from "@/features/media/actions/get-media.action";
import { uploadMediaAction } from "@/features/media/actions/upload-media.action";

import type { CatalogImageRow } from "../repositories/catalog-images.repository";
import type { Media } from "@/features/media/types/media.type";

type Props = {
  catalogoId: string;
  enableLabels?: boolean;
  enablePortada?: boolean;
};

export default function CatalogImagesManager({
  catalogoId,
  enableLabels = false,
  enablePortada = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [images, setImages] = useState<CatalogImageRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<string[]>([]);
  const [labelDrafts, setLabelDrafts] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  async function loadImages() {
    const data = await getCatalogImagesAction(catalogoId);
    setImages(data);
    const drafts: Record<string, string> = {};
    for (const img of data) {
      drafts[img.id] = img.label ?? "";
    }
    setLabelDrafts(drafts);
    setDirty(false);
  }

  useEffect(() => {
    startTransition(() => {
      loadImages();
    });
  }, [catalogoId]);

  async function openGallery() {
    setOpen(true);
    setTab("library");
    setUploadedIds([]);
    const data = await getMediaAction();
    setMedia(data as Media[]);
  }

  function toggleSelection(mediaId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(mediaId)) {
        next.delete(mediaId);
      } else {
        next.add(mediaId);
      }
      return next;
    });
  }

  async function addSelected() {
    startTransition(async () => {
      for (const mediaId of selectedIds) {
        await addCatalogImageAction(catalogoId, mediaId);
      }
      setSelectedIds(new Set());
      setOpen(false);
      await loadImages();
    });
  }

  async function addUploaded() {
    if (uploadedIds.length === 0) return;
    startTransition(async () => {
      for (const mediaId of uploadedIds) {
        await addCatalogImageAction(catalogoId, mediaId);
      }
      setUploadedIds([]);
      setOpen(false);
      await loadImages();
    });
  }

  async function handleUpload(files: FileList) {
    setUploading(true);
    const newIds: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const result = await uploadMediaAction(formData);
        if (result.success && result.media?.id) {
          newIds.push(result.media.id);
        }
      }
      if (newIds.length > 0) {
        setUploadedIds((prev) => [...prev, ...newIds]);
        const data = await getMediaAction();
        setMedia(data as Media[]);
      }
    } finally {
      setUploading(false);
    }
  }

  function updateLabelDraft(id: string, value: string) {
    setLabelDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
    const current = images.find((i) => i.id === id)?.label ?? "";
    if (value !== current) {
      setDirty(true);
    } else {
      const allMatch = images.every((i) => (labelDrafts[i.id] ?? "") === (i.label ?? ""));
      if (allMatch) setDirty(false);
    }
  }

  async function saveAllLabels() {
    setSavingAll(true);
    try {
      const updates = images
        .map((i) => ({ id: i.id, current: i.label ?? "", draft: labelDrafts[i.id] ?? "" }))
        .filter((u) => u.current !== u.draft);
      for (const u of updates) {
        await updateCatalogImageLabelAction(u.id, u.draft.trim());
      }
      await loadImages();
    } finally {
      setSavingAll(false);
    }
  }

  async function deleteImage(imageId: string) {
    startTransition(async () => {
      await deleteCatalogImageAction(imageId);
      await loadImages();
    });
  }

  async function togglePortada(imageId: string, check: boolean) {
    startTransition(async () => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, es_portada: check }
            : check
              ? { ...img, es_portada: false }
              : img
        )
      );
      const result = await updateCatalogImagePortadaAction(catalogoId, imageId, check);
      if (!result.success) {
        await loadImages();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-kc-charcoal">Imágenes del catálogo</h3>
        <div className="flex items-center gap-3">
          {enableLabels && dirty && (
            <button
              type="button"
              disabled={savingAll}
              onClick={saveAllLabels}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {savingAll ? "Guardando..." : "Guardar todos los títulos"}
            </button>
          )}
          <Button
            type="button"
            disabled={isPending}
            onClick={openGallery}
          >
            {isPending ? "..." : "Agregar imágenes"}
          </Button>
        </div>
      </div>

      {enableLabels && (
        <p className="rounded-lg border border-kc-sand bg-kc-cream/30 p-3 text-xs text-kc-mocha">
          Edita todos los títulos que desees y pulsa <strong>"Guardar todos los títulos"</strong> para aplicar los cambios de una sola vez. La primera imagen se mostrará más grande en la página pública.
        </p>
      )}

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Este catálogo todavía no tiene imágenes.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {images.map((image, idx) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border bg-white"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.nombre}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-contain"
                />
                {enablePortada ? (
                  image.es_portada && (
                    <span className="absolute left-2 top-2 rounded-full bg-kc-rose-gold px-2 py-0.5 text-xs font-semibold text-white">
                      Portada
                    </span>
                  )
                ) : (
                  idx === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-kc-rose-gold px-2 py-0.5 text-xs font-semibold text-white">
                      Principal
                    </span>
                  )
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-xs text-kc-mocha">{image.nombre}</p>

                {enablePortada && (
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-kc-sand bg-kc-cream/40 px-2 py-2 text-xs font-medium text-kc-mocha transition hover:bg-kc-cream">
                    <input
                      type="checkbox"
                      checked={image.es_portada}
                      disabled={isPending}
                      onChange={(e) => togglePortada(image.id, e.target.checked)}
                      className="h-4 w-4 accent-kc-rose-gold"
                    />
                    Foto de portada
                  </label>
                )}

                {enableLabels && (
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-kc-mocha">
                      Título de la tarjeta
                    </label>
                    <input
                      value={labelDrafts[image.id] ?? ""}
                      onChange={(e) => updateLabelDraft(image.id, e.target.value)}
                      placeholder="Ej: Mesas dulces"
                      className="w-full rounded-lg border border-kc-sand px-2 py-1.5 text-xs outline-none focus:border-kc-rose-gold focus:ring-1 focus:ring-kc-rose-gold/30"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => deleteImage(image.id)}
                  className="w-full rounded-lg bg-red-50 py-2 text-xs text-red-600 transition hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal con tabs: Biblioteca / Subir nuevas */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex max-h-[90vh] w-[1100px] flex-col overflow-hidden rounded-2xl bg-white">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b p-6">
              <h2 className="text-2xl font-semibold">Agregar imágenes al catálogo</h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedIds(new Set());
                  setUploadedIds([]);
                  setOpen(false);
                }}
                className="rounded-lg border px-4 py-2 transition hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b px-6 pt-4">
              <button
                type="button"
                onClick={() => setTab("library")}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === "library"
                    ? "border-kc-rose-gold text-kc-charcoal"
                    : "border-transparent text-kc-mocha hover:text-kc-charcoal"
                }`}
              >
                Biblioteca existente
                {selectedIds.size > 0 && (
                  <span className="ml-2 rounded-full bg-kc-rose-gold px-2 py-0.5 text-xs text-white">
                    {selectedIds.size}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab("upload")}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === "upload"
                    ? "border-kc-rose-gold text-kc-charcoal"
                    : "border-transparent text-kc-mocha hover:text-kc-charcoal"
                }`}
              >
                Subir nuevas
                {uploadedIds.length > 0 && (
                  <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">
                    {uploadedIds.length} listas
                  </span>
                )}
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6">
              {tab === "library" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                  {media.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSelection(item.id)}
                        className={`overflow-hidden rounded-xl border bg-white text-left transition ${
                          isSelected
                            ? "ring-2 ring-kc-rose-gold border-kc-rose-gold"
                            : "hover:shadow-lg"
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={item.url}
                            alt={item.nombre}
                            fill
                            sizes="(max-width: 768px) 50vw, 20vw"
                            className="object-contain"
                          />
                          {isSelected && (
                            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-kc-rose-gold text-white">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs text-gray-600">{item.nombre}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl border-2 border-dashed border-kc-rose-gold/40 bg-kc-rose-gold/5 p-10 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                      📤
                    </div>
                    <p className="mb-2 text-sm font-medium text-kc-charcoal">
                      Selecciona varias imágenes a la vez
                    </p>
                    <p className="mb-6 text-xs text-kc-mocha">
                      Soporta JPG, PNG, WebP. Cada imagen se subirá al MediaLibrary y quedará disponible.
                    </p>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-kc-charcoal px-8 py-3 text-sm font-medium text-kc-cream transition hover:bg-kc-deep">
                      {uploading ? "Subiendo..." : "Seleccionar archivos"}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        hidden
                        disabled={uploading}
                        onChange={(e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          void handleUpload(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {/* Imágenes recién subidas */}
                  {uploadedIds.length > 0 ? (
                    <div>
                      <p className="mb-3 text-sm font-medium text-kc-charcoal">
                        {uploadedIds.length} imagen(es) subida(s). Se agregarán todas al catálogo al pulsar el botón inferior.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {uploadedIds.map((id) => {
                          const item = media.find((m) => m.id === id);
                          if (!item) return null;
                          return (
                            <div
                              key={id}
                              className="overflow-hidden rounded-xl border border-emerald-300 bg-white"
                            >
                              <div className="relative aspect-square">
                                <Image
                                  src={item.url}
                                  alt={item.nombre}
                                  fill
                                  sizes="(max-width: 768px) 50vw, 20vw"
                                  className="object-contain"
                                />
                                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                              <div className="p-2">
                                <p className="truncate text-xs text-gray-600">{item.nombre}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-kc-mocha">
                      Aún no se han subido imágenes.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer fijo con acción por tab */}
            <div className="flex items-center justify-between gap-4 border-t bg-gray-50 px-6 py-4">
              <span className="text-sm text-gray-500">
                {tab === "library"
                  ? `${selectedIds.size} seleccionada(s) de la biblioteca`
                  : `${uploadedIds.length} imagen(es) nueva(s) lista(s) para agregar`}
              </span>
              <div className="flex items-center gap-3">
                {tab === "library" ? (
                  <button
                    type="button"
                    disabled={selectedIds.size === 0 || isPending}
                    onClick={addSelected}
                    className="rounded-xl bg-kc-rose-gold px-6 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    Agregar selección al catálogo
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={uploadedIds.length === 0 || isPending}
                    onClick={addUploaded}
                    className="rounded-xl bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Agregar subidas al catálogo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
