import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Correo electrónico inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const signUpSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100),
    apellidos: z
      .string()
      .min(2, "Los apellidos deben tener al menos 2 caracteres")
      .max(100),
    email: z.email("Correo electrónico inválido"),
    celular: z
      .string()
      .min(9, "El celular debe tener al menos 9 dígitos")
      .max(15, "El celular es demasiado largo"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.email("Correo electrónico inválido"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;