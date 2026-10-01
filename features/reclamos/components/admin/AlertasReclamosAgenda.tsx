import Link from "next/link";
import { AlertTriangle, ArrowRight, BellRing } from "lucide-react";

export type AlertaReclamo = {
  id: string;
  numero: string;
  tipo: string;
  nombres: string;
  apellidos: string;
  limite: Date;
  diasRestantes: number;
  nivel: "info" | "urgente" | "vencido";
};

/**
 * Panel de alertas del Libro de Reclamaciones para la Agenda de
 * Producción. La intensidad aumenta cuando faltan ≤5 días hábiles
 * para el vencimiento legal (15 días hábiles) y permanece activa
 * hasta que la solicitud es respondida.
 */
export default function AlertasReclamosAgenda({
  alertas,
}: {
  alertas: AlertaReclamo[];
}) {
  if (alertas.length === 0) return null;

  const criticos = alertas.filter(
    (a) => a.nivel === "urgente" || a.nivel === "vencido"
  );
  const info = alertas.filter((a) => a.nivel === "info");

  return (
    <div className="space-y-4">
      {/* ALERTAS INTENSAS: vencidas o por vencer (≤5 días hábiles) */}
      {criticos.length > 0 && (
        <section
          role="alert"
          className="relative overflow-hidden rounded-xl border-2 border-red-500 bg-gradient-to-r from-red-50 to-white p-5 shadow-[0_0_25px_-5px_rgba(239,68,68,0.55)]"
        >
          {/* Halo pulsante */}
          <div className="pointer-events-none absolute inset-0 animate-pulse bg-red-500/5" />

          <div className="relative flex items-start gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 animate-pulse items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40">
              {criticos[0].nivel === "vencido" ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <BellRing className="h-6 w-6" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold tracking-wide text-red-700 uppercase">
                  {criticos.some((a) => a.nivel === "vencido")
                    ? "¡Plazo legal vencido!"
                    : `Atención urgente: ${criticos.length} ${
                        criticos.length === 1
                          ? "reclamo por vencer"
                          : "reclamos por vencer"
                      }`}
                </h2>
                {criticos.some((a) => a.nivel === "vencido") && (
                  <span className="animate-bounce rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    Requiere acción inmediata
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-red-600">
                Faltan 5 días hábiles o menos (o ya venció el plazo) para
                responder estas solicitudes del Libro de Reclamaciones.
              </p>

              <ul className="mt-3 space-y-2">
                {criticos.map((a) => (
                  <li key={a.id}>
                    <Link
                      href="/admin/reclamos"
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition hover:bg-red-50 ${
                        a.nivel === "vencido"
                          ? "border-red-400 bg-red-100/70"
                          : "border-red-200 bg-white"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm">
                        <span className="font-mono font-bold text-red-700">
                          {a.numero}
                        </span>
                        <span className="truncate text-gray-700">
                          {a.nombres} {a.apellidos}
                        </span>
                        <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 uppercase sm:inline">
                          {a.tipo}
                        </span>
                      </span>
                      <span
                        className={`flex-shrink-0 text-xs font-bold uppercase ${
                          a.nivel === "vencido"
                            ? "text-red-700"
                            : "text-orange-600"
                        }`}
                      >
                        {a.nivel === "vencido"
                          ? "VENCIDO"
                          : `${a.diasRestantes} d háb.`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href="/admin/reclamos"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-red-700 underline-offset-2 hover:underline"
              >
                Ir al Libro de Reclamaciones a responder
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* AVISO SUAVE: pendientes con plazo holgado */}
      {info.length > 0 && (
        <Link
          href="/admin/reclamos"
          className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 transition hover:border-blue-400"
        >
          <p className="text-sm text-blue-800">
            <strong>
              {info.length}{" "}
              {info.length === 1
                ? "solicitud pendiente"
                : "solicitudes pendientes"}
            </strong>{" "}
            en el Libro de Reclamaciones, con plazo vigente.
          </p>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-blue-500" />
        </Link>
      )}
    </div>
  );
}
