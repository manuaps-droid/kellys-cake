import { getModulosActivos } from "@/lib/foodos/modules";
import { ModulosManager } from "@/features/modulos/components/ModulosManager";

export default async function ModulosPage() {
  const modulosActivos = await getModulosActivos();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🧩 Configuración de Módulos de FoodOS
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Activa o desactiva módulos según el plan o las necesidades operativas de tu pastelería.
        </p>
      </div>

      <ModulosManager modulosActivos={modulosActivos} />
    </div>
  );
}
