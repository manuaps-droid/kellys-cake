"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authClient } from "@/features/auth/services/auth.client";

import {
  signInSchema,
  type SignInSchema,
} from "@/features/auth/validations/auth.schema";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInSchema) {
    const { error } = await authClient.signIn(
      data.email,
      data.password
    );

    if (error) {
      setError("root", {
        message: "Correo o contraseña incorrectos.",
      });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {errors.root.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>

        <Input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>

        <Input
          id="password"
          type="password"
          placeholder="********"
          {...register("password")}
        />

        {errors.password && (
          <p className="text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Iniciando sesión..."
          : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm">
        ¿No tienes una cuenta?{" "}
        <Link
          href="/auth/register"
          className="font-medium hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}