import { getEventoDetalle } from "@/features/eventos/queries/get-evento-detalle";
import { EventoDetalle } from "@/features/eventos/components/EventoDetalle";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await getEventoDetalle(id);

  if (!evento) {
    redirect("/foodos/eventos");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <Link href="/foodos/eventos" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
        ← Volver a todos los eventos
      </Link>
      <EventoDetalle evento={evento} />
    </div>
  );
}
