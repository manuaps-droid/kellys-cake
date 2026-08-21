"use client";

import type {
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";

import type { ProductSchema } from "../../validations/product.schema";

type Props = {
  register: UseFormRegister<ProductSchema>;
  errors: FieldErrors<ProductSchema>;
};

export default function ProductStatus({
  register,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <label className="flex items-center gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          {...register("disponible")}
        />

        <span>Disponible</span>
      </label>

      <label className="flex items-center gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          {...register("destacado")}
        />

        <span>Destacado</span>
      </label>

      <label className="flex items-center gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          {...register("mas_vendido")}
        />

        <span>Más vendido</span>
      </label>

      <div>
        <label className="mb-2 block font-medium">
          Estado
        </label>

        <select
          {...register("estado")}
          className="w-full rounded-xl border p-3"
        >
          <option value="borrador">
            Borrador
          </option>

          <option value="publicado">
            Publicado
          </option>
        </select>
      </div>
    </div>
  );
}