import { notFound } from "next/navigation";

import PageHeader from "@/components/common/PageHeader";

import ProductForm from "@/features/admin/products/components/ProductForm";

import { getProductById } from "@/features/admin/products/services/get-product.service";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: PageProps) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Editar producto"
        description="Actualiza la información del producto."
      />

      <ProductForm
        product={product}
      />
    </>
  );
}