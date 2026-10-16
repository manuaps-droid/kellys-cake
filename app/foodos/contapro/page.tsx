import ContaproImporter from "@/features/contapro/components/ContaproImporter";

export const metadata = {
  title: "Importar Contapro | FoodOS",
  description:
    "Vincula el sistema contable (Contapro/Concar) con FoodOS: importa compras y ventas por mes o rango de meses para calcular la rentabilidad y KPIs reales.",
};

export default function ContaproPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          FoodOS · Vínculo contable
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">
          Importar datos de Contapro
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Importa los reportes de compras y ventas exportados del sistema
          contable (Excel o CSV) para alimentar la rentabilidad y los KPIs de
          FoodOS con cifras reales. Puedes importar por un mes o por un rango
          de meses, y cada importación se puede eliminar sin afectar las
          demás.
        </p>
      </div>

      <ContaproImporter />
    </div>
  );
}
