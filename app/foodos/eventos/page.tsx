import Link from "next/link";
import { getEventos } from "@/features/eventos/queries/get-eventos";
import { EventosList } from "@/features/eventos/components/EventosList";

export default async function EventosPage() {
  const eventos = await getEventos();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Eventos & Rentabilidad</h1>
          <p className="text-gray-500 text-sm">Calcula la ganancia real de cada pedido o evento individual.</p>
        </div>
        <Link href="/foodos/eventos/nuevo" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm text-sm">
          + Nuevo Evento
        </Link>
      </div>

      <EventosList eventos={eventos} />
    </div>
  );
}
