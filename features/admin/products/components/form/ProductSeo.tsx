import {
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import type { ProductSchema } from "../../validations/product.schema";

type Props = {
  register: UseFormRegister<ProductSchema>;
  errors: FieldErrors<ProductSchema>;
};

export default function ProductSeo({
  register,
  errors,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block font-medium">
          SEO Title
        </label>

        <Input
          {...register("seo_title")}
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          SEO Description
        </label>

        <Textarea
          rows={4}
          {...register("seo_description")}
        />
      </div>
    </div>
  );
}