import PageHeader from "@/components/common/PageHeader";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/common/EmptyState";
import VisitasChart from "@/components/admin/visitas/VisitasChart";
import { getResumenVisitasAction } from "@/features/admin/visitas/actions/get-visitas.action";

import {
  Users,
  Eye,
  TrendingUp,
  Calendar,
  Smartphone,
  Monitor,
  Compass,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminVisitasPage() {
  const result = await getResumenVisitasAction();

  if (!result.success || !result.resumen) {
    return (
      <EmptyState
        title="Error al cargar estadísticas"
        description={
          result.message || "No se pudo recuperar la información de visitas."
        }
      />
    );
  }

  const resumen = result.resumen;

  // Calcular totales de dispositivos de los últimos 7 días
  const ultimos7 = resumen.historialDias.slice(0, 7);
  const movil7 = ultimos7.reduce(
    (acc, d) => acc + (d.dispositivos?.movil || 0),
    0
  );
  const desktop7 = ultimos7.reduce(
    (acc, d) => acc + (d.dispositivos?.desktop || 0),
    0
  );
  const totalDisp7 = movil7 + desktop7 || 1;
  const pctMovil = Math.round((movil7 / totalDisp7) * 100);
  const pctDesktop = 100 - pctMovil;

  return (
    <section className="space-y-8">
      <PageHeader
        title="Contador de Visitas"
        description="Métricas de tráfico en tiempo real, visitantes únicos diarios y páginas más populares."
      />

      {/* Tarjetas resumen superior */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Hoy */}
        <Card className="p-6 border-l-4 border-l-cake-espresso">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Hoy (En curso)
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-cake-espresso">
                {resumen.hoy.total}
              </h3>
              <p className="mt-1 text-xs text-cake-gold font-medium">
                {resumen.hoy.unicos} visitantes únicos
              </p>
            </div>
            <div className="rounded-xl bg-[#FFF5E8] p-3 text-cake-gold">
              <Eye size={24} />
            </div>
          </div>
        </Card>

        {/* Ayer */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Ayer
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-gray-800">
                {resumen.ayer.total}
              </h3>
              <p className="mt-1 text-xs text-gray-500 font-medium">
                {resumen.ayer.unicos} visitantes únicos
              </p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
              <Calendar size={24} />
            </div>
          </div>
        </Card>

        {/* Últimos 7 Días */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Últimos 7 días
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-cake-espresso">
                {resumen.ultimos7Dias.total}
              </h3>
              <p className="mt-1 text-xs text-emerald-600 font-medium">
                {resumen.ultimos7Dias.unicos} visitantes únicos
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>

        {/* Histórico / 30 Días */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Últimos 30 días
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-gray-800">
                {resumen.ultimos30Dias.total}
              </h3>
              <p className="mt-1 text-xs text-gray-500 font-medium">
                Total histórico: {resumen.totalHistorico}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Users size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico principal */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-cake-espresso">
            Evolución de Tráfico Diario
          </h2>
          <p className="text-xs text-gray-500">
            Comparativa entre páginas vistas totales y visitantes individuales por día (Hora Perú).
          </p>
        </div>

        <VisitasChart historial={resumen.historialDias} />
      </Card>

      {/* Sección intermedia: Top páginas y dispositivos */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Páginas más visitadas (2 cols) */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="text-cake-gold" size={20} />
            <h2 className="text-base font-bold text-cake-espresso">
              Páginas Más Visitadas
            </h2>
          </div>

          {resumen.topRutas.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              Aún no hay suficiente actividad registrada.
            </p>
          ) : (
            <div className="space-y-3">
              {resumen.topRutas.map((item, index) => {
                const maxRutaVisitas = resumen.topRutas[0]?.visitas || 1;
                const porcentaje = Math.round((item.visitas / maxRutaVisitas) * 100);

                return (
                  <div key={item.ruta} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-700 truncate max-w-[280px] sm:max-w-md">
                        <span className="font-bold text-cake-espresso mr-2">
                          #{index + 1}
                        </span>
                        {item.ruta}
                      </span>
                      <span className="font-semibold text-cake-espresso">
                        {item.visitas}{" "}
                        <span className="text-[11px] font-normal text-gray-500">
                          vistas
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cake-espresso/80 transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Dispositivos (1 col) */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="text-cake-gold" size={20} />
              <h2 className="text-base font-bold text-cake-espresso">
                Dispositivos (7 días)
              </h2>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Smartphone size={15} className="text-cake-espresso" />
                    Celulares y Tablets
                  </span>
                  <span>{pctMovil}% ({movil7})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cake-espresso transition-all duration-500"
                    style={{ width: `${pctMovil}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Monitor size={15} className="text-cake-gold" />
                    Computadoras (PC/Laptop)
                  </span>
                  <span>{pctDesktop}% ({desktop7})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cake-gold transition-all duration-500"
                    style={{ width: `${pctDesktop}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-[#FFFDF8] border border-cake-gold/20 p-3 text-[11px] text-gray-600">
            💡 Las visitas reflejan navegación de clientes reales, excluyendo rastreadores automáticos y visitas al panel de administración.
          </div>
        </Card>
      </div>

      {/* Tabla detallada día a día */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-cake-espresso mb-4">
          Detalle Diario (Últimos 30 días)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/70 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Vistas Totales</th>
                <th className="py-3 px-4">Visitantes Únicos</th>
                <th className="py-3 px-4">Móviles</th>
                <th className="py-3 px-4">Computadora</th>
                <th className="py-3 px-4">Prom. Páginas/Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resumen.historialDias.map((dia) => {
                const ratio =
                  dia.unicos > 0 ? (dia.total / dia.unicos).toFixed(1) : "0.0";

                return (
                  <tr
                    key={dia.fecha}
                    className="hover:bg-amber-50/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {dia.fecha}
                    </td>
                    <td className="py-3 px-4 font-bold text-cake-espresso">
                      {dia.total}
                    </td>
                    <td className="py-3 px-4 font-semibold text-cake-gold">
                      {dia.unicos}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {dia.dispositivos?.movil || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {dia.dispositivos?.desktop || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono">
                      {ratio} págs
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
