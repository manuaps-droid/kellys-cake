import { RecetaEditor } from "@/features/recetas/components/RecetaEditor";
import { getIngredientes } from "@/features/ingredientes/queries/get-ingredientes";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function RecetaPage({ params }: { params: { id: string } }) {
  const ingredientes = await getIngredientes();
  
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });
  
  const { data: producto } = await supabase.from('productos').select('nombre').eq('id', params.id).single();

  if (!producto) return <div className="p-6">Producto no encontrado</div>;

  const ingredientesDisponibles = ingredientes.map(i => ({
    id: i.id,
    nombre: i.nombre,
    unidad_uso: i.unidad_uso,
    costo_por_unidad_uso: i.costo_por_unidad_uso,
    porcentaje_merma_estandar: i.porcentaje_merma_estandar
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Receta: {producto.nombre}</h1>
        <p className="text-gray-500">Añade ingredientes para descubrir el costo exacto.</p>
      </div>
      <RecetaEditor productoId={params.id} ingredientesDisponibles={ingredientesDisponibles} />
    </div>
  );
}