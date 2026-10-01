import { z } from "zod";

export const ordenItemSchema = z.object({
  producto_id: z.string().uuid("Selecciona un producto"),
  cantidad: z.coerce.number().min(0.5, "La cantidad debe ser mayor a 0"),
});

export const ordenProduccionSchema = z.object({
  fecha_prevista: z.string().min(1, "Fecha obligatoria"),
  notas: z.string().optional(),
  items: z.array(ordenItemSchema).min(1, "Añade al menos un producto a producir"),
});

export type OrdenProduccionFormValues = z.infer<typeof ordenProduccionSchema>;
