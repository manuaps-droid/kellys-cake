import { UseFormRegister, FieldErrors } from "react-hook-form";

import { Input } from "@/components/ui/Input";

import type { ProductSchema } from "../../validations/product.schema";

type Props = {
  register: UseFormRegister<ProductSchema>;
  errors: FieldErrors<ProductSchema>;
};

export default function ProductCategory({
  register,
  errors,
}: Props) {
  return (
    <div>
      <label className="mb-2 block font-medium">
        Categoría
      </label>

      <Input
        {...register("categoria")}
      />

      {errors.categoria && (
        <p className="mt-1 text-sm text-red-500">
          {errors.categoria.message}
        </p>
      )}
    </div>
  );
}