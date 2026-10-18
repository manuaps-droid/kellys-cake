import PulsoNegocio from "@/features/kpis/components/PulsoNegocio";
import { getPulsoNegocio } from "@/features/kpis/services/pulso.service";

export const metadata = {
  title: "Pulso del Negocio | FoodOS",
  description:
    "Indicadores de gestión en lenguaje natural: ticket promedio, lealtad de clientes, merma y velocidad de rotación.",
};

export default async function PulsoPage() {
  const datos = await getPulsoNegocio();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <PulsoNegocio datos={datos} />
      </div>
    </div>
  );
}
