"use client";

import { useEffect, useMemo, useState } from "react";

import MediaGrid from "./MediaGrid";
import MediaSearch from "./MediaSearch";
import MediaUploader from "./MediaUploader";
import MediaViewer from "./MediaViewer";

import { getMediaAction } from "../actions/get-media.action";

import type { Media } from "../types/media.type";

type Props = {
  open: boolean;
  selected?: string;
  onClose: () => void;
  onSelect: (media: Media) => void;
};

export default function MediaDialog({
  open,
  selected,
  onClose,
  onSelect,
}: Props) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [viewerOpen, setViewerOpen] =
    useState(false);

  const [viewerMedia, setViewerMedia] =
    useState<Media | null>(null);

  useEffect(() => {
    if (!open) return;

    async function loadMedia() {
      setLoading(true);

      const data = await getMediaAction();

      setMedia(data as Media[]);

      setLoading(false);
    }

    loadMedia();
  }, [open]);

  const filteredMedia = useMemo(() => {
    const text = search.toLowerCase().trim();

    if (!text) {
      return media;
    }

    return media.filter((item) => {
      return (
        item.nombre
          .toLowerCase()
          .includes(text) ||
        item.carpeta
          .toLowerCase()
          .includes(text) ||
        (item.alt ?? "")
          .toLowerCase()
          .includes(text)
      );
    });
  }, [media, search]);

  if (!open) {
    return null;
  }

  return (
    <>
      <MediaViewer
        open={viewerOpen}
        media={viewerMedia}
        onClose={() =>
          setViewerOpen(false)
        }
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="max-h-[90vh] w-[1100px] overflow-auto rounded-2xl bg-white p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">
              Biblioteca Multimedia
            </h2>

            <div className="flex gap-3">
              <MediaUploader
                onUploaded={(item) => {
                  setMedia((current) => [
                    item,
                    ...current,
                  ]);
                }}
              />

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border px-4 py-2 transition hover:bg-gray-100"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="mb-6">
            <MediaSearch
              value={search}
              onChange={setSearch}
            />
          </div>

            {loading ? (
              <p>Cargando...</p>
            ) : filteredMedia.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
                No se encontraron imágenes.
              </div>
            ) : (
              <MediaGrid
                media={filteredMedia}
                selected={selected}
                onSelect={(item) => {
                  onSelect(item);
                  onClose();
                }}
                onDelete={(id) => {
                  setMedia((current) =>
                    current.filter(
                      (item) =>
                        item.id !== id
                    )
                  );
                }}
              />
            )}

          {viewerMedia && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onSelect(viewerMedia);
                  setViewerOpen(false);
                  onClose();
                }}
                className="rounded-xl bg-[#D8B07A] px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Usar esta imagen
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}