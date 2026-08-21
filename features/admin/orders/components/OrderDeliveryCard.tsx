"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import Card from "@/components/ui/Card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { updateOrderDelivery } from "../actions/update-order-delivery.action";

type Props = {
  orderId: string;
  fechaEntrega?: string | null;
  horaEntrega?: string | null;
  tipoEntrega?: string | null;
};

const TIPO_ENTREGA_OPTIONS = [
  { value: "delivery", label: "Delivery" },
  { value: "recojo", label: "Recojo en tienda" },
];

export default function OrderDeliveryCard({
  orderId,
  fechaEntrega,
  horaEntrega,
  tipoEntrega,
}: Props) {
  const [fecha, setFecha] = useState(
    fechaEntrega?.slice(0, 10) ?? ""
  );
  const [hora, setHora] = useState(
    horaEntrega?.slice(0, 5) ?? ""
  );
  const [tipo, setTipo] = useState(
    tipoEntrega ?? ""
  );
  const [pending, startTransition] =
    useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result =
        await updateOrderDelivery(orderId, {
          fecha_entrega: fecha || null,
          hora_entrega: hora || null,
          tipo_entrega: tipo || null,
        });

      if (!result.success) {
        toast.error(
          result.message ??
            "No se pudo programar la entrega."
        );

        return;
      }

      toast.success(
        "Entrega programada."
      );
    });
  }

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold">
        Programación de entrega
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="fecha-entrega"
            className="mb-1.5 block text-sm text-gray-500"
          >
            Fecha de entrega
          </label>
          <input
            id="fecha-entrega"
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-cake-gold focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="hora-entrega"
            className="mb-1.5 block text-sm text-gray-500"
          >
            Hora de entrega
          </label>
          <input
            id="hora-entrega"
            type="time"
            value={hora}
            onChange={(e) =>
              setHora(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-cake-gold focus:outline-none"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm text-gray-500">
            Tipo de entrega
          </p>

          <Select
            value={tipo || undefined}
            onValueChange={setTipo}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder="Selecciona un tipo"
              />
            </SelectTrigger>

            <SelectContent>
              {TIPO_ENTREGA_OPTIONS.map(
                (option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="w-full rounded-xl bg-cake-gold px-5 py-3 font-medium text-white transition hover:bg-cake-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Guardando..."
            : "Guardar programación"}
        </button>
      </div>
    </Card>
  );
}
