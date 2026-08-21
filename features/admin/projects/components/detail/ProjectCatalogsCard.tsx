import Card from "@/components/ui/Card";

import type { AdminProjectCatalog } from "../../types/project.type";

type Props = {
  catalogs: AdminProjectCatalog[];
};

export default function ProjectCatalogsCard({ catalogs }: Props) {
  const flavors = catalogs.filter((c) => c.tipo === "flavor");
  const fillings = catalogs.filter((c) => c.tipo === "filling");
  const frostings = catalogs.filter((c) => c.tipo === "frosting");
  const celebrations = catalogs.filter((c) => c.tipo === "celebration");

  function renderSection(title: string, items: AdminProjectCatalog[]) {
    if (items.length === 0) return null;

    return (
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className="rounded-full bg-[#D8B07A]/10 px-3 py-1 text-sm font-medium text-[#D8B07A]"
            >
              {item.nombre}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold">
        Personalización
      </h2>

      <div className="space-y-5">
        {renderSection("Celebración", celebrations)}
        {renderSection("Sabores", flavors)}
        {renderSection("Rellenos", fillings)}
        {renderSection("Coberturas", frostings)}

        {catalogs.length === 0 && (
          <p className="text-gray-400">Sin selecciones</p>
        )}
      </div>
    </Card>
  );
}
