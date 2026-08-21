import CatalogGroup from "./CatalogGroup";

import type { AdminCatalog } from "../../types/catalog.type";

type Props = {
  catalogs: AdminCatalog[];
};

export default function CatalogTree({
  catalogs,
}: Props) {
  const groups = Object.groupBy(
    catalogs,
    (catalog) => catalog.tipo
  );

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(
        ([tipo, items]) => (
          <CatalogGroup
            key={tipo}
            tipo={tipo}
            items={items ?? []}
          />
        )
      )}
    </div>
  );
}