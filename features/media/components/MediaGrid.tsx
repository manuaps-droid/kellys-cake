"use client";

import MediaCard from "./MediaCard";

import type { Media } from "../types/media.type";

type MediaGridProps = {
  media: Media[];
  selected?: string;
  onSelect?: (media: Media) => void;
  onDelete?: (id: string) => void;
};

export default function MediaGrid({
  media,
  selected,
  onSelect,
  onDelete,
}: MediaGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {media.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          selected={selected}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}