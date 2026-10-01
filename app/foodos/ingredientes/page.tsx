import { IngredientesTable } from "@/features/ingredientes/components/IngredientesTable";
import Link from "next/link";
import { Suspense } from "react";

export default function IngredientesPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredientes</h1>
          <p className="text-gray-500">Administra tus insumos, unidades y descubre el costo real por uso.</p>
        </div>
        <Link 
          href="/foodos/ingredientes/nuevo" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          + Nuevo Ingrediente
        </Link>
      </div>
      
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando ingredientes...</div>}>
        <IngredientesTable />
      </Suspense>
    </div>
  );
}

