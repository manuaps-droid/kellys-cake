import Link from "next/link";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/common/PageHeader";

import CatalogForm from "@/features/admin/personalization/components/CatalogForm";

type Props = {
  searchParams: Promise<{ tipo?: string }>;
};

export default async function NewCatalogPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const defaultTipo = params.tipo ?? "";

  return (
    <section className="space-y-8">
      <PageHeader
        title="Nuevo catálogo"
        description={
          defaultTipo
            ? `Agregar nuevo elemento al tipo "${defaultTipo}"`
            : "Crea una nueva opción de personalización."
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/catalogos">
              Volver
            </Link>
          </Button>
        }
      />

      <Card className="p-8">
        <CatalogForm defaultTipo={defaultTipo} />
      </Card>
    </section>
  );
}
