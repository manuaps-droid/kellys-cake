import { ProductoDesdeCatalogo } from "@/features/productos/components/ProductoDesdeCatalogo";
import { getProductosTienda } from "@/features/productos/queries/get-productos-tienda";

export default async function NuevoProductoPage() {
  const productos = await getProductosTienda();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Crear Producto Final
        </h1>
        <p className="text-gray-500">
          Elige un producto de tu tienda, arma su receta con tus ingredientes y
          FoodOS calcula el costo y el margen al instante.
        </p>
      </div>
      <ProductoDesdeCatalogo productos={productos} />
    </div>
  );
}
