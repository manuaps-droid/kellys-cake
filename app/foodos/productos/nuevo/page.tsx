import { ProductoForm } from "@/features/productos/components/ProductoForm";

export default function NuevoProductoPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear Producto Final</h1>
        <p className="text-gray-500">Añade los pasteles o platillos que vendes a tus clientes.</p>
      </div>
      <ProductoForm />
    </div>
  );
}

