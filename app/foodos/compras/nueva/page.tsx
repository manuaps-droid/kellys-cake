import { CompraEditor } from "@/features/compras/components/CompraEditor";
import { getIngredientes } from "@/features/ingredientes/queries/get-ingredientes";

export default async function NuevaCompraPage() {
  const ingredientes = await getIngredientes();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ingresar Compra de Insumos</h1>
        <p className="text-gray-500">Al guardar, los costos de los ingredientes y las recetas afectadas se actualizarán automáticamente usando el nuevo precio.</p>
      </div>
      <CompraEditor ingredientes={ingredientes} />
    </div>
  );
}
