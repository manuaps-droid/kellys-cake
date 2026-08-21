import { z } from "zod";

export const checkoutSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre es obligatorio."),

  apellidos: z
    .string()
    .min(2, "Los apellidos son obligatorios."),

  email: z
    .string()
    .email("Correo electrónico inválido."),

  telefono: z
    .string()
    .min(9, "Ingrese un teléfono válido."),

  direccion: z
    .string()
    .min(5, "La dirección es obligatoria."),

  referencia: z.string().optional(),

  notas: z.string().optional(),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;