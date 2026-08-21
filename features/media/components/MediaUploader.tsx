"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

import { uploadMediaAction } from "../actions/upload-media.action";

import type { Media } from "../types/media.type";

type Props = {
  onUploaded?: (media: Media) => void;
};

export default function MediaUploader({
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  async function upload(files: FileList) {
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        // Agregamos un pequeño delay entre subidas para evitar saturar la conexión
        await new Promise(resolve => setTimeout(resolve, 300));

        const result = await uploadMediaAction(formData);

        if (result.success) {
          onUploaded?.(result.media);
        } else {
          console.error("Error subiendo archivo:", result.message);
        }
      }
    } catch (error) {
      console.error("Error crítico en la carga:", error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (!e.target.files) return;

          upload(e.target.files);
        }}
      />

      <Button
        type="button"
        disabled={uploading}
        onClick={() =>
          inputRef.current?.click()
        }
      >
        {uploading
          ? "Subiendo..."
          : "Subir imágenes"}
      </Button>
    </>
  );
}