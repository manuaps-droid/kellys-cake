"use client";

import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";

import { useCustomization } from "../context/CustomizationProvider";

export default function InspirationStep() {
  const {
    data,
    updateData,
    nextStep,
    previousStep,
  } = useCustomization();

  function handleFiles(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      e.target.files ?? []
    ).slice(0, 4);

    updateData({
      inspirationImages: files,
    });
  }

  function removeImage(index: number) {
    const images = [...data.inspirationImages];

    images.splice(index, 1);

    updateData({
      inspirationImages: images,
    });
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <span className="text-sm font-semibold uppercase tracking-widest text-[#D8B07A]">
        Paso 3 de 8
      </span>

      <h2 className="mt-4 font-playfair text-5xl font-bold text-[#0B1423]">
        Muéstranos qué te inspira
      </h2>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
        Puedes subir hasta cuatro imágenes.
      </p>

      <label className="mt-10 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D8B07A] bg-white p-16">
        <ImagePlus
          size={50}
          className="text-[#D8B07A]"
        />

        <p className="mt-6 text-xl font-semibold">
          Seleccionar imágenes
        </p>

        <input
          hidden
          multiple
          accept="image/*"
          type="file"
          onChange={handleFiles}
        />
      </label>

      {data.inspirationImages.length > 0 && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.inspirationImages.map(
            (image, index) => {
              if (!(image instanceof File)) {
                return null;
              }

              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-3xl"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Inspiración ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeImage(index)
                    }
                    className="absolute right-2 top-2 rounded-full bg-white p-2"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                </div>
              );
            }
          )}
        </div>
      )}

      <div className="mt-14 flex justify-between">
        <button
          type="button"
          onClick={previousStep}
          className="rounded-lg border px-6 py-3"
        >
          Atrás
        </button>

        <button
          type="button"
          onClick={nextStep}
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          Continuar
        </button>
      </div>
    </section>
  );
}