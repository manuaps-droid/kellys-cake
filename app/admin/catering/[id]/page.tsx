import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import PageHeader from "@/components/common/PageHeader";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  detectarProductos,
  parseDescripcion,
  estiloSeccion,
} from "@/features/catering/lib/descripcion-sections";

import type { CotizacionItem } from "@/features/cotizaciones/types/cotizacion.types";
import { getProjectByIdAdminRepository } from "@/features/admin/projects/repositories/_admin/get-project-by-id.admin.repository";

type CateringRow = {
  id: string;
  tipo_evento: string | null;
  nombre: string | null;
  email: string | null;
  celular: string | null;
  fecha_evento: string | null;
  num_invitados: number | null;
  descripcion: string | null;
  presupuesto: string | null;
  estado: string | null;
  notas_admin: string | null;
  proyecto_id: string | null;
  created_at: string | null;
};

type PedidoRow = {
  id: string;
  numero: number | null;
  total: number;
  subtotal: number;
  envio: number;
  estado: string | null;
  estado_pago: string | null;
  tipo_pago: string | null;
  monto_pagado: number | null;
  created_at: string | null;
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  cotizado: "Cotizado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
};

const ESTADO_STYLES: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  cotizado: "bg-blue-50 text-blue-700 border-blue-200",
  aceptado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rechazado: "bg-red-50 text-red-700 border-red-200",
};

const TIPO_LABELS: Record<string, string> = {
  cumpleanos: "🎂 Cumpleaños",
  corporativo: "🏢 Corporativo",
  otro: "🎉 Otro",
};

function fmtSoles(n: number): string {
  return n.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });
}

function detallePastel(
  item: CotizacionItem
): { label: string; value: string }[] {
  const lineas: { label: string; value: string }[] = [];

  if (item.sabores) lineas.push({ label: "Sabores", value: item.sabores });
  if (item.rellenos) lineas.push({ label: "Rellenos", value: item.rellenos });
  if (item.decoracion) lineas.push({ label: "Decoración", value: item.decoracion });
  if (item.observaciones) lineas.push({ label: "Observaciones", value: item.observaciones });

  if (lineas.length === 0) {
    for (const l of (item.descripcion ?? "").split("\n")) {
      const i = l.indexOf(":");
      if (i > 0) {
        lineas.push({ label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() });
      }
    }
  }

  return lineas;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminCateringDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("cotizaciones_catering")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const { data: cotizacion } = await supabase
    .from("cotizaciones")
    .select("id, numero, token, items")
    .eq("catering_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cotizacionItems = (cotizacion?.items ?? []) as unknown as CotizacionItem[];
  const cotizacionItemsSubtotal = cotizacionItems.reduce(
    (sum, item) => sum + item.precio_unitario * item.cantidad,
    0
  );

  const { data: pedidos } = await supabase
    .from("cotizaciones")
    .select("pedidos(*)")
    .eq("catering_id", id);

  const ordenes = (pedidos ?? [])
    .flatMap((c) => (c.pedidos ?? []) as unknown as PedidoRow[])
    .sort((a, b) =>
      new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
    );

  const row = data as unknown as CateringRow;
  const productos = detectarProductos(row.descripcion);
  const secciones = row.descripcion ? parseDescripcion(row.descripcion) : [];
  const EstadoStyle = ESTADO_STYLES[row.estado ?? "pendiente"] ?? ESTADO_STYLES.pendiente;

  const proyecto = row.proyecto_id
    ? await getProjectByIdAdminRepository(row.proyecto_id)
    : null;

  return (
    <section className="space-y-8">
      <PageHeader
        title={`Cotización ${row.nombre ?? "#" + row.id.slice(0, 8)}`}
        description="Solicitud completa de cotización de catering."
        actions={
          <div className="flex flex-wrap gap-3">
            {cotizacion?.token && (
              <a
                href={`/cotizacion/${cotizacion.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-cake-gold px-5 py-3 font-medium text-cake-gold transition hover:bg-cake-gold hover:text-white"
              >
                Ver cotización pública
                <span aria-hidden="true">↗</span>
              </a>
            )}
            <Link
              href={`/admin/cotizaciones/nuevo?cateringId=${id}`}
              className="rounded-xl bg-cake-gold px-5 py-3 font-semibold text-white transition hover:bg-[#b8860b]"
            >
              {cotizacion ? "Editar cotización" : "Generar cotización"}
            </Link>
            <Link
              href="/admin/catering"
              className="rounded-xl border border-gray-300 px-5 py-3 font-medium transition hover:bg-gray-100"
            >
              ← Volver a catering
            </Link>
          </div>
        }
      />

      {/* Estado */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${
            EstadoStyle
          }`}
        >
          {ESTADO_LABELS[row.estado ?? "pendiente"] ?? row.estado}
        </span>
        <span className="text-sm text-gray-500">
          Recibido el{" "}
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </span>
      </div>

      {/* Datos del cliente y del evento */}
      <div className="rounded-3xl border bg-white p-8">
        <h2 className="text-lg font-semibold">Datos de la solicitud</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cliente</p>
            <p className="mt-0.5 font-semibold text-cake-espresso">{row.nombre ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Correo</p>
            <p className="mt-0.5 break-words text-gray-700">{row.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Celular</p>
            <p className="mt-0.5 text-gray-700">{row.celular}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tipo de evento
            </p>
            <p className="mt-0.5 text-gray-700">
              {row.tipo_evento ? TIPO_LABELS[row.tipo_evento] ?? row.tipo_evento : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fecha del evento
            </p>
            <p className="mt-0.5 text-gray-700">
              {row.fecha_evento
                ? new Date(row.fecha_evento).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Invitados</p>
            <p className="mt-0.5 text-gray-700">{row.num_invitados ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Presupuesto</p>
            <p className="mt-0.5 text-gray-700">{row.presupuesto ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Productos solicitados */}
      <div className="rounded-3xl border bg-white p-8">
        <h2 className="text-lg font-semibold">Productos solicitados</h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {productos.pastel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
              🍰 Pastel personalizado
            </span>
          )}
          {productos.extras && (
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1.5 text-sm font-medium text-pink-700">
              🧁 Cupcakes / Cake pops / Galletas
            </span>
          )}
          {productos.coffeeBreak && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
              🥐 Coffee break
            </span>
          )}
          {!productos.pastel && !productos.extras && !productos.coffeeBreak && (
            <span className="text-sm text-gray-400">Sin productos adicionales.</span>
          )}
        </div>

        {proyecto && (
          <div className="mt-6 rounded-2xl border border-[#D8B07A]/30 bg-[#FFF5E8] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-cake-gold">
                🍰 Pastel personalizado vinculado
              </p>
              <a
                href={`/admin/proyectos/${proyecto.id}`}
                className="text-xs font-medium text-cake-gold underline hover:text-[#b8860b]"
              >
                Ver proyecto completo →
              </a>
            </div>

            {proyecto.imagenes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {proyecto.imagenes.map((img) => (
                  <div
                    key={img.id}
                    className="relative h-44 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <Image
                      src={img.url ?? ""}
                      alt={img.nombre ?? "Foto del pastel"}
                      fill
                      sizes="176px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {proyecto.catalogos.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { tipo: "celebration", titulo: "Celebración" },
                  { tipo: "flavor", titulo: "Sabores" },
                  { tipo: "filling", titulo: "Rellenos" },
                  { tipo: "frosting", titulo: "Coberturas" },
                ].map((grupo) => {
                  const items = proyecto.catalogos.filter(
                    (c) => c.tipo === grupo.tipo
                  );
                  if (items.length === 0) return null;

                  return (
                    <div
                      key={grupo.tipo}
                      className="rounded-xl bg-white p-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {grupo.titulo}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {items.map((item) => (
                          <span
                            key={item.id}
                            className="rounded-full bg-[#D8B07A]/10 px-2.5 py-1 text-xs font-medium text-[#D8B07A]"
                          >
                            {item.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {proyecto.descripcion && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {proyecto.descripcion}
              </p>
            )}

            {proyecto.alergias && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                ⚠️ Alergias / Restricciones: {proyecto.alergias}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Items de la cotización */}
      {cotizacionItems.length > 0 && (
        <div className="rounded-3xl border bg-white p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Detalle de la cotización</h2>
            {cotizacion?.token && (
              <a
                href={`/cotizacion/${cotizacion.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-cake-gold hover:text-[#b8860b]"
              >
                Ver cotización pública ↗
              </a>
            )}
          </div>

          <div className="mt-4 space-y-4">
            {cotizacionItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-5 sm:flex-row"
              >
                <div className="shrink-0">
                  {item.imagen ? (
                    <div className="relative h-64 w-64 overflow-hidden rounded-xl border bg-gray-100">
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        sizes="256px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-3xl">
                      🍰
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-cake-espresso">
                        {item.nombre}
                      </h3>
                      {item.cantidad > 1 && (
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.cantidad}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cake-espresso">
                        S/ {fmtSoles(item.precio_unitario * item.cantidad)}
                      </p>
                      {item.cantidad > 1 && (
                        <p className="text-xs text-gray-500">
                          S/ {fmtSoles(item.precio_unitario)} c/u
                        </p>
                      )}
                    </div>
                  </div>

                  {item.tipo === "pastel" ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {detallePastel(item).map((d) => (
                        <div
                          key={d.label}
                          className="rounded-lg bg-gray-50 px-3 py-2"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {d.label}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-800">
                            {d.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    item.descripcion && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {item.descripcion}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Subtotal:{" "}
                <span className="text-base font-bold text-cake-espresso">
                  S/ {fmtSoles(cotizacionItemsSubtotal)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detalle completo por secciones */}
      {row.descripcion && (
        <div className="rounded-3xl border bg-white p-8">
          <h2 className="text-lg font-semibold">Detalle de la solicitud</h2>
          <div className="mt-4 space-y-3">
            {secciones.map((sec, i) => (
              <div key={i} className={`rounded-xl p-4 text-sm leading-7 ${estiloSeccion(sec.titulo)}`}>
                {sec.titulo ? <p className="mb-1 font-semibold">{sec.titulo}</p> : null}
                <p className="whitespace-pre-wrap">{sec.contenido}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos vinculados */}
      <div className="rounded-3xl border bg-white p-8">
        <h2 className="text-lg font-semibold">Pedidos</h2>
        {ordenes.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">
            Aún no hay pedidos vinculados a esta solicitud.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {ordenes.map((orden) => (
              <div
                key={orden.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 p-5"
              >
                <div>
                  <a
                    href={`/admin/pedidos/${orden.id}`}
                    className="text-sm font-semibold text-cake-gold transition hover:text-[#b8860b]"
                  >
                    Pedido #{orden.numero ?? orden.id.slice(0, 8)}
                  </a>
                  <div className="mt-1 text-xs text-gray-500">
                    {orden.created_at
                      ? new Date(orden.created_at).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                    {orden.estado_pago === "pagado" ? (
                      <span className="ml-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Pagado
                      </span>
                    ) : (
                      <span className="ml-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Pago pendiente
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-cake-espresso">
                    S/ {Number(orden.total).toFixed(2)}
                  </p>
                  <a
                    href={`/admin/pedidos/${orden.id}`}
                    className="mt-1 inline-block text-xs font-medium text-cake-gold hover:text-[#b8860b]"
                  >
                    Ver detalle ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {row.notas_admin && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <h2 className="text-lg font-semibold text-amber-800">Notas internas</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-amber-900">{row.notas_admin}</p>
        </div>
      )}
    </section>
  );
}
