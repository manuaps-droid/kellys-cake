"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import ProductFormLayout from "./ProductFormLayout";
import ProductTabs from "./ProductTabs";
import ProductPresentations from "./ProductPresentations";

import ProductBasicInfo from "./form/ProductBasicInfo";
import ProductPrice from "./form/ProductPrice";
import ProductCategory from "./form/ProductCategory";
import ProductCatalog from "./form/ProductCatalog";
import ProductImages from "./form/ProductImages";
import ProductSeo from "./form/ProductSeo";
import ProductStatus from "./form/ProductStatus";

import ProductCatalogOptions from "../options/ProductCatalogOptions";

import {
  productSchema,
  type ProductSchema,
} from "../validations/product.schema";

import { createProduct } from "../actions/create-product.action";
import { updateProduct } from "../actions/update-product.action";

import type { Product } from "../types/product.type";

type ProductFormProps = {
  product?: Product;
};

export default function ProductForm({
  product,
}: ProductFormProps) {
  const router = useRouter();

  const isEditing = !!product;

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),

    defaultValues: {
      nombre: product?.nombre ?? "",
      slug: product?.slug ?? "",
      descripcion: product?.descripcion ?? "",
      descripcion_corta:
        product?.descripcion_corta ?? "",
      categoria: product?.categoria ?? "",
      catalogo_id:
        product?.catalogo_id ?? "",
      precio: product?.precio ?? null,
      imagen: product?.imagen ?? "",
      imagen_principal_id:
        product?.imagen_principal_id ??
        null,
      disponible:
        product?.disponible ?? true,
      destacado:
        product?.destacado ?? false,
      mas_vendido:
        product?.mas_vendido ?? false,
      estado:
        product?.estado ?? "borrador",
      seo_title:
        product?.seo_title ?? "",
      seo_description:
        product?.seo_description ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = form;

  async function onSubmit(
    data: ProductSchema
  ) {
    const result =
      isEditing && product
        ? await updateProduct(
            product.id,
            data
          )
        : await createProduct(data);

    if (!result.success) {
      toast.error(
        result.message ??
          "Ocurrió un error."
      );
      return;
    }

    toast.success(
      isEditing
        ? "Producto actualizado."
        : "Producto creado."
    );

    if (isEditing) {
      router.push("/admin/productos");
    } else {
      // Redirigir a la edición para que pueda subir imágenes y configurar opciones
      const newId = (result as { id?: string }).id;
      if (newId) {
        router.push(`/admin/productos/${newId}`);
      }
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      <ProductTabs
        defaultValue="general"
        tabs={[
          {
            value: "general",
            label: "General",
            content: (
              <div className="space-y-8">
                <ProductFormLayout
                  title="Información"
                  description="Datos principales del producto."
                >
                  <ProductBasicInfo
                    register={register}
                    errors={errors}
                  />
                </ProductFormLayout>

                <ProductFormLayout title="Precio">
                  <ProductPrice
                    register={register}
                    errors={errors}
                  />
                </ProductFormLayout>

                <ProductFormLayout title="Categoría">
                  <ProductCategory
                    register={register}
                    errors={errors}
                  />
                </ProductFormLayout>

                <ProductFormLayout title="Catálogo">
                  <ProductCatalog
                    register={register}
                    setValue={setValue}
                    value={watch(
                      "catalogo_id"
                    )}
                    errors={errors}
                  />
                </ProductFormLayout>
              </div>
            ),
          },
          {
            value: "imagenes",
            label: "Imágenes",
            content:
              isEditing && product ? (
                <ProductFormLayout title="Imágenes">
                  <ProductImages
                    productId={product.id}
                    value={watch(
                      "imagen_principal_id"
                    )}
                    onChange={(id) =>
                      setValue(
                        "imagen_principal_id",
                        id
                      )
                    }
                  />
                </ProductFormLayout>
              ) : (
                <div>
                  Guarda el producto
                  primero para agregar
                  imágenes.
                </div>
              ),
          },
          {
            value: "presentaciones",
            label: "Presentaciones",
            content:
              isEditing && product ? (
                <ProductFormLayout
                  title="Presentaciones"
                  description="Administra las presentaciones del producto."
                >
                  <ProductPresentations
                    productId={product.id}
                  />
                </ProductFormLayout>
              ) : (
                <div>
                  Guarda el producto
                  primero para agregar
                  presentaciones.
                </div>
              ),
          },
          {
            value: "opciones",
            label: "Opciones",
            content:
              isEditing && product ? (
                <ProductFormLayout
                  title="Opciones del producto"
                  description="Selecciona qué opciones estarán disponibles para este producto."
                >
                  <ProductCatalogOptions
                    productId={product.id}
                  />
                </ProductFormLayout>
              ) : (
                <div>
                  Guarda el producto
                  primero para configurar
                  sus opciones.
                </div>
              ),
          },
          {
            value: "seo",
            label: "SEO",
            content: (
              <ProductFormLayout title="SEO">
                <ProductSeo
                  register={register}
                  errors={errors}
                />
              </ProductFormLayout>
            ),
          },
          {
            value: "publicacion",
            label: "Publicación",
            content: (
              <ProductFormLayout title="Publicación">
                <ProductStatus
                  register={register}
                  errors={errors}
                />
              </ProductFormLayout>
            ),
          },
        ]}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
            ? "Actualizar producto"
            : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}