import type { AdminProjectStatus } from "../types/project.type";

export const PROJECT_STATUS: Record<string, AdminProjectStatus> = {
  PENDING: "pendiente",
  QUOTE_SENT: "cotizacion_enviada",
  APPROVED: "aprobado",
  DELIVERED: "entregado",
  CANCELLED: "anulado",
  FINALIZED: "finalizado",
};

export const PROJECT_STATUS_LABEL: Record<AdminProjectStatus, string> = {
  pendiente: "Pendiente",
  cotizacion_enviada: "Cotización enviada",
  aprobado: "Aprobado",
  entregado: "Entregado",
  anulado: "Anulado",
  finalizado: "Finalizado",
};

export function getProjectStatusColor(status: AdminProjectStatus): string {
  switch (status) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-700";
    case "cotizacion_enviada":
      return "bg-blue-100 text-blue-700";
    case "aprobado":
      return "bg-green-100 text-green-700";
    case "entregado":
      return "bg-purple-100 text-purple-700";
    case "anulado":
      return "bg-red-100 text-red-700";
    case "finalizado":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
