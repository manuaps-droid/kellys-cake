"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";

type Props = {
  label?: string;
  value: string | null;
  onChange: (url: string | null) => void;
};

export default function ItemImageUploader({
  label = "Imagen del modelo",
  value,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success || !result.media?.url) {
        throw new Error(result.message ?? "No se pudo subir la imagen.");
      }

      onChange(result.media.url);
      toast.success("Imagen subida.");
    } catch (err) {
      console.error(err);
      toast.error("Error al subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>

      {value ? (
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-gray-100">
            <Image
              src={value}
              alt="Modelo"
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="cursor-pointer text-xs font-medium text-cake-gold underline">
              Reemplazar
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  void handleFile(e.target.files?.[0])
                }
              />
            </label>

            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-left text-xs font-medium text-red-500 transition hover:text-red-700"
            >
              Quitar imagen
            </button>
          </div>
        </div>
      ) : (
        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-2xl text-gray-400 transition hover:border-cake-gold hover:text-cake-gold">
          {uploading ? (
            <span className="text-xs">Subiendo...</span>
          ) : (
            "+"
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              void handleFile(e.target.files?.[0])
            }
          />
        </label>
      )}
    </div>
  );
}
