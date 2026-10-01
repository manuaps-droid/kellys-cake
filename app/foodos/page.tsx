import { getProductos } from "@/features/productos/queries/get-productos";
import Link from "next/link";

export default async function AdminDashboard() {
  const productos = await getProductos();
  
  const productosConReceta = productos?.filter(p => p.precio_costo && p.precio_costo > 0) || [];
  const rentables = productosConReceta.filter(p => (p.margen_porcentaje || 0) > 50);
  const alertaMargen = productosConReceta.filter(p => (p.margen_porcentaje || 0) < 30);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resumen del Negocio</h1>
        <p className="text-gray-500 mt-1">Monitorea la salud financiera de tus recetas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Productos en CatÃ¡logo</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{productos?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Recetas Completadas</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{productosConReceta.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Productos Estrella (Margen &gt;50%)</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{rentables.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            âš ï¸ Alertas de Rentabilidad
          </h3>
          {alertaMargen.length === 0 ? (
            <p className="text-gray-500">Todos tus productos tienen un margen saludable.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {alertaMargen.map(p => (
                <li key={p.id} className="py-3 flex justify-between items-center">
                  <span className="font-medium text-gray-800">{p.nombre}</span>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                    {p.margen_porcentaje?.toFixed(1)}% Margen
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">ðŸ¤–</div>
          <h3 className="text-lg font-bold text-gray-900">AI Copilot (PrÃ³ximamente)</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-sm">
            Pronto podrÃ© decirte quÃ© ingredientes estÃ¡n afectando tus mÃ¡rgenes e inventar nuevas recetas basadas en tus sobrantes.
          </p>
        </div>
      </div>
    </div>
  );
}

