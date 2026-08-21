"use client";

import { useState } from "react";

import { toast } from "sonner";

import MediaPreview from "./MediaPreview";
import MediaInfo from "./MediaInfo";
import MediaActions from "./MediaActions";

import { deleteMediaAction } from "../actions/delete-media.action";
import { updateMediaAltAction } from "../actions/update-media-alt.action";
import { updateMediaNameAction } from "../actions/update-media-name.action";

import type { Media } from "../types/media.type";

type Props = {
  media: Media;
  selected?: string;
  onSelect?: (media: Media) => void;
  onDelete?: (id: string) => void;
};

export default function MediaCard({
  media,
  selected,
  onSelect,
  onDelete,
}: Props) {
  const [editingName, setEditingName] =
    useState(false);

  const [editingAlt, setEditingAlt] =
    useState(false);

  const [name, setName] = useState(
    media.nombre
  );

  const [alt, setAlt] = useState(
    media.alt ?? ""
  );

  async function saveName() {
    const result =
      await updateMediaNameAction(
        media.id,
        name
      );

    if (!result.success) {
      toast.error(result.message);

      return;
    }

    toast.success("Nombre actualizado.");

    setEditingName(false);
  }

  async function saveAlt() {
    const result =
      await updateMediaAltAction(
        media.id,
        alt
      );

    if (!result.success) {
      toast.error(result.message);

      return;
    }

    toast.success("ALT actualizado.");

    setEditingAlt(false);
  }

  async function remove() {
    if (
      !window.confirm(
        "¿Eliminar imagen?"
      )
    ) {
      return;
    }

    const result =
      await deleteMediaAction(media.id);

    if (!result.success) {
      toast.error(result.message);

      return;
    }

    toast.success("Imagen eliminada.");

    onDelete?.(media.id);
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(
      media.url
    );

    toast.success("URL copiada.");
  }

  return (
    <div
      onClick={() => onSelect?.(media)}
      className={`overflow-hidden rounded-xl border bg-white transition hover:shadow-lg ${
        selected === media.id
          ? "ring-2 ring-[#D8B07A]"
          : ""
      }`}
    >
      <MediaPreview
        url={media.url}
        alt={alt || name}
      />

      <div className="space-y-3 p-3">
        {editingName ? (
          <>
            <input
              value={name}
              onClick={(e) =>
                e.stopPropagation()
              }
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                saveName();
              }}
              className="w-full rounded-lg bg-blue-600 py-2 text-white"
            >
              Guardar nombre
            </button>
          </>
        ) : (
          <MediaInfo
            nombre={name}
            carpeta={media.carpeta}
          />
        )}

        {editingAlt && (
          <>
            <input
              value={alt}
              onClick={(e) =>
                e.stopPropagation()
              }
              onChange={(e) =>
                setAlt(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Texto ALT"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                saveAlt();
              }}
              className="w-full rounded-lg bg-green-600 py-2 text-white"
            >
              Guardar ALT
            </button>
          </>
        )}

        <MediaActions
          onRename={() =>
            setEditingName(true)
          }
          onEditAlt={() =>
            setEditingAlt(true)
          }
          onCopy={copyUrl}
          onDelete={remove}
        />
      </div>
    </div>
  );
}