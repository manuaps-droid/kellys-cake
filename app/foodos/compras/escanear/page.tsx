import { getIngredientes } from "@/features/ingredientes/queries/get-ingredientes";
import { getAlmacenes } from "@/features/inventario/queries/get-almacenes";
import { EscanearFacturaClient } from "./client";

export default async function EscanearFacturaPage() {
  const [ingredientes, almacenes] = await Promise.all([
    getIngredientes(),
    getAlmacenes()
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📸 Lector Inteligente de Facturas & Stock
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Sube una foto de tu factura y la IA extraerá los insumos y precios. Al confirmar, sumará automáticamente el stock al almacén que elijas.
        </p>
      </div>
      <EscanearFacturaClient ingredientes={ingredientes} almacenes={almacenes} />
    </div>
  );
}
