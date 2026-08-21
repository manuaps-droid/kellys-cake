import { z } from "zod";

export const customerSchema = z.object({
  firstName: z
    .string()
    .min(2, "El nombre es obligatorio"),

  lastName: z
    .string()
    .min(2, "El apellido es obligatorio"),

  email: z
    .string()
    .email("Correo electrónico inválido"),

  phone: z
    .string()
    .min(9, "Ingrese un teléfono válido"),

  recipientName: z.string().or(z.literal("")).catch(""),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
