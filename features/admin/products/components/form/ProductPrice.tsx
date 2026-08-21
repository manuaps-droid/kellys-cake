import { UseFormRegister, FieldErrors } from "react-hook-form";

import { Input } from "@/components/ui/Input";

import type { ProductSchema } from "../../validations/product.schema";

type Props = {
  register: UseFormRegister<ProductSchema>;
  errors: FieldErrors<ProductSchema>;
};

export default function ProductPrice({
  register,
  errors,
}: Props) {
  return (
    <div>
      <label className="mb-2 block font-medium">
        Precio
      </label>

      <Input
        type="number"
        step="0.01"
        placeholder="Opcional"
        {...register("precio", {
          setValueAs: (v: string) => {
            if (v === "" || v === null || v === undefined || isNaN(Number(v))) {
              return null;
            }
            return Number(v);
          },
        })}
      />

      {errors.precio && (
        <p className="mt-1 text-sm text-red-500">
          {errors.precio.message}
        </p>
      )}
    </div>
  );
}