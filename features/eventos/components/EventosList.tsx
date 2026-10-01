"use client";

import Link from "next/link";

export function EventosList({ eventos }: { eventos: any[] }) {
  return (
    <div className="space-y-4">
      {eventos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-bold text-gray-700">No tienes eventos registrados aún</h3>
          <p className="text-sm text-gray-500 mt-1">Crea tu primer evento para empezar a calcular tu rentabilidad real.</p>
          <Link href="/foodos/eventos/nuevo" className="inline-block mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm">
            + Crear Primer Evento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventos.map((ev) => {
            const esPositivo = ev.ganancia >= 0;
            return (
              <Link
                key={ev.id}
                href={"/foodos/eventos/" + ev.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all block"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{ev.nombre}</h3>
                    {ev.cliente && <p className="text-xs text-gray-500">{ev.cliente}</p>}
                  </div>
                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + (ev.estado === "completado" ? "bg-emerald-100 text-emerald-800" : ev.estado === "cancelado" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800")}>
                    {ev.estado === "completado" ? "Completado" : ev.estado === "cancelado" ? "Cancelado" : "En curso"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-lg p-3 mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Cobrado</p>
                    <p className="text-sm font-black text-gray-900">S/ {Number(ev.monto_cobrado).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Gastos</p>
                    <p className="text-sm font-black text-red-600">S/ {Number(ev.total_gastos).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Ganancia</p>
                    <p className={"text-sm font-black " + (esPositivo ? "text-emerald-600" : "text-red-600")}>
                      S/ {Number(ev.ganancia).toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    {ev.fecha_evento || "Sin fecha"} &middot; {ev.num_gastos} gastos
                  </span>
                  <span className={"font-black " + (esPositivo ? "text-emerald-600" : "text-red-600")}>
                    {ev.margen.toFixed(1)}% margen
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
