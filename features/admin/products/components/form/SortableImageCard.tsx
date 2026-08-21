"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import ProductImageCard from "./ProductImageCard";

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

export default function SortableImageCard({
  image,
  loading,
  onSetMain,
  onDelete,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(
          transform
        ),
        transition,
      }}
      className={
        isDragging
          ? "opacity-50"
          : ""
      }
      {...attributes}
      {...listeners}
    >
      <ProductImageCard
        image={image}
        loading={loading}
        onSetMain={onSetMain}
        onDelete={onDelete}
      />
    </div>
  );
}