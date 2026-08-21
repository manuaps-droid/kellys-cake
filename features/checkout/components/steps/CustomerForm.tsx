"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  customerSchema,
  CustomerFormValues,
} from "../../schemas";

import { useCheckout } from "../../hooks/useCheckout";

import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

export default function CustomerForm() {
  const {
    checkout,
    updateCustomer,
  } = useCheckout();

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: checkout.customer.firstName,
      lastName: checkout.customer.lastName,
      email: checkout.customer.email,
      phone: checkout.customer.phone,
      recipientName: checkout.customer.recipientName,
    },
  });

  useEffect(() => {
    const subscription = watch((values) => {
      updateCustomer({
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        email: values.email || "",
        phone: values.phone || "",
        recipientName: values.recipientName || "",
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, updateCustomer]);

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-2xl font-bold text-cake-espresso">
          Datos del cliente
        </h2>

        <p className="text-sm text-cake-chocolate/60">
          Completa tu información para continuar.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Nombre
          </Label>

          <Input
            id="firstName"
            {...register("firstName")}
          />

          {errors.firstName && (
            <p className="text-sm text-red-500">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Apellido
          </Label>

          <Input
            id="lastName"
            {...register("lastName")}
          />

          {errors.lastName && (
            <p className="text-sm text-red-500">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">
            Correo electrónico
          </Label>

          <Input
            id="email"
            type="email"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">
            Teléfono
          </Label>

          <Input
            id="phone"
            {...register("phone")}
          />

          {errors.phone && (
            <p className="text-sm text-red-500">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="recipientName">
            Persona que recibe (opcional)
          </Label>

          <Input
            id="recipientName"
            placeholder="Nombre de quien recibe el pedido"
            {...register("recipientName")}
          />

          {errors.recipientName && (
            <p className="text-sm text-red-500">
              {errors.recipientName.message}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
