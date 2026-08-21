import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

import { getProjectsAdminService } from "@/features/admin/projects/services/_admin/get-projects.admin.service";
import ProjectsTable from "@/features/admin/projects/components/ProjectsTable";

type Props = {
  searchParams: Promise<{
    estado?: string;
  }>;
};

const ESTADO_TABS = [
  { key: "all", label: "Activos" },
  { key: "pendiente", label: "Pendientes" },
  { key: "cotizacion_enviada", label: "Cotización enviada" },
  { key: "aprobado", label: "Aprobados" },
  { key: "entregado", label: "Entregados" },
  { key: "anulado", label: "Anulados" },
  { key: "finalizado", label: "Finalizados" },
];

export default async function AdminProjectsPage({
  searchParams,
}: Props) {
  const filters = await searchParams;
  const estadoFilter = filters.estado ?? "all";

  try {
    const projects =
      await getProjectsAdminService(estadoFilter);

    return (
      <section className="space-y-8">
        <PageHeader
          title="Proyectos personalizados"
          description="Gestiona todas las solicitudes de personalización."
        />

        <div className="flex flex-wrap items-center gap-2">
          {ESTADO_TABS.map((tab) => {
            const active = estadoFilter === tab.key;
            return (
              <a
                key={tab.key}
                href={tab.key === "all" ? "/admin/proyectos" : `/admin/proyectos?estado=${tab.key}`}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-cake-gold bg-cake-gold text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-cake-gold hover:text-cake-gold"
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </div>

        <ProjectsTable
          projects={projects}
        />
      </section>
    );
  } catch (e) {
    console.error("AdminProjectsPage error:", e, JSON.stringify(e));

    return (
      <EmptyState
        title="Error"
        description={
          e instanceof Error
            ? e.message
            : typeof e === "object" && e !== null
              ? JSON.stringify(e)
              : "No se pudieron cargar los proyectos."
        }
      />
    );
  }
}
