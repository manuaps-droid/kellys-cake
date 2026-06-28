"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signUp } from "@/services/auth/auth.service";

const registerSchema = z
  .object({
    nombre: z.string().min(3, "Ingrese su nombre completo"),
    email: z.string().email("Ingrese un correo válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    const { error } = await signUp(
      data.nombre,
      data.email,
      data.password
    );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "¡Cuenta creada correctamente! Revisa tu correo electrónico para confirmar tu cuenta."
    );

    reset();
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-3xl">
          Crear una cuenta
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <Label htmlFor="nombre">Nombre completo</Label>

            <Input
              id="nombre"
              placeholder="Juan Pérez"
              {...register("nombre")}
            />

            {errors.nombre && (
              <p className="mt-1 text-sm text-red-500">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo electrónico</Label>

            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              {...register("email")}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>

            <Input
              id="password"
              type="password"
              {...register("password")}
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">
              Confirmar contraseña
            </Label>

            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}