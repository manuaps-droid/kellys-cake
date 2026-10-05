"use client";

import {
  Controller,
  Control,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";

import type { ProductImage } from "@/features/admin/products/types/product-image.type";
import type { ProductPresentationSchema } from "../../validations/product-presentation.schema";

type Props = {
  register: UseFormRegister<ProductPresentationSchema>;
  control: Control<ProductPresentationSchema>;
  errors: FieldErrors<ProductPresentationSchema>;
  images: ProductImage[];
};

export default function ProductPresentationForm({
  register,
  control,
  errors,
  images,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>

        <Input
          id="nombre"
          placeholder="Ej. 10 porciones"
          {...register("nombre")}
        />

        {errors.nombre && (
          <p className="text-sm text-destructive">
            {errors.nombre.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>

        <Textarea
          id="descripcion"
          rows={3}
          {...register("descripcion")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Precio</Label>

          <Input
            type="number"
            step="0.01"
            {...register("precio", {
              valueAsNumber: true,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Precio oferta</Label>

          <Input
            type="number"
            step="0.01"
            {...register("precio_oferta", {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>SKU</Label>

          <Input {...register("sku")} />
        </div>

        <div className="space-y-2">
          <Label>Código de barras</Label>

          <Input {...register("codigo_barras")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Stock</Label>

          <Input
            type="number"
            {...register("stock", {
              valueAsNumber: true,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Peso</Label>

          <Input
            type="number"
            step="0.01"
            {...register("peso", {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tiempo de preparación</Label>

          <Input
            type="number"
            {...register("tiempo_preparacion", {
              valueAsNumber: true,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>

          <Input {...register("slug")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Imagen</Label>

        <Controller
          control={control}
          name="imagen_id"
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(value) =>
                field.onChange(value === "" ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione una imagen" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="">
                  Sin imagen
                </SelectItem>

                {images.map((image) => (
                  <SelectItem
                    key={image.id}
                    value={image.id}
                  >
                    {image.media[0]?.nombre ??
                      `Imagen ${image.orden + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <Label>Presentación predeterminada</Label>

        <Controller
          control={control}
          name="predeterminada"
          render={({ field }) => (
            <Switch
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
}