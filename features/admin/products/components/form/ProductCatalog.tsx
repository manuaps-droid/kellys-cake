"use client";

import { useEffect, useState } from "react";
import {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { getCatalogByTypeAction } from "@/features/catalogs/actions/get-catalog-by-type.action";

import type { CatalogItem } from "@/features/catalogs/types/catalog.type";
import type { ProductSchema } from "../../validations/product.schema";

type Props = {
  register: UseFormRegister<ProductSchema>;
  setValue: UseFormSetValue<ProductSchema>;
  value: string;
  errors: FieldErrors<ProductSchema>;
};

export default function ProductCatalog({
  register,
  setValue,
  value,
  errors,
}: Props) {
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);

  useEffect(() => {
    async function load() {
      const data =
        await getCatalogByTypeAction(
          "categoria_producto"
        );

      setCatalogs(data);
    }

    load();
  }, []);

  useEffect(() => {
    register("catalogo_id");
  }, [register]);

  return (
    <div>
      <label className="mb-2 block font-medium">
        Catálogo
      </label>

      <Select
        value={value}
        onValueChange={(v) =>
          setValue("catalogo_id", v, {
            shouldValidate: true,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccione un catálogo" />
        </SelectTrigger>

        <SelectContent>
          {catalogs.map((item) => (
            <SelectItem
              key={item.id}
              value={item.id}
            >
              {item.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {errors.catalogo_id && (
        <p className="mt-1 text-sm text-red-500">
          {errors.catalogo_id.message}
        </p>
      )}
    </div>
  );
}