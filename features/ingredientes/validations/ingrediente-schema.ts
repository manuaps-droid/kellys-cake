import { z } from "zod";

export const ingredienteSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  categoria_id: z.string().optional(),
  unidad_compra: z.string().min(1, "Unidad de compra requerida (ej: kg, litro)"),
  unidad_uso: z.string().min(1, "Unidad de uso requerida (ej: gramo, ml)"),
  factor_conversion: z.coerce.number().min(0.0001, "El factor debe ser mayor a 0"),
  costo_unitario: z.coerce.number().min(0, "El costo no puede ser negativo"),
  porcentaje_rendimiento: z.coerce.number().min(0).max(100).default(100),
  porcentaje_merma_estandar: z.coerce.number().min(0).max(100).default(0),
});

export type IngredienteFormValues = z.infer<typeof ingredienteSchema>;
