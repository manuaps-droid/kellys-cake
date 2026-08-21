"use client";

import { Button } from "@/components/ui/Button";

import { useCustomization } from "../context/CustomizationProvider";

export default function DeliveryStep() {
  const {
    data,
    updateData,
    nextStep,
    previousStep,
  } = useCustomization();

  const isDelivery =
    data.deliveryType === "delivery";

  const valid =
    data.deliveryType === "pickup"
      ? true
      : data.address.trim() !== "";

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <span className="text-sm font-semibold uppercase tracking-widest text-[#D8B07A]">
        Paso 9 de 10
      </span>

      <h1 className="mt-4 font-playfair text-5xl font-bold text-[#0B1423]">
        ¿Cómo deseas recibir tu pedido?
      </h1>

      <p className="mt-6 text-lg text-gray-600">
        Selecciona la opción que prefieras.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">

        <button
          type="button"
          onClick={() =>
            updateData({
              deliveryType: "delivery",
            })
          }
          className={`rounded-3xl border p-8 text-left transition ${
            isDelivery
              ? "border-[#D8B07A] bg-[#FFF8F2]"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2 className="text-2xl font-semibold">
            Delivery
          </h2>

          <p className="mt-3 text-gray-600">
            Llevamos tu pastel hasta la dirección indicada.
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            updateData({
              deliveryType: "pickup",
            })
          }
          className={`rounded-3xl border p-8 text-left transition ${
            !isDelivery
              ? "border-[#D8B07A] bg-[#FFF8F2]"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2 className="text-2xl font-semibold">
            Recojo en tienda
          </h2>

          <p className="mt-3 text-gray-600">
            Pasaré a recoger el pedido personalmente.
          </p>
        </button>

      </div>

      {isDelivery && (
        <div className="mt-12 space-y-6">

          <div>
            <label className="mb-2 block font-semibold">
              Dirección
            </label>

            <input
              type="text"
              value={data.address}
              onChange={(e) =>
                updateData({
                  address: e.target.value,
                })
              }
              placeholder="Av. Javier Prado 123..."
              className="w-full rounded-2xl border border-gray-300 p-4"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Referencia
            </label>

            <textarea
              rows={3}
              value={data.reference}
              onChange={(e) =>
                updateData({
                  reference: e.target.value,
                })
              }
              placeholder="Frente al parque..."
              className="w-full rounded-2xl border border-gray-300 p-4"
            />
          </div>

        </div>
      )}

      <div className="mt-14 flex justify-between">

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