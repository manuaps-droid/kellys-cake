"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import { signUpAction } from "@/features/auth/actions/auth.actions";

import {
  signUpSchema,
  type SignUpSchema,
} from "@/features/auth/validations/auth.schema";

export default function RegisterForm() {
  const router = useRouter();
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      nombre: "",
      apellidos: "",
      email: "",
      celular: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignUpSchema) {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const result = await signUpAction({
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.email,
        celular: data.celular,
        password: data.password,
      });

      if (!result.success) {
        setError("root", {
          message: result.message ?? "No se pudo crear la cuenta.",
        });
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {errors.root.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>

          <Input
            id="nombre"
            type="text"
            placeholder="María"
            {...register("nombre")}
          />

          {errors.nombre && (
            <p className="text-sm text-red-500">
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellidos">Apellidos</Label>

          <Input
            id="apellidos"
            type="text"
            placeholder="García López"
            {...register("apellidos")}
          />

          {errors.apellidos && (
            <p className="text-sm text-red-500">
              {errors.apellidos.message}
            </p>
          )}
        </div>
      </div>

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
        <Label htmlFor="celular">Celular</Label>

        <Input
          id="celular"
          type="tel"
          placeholder="987 654 321"
          {...register("celular")}
        />

        {errors.celular && (
          <p className="text-sm text-red-500">
            {errors.celular.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>

        <Input
          id="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          {...register("password")}
        />

        {errors.password && (
          <p className="text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>

        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repite tu contraseña"
          {...register("confirmPassword")}
        />

        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href="/auth/login"
          className="font-medium hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
