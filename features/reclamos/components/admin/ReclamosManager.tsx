"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { respondReclamoAction } from "@/features/reclamos/actions/respond-reclamo.action";
import { generarBorradorAction } from "@/features/reclamos/actions/generar-borrador.action";
import {
  evaluarPlazo,
  type EstadoPlazo,
} from "@/features/reclamos/utils/plazo.utils";

export type ReclamoAdmin = {
  id: string;
  numero: string;
  tipo: string;
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  direccion: string;
  email: string;
  telefono: string;
  producto_servicio: string;
  monto_reclamado: number;
  fecha_compra: string | null;
  descripcion: string;
  peticion: string;
  estado: string;
  respuesta: string | null;
  respondido_at: string | null;
  created_at: string;
};

const ESTADOS_FILTRO = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "en_proceso", label: "En proceso" },
  { value: "resuelto", label: "Resueltas" },
] as const;

const badgeEstado: Record<string, string> = {
  pendiente: "bg-red-50 text-red-600",
  en_proceso: "bg-amber-50 text-amber-700",
  resuelto: "bg-emerald-50 text-emerald-700",
};

const labelEstado: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelto: "Resuelta",
};

function PlazoBadge({ reclamo }: { reclamo: ReclamoAdmin }) {
  const { estado, limite } = evaluarPlazo(
    reclamo.created_at,
    reclamo.respondido_at
  );

  if (estado === "resuelto") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Respondida
      </span>
    );
  }

  if (estado === "vencido") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
        <AlertTriangle className="h-3.5 w-3.5" />
        Plazo vencido ({limite.toLocaleDateString("es-PE")})
      </span>
    );
  }

  const diasRestantes = Math.max(
    0,
    Math.ceil((limite.getTime() - Date.now()) / 86400000)
  );

  return (
    <span className="inline-flex items-center gap-1 text-xs text-kc-mocha">
      <Clock className="h-3.5 w-3.5" />
      Vence el {limite.toLocaleDateString("es-PE")} ({diasRestantes} d)
    </span>
  );
}

type Props = {
  reclamos: ReclamoAdmin[];
};

export default function ReclamosManager({ reclamos }: Props) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<string>("todas");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [borradoresPendientes, setBorradoresPendientes] = useState<
    Record<string, boolean>
  >({});
  const [generandoId, setGenerandoId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtrados = useMemo(
    () =>
      filtro === "todas"
        ? reclamos
        : reclamos.filter((r) => r.estado === filtro),
    [reclamos, filtro]
  );

  const conteoPorEstado = useMemo(() => {
    const c: Record<string, number> = { todas: reclamos.length };
    for (const r of reclamos) {
      c[r.estado] = (c[r.estado] ?? 0) + 1;
    }
    return c;
  }, [reclamos]);

  function generarBorrador(reclamo: ReclamoAdmin) {
    setGenerandoId(reclamo.id);
    startTransition(async () => {
      const result = await generarBorradorAction({
        id: reclamo.id,
        numero: reclamo.numero,
        tipo: reclamo.tipo,
        nombres: reclamo.nombres,
        producto_servicio: reclamo.producto_servicio,
        monto_reclamado: reclamo.monto_reclamado,
        fecha_registro: reclamo.created_at,
        descripcion: reclamo.descripcion,
        peticion: reclamo.peticion,
      });
      setGenerandoId(null);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setRespuestas((prev) => ({ ...prev, [reclamo.id]: result.borrador }));
      setBorradoresPendientes((prev) => ({ ...prev, [reclamo.id]: true }));
      toast.success(
        result.modo === "ia"
          ? "Borrador generado con el asistente IA. Revísalo y edítalo antes de enviar."
          : "Borrador generado con plantilla. Revísalo y edítalo antes de enviar."
      );
    });
  }

  function responder(reclamo: ReclamoAdmin, estado: "en_proceso" | "resuelto") {
    const respuesta = respuestas[reclamo.id] ?? reclamo.respuesta ?? "";

    setPendingId(reclamo.id);
    startTransition(async () => {
      const result = await respondReclamoAction({
        id: reclamo.id,
        respuesta,
        estado,
      });
      setPendingId(null);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        estado === "resuelto"
          ? `Solicitud ${reclamo.numero} marcada como resuelta.`
          : `Respuesta guardada en proceso para ${reclamo.numero}.`
      );
      setBorradoresPendientes((prev) => ({ ...prev, [reclamo.id]: false }));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {ESTADOS_FILTRO.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFiltro(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filtro === f.value
                ? "bg-[#2C1810] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border"
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">
              {conteoPorEstado[f.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-gray-500">
          No hay solicitudes en este estado.
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map((r) => {
            const abierto = expandido === r.id;
            const respuestaActual = respuestas[r.id] ?? r.respuesta ?? "";

            return (
              <div
                key={r.id}
                className="overflow-hidden rounded-2xl border bg-white"
              >
                {/* Cabecera de la tarjeta */}
                <button
                  type="button"
                  onClick={() => setExpandido(abierto ? null : r.id)}
                  className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors hover:bg-gray-50/70"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {r.numero}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.tipo === "reclamo"
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-sky-50 text-sky-600"
                        }`}
                      >
                        {r.tipo === "reclamo" ? "Reclamo" : "Queja"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          badgeEstado[r.estado]
                        }`}
                      >
                        {labelEstado[r.estado]}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-semibold text-gray-800">
                      {r.nombres} {r.apellidos}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-gray-500">
                      {r.producto_servicio} · S/{" "}
                      {Number(r.monto_reclamado).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-4">
                    <PlazoBadge reclamo={r} />
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                        abierto ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Detalle expandible */}
                {abierto && (
                  <div className="border-t px-6 py-6">
                    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {/* Datos del consumidor */}
                      <section>
                        <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                          Consumidor
                        </h4>
                        <dl className="mt-2 space-y-1 text-sm text-gray-600">
                          <div>
                            Documento:{" "}
                            <strong className="text-gray-900 uppercase">
                              {r.tipo_documento} {r.numero_documento}
                            </strong>
                          </div>
                          <div>
                            Correo:{" "}
                            <a
                              href={`mailto:${r.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {r.email}
                            </a>
                          </div>
                          <div>Teléfono: {r.telefono}</div>
                          <div>Domicilio: {r.direccion}</div>
                        </dl>
                      </section>

                      {/* Datos de la compra */}
                      <section>
                        <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                          Compra
                        </h4>
                        <dl className="mt-2 space-y-1 text-sm text-gray-600">
                          <div>Producto: {r.producto_servicio}</div>
                          <div>
                            Monto reclamado:{" "}
                            <strong className="text-gray-900">
                              S/ {Number(r.monto_reclamado).toFixed(2)}
                            </strong>
                          </div>
                          {r.fecha_compra && (
                            <div>
                              Fecha de compra:{" "}
                              {new Date(r.fecha_compra).toLocaleDateString(
                                "es-PE"
                              )}
                            </div>
                          )}
                          <div>
                            Registrado:{" "}
                            {new Date(r.created_at).toLocaleString("es-PE")}
                          </div>
                        </dl>
                      </section>

                      {/* Descripción y petición */}
                      <section className="sm:col-span-2">
                        <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                          Descripción del hecho
                        </h4>
                        <p className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                          {r.descripcion}
                        </p>
                      </section>
                      <section className="sm:col-span-2">
                        <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                          Petición del consumidor
                        </h4>
                        <p className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                          {r.peticion}
                        </p>
                      </section>

                      {/* Respuesta del admin */}
                      <section className="sm:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                            Respuesta al consumidor
                          </h4>
                          <button
                            type="button"
                            onClick={() => generarBorrador(r)}
                            disabled={generandoId === r.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-semibold text-purple-700 transition hover:border-purple-400 hover:bg-purple-100 disabled:opacity-50"
                          >
                            {generandoId === r.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                            Generar borrador con asistente
                          </button>
                        </div>

                        {borradoresPendientes[r.id] && (
                          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3" />
                            Borrador pendiente de aprobación — revisa, edita y
                            envía cuando esté conforme.
                          </p>
                        )}

                        <textarea
                          rows={4}
                          value={respuestaActual}
                          onChange={(e) =>
                            setRespuestas((prev) => ({
                              ...prev,
                              [r.id]: e.target.value,
                            }))
                          }
                          placeholder="Redacta la respuesta que se enviará al correo del consumidor…"
                          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <Button
                            type="button"
                            disabled={pendingId === r.id}
                            onClick={() => responder(r, "resuelto")}
                            className="rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
                          >
                            {pendingId === r.id && (
                              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                            )}
                            Responder y marcar resuelta
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={pendingId === r.id}
                            onClick={() => responder(r, "en_proceso")}
                            className="rounded-full"
                          >
                            Guardar en proceso
                          </Button>
                          {r.respondido_at && (
                            <span className="text-xs text-gray-400">
                              Respondida el{" "}
                              {new Date(r.respondido_at).toLocaleString(
                                "es-PE"
                              )}
                            </span>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
