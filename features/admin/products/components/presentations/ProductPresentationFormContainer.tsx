"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import ProductPresentationForm from "./ProductPresentationForm";

import {
  createProductPresentationAction,
  updateProductPresentationAction,
} from "../../actions/product-presentations.actions";

import { getProductImagesAction } from "../../images/actions/get-product-images.action";

import {
  productPresentationSchema,
  type ProductPresentationSchema,
} from "../../validations/product-presentation.schema";

import type {
  ProductPresentation,
  CreateProductPresentationInput,
} from "../../types/product-presentation";

import type { ProductImage } from "../../types/product-image.type";

type Props = {
  productId: string;
  presentation?: ProductPresentation;
  onSuccess: () => void;
};

export default function ProductPresentationFormContainer({
  productId,
  presentation,
  onSuccess,
}: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ProductPresentationSchema>({
    resolver: zodResolver(productPresentationSchema),
    defaultValues: {
      producto_id: productId,
      nombre: "",
      descripcion: "",
      precio: 0,
      precio_oferta: null,
      sku: "",
      codigo_barras: "",
      stock: null,
      peso: null,
      tiempo_preparacion: null,
      imagen_id: null,
      slug: "",
      orden: 0,
      predeterminada: false,
    },
  });

  useEffect(() => {
    async function loadImages() {
      try {
        const data = await getProductImagesAction(productId);
        setImages(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadImages();
  }, [productId]);

  useEffect(() => {
    if (presentation) {
      reset({
        producto_id: presentation.producto_id,
        nombre: presentation.nombre,
        descripcion: presentation.descripcion ?? "",
        precio: presentation.precio,
        precio_oferta: presentation.precio_oferta,
        sku: presentation.sku ?? "",
        codigo_barras: presentation.codigo_barras ?? "",
        stock: presentation.stock,
        peso: presentation.peso,
        tiempo_preparacion:
          presentation.tiempo_preparacion,
        imagen_id: presentation.imagen_id,
        slug: presentation.slug ?? "",
        orden: presentation.orden,
        predeterminada:
          presentation.predeterminada,
      });
    } else {
      reset({
        producto_id: productId,
        nombre: "",
        descripcion: "",
        precio: 0,
        precio_oferta: null,
        sku: "",
        codigo_barras: "",
        stock: null,
        peso: null,
        tiempo_preparacion: null,
        imagen_id: null,
        slug: "",
        orden: 0,
        predeterminada: false,
      });
    }
  }, [presentation, productId, reset]);

  async function onSubmit(
    data: ProductPresentationSchema
  ) {
    try {
      if (presentation) {
        await updateProductPresentationAction({
          id: presentation.id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          precio_oferta: data.precio_oferta,
          sku: data.sku,
          codigo_barras: data.codigo_barras,
          stock: data.stock,
          peso: data.peso,
          tiempo_preparacion:
            data.tiempo_preparacion,
          imagen_id: data.imagen_id,
          slug: data.slug,
          predeterminada:
            data.predeterminada,
          activo: presentation.activo,
        });

        toast.success("Presentación actualizada.");
      } else {
        await createProductPresentationAction(
          data as CreateProductPresentationInput
        );

        toast.success("Presentación creada.");
      }

      onSuccess();
    } catch (error) {
      console.error(error);

      toast.error(
        "Ocurrió un error al guardar la presentación."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <ProductPresentationForm
        register={register}
        control={control}
        errors={errors}
        images={images}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : presentation
              ? "Actualizar"
              : "Crear"}
        </button>
      </div>
    </form>
  );
}