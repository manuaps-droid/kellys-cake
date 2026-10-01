import { CotizacionEditor } from "@/features/cotizador/components/CotizacionEditor";
import { getProductos } from "@/features/productos/queries/get-productos";

export default async function NuevaCotizacionPage() {
  const productos = await getProductos();
  const productosActivos = productos?.filter(p => p.precio_costo && p.precio_costo > 0) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Armar Nueva Cotización</h1>
        <p className="text-gray-500">Combina productos y servicios extras. El panel de rentabilidad te indicará tu margen de ganancia real antes de enviar el precio al cliente.</p>
      </div>
      <CotizacionEditor productos={productosActivos} />
    </div>
  );
}
