import { z } from "zod";

export const recetaItemSchema = z.object({
  ingrediente_id: z.string().uuid("Selecciona un ingrediente válido"),
  cantidad: z.coerce.number().min(0.0001, "La cantidad debe ser mayor a 0"),
  unidad: z.string().min(1, "Falta unidad"),
  merma_porcentaje: z.coerce.number().min(0).max(100).default(0),
});

export const recetaSchema = z.object({
  producto_id: z.string().uuid(),
  nombre: z.string().default("Receta Estándar"),
  rendimiento: z.coerce.number().min(0.1, "El rendimiento debe ser mayor a 0").default(1),
  items: z.array(recetaItemSchema).min(1, "Debes agregar al menos 1 ingrediente a la receta"),
});

export type RecetaFormValues = z.infer<typeof recetaSchema>;
