import PageHeader from "@/components/common/PageHeader";

import ProductForm from "@/features/admin/products/components/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        title="Nuevo producto"
        description="Completa la información para crear un nuevo producto."
      />

      <ProductForm />
    </>
  );
}