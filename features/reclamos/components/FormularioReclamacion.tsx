"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FileText, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { createReclamoAction } from "@/features/reclamos/actions/create-reclamo.action";
import {
  libroReclamacionesSchema,
  type LibroReclamacionesSchema,
} from "@/features/reclamos/validations/libro-reclamaciones.schema";

const inputCls =
  "w-full rounded-xl border border-kc-sand/70 bg-white px-4 py-2.5 text-sm text-kc-charcoal placeholder:text-kc-mocha/40 outline-none transition focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20";

const errorCls = "mt-1 text-xs text-red-600";

const labelCls =
  "mb-1.5 block text-xs font-semibold tracking-wide text-kc-mocha uppercase";

export default function FormularioReclamacion() {
  const [numeroGenerado, setNumeroGenerado] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LibroReclamacionesSchema>({
    resolver: zodResolver(libroReclamacionesSchema) as any,
    defaultValues: {
      tipo: undefined,
      fecha_compra: "",
    },
  });

  const tipoSel = watch("tipo");

  function onSubmit(values: LibroReclamacionesSchema) {
    startTransition(async () => {
      const result = await createReclamoAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setNumeroGenerado(result.numero ?? "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Pantalla de confirmación
  if (numeroGenerado !== null) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-emerald-50/60 p-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-kc-charcoal">
          Solicitud registrada
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-kc-mocha">
          Tu solicitud ingresó al Libro de Reclamaciones con el número:
        </p>
        <p className="mt-3 inline-block rounded-full bg-white px-6 py-2 font-mono text-lg font-bold text-kc-charcoal shadow-sm">
          {numeroGenerado}
        </p>
        <p className="mx-auto mt-5 max-w-md text-xs leading-relaxed text-kc-mocha/80">
          Enviaremos nuestra respuesta a tu correo electrónico en un plazo
          máximo de <strong>15 días hábiles</strong>, conforme a la normativa
          vigente. Guarda este número para cualquier seguimiento.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setNumeroGenerado(null);
            reset();
          }}
          className="mt-6 rounded-full"
        >
          Registrar otra solicitud
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* TIPO DE SOLICITUD */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest text-kc-charcoal uppercase">
          <FileText className="h-4 w-4 text-kc-rose-gold" />
          Tipo de solicitud
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              {
                value: "reclamo",
                titulo: "Reclamo",
                desc: "Disconformidad sobre los productos o servicios contratados.",
              },
              {
                value: "queja",
                titulo: "Queja",
                desc: "Disconformidad sobre la atención al cliente o el servicio recibido.",
              },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                tipoSel === opt.value
                  ? "border-kc-rose-gold bg-kc-blush/20 shadow-md"
                  : "border-kc-sand/60 bg-white hover:border-kc-rose-gold/40"
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                {...register("tipo")}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                    tipoSel === opt.value
                      ? "border-kc-rose-gold bg-kc-rose-gold"
                      : "border-kc-sand bg-white"
                  }`}
                >
                  {tipoSel === opt.value && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="font-semibold text-kc-charcoal">
                  {opt.titulo}
                </span>
              </div>
              <p className="mt-2 pl-8 text-xs leading-relaxed text-kc-mocha">
                {opt.desc}
              </p>
            </label>
          ))}
        </div>
        {errors.tipo && <p className={errorCls}>{errors.tipo.message}</p>}
      </section>

      {/* I. IDENTIFICACIÓN DEL CONSUMIDOR */}
      <section>
        <h3 className="text-sm font-bold tracking-widest text-kc-charcoal uppercase">
          I. Identificación del consumidor
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nombres *</label>
            <input {...register("nombres")} className={inputCls} placeholder="Ej. María Fernanda" />
            {errors.nombres && <p className={errorCls}>{errors.nombres.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Apellidos *</label>
            <input {...register("apellidos")} className={inputCls} placeholder="Ej. Quispe Torres" />
            {errors.apellidos && <p className={errorCls}>{errors.apellidos.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Tipo de documento *</label>
            <select {...register("tipo_documento")} className={inputCls} defaultValue="">
              <option value="" disabled>
                Selecciona…
              </option>
              <option value="dni">DNI</option>
              <option value="ce">Carné de extranjería</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="ruc">RUC</option>
            </select>
            {errors.tipo_documento && (
              <p className={errorCls}>{errors.tipo_documento.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Número de documento *</label>
            <input {...register("numero_documento")} className={inputCls} placeholder="Ej. 71234567" />
            {errors.numero_documento && (
              <p className={errorCls}>{errors.numero_documento.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Domicilio *</label>
            <input {...register("direccion")} className={inputCls} placeholder="Ej. Calle Los Álamos 123, Cayma" />
            {errors.direccion && <p className={errorCls}>{errors.direccion.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Correo electrónico *</label>
            <input {...register("email")} type="email" className={inputCls} placeholder="tucorreo@ejemplo.com" />
            {errors.email && <p className={errorCls}>{errors.email.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Teléfono *</label>
            <input {...register("telefono")} className={inputCls} placeholder="Ej. 987654321" />
            {errors.telefono && <p className={errorCls}>{errors.telefono.message}</p>}
          </div>
        </div>
      </section>

      {/* II. DETALLE DE LA COMPRA */}
      <section>
        <h3 className="text-sm font-bold tracking-widest text-kc-charcoal uppercase">
          II. Detalle de la compra
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Producto o servicio contratado *</label>
            <input
              {...register("producto_servicio")}
              className={inputCls}
              placeholder="Ej. Torta personalizada de chocolate, 1 kg"
            />
            {errors.producto_servicio && (
              <p className={errorCls}>{errors.producto_servicio.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Monto reclamado (S/) *</label>
            <input
              {...register("monto_reclamado")}
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
              placeholder="0.00"
            />
            {errors.monto_reclamado && (
              <p className={errorCls}>{errors.monto_reclamado.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Fecha de compra</label>
            <input {...register("fecha_compra")} type="date" className={inputCls} />
          </div>
        </div>
      </section>

      {/* III. DETALLE DE LA RECLAMACIÓN */}
      <section>
        <h3 className="text-sm font-bold tracking-widest text-kc-charcoal uppercase">
          III. Detalle de la reclamación
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>Descripción del hecho *</label>
            <textarea
              {...register("descripcion")}
              rows={5}
              className={inputCls}
              placeholder="Describe qué ocurrió, cuándo y con quién…"
            />
            {errors.descripcion && (
              <p className={errorCls}>{errors.descripcion.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Petición concreta *</label>
            <textarea
              {...register("peticion")}
              rows={3}
              className={inputCls}
              placeholder="¿Qué solución esperas? Ej. cambio del producto, devolución del dinero…"
            />
            {errors.peticion && <p className={errorCls}>{errors.peticion.message}</p>}
          </div>
        </div>
      </section>

      {/* Envío */}
      <div className="rounded-2xl border border-kc-sand/60 bg-white p-5">
        <p className="text-[11px] leading-relaxed text-kc-mocha/80">
          El registro en el Libro de Reclamaciones es gratuito. Kelly&apos;s
          Cake se compromete a dar respuesta a tu solicitud en un plazo máximo
          de <strong>15 días hábiles</strong> conforme a la normativa vigente.
          La respuesta será enviada al correo que indicaste.
        </p>
        <Button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-full py-3 text-sm shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-auto sm:px-10"
        >
          <Send className="mr-2 inline h-4 w-4" />
          {pending ? "Enviando…" : "Enviar reclamación"}
        </Button>
      </div>
    </form>
  );
}
