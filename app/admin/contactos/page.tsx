import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminContactosPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("contactos")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  const mensajes = data ?? [];

  return (
    <section className="space-y-8">
      <PageHeader
        title="Mensajes de contacto"
        description="Bandeja de entrada de consultas de clientes."
      />

      {mensajes.length === 0 ? (
        <EmptyState
          title="Bandeja vacía"
          description="Aún no has recibido ningún mensaje de contacto."
        />
      ) : (
        <div className="space-y-4">
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className="rounded-2xl border bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">
                    {msg.nombre}
                  </h3>

                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>
                      {msg.email}
                    </span>

                    {msg.telefono && (
                      <span>
                        {msg.telefono}
                      </span>
                    )}

                    <span className="text-xs text-gray-400">
                      {new Date(
                        msg.created_at
                      ).toLocaleString(
                        "es-PE"
                      )}
                    </span>
                  </div>
                </div>

                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
                  {msg.asunto}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-600">
                {msg.mensaje}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
