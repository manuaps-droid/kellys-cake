"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";

import { updateCustomerAction } from "../actions/update-customer.action";

import type { AdminCustomer } from "../types/customer.type";

import {
  updateCustomerSchema,
  type UpdateCustomerSchema,
} from "../validations/update-customer.schema";

type Props = {
  customer: AdminCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UpdateCustomerModal({
  customer,
  open,
  onOpenChange,
}: Props) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateCustomerSchema>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      nombre: customer.nombre,
      apellidos: customer.apellidos ?? "",
      correo: customer.correo ?? "",
      celular: customer.celular ?? "",
      dni: customer.dni ?? "",
      activo: customer.activo,
    },
  });

  const activo = watch("activo");

  const inputClass =
    "h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  function onSubmit(values: UpdateCustomerSchema) {
    startTransition(async () => {
      const result = await updateCustomerAction(
        customer.id,
        values
      );

      if (result.success) {
        toast.success("Cliente actualizado correctamente.");
        onOpenChange(false);
      } else {
        toast.error(
          result.message ?? "No se pudo actualizar el cliente."
        );
      }
    });
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Actualizar cliente"
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="update-customer-form"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </>
      }
    >
      <form
        id="update-customer-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2"
      >
        <div>
          <label className="text-sm font-medium text-gray-700">
            Nombre *
          </label>
          <Input
            className={inputClass}
            placeholder="Nombre"
            {...register("nombre")}
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-red-500">
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Apellidos
          </label>
          <Input
            className={inputClass}
            placeholder="Apellidos"
            {...register("apellidos")}
          />
          {errors.apellidos && (
            <p className="mt-1 text-xs text-red-500">
              {errors.apellidos.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Correo
          </label>
          <Input
            className={inputClass}
            placeholder="correo@ejemplo.com"
            type="email"
            {...register("correo")}
          />
          {errors.correo && (
            <p className="mt-1 text-xs text-red-500">
              {errors.correo.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Celular
          </label>
          <Input
            className={inputClass}
            placeholder="987654321"
            {...register("celular")}
          />
          {errors.celular && (
            <p className="mt-1 text-xs text-red-500">
              {errors.celular.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            DNI
          </label>
          <Input
            className={inputClass}
            placeholder="8 dígitos"
            maxLength={8}
            {...register("dni")}
          />
          {errors.dni && (
            <p className="mt-1 text-xs text-red-500">
              {errors.dni.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 sm:col-span-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            <p className="text-xs text-gray-400">
              Permite habilitar o deshabilitar el cliente.
            </p>
          </div>
          <Switch
            size="sm"
            checked={activo}
            onCheckedChange={(v: boolean) =>
              setValue("activo", v, { shouldValidate: false })
            }
          />
        </div>
      </form>
    </Modal>
  );
}