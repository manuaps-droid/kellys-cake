import { getInventario } from "@/features/inventario/queries/get-inventario";
import { getAlmacenes } from "@/features/inventario/queries/get-almacenes";
import { InventarioTable } from "@/features/inventario/components/InventarioTable";

export default async function InventarioPage() {
  const [inventario, almacenes] = await Promise.all([
    getInventario(),
    getAlmacenes()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📦 Control de Inventario & Almacenes
          </h1>
          <p className="text-gray-500 text-sm">
            Monitoreo en tiempo real de insumos físicos. Las entradas se alimentan del escáner de facturas.
          </p>
        </div>
      </div>

      <InventarioTable inventario={inventario} almacenes={almacenes} />
    </div>
  );
}
