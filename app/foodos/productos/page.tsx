import { ProductosTable } from "@/features/productos/components/ProductosTable";
import Link from "next/link";
import { Suspense } from "react";

export default function ProductosPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos y Márgenes</h1>
          <p className="text-gray-500">Administra lo que vendes y descubre si realmente es rentable.</p>
        </div>
        <Link href="/foodos/productos/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm">
          + Nuevo Producto
        </Link>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando productos...</div>}>
        <ProductosTable />
      </Suspense>
    </div>
  );
}

