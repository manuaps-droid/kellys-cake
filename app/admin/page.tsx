import Link from "next/link";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/common/PageHeader";
import Price from "@/components/ui/Price";
import EmptyState from "@/components/common/EmptyState";

import { getDashboardAction } from "@/features/admin/dashboard/actions/get-dashboard.action";

import {
  CakeSlice,
  Clock3,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const result =
    await getDashboardAction();

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

  const cards = [
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.title} href={card.href}>
              <Card
                className="p-6 transition-all duration-200 hover:border-cake-gold hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="transition-colors group-hover:text-cake-gold">
                    <p className="text-sm text-gray-500 group-hover:text-cake-gold/80">
                      {card.title}
                    </p>

                    <h2 className="mt-2 text-4xl font-bold text-cake-espresso group-hover:text-cake-gold">
                      {card.value}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 group-hover:text-cake-gold/80">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FFF5E8] p-4 transition-colors group-hover:bg-cake-gold/20">
                    <Icon
                      size={28}
                      className="text-cake-gold"
                    />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-8 lg:col-span-2">
          <h2 className="text-xl font-semibold text-cake-espresso">
            Ventas acumuladas
          </h2>

          <div className="mt-6">
            <Price
              value={stats.ventas}
              className="text-5xl"
            />
          </div>

          <p className="mt-4 text-gray-500">
            Total generado por todos los pedidos registrados.
          </p>
        </Card>

        <Card className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <Clock3
              size={22}
              className="text-cake-gold"
            />

            <h2 className="text-xl font-semibold text-cake-espresso">
              Resumen
            </h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Pedidos pendientes</span>

              <strong>
                {stats.pedidosPendientes}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>Productos activos</span>

              <strong>
                {stats.productosActivos}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>Clientes activos</span>

              <strong>
                {stats.clientesActivos}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>Proyectos pendientes</span>

              <strong>
                {stats.proyectosPendientes}
              </strong>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}