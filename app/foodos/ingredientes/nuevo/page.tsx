import { IngredienteForm } from "@/features/ingredientes/components/IngredienteForm";

export default function NuevoIngredientePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Ingrediente</h1>
        <p className="text-gray-500">Registra un nuevo ingrediente para tus recetas y controla sus costos.</p>
      </div>
      
      <IngredienteForm />
    </div>
  );
}

