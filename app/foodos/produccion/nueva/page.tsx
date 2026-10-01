import { OrdenProduccionEditor } from "@/features/produccion/components/OrdenProduccionEditor";
import { getProductos } from "@/features/productos/queries/get-productos";

export default async function NuevaProduccionPage() {
  const productos = await getProductos();
  const productosConReceta = productos?.filter(p => p.precio_costo && p.precio_costo > 0) || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Hoja de Producción</h1>
        <p className="text-gray-500">Agrega los productos que vas a hornear y generaremos la lista exacta de insumos que necesitas sacar del almacén.</p>
      </div>
      <OrdenProduccionEditor productos={productosConReceta} />
    </div>
  );
}
