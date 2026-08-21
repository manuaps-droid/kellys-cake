import { UseFormRegister, FieldErrors } from "react-hook-form";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import type { ProductSchema } from "../../validations/product.schema";

type Props = {
  register: UseFormRegister<ProductSchema>;
  errors: FieldErrors<ProductSchema>;
};

export default function ProductBasicInfo({
  register,
  errors,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block font-medium">
          Nombre
        </label>

        <Input {...register("nombre")} />

        {errors.nombre && (
          <p className="mt-1 text-sm text-red-500">
            {errors.nombre.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Descripción
        </label>

        <Textarea
          rows={5}
          {...register("descripcion")}
        />

        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-500">
            {errors.descripcion.message}
          </p>
        )}
      </div>
    </div>
  );
}