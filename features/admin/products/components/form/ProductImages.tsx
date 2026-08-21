"use client";

import { useEffect, useState, useTransition } from "react";

import { arrayMove } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/Button";

import MediaDialog from "@/features/media/components/MediaDialog";

import ProductImagesGrid from "./ProductImagesGrid";

import { addProductImageAction } from "@/features/admin/products/images/actions/add-product-image.action";
import { deleteProductImageAction } from "@/features/admin/products/images/actions/delete-product-image.action";
import { getProductImagesAction } from "@/features/admin/products/images/actions/get-product-images.action";
import { reorderProductImagesAction } from "@/features/admin/products/images/actions/reorder-product-images.action";
import { setProductMainImageAction } from "@/features/admin/products/images/actions/set-product-main-image.action";

import type { ProductImage } from "@/features/admin/products/types/product-image.type";

type Props = {
  productId: string;
  value: string | null;
  onChange: (id: string | null) => void;
};

export default function ProductImages({
  productId,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const [images, setImages] = useState<ProductImage[]>([]);

  const [isPending, startTransition] =
    useTransition();

  async function loadImages() {
    const data =
      await getProductImagesAction(
        productId
      );

    setImages(data);
  }

  useEffect(() => {
    startTransition(() => {
      loadImages();
    });
  }, [productId]);

  function moveImage(
    activeId: string,
    overId: string
  ) {
    const oldIndex =
      images.findIndex(
        (i) => i.id === activeId
      );

    const newIndex =
      images.findIndex(
        (i) => i.id === overId
      );

    if (
      oldIndex === -1 ||
      newIndex === -1
    )
      return;

    const reordered = arrayMove(
      images,
      oldIndex,
      newIndex
    );

    setImages(reordered);

    startTransition(async () => {
      await reorderProductImagesAction(
        productId,
        reordered.map(
          (i) => i.id
        )
      );
    });
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              setOpen(true)
            }
          >
            Agregar imagen
          </Button>
        </div>

        {images.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Este producto todavía no tiene
            imágenes.
          </div>
        )}

        {images.length > 0 && (
          <ProductImagesGrid
            images={images}
            loading={isPending}
            onMove={moveImage}
            onSetMain={(
              imageId,
              mediaId
            ) =>
              startTransition(
                async () => {
                  await setProductMainImageAction(
                    productId,
                    imageId,
                    mediaId
                  );

                  onChange(
                    mediaId
                  );

                  await loadImages();
                }
              )
            }
            onDelete={(
              imageId
            ) =>
              startTransition(
                async () => {
                  await deleteProductImageAction(
                    imageId
                  );

                  await loadImages();
                }
              )
            }
          />
        )}

        <input
          type="hidden"
          value={value ?? ""}
          readOnly
        />
      </div>

      <MediaDialog
        open={open}
        selected={
          value ?? undefined
        }
        onClose={() =>
          setOpen(false)
        }
        onSelect={(media) => {
          startTransition(
            async () => {
              await addProductImageAction(
                productId,
                media.id
              );

              onChange(
                media.id
              );

              await loadImages();

              setOpen(false);
            }
          );
        }}
      />
    </>
  );
}