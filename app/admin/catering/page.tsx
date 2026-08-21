import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

import { createAdminClient } from "@/lib/supabase/admin";

import { detectarProductos } from "@/features/catering/lib/descripcion-sections";
import DeleteCateringButton from "@/features/catering/components/DeleteCateringButton";

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

type Props = {
  searchParams: Promise<{
    estado?: string;
  }>;
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  cotizado: "Cotizado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  finalizado: "Finalizado",
};

const ESTADO_STYLES: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  cotizado: "bg-blue-50 text-blue-700 border-blue-200",
  aceptado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rechazado: "bg-red-50 text-red-700 border-red-200",
  finalizado: "bg-gray-100 text-gray-500 border-gray-200",
};

const TIPO_LABELS: Record<string, string> = {
  cumpleanos: "🎂 Cumpleaños",
  corporativo: "🏢 Corporativo",
  otro: "🎉 Otro",
};

export default async function AdminCateringPage({
  searchParams,
}: Props) {
  const filters = await searchParams;
  const estadoFilter = filters.estado ?? "all";

  const supabase = createAdminClient();

  let query = supabase
    .from("cotizaciones_catering")
    .select("*")
    .order("created_at", { ascending: false });

  if (estadoFilter === "all") {
    query = query.neq("estado", "finalizado");
  } else if (estadoFilter !== "finalizado") {
    query = query.eq("estado", estadoFilter);
  } else {
    query = query.eq("estado", "finalizado");
  }

  const { data, error } = await query;

  if (error) {
    return (
      <EmptyState
        title="Error"
        description={
          error.message ??
          "No se pudieron cargar las cotizaciones de catering."
        }
      />
    );
  }

  const rows = (data ?? []) as unknown as CateringRow[];

  // Contadores por estado para los badges del filtro
  const { data: allRows } = await supabase
    .from("cotizaciones_catering")
    .select("estado");

  const counts: Record<string, number> = { all: 0, pendiente: 0, cotizado: 0, aceptado: 0, rechazado: 0, finalizado: 0 };
  for (const r of (allRows ?? []) as unknown as { estado: string }[]) {
    counts.all++;
    if (counts[r.estado] !== undefined) counts[r.estado]++;
  }
  counts.all = counts.all - (counts.finalizado ?? 0);

  return (
    <section className="space-y-8">
      <PageHeader
        title="Catering"
        description="Solicitudes de cotización para servicios de catering y eventos."
      />

      {/* Filtros por estado */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "Todas", count: counts.all },
          { key: "pendiente", label: "Pendientes", count: counts.pendiente },
          { key: "cotizado", label: "Cotizadas", count: counts.cotizado },
          { key: "aceptado", label: "Aceptadas", count: counts.aceptado },
          { key: "rechazado", label: "Rechazadas", count: counts.rechazado },
          { key: "finalizado", label: "Finalizadas", count: counts.finalizado },
        ].map((filter) => {
          const active = estadoFilter === filter.key;
          return (
            <a
              key={filter.key}
              href={filter.key === "all" ? "/admin/catering" : `/admin/catering?estado=${filter.key}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-cake-gold bg-cake-gold text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-cake-gold hover:text-cake-gold"
              }`}
            >
              {filter.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                  active ? "bg-white/20" : "bg-gray-100 text-gray-600"
                }`}
              >
                {filter.count}
              </span>
            </a>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Sin solicitudes"
          description="Aún no hay solicitudes de catering que coincidan con este filtro."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Evento</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Invitados</th>
                <th className="px-6 py-4">Productos</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Recibido</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const EstadoStyle = ESTADO_STYLES[row.estado ?? "pendiente"] ?? ESTADO_STYLES.pendiente;
                const productos = detectarProductos(row.descripcion);
                return (
                  <tr key={row.id} className="align-top transition hover:bg-amber-50/40">
                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-cake-espresso">
                        {row.nombre ?? "-"}
                      </div>
                      <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                        <div className="truncate">{row.email}</div>
                        <div>{row.celular}</div>
                      </div>
                    </td>

                    {/* Evento */}
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {row.tipo_evento ? TIPO_LABELS[row.tipo_evento] ?? row.tipo_evento : "-"}
                      </span>
                      {row.presupuesto && (
                        <div className="mt-2 text-xs text-gray-500">
                          💰 {row.presupuesto}
                        </div>
                      )}
                    </td>

                    {/* Fecha evento */}
                    <td className="px-6 py-4 text-gray-700">
                      {row.fecha_evento
                        ? new Date(row.fecha_evento).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    {/* Invitados */}
                    <td className="px-6 py-4 text-gray-700">
                      {row.num_invitados ?? "-"}
                    </td>

                    {/* Productos solicitados */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {productos.pastel && (
                          <a
                            href={`/admin/proyectos/${row.proyecto_id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-[#FFF5E8] px-2.5 py-1 text-xs font-medium text-cake-gold transition hover:bg-cake-gold hover:text-white"
                            title="Ver proyecto de pastel personalizado"
                          >
                            🍰 Pastel personalizado
                          </a>
                        )}
                        {productos.extras && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700">
                            🧁 Cupcakes / Cake pops / Galletas
                          </span>
                        )}
                        {productos.coffeeBreak && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            🥐 Coffee break
                          </span>
                        )}
                        {!productos.pastel && !productos.extras && !productos.coffeeBreak && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${
                          EstadoStyle
                        }`}
                      >
                        {ESTADO_LABELS[row.estado ?? "pendiente"] ?? row.estado}
                      </span>
                    </td>

                    {/* Recibido */}
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <a
                          href={`/admin/catering/${row.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-cake-gold px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#b8860b]"
                          title="Ver detalle completo de la cotización"
                        >
                          Ver detalle
                          <span aria-hidden="true">↗</span>
                        </a>

                        <DeleteCateringButton
                          id={row.id}
                          clienteNombre={row.nombre}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
