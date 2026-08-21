"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { getFlavorsAction } from "../actions/get-flavors.action";
import { getFillingsAction } from "../actions/get-fillings.action";
import { getFrostingsAction } from "../actions/get-frostings.action";
import { useCatalogSelection } from "../hooks/useCatalogSelection";
import { createProjectAction } from "../actions/create-project.action";
import { useCustomization } from "../context/CustomizationProvider";
import {
  loadCateringPending,
  updateCateringPending,
  clearCateringPending,
} from "@/features/catering/lib/catering-link";

export default function SummaryStep() {
  const router = useRouter();

  const {
    data,
    updateData,
    resetWizard,
  } = useCustomization();

  const [uploading, setUploading] =
    useState(false);
  const [pending, startTransition] =
    useTransition();

  const flavors = useCatalogSelection({
    loader: getFlavorsAction,
    key: "flavors",
  });

  const fillings = useCatalogSelection({
    loader: getFillingsAction,
    key: "fillings",
  });

  const frostings = useCatalogSelection({
    loader: getFrostingsAction,
    key: "frostings",
  });

  const flavorMap = useMemo(
    () =>
      new Map(
        flavors.map((f) => [f.id, f.nombre])
      ),
    [flavors]
  );

  const fillingMap = useMemo(
    () =>
      new Map(
        fillings.map((f) => [f.id, f.nombre])
      ),
    [fillings]
  );

  const frostingMap = useMemo(
    () =>
      new Map(
        frostings.map((f) => [f.id, f.nombre])
      ),
    [frostings]
  );

  function resolveNames(
    ids: string[],
    map: Map<string, string>
  ) {
    return ids
      .map((id) => map.get(id))
      .filter(
        (n): n is string => !!n
      )
      .join(", ");
  }

  const canSubmit =
    data.autorizaComunicacion;

  async function finish() {
    if (!canSubmit) return;

    // Los pedidos se programan con mínimo 5 días de anticipación
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 5);
    const minDateStr = minDate.toISOString().split("T")[0];
    if (data.deliveryDate < minDateStr) {
      alert(`La fecha del evento debe ser con mínimo 5 días de anticipación (a partir del ${minDateStr}).`);
      return;
    }

    setUploading(true);

    const mediaIds: string[] = [];

    for (const file of data.inspirationImages) {
      const formData =
        new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(
          "/api/upload-image",
          {
            method: "POST",
            body: formData,
          }
        );

        const result =
          await res.json();

        if (
          result.success &&
          result.media
        ) {
          mediaIds.push(
            result.media.id
          );
        }
      } catch {
        console.error(
          "Error subiendo imagen"
        );
      }
    }

    setUploading(false);

    startTransition(async () => {
      const result =
        await createProjectAction({
          descripcion:
            data.description,
          mensaje: data.message,
          personas: data.people,
          presupuesto:
            data.budget,
          alergias: data.allergies,
          fechaEvento:
            data.deliveryDate,
          horaEvento:
            data.deliveryTime,
          tipoEntrega:
            data.deliveryType,
          direccion: data.address,
          referencia:
            data.reference,
          latitud: data.latitude,
          longitud: data.longitude,
          catalogos:
            data.flavors
              .concat(
                data.fillings
              )
              .concat(
                data.frostings
              ),
          imagenes: mediaIds,
          observaciones:
            data.observaciones,
          autorizaComunicacion:
            data.autorizaComunicacion,
        });

      if (!result.success) {
        alert(
          result.message ??
            "Ocurrió un error al crear el proyecto."
        );

        return;
      }

      resetWizard();

      // ¿Venimos del formulario de catering?
      const cateringPending = loadCateringPending();
      if (cateringPending && result.project?.id) {
        // Construir resumen del pastel para mostrar en el formulario de catering
        const partes: string[] = [];
        if (data.celebration) partes.push(`Celebración: ${data.celebration}`);
        if (data.people) partes.push(`Personas: ${data.people}`);
        const sabores = resolveNames(data.flavors, flavorMap);
        const rellenos = resolveNames(data.fillings, fillingMap);
        const coberturas = resolveNames(data.frostings, frostingMap);
        if (sabores) partes.push(`Sabores: ${sabores}`);
        if (rellenos) partes.push(`Rellenos: ${rellenos}`);
        if (coberturas) partes.push(`Coberturas: ${coberturas}`);
        if (data.deliveryDate) partes.push(`Fecha: ${data.deliveryDate} ${data.deliveryTime || ""}`.trim());
        if (data.deliveryType) partes.push(`Entrega: ${data.deliveryType === "delivery" ? "Delivery" : "Recojo en tienda"}`);
        if (data.address) partes.push(`Dirección: ${data.address}`);
        if (data.description) partes.push(`Descripción: ${data.description}`);
        if (data.allergies) partes.push(`Alergias: ${data.allergies}`);

        updateCateringPending({
          proyecto_id: result.project.id,
          pastel_resumen: partes.join("\n"),
        });

        router.push("/catering?from=catering#cotizar");
        return;
      }

      // Limpieza por si quedó algún flag abandonado
      clearCateringPending();

      router.push(
        "/personalizar/gracias"
      );
    });
  }

  const busy = uploading || pending;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <span className="text-sm font-semibold uppercase tracking-widest text-[#D8B07A]">
        Último paso
      </span>

      <h1 className="mt-4 font-playfair text-5xl font-bold text-[#0B1423]">
        Revisa tu solicitud
      </h1>

      <p className="mt-6 max-w-3xl text-lg text-gray-600">
        Verifica que toda la información sea correcta antes de enviar tu solicitud.
      </p>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <SummaryCard
          title="Celebración"
          value={data.celebration}
        />

        <SummaryCard
          title="Personas"
          value={`${data.people}`}
        />

        <SummaryCard
          title="Sabores"
          value={
            data.flavors.length
              ? resolveNames(
                  data.flavors,
                  flavorMap
                )
              : "-"
          }
        />

        <SummaryCard
          title="Rellenos"
          value={
            data.fillings.length
              ? resolveNames(
                  data.fillings,
                  fillingMap
                )
              : "-"
          }
        />

        <SummaryCard
          title="Coberturas"
          value={
            data.frostings.length
              ? resolveNames(
                  data.frostings,
                  frostingMap
                )
              : "-"
          }
        />

        <SummaryCard
          title="Fecha"
          value={`${data.deliveryDate} ${data.deliveryTime}`}
        />

        <SummaryCard
          title="Entrega"
          value={
            data.deliveryType ===
            "delivery"
              ? "Delivery"
              : "Recojo en tienda"
          }
        />

        {data.address && (
          <SummaryCard
            title="Dirección"
            value={data.address}
          />
        )}
      </div>

      {data.description && (
        <div className="mt-10 rounded-3xl border bg-white p-8">
          <h3 className="text-xl font-semibold">
            Descripción del pastel
          </h3>

          <p className="mt-4 whitespace-pre-wrap leading-8 text-gray-600">
            {data.description}
          </p>
        </div>
      )}

      <div className="mt-10 rounded-3xl border bg-white p-8">
        <h3 className="text-xl font-semibold">
          Observaciones
        </h3>

        <textarea
          value={
            data.observaciones
          }
          onChange={(e) =>
            updateData({
              observaciones:
                e.target.value,
            })
          }
          placeholder="Si tienes alguna observación adicional, escríbela aquí..."
          rows={4}
          className="mt-4 w-full resize-none rounded-xl border border-gray-200 p-4 text-gray-700 outline-none transition focus:border-[#D8B07A] focus:ring-2 focus:ring-[#D8B07A]/20"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-[#D8B07A]/30 bg-amber-50 p-8">
        <label className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={
              data.autorizaComunicacion
            }
            onChange={(e) =>
              updateData({
                autorizaComunicacion:
                  e.target.checked,
              })
            }
            className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-[#D8B07A] focus:ring-[#D8B07A]"
          />

          <span className="text-sm leading-6 text-gray-700">
            Autorizo que Kelly's Cake utilice mi correo
            electrónico y número de celular para
            remitirme comunicaciones relacionadas con mi
            solicitud, incluyendo —pero sin limitarse a— la
            cotización correspondiente, así como información
            sobre promociones y novedades. Esta autorización
            se mantendrá vigente hasta que manifieste lo
            contrario.
          </span>
        </label>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          type="button"
          onClick={finish}
          disabled={busy || !canSubmit}
          className="rounded-xl bg-[#0B1423] px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy
            ? uploading
              ? "Subiendo imágenes..."
              : "Enviando..."
            : "Enviar solicitud"}
        </button>
      </div>
    </section>
  );
}

type CardProps = {
  title: string;
  value: string;
};

function SummaryCard({
  title,
  value,
}: CardProps) {
  return (
    <div className="rounded-3xl border bg-white p-6">
      <p className="text-sm uppercase tracking-wider text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-lg font-semibold text-[#0B1423]">
        {value || "-"}
      </p>
    </div>
  );
}
