import { getCurrentClient } from "@/features/auth/services/auth.server";
import PageHeader from "@/components/common/PageHeader";
import { ReferralCodeCard } from "@/features/referidos/components/ReferralCodeCard";
import Card from "@/components/common/Card";
import { Share2, UserPlus, Gift } from "lucide-react";

export default async function ReferidosPage() {
  // Protección de ruta — redirige a login si no hay sesión
  await getCurrentClient();

  const steps = [
    {
      title: "Comparte tu código",
      description:
        "Envía tu código único a tus amigos o familiares.",
      icon: Share2,
    },
    {
      title: "Tu amigo se registra",
      description:
        "Debe ingresar el código al crear su cuenta.",
      icon: UserPlus,
    },
    {
      title: "Ambos ganan",
      description:
        "Tú recibes 30 puntos y tu amigo un 10% de descuento.",
      icon: Gift,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Mis Referidos"
        description="Comparte tu código y gana puntos por cada amigo que se una a Kelly's Cake."
      />

      <div className="max-w-2xl">
        <ReferralCodeCard />
      </div>

      <div className="mt-12">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal mb-8 text-center md:text-left">
          Cómo funciona
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Línea decorativa desktop */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-kc-rose-gold/20 -z-10" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-kc-blush flex items-center justify-center text-kc-rose-gold shadow-sm mb-4 group-hover:scale-110 group-hover:bg-kc-blush/20 transition-all duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-kc-charcoal text-lg mb-2">
                  {idx + 1}. {step.title}
                </h3>
                <p className="text-gray-600 text-sm max-w-[200px]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal mb-6">
          Amigos Referidos
        </h2>
        <Card className="p-8 text-center bg-white/50 border-dashed">
          <p className="text-gray-500 mb-2">
            Aún no has invitado a ningún amigo.
          </p>
          <p className="text-sm text-gray-400">
            ¡Comparte tu código y empieza a ganar puntos!
          </p>
        </Card>
      </div>
    </div>
  );
}
