import { z } from "zod";

export const updateCustomerSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio."),
  apellidos: z
    .string()
    .trim()
    .optional(),
  correo: z
    .string()
    .trim()
    .email("Correo inválido.")
    .optional()
    .or(z.literal("")),
  celular: z
    .string()
    .trim()
    .regex(/^[0-9]{6,15}$/, "Celular inválido.")
    .optional()
    .or(z.literal("")),
  dni: z
    .string()
    .trim()
    .regex(/^[0-9]{8}$/, "El DNI debe tener 8 dígitos.")
    .optional()
    .or(z.literal("")),
  activo: z.boolean(),
});

export type UpdateCustomerSchema = z.infer<
  typeof updateCustomerSchema
>;