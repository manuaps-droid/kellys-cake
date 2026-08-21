import { getCatalogosAction } from "@/features/admin/personalization/actions/get-catalogs.action";

import CatalogToolbar from "@/features/admin/personalization/components/catalog-tree/CatalogToolbar";
import CatalogTree from "@/features/admin/personalization/components/catalog-tree/CatalogTree";

export default async function CatalogosPage() {
  const catalogs = await getCatalogosAction();

  return (
    <section className="space-y-8">
      <CatalogToolbar />

      {catalogs.length === 0 ? (
        <div className="rounded-2xl border border-kc-sand/50 bg-white p-12 text-center shadow-sm">
          <p className="text-kc-mocha">
            No hay catálogos creados. Crea el primero.
          </p>
        </div>
      ) : (
        <CatalogTree catalogs={catalogs} />
      )}
    </section>
  );
}
