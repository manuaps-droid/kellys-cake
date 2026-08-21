import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectByIdAdminService } from "@/features/admin/projects/services/_admin/get-project-by-id.admin.service";
import ProjectInfoCard from "@/features/admin/projects/components/detail/ProjectInfoCard";
import ProjectCustomerCard from "@/features/admin/projects/components/detail/ProjectCustomerCard";
import ProjectCatalogsCard from "@/features/admin/projects/components/detail/ProjectCatalogsCard";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const project = await getProjectByIdAdminService(id);

  if (!project) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/proyectos"
            className="text-sm text-gray-500 hover:text-[#D8B07A]"
          >
            ← Volver a proyectos
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            Proyecto #{project.id.slice(0, 8)}
          </h1>
        </div>

        {project.estado !== "finalizado" && (
          <Link
            href={`/admin/cotizaciones/nuevo?proyectoId=${id}`}
            className="rounded-xl bg-cake-gold px-5 py-3 font-semibold text-white transition hover:bg-[#b8860b]"
          >
            Generar cotización
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ProjectInfoCard project={project} />
          <ProjectCatalogsCard catalogs={project.catalogos} />
        </div>

        <div className="space-y-6">
          <ProjectCustomerCard customer={project.cliente} />
        </div>
      </div>

      {project.descripcion && (
        <div className="rounded-3xl border bg-white p-8">
          <h3 className="text-xl font-semibold">Descripción del pastel</h3>
          <p className="mt-4 whitespace-pre-wrap leading-8 text-gray-600">
            {project.descripcion}
          </p>
        </div>
      )}

      {project.mensaje && (
        <div className="rounded-3xl border bg-white p-8">
          <h3 className="text-xl font-semibold">Mensaje especial</h3>
          <p className="mt-4 whitespace-pre-wrap leading-8 text-gray-600">
            {project.mensaje}
          </p>
        </div>
      )}

      {project.observaciones && (
        <div className="rounded-3xl border bg-white p-8">
          <h3 className="text-xl font-semibold">Observaciones del cliente</h3>
          <p className="mt-4 whitespace-pre-wrap leading-8 text-gray-600">
            {project.observaciones}
          </p>
        </div>
      )}

      {project.alergias && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <h3 className="text-xl font-semibold text-amber-800">
            Alergias / Restricciones
          </h3>
          <p className="mt-4 whitespace-pre-wrap leading-8 text-amber-700">
            {project.alergias}
          </p>
        </div>
      )}

      {project.imagenes.length > 0 && (
        <div className="rounded-3xl border bg-white p-8">
          <h3 className="text-xl font-semibold">Imágenes</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.imagenes.map((img) => (
              <div
                key={img.id}
                className="aspect-square overflow-hidden rounded-xl bg-gray-100"
              >
                <img
                  src={img.url ?? ""}
                  alt={img.nombre ?? ""}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border bg-green-50 p-8">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${project.autoriza_comunicacion ? "bg-green-500" : "bg-red-400"}`} />
          <h3 className="text-lg font-semibold text-green-800">
            {project.autoriza_comunicacion
              ? "Autoriza comunicación"
              : "No autoriza comunicación"}
          </h3>
        </div>
        {project.autoriza_comunicacion && (
          <p className="mt-2 text-sm text-green-700">
            El cliente autorizó el uso de su correo y celular para recibir la cotización y comunicaciones relacionadas.
          </p>
        )}
      </div>
    </section>
  );
}
