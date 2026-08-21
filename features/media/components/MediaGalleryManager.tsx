"use client";

import { useState } from "react";

import MediaUploader from "@/features/media/components/MediaUploader";
import MediaGrid from "@/features/media/components/MediaGrid";

import type { Media } from "@/features/media/types/media.type";

type Props = {
  initialMedia: Media[];
};

export default function MediaGalleryManager({ initialMedia }: Props) {
  const [media, setMedia] = useState<Media[]>(initialMedia);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <MediaUploader
          onUploaded={(item) => {
            setMedia((current) => [item, ...current]);
          }}
        />
      </div>

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
          No hay imágenes. Sube tu primera imagen usando el botón superior.
        </div>
      ) : (
        <MediaGrid
          media={media}
          onDelete={(id) => {
            setMedia((current) =>
              current.filter((item) => item.id !== id)
            );
          }}
        />
      )}
    </div>
  );
}
