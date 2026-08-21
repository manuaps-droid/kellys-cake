import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";

import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminGalleryPage() {
  const supabase = createAdminClient();

  // Obtener toda la biblioteca multimedia
  const { data: mediaData } = await supabase
    .from("media")
    .select("id, url, nombre, carpeta, created_at")
    .order("created_at", { ascending: false });

  // Obtener imágenes de proyectos personalizados con cliente
  const { data: proyectoImgs } = await supabase
    .from("proyecto_imagenes")
    .select(
      `
      media_id,
      proyectos_personalizados!proyecto_id (
        clientes (
          nombre,
          apellidos
        )
      )
      `
    );

  // Mapa de media_id -> cliente
  const clienteMap = new Map<string, string>();
  (proyectoImgs ?? []).forEach((r: Record<string, unknown>) => {
    const mediaId = r.media_id as string;
    const proyecto = Array.isArray(r.proyectos_personalizados)
      ? (r.proyectos_personalizados as Array<Record<string, unknown>>)[0]
      : (r.proyectos_personalizados as Record<string, unknown> | null);
    const cliente = proyecto?.clientes as Record<string, unknown> | undefined;
    if (cliente) {
      clienteMap.set(
        mediaId,
        `${(cliente.nombre as string) ?? ""} ${(cliente.apellidos as string) ?? ""}`.trim()
      );
    }
  });

  const images = (mediaData ?? []).map((m: Record<string, unknown>) => ({
    id: m.id as string,
    url: m.url as string,
    nombre: m.nombre as string,
    carpeta: (m.carpeta as string) ?? null,
    created_at: m.created_at as string,
    cliente: clienteMap.get(m.id as string) ?? null,
  }));

  return (
    <section className="space-y-8">
      <PageHeader
        title="Galería"
        description="Toda la biblioteca multimedia del sitio."
      />

      {images.length === 0 ? (
        <EmptyState
          title="Galería vacía"
          description="Aún no hay imágenes. Sube imágenes desde la biblioteca multimedia."
        />
      ) : (
        <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative break-inside-avoid overflow-hidden rounded-2xl bg-gray-100"
            >
              <img
                src={img.url ?? ""}
                alt={img.nombre ?? ""}
                className="w-full transition group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                <p className="truncate text-sm font-medium text-white">
                  {img.nombre}
                </p>

                {img.cliente && (
                  <p className="text-xs text-gray-300">
                    Cliente: {img.cliente}
                  </p>
                )}

                {img.carpeta && !img.cliente && (
                  <p className="text-xs text-gray-300">
                    {img.carpeta}
                  </p>
                )}

                {img.created_at && (
                  <p className="text-xs text-gray-300">
                    {new Date(img.created_at).toLocaleDateString("es-PE")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
