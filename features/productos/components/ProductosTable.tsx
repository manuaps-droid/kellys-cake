import { getProductos } from "../queries/get-productos";
import Link from "next/link";

export async function ProductosTable() {
  const productos = await getProductos();

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Venta</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo (Receta)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen Real</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {productos?.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No tienes productos registrados.</td></tr>
          ) : (
            productos?.map((prod) => {
              const costo = prod.precio_costo || 0;
              const venta = prod.precio_venta || 0;
              const margen = prod.margen_porcentaje || 0;
              
              const margenColor = margen > 60 ? 'text-green-600 bg-green-50' : (margen > 40 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50');

              return (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prod.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">S/ {venta.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {costo > 0 ? `S/ ${costo.toFixed(2)}` : <span className="text-red-400 italic text-xs">Falta Receta</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {costo > 0 ? (
                      <span className={`px-2 py-1 rounded-full text-xs ${margenColor}`}>{margen.toFixed(1)}%</span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/foodos/productos/${prod.id}/receta`} className="text-blue-600 hover:text-blue-900 font-bold">
                      {costo > 0 ? 'Editar Receta' : '+ Crear Receta'}
                    </Link>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

