"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

import { useCustomization } from "../context/CustomizationProvider";

export default function IdeaStep() {
  const {
    data,
    updateData,
    nextStep,
    previousStep,
  } = useCustomization();

  const [description, setDescription] =
    useState(data.description);

  function continueStep() {
    if (!description.trim()) return;

    updateData({
      description,
    });

    nextStep();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <span className="text-sm font-semibold uppercase tracking-widest text-[#D8B07A]">
        Paso 2 de 8
      </span>

      <h2 className="mt-4 font-playfair text-5xl font-bold text-[#0B1423]">
        Cuéntanos cómo imaginas tu pastel
      </h2>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        No hace falta que tengas todo resuelto. Describe lo que se te
        ocurra y lo vamos puliendo juntos.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 shadow">
        <Textarea
          rows={8}
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="Ejemplo: Quiero un pastel de dos pisos con temática de Harry Potter, colores negro y dorado, aproximadamente para 30 personas..."
        />

        <div className="mt-6 rounded-2xl bg-[#FFF8F2] p-5">
          <p className="font-semibold text-[#0B1423]">
            💡 Puedes contarnos:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
            <li>La temática.</li>
            <li>Los colores.</li>
            <li>El estilo que te gusta.</li>
            <li>Algún detalle especial.</li>
            <li>Si ya viste un diseño que te inspira.</li>
          </ul>
        </div>

        <div className="mt-10 flex justify-between">
          <Button
            variant="outline"
            onClick={previousStep}
          >
            Atrás
          </Button>

          <Button
            onClick={continueStep}
            disabled={!description.trim()}
          >
            Continuar
          </Button>
        </div>
      </div>
    </section>
  );
}