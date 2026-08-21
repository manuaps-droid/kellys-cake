"use client";

import Image from "next/image";

import { Button } from "@/components/ui/Button";

import type { ProductImage } from "@/features/admin/products/types/product-image.type";

type Props = {
  image: ProductImage;
  loading: boolean;
  onSetMain: (
    imageId: string,
    mediaId: string
  ) => void;
  onDelete: (
    imageId: string
  ) => void;
};

export default function ProductImageCard({
  image,
  loading,
  onSetMain,
  onDelete,
}: Props) {
  const media = image.media[0];

  if (!media) return null;

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="relative aspect-square">
        <Image
          src={media.url}
          alt={media.nombre}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
      </div>

      <div className="space-y-3 p-3">
        <p className="truncate text-sm">
          {media.nombre}
        </p>

        {image.principal && (
          <div className="rounded bg-green-100 py-1 text-center text-xs font-medium text-green-700">
            Imagen principal
          </div>
        )}

        <div className="flex gap-2">
          {!image.principal && (
            <Button
              type="button"
              className="flex-1"
              disabled={loading}
              onClick={() =>
                onSetMain(
                  image.id,
                  media.id
                )
              }
            >
              Principal
            </Button>
          )}

          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() =>
              onDelete(image.id)
            }
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}