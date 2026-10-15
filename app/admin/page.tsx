import Link from "next/link";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/common/PageHeader";
import Price from "@/components/ui/Price";
import EmptyState from "@/components/common/EmptyState";

import { getDashboardAction } from "@/features/admin/dashboard/actions/get-dashboard.action";
import { getResumenVisitasAction } from "@/features/admin/visitas/actions/get-visitas.action";

import {
  CakeSlice,
  Clock3,
  Eye,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [result, visitasResult] = await Promise.all([
    getDashboardAction(),
    getResumenVisitasAction(),
  ]);

  if (!result.success || !result.stats) {
    return (
      <EmptyState
        title="Error"
        description={
          result.message ??
          "No se pudo cargar el dashboard."
        }
      />
    );
  }

  const stats = result.stats;
  const visitas = visitasResult.success ? visitasResult.resumen : null;

  const cards = [
    {
      title: "Visitas Hoy",
      value: visitas?.hoy.total ?? 0,
      subtitle: `${visitas?.hoy.unicos ?? 0} personas únicas`,
      icon: Eye,
      href: "/admin/visitas",
      highlight: true,
    },
    {
      title: "Pedidos",
      value: stats.pedidos,
      subtitle: `${stats.pedidosPendientes} pendientes`,
      icon: ShoppingCart,
      href: "/admin/pedidos",
    },
    {
      title: "Productos",
      value: stats.productos,
      subtitle: `${stats.productosActivos} activos`,
      icon: Package,
      href: "/admin/productos",
    },
    {
      title: "Clientes",
      value: stats.clientes,
      subtitle: `${stats.clientesActivos} activos`,
      icon: Users,
      href: "/admin/clientes",
    },
    {
      title: "Proyectos",
      value: stats.proyectos,
      subtitle: `${stats.proyectosPendientes} pendientes`,
      icon: CakeSlice,
      href: "/admin/proyectos",
    },
  ];

  return (
    <section className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Resumen general de Kelly's Cake."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.title} href={card.href}>
              <Card
                className={`p-6 transition-all duration-200 hover:border-cake-gold hover:shadow-md group h-full flex flex-col justify-between ${
                  card.highlight ? "border-l-4 border-l-cake-gold bg-[#FFFDF8]" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="transition-colors group-hover:text-cake-gold">
                    <p className="text-sm text-gray-500 group-hover:text-cake-gold/80">
                      {card.title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-cake-espresso group-hover:text-cake-gold">
                      {card.value}
                    </h2>

                    <p className="mt-2 text-xs text-gray-500 group-hover:text-cake-gold/80">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FFF5E8] p-3 transition-colors group-hover:bg-cake-gold/20">
                    <Icon
                      size={24}
                      className="text-cake-gold"
                    />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Tarjeta de Ventas y Cumplimiento de Metas */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-cake-espresso">
                Ventas Acumuladas
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Facturación total registrada en la tienda online.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Meta: S/ {stats.metaMensualVentas.toLocaleString("es-PE")}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <Price
              value={stats.ventas}
              className="text-5xl font-extrabold text-cake-espresso"
            />
            <span className="text-sm font-semibold text-cake-gold">
              {stats.cumplimientoMeta}% de la meta mensual
            </span>
          </div>

          {/* Barra de progreso de meta mensual */}
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
              style={{ width: `${stats.cumplimientoMeta}%` }}
            />
          </div>

          {/* Mini-KPIs en cuadrícula */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div>
              <p className="text-xs text-gray-500 font-medium">Ticket Promedio</p>
              <p className="mt-1 text-xl font-bold text-cake-espresso">
                S/ {stats.ticketPromedio.toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-600">Meta: &gt; S/ 80.00</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium">Tasa de Conversión</p>
              <p className="mt-1 text-xl font-bold text-cake-espresso">
                {visitas?.totalHistorico
                  ? ((stats.pedidos / visitas.totalHistorico) * 100).toFixed(1)
                  : (0).toFixed(1)}%
              </p>
              <p className="text-[11px] text-gray-400">Visitas a pedidos</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium">Tasa de Recompra</p>
              <p className="mt-1 text-xl font-bold text-cake-espresso">
                {stats.tasaRecompra}%
              </p>
              <p className="text-[11px] text-emerald-600">
                {stats.clientesRecurrentes} cliente(s) leales
              </p>
            </div>
          </div>
        </Card>

        {/* Resumen Operativo & Tráfico */}
        <Card className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock3 size={20} className="text-cake-gold" />
              <h2 className="text-lg font-semibold text-cake-espresso">
                Métricas Clave
              </h2>
            </div>
            <Link
              href="/admin/configuracion"
              className="text-xs text-cake-gold hover:underline"
            >
              Configurar &rarr;
            </Link>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pedidos por atender</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                stats.pedidosPendientes > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {stats.pedidosPendientes}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Catálogo activo</span>
              <strong>{stats.productosActivos} tortas / postres</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Clientes registrados</span>
              <strong>{stats.clientesActivos} activos</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cotizaciones pendientes</span>
              <strong>{stats.proyectosPendientes}</strong>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-gray-600">Tráfico hoy</span>
              <strong className="text-cake-gold">
                {visitas?.hoy.total ?? 0} ({visitas?.hoy.unicos ?? 0} únicos)
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tráfico últimos 7 días</span>
              <strong>{visitas?.ultimos7Dias.total ?? 0} visitas</strong>
            </div>

            <div className="pt-2">
              <Link
                href="/admin/visitas"
                className="text-xs font-semibold text-cake-gold hover:underline inline-flex items-center gap-1"
              >
                Ver analítica de visitas completa &rarr;
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}