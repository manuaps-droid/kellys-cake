import Link from "next/link";
import Image from "next/image";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

import {
  getAgendaOrdersService,
} from "@/features/admin/agenda/services/get-agenda.service";

import { ORDER_STATUS_LABEL } from "@/features/orders/constants/order-status";

import AlertasReclamosAgenda, {
  type AlertaReclamo,
} from "@/features/reclamos/components/admin/AlertasReclamosAgenda";
import DeleteOrderButton from "@/features/admin/orders/components/DeleteOrderButton";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  diasHabilesRestantes,
  evaluarPlazo,
} from "@/features/reclamos/utils/plazo.utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    semana?: string;
  }>;
};

function getWeekOffset(searchParams: Awaited<Props["searchParams"]>) {
  const parsed = Number(searchParams.semana);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

function startOfWeek(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d;
}

function formatDayLabel(date: Date): string {
  const hoy = new Date();
  const mismoDia =
    date.getUTCFullYear() === hoy.getUTCFullYear() &&
    date.getUTCMonth() === hoy.getUTCMonth() &&
    date.getUTCDate() === hoy.getUTCDate();

  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(date) + (mismoDia ? " · Hoy" : "");
}

function normalizeDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

const TIPO_ENTREGA_LABEL: Record<string, string> = {
  delivery: "Delivery",
  recojo: "Recojo en tienda",
};

const STATUS_BADGE: Record<string, string> = {
  confirmado: "bg-blue-100 text-blue-700",
  produccion: "bg-yellow-100 text-yellow-700",
  listo: "bg-purple-100 text-purple-700",
};

export default async function AdminAgendaPage({
  searchParams,
}: Props) {
  const filters = await searchParams;
  const weekOffset = getWeekOffset(filters);

  // Reclamos pendientes para las alertas
  const supabaseAdmin = createAdminClient();
  const { data: reclamosPendientes } = await supabaseAdmin
    .from("libro_reclamaciones")
    .select("id, numero, tipo, nombres, apellidos, created_at, respondido_at")
    .neq("estado", "resuelto");

  const ahora = new Date();
  const alertasReclamos: AlertaReclamo[] = (reclamosPendientes ?? []).map(
    (r) => {
      const { limite } = evaluarPlazo(r.created_at, r.respondido_at, ahora);
      const diasRestantes = diasHabilesRestantes(limite, ahora);

      return {
        id: r.id,
        numero: r.numero,
        tipo: r.tipo,
        nombres: r.nombres,
        apellidos: r.apellidos,
        limite,
        diasRestantes,
        nivel:
          r.respondido_at === null && ahora > limite
            ? ("vencido" as const)
            : diasRestantes <= 5
              ? ("urgente" as const)
              : ("info" as const),
      };
    }
  );
  alertasReclamos.sort((a, b) => a.limite.getTime() - b.limite.getTime());

  const { programados, sinFecha } =
    await getAgendaOrdersService();

  const monday = startOfWeek(new Date());
  monday.setUTCDate(monday.getUTCDate() + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d;
  });

  const dayKeys = days.map((d) => d.toISOString().slice(0, 10));
  const ordersByDay = new Map<string, typeof programados>();

  for (const dayKey of dayKeys) {
    ordersByDay.set(dayKey, []);
  }

  for (const order of programados) {
    const key = order.fecha_entrega
      ? normalizeDateKey(order.fecha_entrega)
      : null;
    if (key && ordersByDay.has(key)) {
      ordersByDay.get(key)?.push(order);
    }
  }

  const previousWeek =
    weekOffset > 0 ? weekOffset - 1 : weekOffset - 1;
  const nextWeek = weekOffset + 1;

  return (
    <section className="space-y-8">
      <PageHeader
        title="Agenda de Producción"
        description="Programa la producción según la fecha de entrega de cada pedido confirmado y pagado."
      />

      {/* Alertas del Libro de Reclamaciones */}
      <AlertasReclamosAgenda alertas={alertasReclamos} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/agenda?semana=${previousWeek}`}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-cake-gold hover:text-cake-gold"
          >
            ← Semana anterior
          </Link>

          <Link
            href={`/admin/agenda?semana=${nextWeek}`}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-cake-gold hover:text-cake-gold"
          >
            Siguiente semana →
          </Link>

          {weekOffset !== 0 && (
            <Link
              href="/admin/agenda"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-cake-gold hover:text-cake-gold"
            >
              Esta semana
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-7">
        {days.map((day, index) => {
          const dayKey = dayKeys[index];
          const orders = ordersByDay.get(dayKey) ?? [];

          return (
            <div
              key={dayKey}
              className="flex min-h-[220px] flex-col rounded-xl border border-gray-100 bg-white p-3"
            >
              <h3 className="mb-3 text-center text-sm font-semibold capitalize text-gray-700">
                {formatDayLabel(day)}
              </h3>

              {orders.length === 0 ? (
                <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                  Sin pedidos
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-cake-gold/30 bg-cake-cream transition hover:border-cake-gold"
                    >
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="group block rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-700">
                            {order.hora_entrega
                              ? `#${order.numero ?? "—"} · ${order.hora_entrega.slice(0, 5)}`
                              : `#${order.numero ?? "—"}`}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              STATUS_BADGE[order.estado] ??
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {ORDER_STATUS_LABEL[
                              order.estado as keyof typeof ORDER_STATUS_LABEL
                            ] ?? order.estado}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-gray-800">
                          {order.cliente?.nombre ??
                            "Cliente"}
                        </p>

                        <div className="mt-2 flex items-center gap-1.5">
                          {order.items
                            .slice(0, 4)
                            .map((item) =>
                              item.imagen ? (
                                <div
                                  key={item.id}
                                  className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                                >
                                  <Image
                                    src={item.imagen}
                                    alt={item.nombre}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : null
                            )}

                          <p className="line-clamp-2 text-xs text-gray-500">
                            {order.items
                              .slice(0, 3)
                              .map(
                                (item) =>
                                  `${item.cantidad}x ${item.nombre}`
                              )
                              .join(", ")}
                            {order.items.length > 3
                              ? ` +${order.items.length - 3} más`
                              : ""}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-cake-gold/20 pt-2">
                          <span className="text-xs font-medium text-gray-600">
                            {TIPO_ENTREGA_LABEL[
                              order.tipo_entrega ?? ""
                            ] ?? "Entrega"}
                          </span>
                          <span className="text-xs font-semibold text-cake-gold">
                            S/ {Number(order.total).toFixed(2)}
                          </span>
                        </div>
                      </Link>

                      <div className="flex items-center justify-end border-t border-cake-gold/20 px-2 py-1.5">
                        <DeleteOrderButton
                          orderId={order.id}
                          orderNumber={order.numero}
                          compact
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sinFecha.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-semibold text-amber-800">
            Pedidos por programar
          </h2>
          <p className="mt-1 text-sm text-amber-700">
            Estos pedidos confirmados y pagados aún no tienen fecha de
            entrega asignada.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sinFecha.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-amber-200 bg-white transition hover:border-amber-400"
              >
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="block rounded-lg p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      #{order.numero ?? "—"}
                    </span>
                    <span className="text-xs font-semibold text-cake-gold">
                      S/ {Number(order.total).toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-800">
                    {order.cliente?.nombre ?? "Cliente"}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {order.items
                      .slice(0, 4)
                      .map((item) =>
                        item.imagen ? (
                          <div
                            key={item.id}
                            className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                          >
                            <Image
                              src={item.imagen}
                              alt={item.nombre}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : null
                      )}
                    <p className="text-xs text-gray-500">
                      {order.items
                        .slice(0, 3)
                        .map(
                          (item) =>
                            `${item.cantidad}x ${item.nombre}`
                        )
                        .join(", ")}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center justify-end border-t border-amber-100 px-2 py-1.5">
                  <DeleteOrderButton
                    orderId={order.id}
                    orderNumber={order.numero}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {programados.length === 0 && sinFecha.length === 0 && (
        <EmptyState
          title="Agenda vacía"
          description="Cuando haya pedidos confirmados y pagados con fecha de entrega, aparecerán aquí."
        />
      )}
    </section>
  );
}
