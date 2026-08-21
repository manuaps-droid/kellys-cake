import Link from "next/link";
import { notFound } from "next/navigation";

import PageHeader from "@/components/common/PageHeader";

import { createAdminClient } from "@/lib/supabase/admin";

import CotizacionEditor from "@/features/cotizaciones/components/CotizacionEditor";
import { descripcionToItems } from "@/features/cotizaciones/lib/parse-items";

import type { CotizacionItem } from "@/features/cotizaciones/types/cotizacion.types";

type Props = {
  searchParams: Promise<{
    cateringId?: string;
    proyectoId?: string;
  }>;
};

function withIds(items: unknown[]): CotizacionItem[] {
  return items.map((raw, index) => ({
    ...(raw as CotizacionItem),
    id: (raw as CotizacionItem).id ?? `item-${index}-${Date.now()}`,
  }));
}

export default async function NuevaCotizacionPage({ searchParams }: Props) {
  const { cateringId, proyectoId } = await searchParams;

  if (!cateringId && !proyectoId) {
    notFound();
  }

  const supabase = createAdminClient();

  let clienteNombre = "Cliente";
  let initialItems: CotizacionItem[] = [];
  let existing: { id: string; items: unknown } | null = null;

  if (cateringId) {
    const { data: catering } = await supabase
      .from("cotizaciones_catering")
      .select("id, nombre, descripcion")
      .eq("id", cateringId)
      .single();

    if (!catering) {
      notFound();
    }

    clienteNombre = catering.nombre ?? "";

    const { data: existingCotizacion } = await supabase
      .from("cotizaciones")
      .select("id, items")
      .eq("catering_id", cateringId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    existing = existingCotizacion ?? null;

    const rawItems = (existing?.items as unknown[]) ?? [];
    initialItems = rawItems.length
      ? withIds(rawItems)
      : descripcionToItems(catering.descripcion ?? "");
  } else if (proyectoId) {
    const { data: proyecto } = await supabase
      .from("proyectos_personalizados")
      .select(
        "id, descripcion, presupuesto, clientes ( nombre )"
      )
      .eq("id", proyectoId)
      .single();

    if (!proyecto) {
      notFound();
    }

    const clienteData = Array.isArray(proyecto.clientes)
      ? proyecto.clientes[0]
      : proyecto.clientes;
    clienteNombre = clienteData?.nombre ?? "Cliente";

    const { data: existingCotizacion } = await supabase
      .from("cotizaciones")
      .select("id, items")
      .eq("proyecto_id", proyectoId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    existing = existingCotizacion ?? null;

    const { data: imagenesRows } = await supabase
      .from("proyecto_imagenes")
      .select(`
        media (
          url
        )
      `)
      .eq("proyecto_id", proyectoId)
      .order("orden")
      .limit(1);

    const primerMedia = Array.isArray(imagenesRows?.[0]?.media)
      ? imagenesRows[0].media[0]
      : imagenesRows?.[0]?.media;
    const imagenProyecto = (primerMedia?.url as string | null) ?? null;

    const rawItems = (existing?.items as unknown[]) ?? [];
    initialItems = rawItems.length
      ? withIds(rawItems)
      : [
          {
            id: `item-proyecto-${Date.now()}`,
            tipo: "pastel",
            nombre: "Pastel personalizado",
            descripcion: proyecto.descripcion ?? "",
            cantidad: 1,
            precio_unitario: proyecto.presupuesto ?? 0,
            imagen: imagenProyecto,
          },
        ];
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Generar cotización"
        description={`Documento de cotización para ${clienteNombre}.`}
        actions={
          <Link
            href={cateringId ? `/admin/catering/${cateringId}` : `/admin/proyectos/${proyectoId}`}
            className="rounded-xl border border-gray-300 px-5 py-3 font-medium transition hover:bg-gray-100"
          >
            ← Volver
          </Link>
        }
      />

      <CotizacionEditor
        cateringId={cateringId}
        proyectoId={proyectoId}
        clienteNombre={clienteNombre}
        initialItems={initialItems}
        existingId={existing?.id}
      />
    </section>
  );
}
