"use client";

import Image from "next/image";

import type { Media } from "../types/media.type";

type Props = {
  media: Media | null;
  open: boolean;
  onClose: () => void;
};

export default function MediaViewer({
  media,
  open,
  onClose,
}: Props) {
  if (!open || !media) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-10"
      onClick={onClose}
    >
      <div
        className="relative h-[80vh] w-[80vw]"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <Image
          src={media.url}
          alt={media.alt ?? media.nombre}
          fill
          className="object-contain"
          sizes="80vw"
          priority
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 rounded-lg bg-white px-4 py-2 font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}