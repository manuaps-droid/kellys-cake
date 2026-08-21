"use client";

import { Button } from "@/components/ui/Button";

import {
  useCustomization,
} from "../context/CustomizationProvider";

export default function ScheduleStep() {
  const {
    data,
    updateData,
    nextStep,
    previousStep,
  } = useCustomization();

  const today = new Date();

  today.setDate(today.getDate() + 5);

  const minDate =
    today.toISOString().split("T")[0];

  const valid =
    data.deliveryDate !== "" &&
    data.deliveryTime !== "" &&
    data.deliveryDate >= minDate;

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <span className="text-sm font-semibold uppercase tracking-widest text-[#D8B07A]">
        Paso 8 de 10
      </span>

      <h1 className="mt-4 font-playfair text-5xl font-bold text-[#0B1423]">
        ¿Cuándo será tu evento?
      </h1>

      <p className="mt-6 text-lg text-gray-600">
        Esto nos ayudará a confirmar la disponibilidad.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <label className="mb-3 block font-semibold">
            Fecha
          </label>

          <input
            type="date"
            min={minDate}
            value={data.deliveryDate}
            onChange={(e) =>
              updateData({
                deliveryDate:
                  e.target.value,
              })
            }
            className="w-full rounded-2xl border border-gray-300 p-4"
          />

          <p className="mt-2 text-sm text-gray-500">
            Los pedidos se programan con mínimo 5 días de anticipación.
          </p>
        </div>

        <div>
          <label className="mb-3 block font-semibold">
            Hora
          </label>

          <input
            type="time"
            value={data.deliveryTime}
            onChange={(e) =>
              updateData({
                deliveryTime:
                  e.target.value,
              })
            }
            className="w-full rounded-2xl border border-gray-300 p-4"
          />
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <Button
          variant="outline"
          onClick={previousStep}
        >
          Atrás
        </Button>

        <Button
          onClick={nextStep}
          disabled={!valid}
        >
          Continuar
        </Button>
      </div>
    </section>
  );
}