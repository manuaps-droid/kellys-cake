import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

import ReclamosManager, {
  type ReclamoAdmin,
} from "@/features/reclamos/components/admin/ReclamosManager";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminReclamosPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("libro_reclamaciones")
    .select("*")
    .order("created_at", { ascending: false });

  const reclamos = (data ?? []) as ReclamoAdmin[];

  return (
    <section className="space-y-8">
      <PageHeader
        title="Libro de Reclamaciones"
        description="Solicitudes registradas por los consumidores. Responde dentro del plazo legal de 15 días hábiles."
      />

      {reclamos.length === 0 ? (
        <EmptyState
          title="Sin solicitudes"
          description="Aún no se ha registrado ninguna solicitud en el Libro de Reclamaciones."
        />
      ) : (
        <ReclamosManager reclamos={reclamos} />
      )}
    </section>
  );
}
