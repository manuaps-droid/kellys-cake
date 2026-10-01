"use client";

import { useState, useTransition } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";

import { updateConfigAction } from "@/features/admin/configuracion/actions/config.action";

// -------------------------------------------------------------
// Definición de campos para el renderer dinámico.
// -------------------------------------------------------------
export type FieldDef =
  | {
      key: string;
      type: "text" | "textarea" | "number" | "url" | "email" | "color";
      label: string;
      placeholder?: string;
      help?: string;
      half?: boolean;
    }
  | {
      key: string;
      type: "switch";
      label: string;
      help?: string;
    }
  | {
      key: string;
      type: "select";
      label: string;
      help?: string;
      half?: boolean;
      options: Array<{ value: string; label: string }>;
    };

type ConfigSectionFormProps = {
  seccion: string;
  fields: FieldDef[];
  defaultValues: Record<string, unknown>;
};

export default function ConfigSectionForm({
  seccion,
  fields,
  defaultValues,
}: ConfigSectionFormProps) {
  const [pending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  const form = useForm<FieldValues>({
    resolver: zodResolver(z.object({})) as never,
    defaultValues,
  });

  function onSubmit(values: FieldValues) {
    startTransition(async () => {
      const result = await updateConfigAction(seccion as any, values);
      if (result.success) {
        toast.success("Configuración actualizada correctamente.");
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1500);
      } else {
        toast.error(result.message ?? "No se pudo guardar la configuración.");
      }
    });
  }

  function renderField(f: FieldDef) {
    const name = f.key;
    const error = form.formState.errors[name];
    const register = form.register as any;
    const baseClass =
      "h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

    if (f.type === "switch") {
      return (
        <div key={f.key} className="flex items-center justify-between gap-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700">{f.label}</label>
            {f.help && <p className="mt-0.5 text-xs text-gray-400">{f.help}</p>}
          </div>
          <Switch
            checked={Boolean(form.watch(name))}
            onCheckedChange={(v: boolean) =>
              form.setValue(name, v as never, { shouldValidate: false })
            }
          />
        </div>
      );
    }

    if (f.type === "select") {
      return (
        <div key={f.key} className={f.half ? "col-span-1" : "col-span-2"}>
          <label className="text-sm font-medium text-gray-700">{f.label}</label>
          {f.help && <p className="mb-1 text-xs text-gray-400">{f.help}</p>}
          <select className={baseClass} {...register(name)}>
            {(f.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {error && (
            <p className="mt-1 text-xs text-red-500">
              {String(error.message ?? "")}
            </p>
          )}
        </div>
      );
    }

    if (f.type === "textarea") {
      return (
        <div key={f.key} className="col-span-2">
          <label className="text-sm font-medium text-gray-700">{f.label}</label>
          {f.help && <p className="mb-1 text-xs text-gray-400">{f.help}</p>}
          <Textarea
            rows={3}
            placeholder={f.placeholder}
            className="resize-none"
            {...register(name)}
          />
          {error && (
            <p className="mt-1 text-xs text-red-500">
              {String(error.message ?? "")}
            </p>
          )}
        </div>
      );
    }

    if (f.type === "color") {
      return (
        <div key={f.key} className={f.half ? "col-span-1" : "col-span-2"}>
          <label className="text-sm font-medium text-gray-700">{f.label}</label>
          {f.help && <p className="mb-1 text-xs text-gray-400">{f.help}</p>}
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-transparent"
              {...register(name)}
            />
            <Input type="text" placeholder="#D8B07A" {...register(name)} />
          </div>
          {error && (
            <p className="mt-1 text-xs text-red-500">
              {String(error.message ?? "")}
            </p>
          )}
        </div>
      );
    }

    const inpType: string =
      f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text";

    return (
      <div key={f.key} className={f.half ? "col-span-1" : "col-span-2"}>
        <label className="text-sm font-medium text-gray-700">{f.label}</label>
        {f.help && <p className="mb-1 text-xs text-gray-400">{f.help}</p>}
        <Input
          type={inpType}
          placeholder={f.placeholder}
          className={baseClass}
          step={f.type === "number" ? "0.01" : undefined}
          {...register(name)}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">
            {String(error.message ?? "")}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
        {fields.map(renderField)}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={pending || form.formState.isSubmitting}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : justSaved ? (
            "Guardado ✓"
          ) : (
            "Guardar cambios"
          )}
        </Button>
        <p className="text-xs text-gray-400">
          Los cambios se reflejan inmediatamente en la tienda pública.
        </p>
      </div>
    </form>
  );
}