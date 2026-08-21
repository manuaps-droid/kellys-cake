"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/Button";

import {
  checkoutSchema,
  type CheckoutSchema,
} from "../validations/checkout.schema";

import { createOrder } from "../actions/create-order.action";

export default function CheckoutForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),

    defaultValues: {
      nombre: "",
      apellidos: "",
      email: "",
      telefono: "",
      direccion: "",
      referencia: "",
      notas: "",
    },
  });

  async function onSubmit(
    _: CheckoutSchema
  ) {
    const result =
      await createOrder();

    if (!result.success) {
      alert(
        result.message ??
          "No se pudo crear el pedido."
      );

      return;
    }

    router.replace("/checkout/success");
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold text-[#0B1423]">
        Información de entrega
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6"
      >
        <div>
          <label className="mb-2 block font-medium">
            Nombre
          </label>

          <input
            {...register("nombre")}
            className="w-full rounded-xl border p-3"
          />

          {errors.nombre && (
            <p className="mt-1 text-sm text-red-500">
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Apellidos
          </label>

          <input
            {...register("apellidos")}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Email
          </label>

          <input
            type="email"
            {...register("email")}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Teléfono
          </label>

          <input
            {...register("telefono")}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Dirección
          </label>

          <textarea
            {...register("direccion")}
            className="w-full rounded-xl border p-3"
            rows={3}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Referencia
          </label>

          <input
            {...register("referencia")}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Notas
          </label>

          <textarea
            {...register("notas")}
            className="w-full rounded-xl border p-3"
            rows={4}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Procesando..."
              : "Realizar pedido"}
          </Button>
        </div>
      </form>
    </div>
  );
}