"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import DataTable from "@/components/datatable/DataTable";
import DataTableEmpty from "@/components/datatable/DataTableEmpty";
import DataTableHeader from "@/components/datatable/DataTableHeader";

import ProjectStatusSelect from "./ProjectStatusSelect";
import EditablePresupuesto from "./EditablePresupuesto";

import type { AdminProject } from "../types/project.type";

type ProjectsTableProps = {
  projects: AdminProject[];
};

export default function ProjectsTable({
  projects,
}: ProjectsTableProps) {
  const router = useRouter();
  const [pending, startTransition] =
    useTransition();

  function handleDelete(id: string) {
    if (
      !confirm(
        "¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await fetch(
        `/api/admin/proyectos/${id}`,
        { method: "DELETE" }
      );

      const result =
        await res.json();

      if (!result.success) {
        toast.error(
          result.message ??
            "No se pudo eliminar el proyecto."
        );

        return;
      }

      toast.success(
        "Proyecto eliminado."
      );
      router.refresh();
    });
  }

  return (
    <DataTable>
      <DataTableHeader>
        <tr>
          <th className="px-6 py-4 text-left">
            Cliente
          </th>

          <th className="px-6 py-4 text-left">
            Descripción
          </th>

          <th className="px-6 py-4 text-center">
            Personas
          </th>

          <th className="px-6 py-4 text-right">
            Presupuesto
          </th>

          <th className="px-6 py-4 text-left">
            Estado
          </th>

          <th className="px-6 py-4 text-left">
            Fecha
          </th>

          <th className="px-6 py-4 text-center">
            Acciones
          </th>
        </tr>
      </DataTableHeader>

      <tbody>
        {projects.map((project) => (
          <tr
            key={project.id}
            className="border-b transition hover:bg-gray-50"
          >
            <td className="px-6 py-4 font-medium">
              {project.cliente?.nombre ?? "-"}
            </td>

            <td className="px-6 py-4">
              <div className="max-w-md truncate">
                {project.descripcion}
              </div>
            </td>

            <td className="px-6 py-4 text-center">
              {project.personas}
            </td>

            <td className="px-6 py-4">
              <EditablePresupuesto
                projectId={project.id}
                value={project.presupuesto}
              />
            </td>

            <td className="px-6 py-4">
              <ProjectStatusSelect
                projectId={project.id}
                value={project.estado}
              />
            </td>

            <td className="px-6 py-4">
              {project.fecha_evento ?? "-"}
            </td>

            <td className="px-6 py-4">
              <div className="flex items-center justify-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link
                    href={`/admin/proyectos/${project.id}`}
                  >
                    Ver detalle
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDelete(
                      project.id
                    )
                  }
                  disabled={pending}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </Button>
              </div>
            </td>
          </tr>
        ))}

        {projects.length === 0 && (
          <DataTableEmpty
            colSpan={7}
            title="No existen proyectos"
            description="Todavía no hay proyectos personalizados registrados."
          />
        )}
      </tbody>
    </DataTable>
  );
}
