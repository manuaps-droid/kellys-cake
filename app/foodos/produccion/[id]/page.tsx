import { generarConsolidadoAlmacen } from "@/features/produccion/services/consolidacion.service";
import Link from "next/link";

export default async function HojaProduccionPage({ params }: { params: { id: string } }) {
  const reporte = await generarConsolidadoAlmacen(params.id);

  if (!reporte) return <div className="p-6">Orden no encontrada</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hoja de Producción</h1>
          <p className="text-gray-500">Fecha: {reporte.orden.fecha_prevista}</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-slate-800 hidden md:block">
          🖨️ Imprimir Hoja
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-8">
        <h3 className="font-bold text-yellow-800">Resumen de la Orden</h3>
        <p className="text-sm text-yellow-700 mt-1">
          {reporte.orden.items.map((i: any) => `${i.cantidad}x ProdID(${i.producto_id.substring(0,4)})`).join(" | ")}
        </p>
        {reporte.orden.notas && <p className="text-sm italic mt-2">Notas: {reporte.orden.notas}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-800">
          Lista Consolidada de Almacén
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingrediente a Retirar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">¿Para qué se usará?</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Check</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reporte.insumos.map((insumo: any) => (
              <tr key={insumo.ingrediente_id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{insumo.nombre}</td>
                <td className="px-6 py-4 text-sm font-black text-blue-600 bg-blue-50/50">
                  {insumo.cantidad_requerida.toFixed(2)} {insumo.unidad_uso}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  <ul className="list-disc pl-4">
                    {insumo.productos_que_lo_usan.map((p: any, idx: number) => (
                      <li key={idx}>{p.nombre} ({p.cantidad_aportada.toFixed(1)} {insumo.unidad_uso})</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8">
        <Link href="/foodos" className="text-blue-600 hover:underline">← Volver al Dashboard</Link>
      </div>
    </div>
  );
}