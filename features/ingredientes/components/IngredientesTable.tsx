import { getIngredientes } from "../queries/get-ingredientes";
import { IngredientesClientTable } from "./IngredientesClientTable";

export async function IngredientesTable() {
  const ingredientes = await getIngredientes();

  return <IngredientesClientTable ingredientes={ingredientes as any[]} />;
}
