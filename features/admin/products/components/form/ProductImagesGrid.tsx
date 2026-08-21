"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import SortableImageCard from "./SortableImageCard";

import type { ProductImage } from "@/features/admin/products/types/product-image.type";

type Props = {
  images: ProductImage[];
  loading: boolean;
  onMove: (
    activeId: string,
    overId: string
  ) => void;
  onSetMain: (
    imageId: string,
    mediaId: string
  ) => void;
  onDelete: (
    imageId: string
  ) => void;
};

export default function ProductImagesGrid({
  images,
  loading,
  onMove,
  onSetMain,
  onDelete,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const {
      active,
      over,
    } = event;

    if (!over) return;

    if (active.id === over.id) return;

    onMove(
      String(active.id),
      String(over.id)
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={
        closestCenter
      }
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map(
          (i) => i.id
        )}
        strategy={
          rectSortingStrategy
        }
      >
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {images.map((image) => (
            <SortableImageCard
              key={image.id}
              image={image}
              loading={loading}
              onSetMain={onSetMain}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}