import Card from "@/components/ui/Card";

import {
  getProjectStatusColor,
  PROJECT_STATUS_LABEL,
} from "../../constants/project-status";

import type { AdminProject } from "../../types/project.type";

type Props = {
  project: AdminProject;
};

export default function ProjectInfoCard({ project }: Props) {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold">
        Información del proyecto
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Código</p>
          <p className="font-mono">#{project.id.slice(0, 8)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Fecha de solicitud</p>
          <p>{new Date(project.created_at).toLocaleString("es-PE")}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Estado</p>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getProjectStatusColor(project.estado)}`}
          >
            {PROJECT_STATUS_LABEL[project.estado] ?? project.estado}
          </span>
        </div>

        <div>
          <p className="text-sm text-gray-500">Personas</p>
          <p>{project.personas}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Presupuesto</p>
          <p className="font-semibold">
            {project.presupuesto != null
              ? `S/. ${project.presupuesto.toFixed(2)}`
              : "No especificado"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Fecha del evento</p>
          <p>{project.fecha_evento ?? "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Hora del evento</p>
          <p>{project.hora_evento ?? "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Tipo de entrega</p>
          <p>
            {project.tipo_entrega === "delivery" ? "Delivery" : "Recojo en tienda"}
          </p>
        </div>

        {project.direccion && (
          <div>
            <p className="text-sm text-gray-500">Dirección</p>
            <p>{project.direccion}</p>
          </div>
        )}

        {project.referencia && (
          <div>
            <p className="text-sm text-gray-500">Referencia</p>
            <p>{project.referencia}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
