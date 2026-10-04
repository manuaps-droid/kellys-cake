import { getCurrentClient } from "@/features/auth/services/auth.server";
import PageHeader from "@/components/common/PageHeader";
import { RewardsCard } from "@/features/rewards/components/RewardsCard";
import { RewardsHistory } from "@/features/rewards/components/RewardsHistory";
import Card from "@/components/common/Card";
import { Gift, Share2, Star, ShoppingBag, UserPlus, Smile, Clock } from "lucide-react";
import { REWARD_RULES } from "@/features/rewards/constants/reward-rules";
import { getPublicMarketing } from "@/features/admin/configuracion/queries/public-config.query";

export default async function RewardsPage() {
  // Protección de ruta
  await getCurrentClient();

  const marketing = await getPublicMarketing();
  const solesBase = marketing?.soles_por_puntos ?? 10;
  const puntosBase = marketing?.puntos_otorgados ?? 5;
  const diasVigencia = marketing?.dias_vencimiento_puntos ?? 365;

  const rewardRules = [
    {
      title: "Compras",
      description: `${puntosBase} puntos por cada S/ ${solesBase} de compra`,
      icon: ShoppingBag,
    },
    {
      title: "Primera compra",
      description: `${REWARD_RULES.PRIMERA_COMPRA} puntos bonus en tu primer pedido`,
      icon: Star,
    },
    {
      title: "Vigencia de puntos",
      description: `Tus puntos son válidos por ${diasVigencia} días para canjear en la tienda`,
      icon: Clock,
    },
    {
      title: "Referidos",
      description: `${REWARD_RULES.REFERIDO_COMPLETADO} puntos por cada amigo que compre`,
      icon: Share2,
    },
    {
      title: "Cumpleaños",
      description: `${REWARD_RULES.CUMPLEANOS} puntos de regalo en tu cumpleaños`,
      icon: Gift,
    },
    {
      title: "Reseñas con foto",
      description: `${REWARD_RULES.RESENA_CON_FOTO} puntos por dejar una reseña`,
      icon: Smile,
    },
    {
      title: "Registro",
      description: `${REWARD_RULES.REGISTRO} puntos de bienvenida al crear tu cuenta`,
      icon: UserPlus,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Mis Rewards"
        description="Acumula puntos con cada compra y canjéalos por descuentos."
      />

      <RewardsCard />

      <div className="mt-12">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal mb-6">
          Cómo ganar puntos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewardRules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <Card key={idx} className="p-6 flex items-start space-x-4">
                <div className="p-3 bg-kc-blush/30 text-kc-charcoal rounded-xl flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-kc-charcoal text-lg">
                    {rule.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{rule.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Historial de movimientos */}
      <div className="mt-12">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal mb-6">
          Historial de Puntos
        </h2>
        <RewardsHistory />
      </div>
    </div>
  );
}
