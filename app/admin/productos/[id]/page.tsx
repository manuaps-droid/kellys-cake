import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import ProductForm from "@/features/admin/products/components/ProductForm";
import { getProductAction } from "@/features/admin/products/actions/get-product.action";
import { ExternalLink, ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const result = await getProductAction(id);

  if (!result.success || !result.product) {
    notFound();
  }

  const product = result.product;

  return (
    <div className="space-y-8">
      <PageHeader
        title={product.nombre}
        description="Ficha del producto: edita la información general, precios, imágenes, presentaciones y SEO."
        actions={
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/productos" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Volver a productos
              </Link>
            </Button>
            {product.slug && product.estado === "publicado" && (
              <Button asChild variant="secondary">
                <Link
                  href={`/productos/${product.slug}`}
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Ver en tienda
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <ProductForm product={product} />
    </div>
  );
}
