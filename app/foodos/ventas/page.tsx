import { getProductos } from "@/features/productos/queries/get-productos";
import { PuntoDeVenta } from "@/features/ventas/components/PuntoDeVenta";

export default async function VentasPage() {
  const productos = await getProductos();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🧾 Punto de Venta (POS) & Boletas SUNAT
          </h1>
          <p className="text-gray-500 text-xs">
            Caja rápida de mostrador: emite comprobantes oficiales y descuenta stock automáticamente.
          </p>
        </div>
      </div>

      <PuntoDeVenta productos={productos || []} />
    </div>
  );
}
