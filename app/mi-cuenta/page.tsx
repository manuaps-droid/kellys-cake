import Link from "next/link";
import { Package, Award, Users, ArrowRight, Calendar } from "lucide-react";
import { getCurrentClient } from "@/features/auth/services/auth.server";
import { RewardsCard } from "@/features/rewards/components/RewardsCard";
import Card from "@/components/common/Card";

import { getPublicMarketing } from "@/features/admin/configuracion/queries/public-config.query";

import DashboardWheelTrigger from "./components/DashboardWheelTrigger";

export default async function DashboardPage() {
  const [{ supabase, user, cliente }, marketing] = await Promise.all([
    getCurrentClient(),
    getPublicMarketing(),
  ]);

  // Estadísticas rápidas
  const { count: pedidosCount } = await supabase
    .from("pedidos")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", cliente.id);

  const { data: ultimoPedido } = await supabase
    .from("pedidos")
    .select("created_at")
    .eq("cliente_id", cliente.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const fechaUltimo = ultimoPedido
    ? new Date(ultimoPedido.created_at).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Sin pedidos aún";

  const nombre =
    user.user_metadata?.nombre ||
    user.user_metadata?.full_name?.split(" ")[0] ||
    "Cliente";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Ruleta Trigger si no ha girado y está activa */}
      {!cliente.ruleta_girada && marketing?.ruleta_activo !== false && (
        <DashboardWheelTrigger ruletaGirada={cliente.ruleta_girada} />
      )}
      {/* Header de bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-kc-sand/30">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-kc-charcoal">
            Bienvenida, {nombre}
          </h1>
          <p className="text-gray-600 mt-2">
            Desde aquí puedes administrar tus pedidos, ver tus rewards y
            configurar tu cuenta.
          </p>
        </div>
        <Link
          href="/productos"
          className="inline-flex items-center justify-center px-6 py-3 bg-kc-charcoal text-white rounded-full font-medium hover:bg-kc-deep transition-colors"
        >
          Hacer nuevo pedido
        </Link>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rewards Summary */}
        <div className="lg:col-span-2">
          <RewardsCard />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <Card className="p-5 flex items-start space-x-4 bg-gradient-to-br from-white to-kc-ivory/30">
            <div className="p-3 bg-kc-blush/30 rounded-xl text-kc-charcoal">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pedidos</p>
              <p className="text-2xl font-bold text-kc-charcoal">
                {pedidosCount || 0}
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-start space-x-4 bg-gradient-to-br from-white to-kc-ivory/30">
            <div className="p-3 bg-kc-sand/50 rounded-xl text-kc-charcoal">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Último Pedido</p>
              <p className="text-sm font-medium text-kc-charcoal mt-1 line-clamp-1">
                {fechaUltimo}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Accesos rápidos */}
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal mt-8 mb-4">
        Accesos Rápidos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/mi-cuenta/pedidos"
          className="group p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-kc-rose-gold/30 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-kc-blush/20 transition-colors">
              <Package className="w-5 h-5 text-gray-600 group-hover:text-kc-rose-gold transition-colors" />
            </div>
            <span className="font-medium text-kc-charcoal">Mis Pedidos</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-kc-rose-gold transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/mi-cuenta/rewards"
          className="group p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-kc-rose-gold/30 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-kc-blush/20 transition-colors">
              <Award className="w-5 h-5 text-gray-600 group-hover:text-kc-rose-gold transition-colors" />
            </div>
            <span className="font-medium text-kc-charcoal">Mis Rewards</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-kc-rose-gold transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/mi-cuenta/referidos"
          className="group p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-kc-rose-gold/30 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-kc-blush/20 transition-colors">
              <Users className="w-5 h-5 text-gray-600 group-hover:text-kc-rose-gold transition-colors" />
            </div>
            <span className="font-medium text-kc-charcoal">
              Referir a un amigo
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-kc-rose-gold transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
