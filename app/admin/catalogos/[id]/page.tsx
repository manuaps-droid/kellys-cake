import Link from "next/link";
import { notFound } from "next/navigation";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/common/PageHeader";

import CatalogForm from "@/features/admin/personalization/components/CatalogForm";
import CatalogImagesManager from "@/features/admin/personalization/images/components/CatalogImagesManager";
import { getCatalogByIdAction } from "@/features/admin/personalization/actions/get-catalog-by-id.action";
import PrecioCantidadEditor from "@/features/admin/products/components/PrecioCantidadEditor";
import { getPreciosCantidadByCatalogoAction } from "@/features/admin/products/actions/producto-precio-cantidad.action";

import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCatalogPage({
  params,
}: Props) {
  const { id } = await params;

  const result =
    await getCatalogByIdAction(id);

  if (
    !result.success ||
    !result.catalog
  ) {
    notFound();
  }

  // Para catálogos coffee_break, cargar productos y sus tiers de precios
  let coffeeBreakProductos: Array<{
    id: string;
    nombre: string;
    tiersIniciales: Array<{ cantidad_minima: number; precio: number }>;
  }> = [];

  if (result.catalog.tipo === "coffee_break") {
    const supabase = createAdminClient();

    const { data: productos } = await supabase
      .from("productos")
      .select("id, nombre")
      .eq("catalogo_id", id)
      .eq("estado", "publicado")
      .order("created_at", { ascending: false });

    const tiersByProduct = await getPreciosCantidadByCatalogoAction(id);

    coffeeBreakProductos = (productos ?? []).map((p) => ({
      id: p.id as string,
      nombre: p.nombre as string,
      tiersIniciales: (tiersByProduct[p.id as string] ?? []).map((t) => ({
        cantidad_minima: t.cantidad_minima,
        precio: t.precio,
      })),
    }));
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Editar catálogo"
        description="Actualiza la información del catálogo."
        actions={
          <Button
            asChild
            variant="outline"
          >
            <Link href="/admin/catalogos">
              Volver
            </Link>
          </Button>
        }
      />

      <Card className="p-8">
        <CatalogForm
          catalog={result.catalog}
        />
      </Card>

      {result.catalog.tipo === "celebration" && (
        <Card className="p-8">
          <CatalogImagesManager
            catalogoId={result.catalog.id}
            enablePortada
          />
        </Card>
      )}

      {result.catalog.tipo === "catering_gallery" && (
        <Card className="p-8">
          <CatalogImagesManager
            catalogoId={result.catalog.id}
            enableLabels
          />
        </Card>
      )}

      {result.catalog.tipo === "coffee_break" && coffeeBreakProductos.length > 0 && (
        <Card className="p-8">
          <h3 className="mb-1 text-lg font-semibold text-kc-charcoal">
            Precios por cantidad
          </h3>
          <p className="mb-6 text-sm text-kc-mocha">
            Define los tiers de precios para cada producto. Ej: 25 und → S/. 15.00, 50 und → S/. 12.00, 100 und → S/. 10.00.
          </p>
          <div className="space-y-4">
            {coffeeBreakProductos.map((producto) => (
              <PrecioCantidadEditor
                key={producto.id}
                productoId={producto.id}
                productoNombre={producto.nombre}
                tiersIniciales={producto.tiersIniciales.map((t) => ({
                  id: "",
                  producto_id: producto.id,
                  cantidad_minima: t.cantidad_minima,
                  precio: t.precio,
                  orden: 0,
                }))}
              />
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}