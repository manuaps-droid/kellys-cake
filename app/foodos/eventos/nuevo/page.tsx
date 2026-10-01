"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearEvento } from "@/features/eventos/actions/evento-actions";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");
  const [montoCobrado, setMontoCobrado] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCrear = async () => {
    if (!nombre.trim()) { setError("El nombre del evento es obligatorio."); return; }
    if (!montoCobrado || Number(montoCobrado) <= 0) { setError("Ingresa el monto que cobrarás al cliente."); return; }

    setLoading(true);
    setError(null);

    const res = await crearEvento({
      nombre: nombre.trim(),
      cliente: cliente || undefined,
      fecha_evento: fecha || undefined,
      monto_cobrado: Number(montoCobrado),
      notas: notas || undefined,
    });

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/foodos/eventos/" + res.eventoId);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">➕ Crear Nuevo Evento</h1>
        <p className="text-gray-500 text-sm">Define el evento o pedido y cuánto cobrarás. Luego podrás ir registrando cada gasto.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Evento *</label>
          <input type="text" placeholder="Ej: Boda Pérez-Gonzales, Cumpleaños Ana 15 años..." value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border border-gray-300 p-3 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
            <input type="text" placeholder="Nombre del cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full rounded-lg border border-gray-300 p-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha del Evento</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full rounded-lg border border-gray-300 p-3 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-green-700 uppercase mb-1">💵 Monto Cobrado al Cliente (S/) *</label>
          <input type="number" step="0.01" placeholder="3500.00" value={montoCobrado} onChange={(e) => setMontoCobrado(e.target.value)} className="w-full rounded-lg border-2 border-green-400 bg-green-50 p-3 text-lg font-black" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas / Descripción</label>
          <textarea placeholder="Ej: Torta 3 pisos + 200 cupcakes + mesa dulce" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 p-3 text-sm" />
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg font-medium">⚠️ {error}</div>}

        <button type="button" onClick={handleCrear} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm shadow-lg transition-all">
          {loading ? "Creando evento..." : "Crear Evento y Empezar a Registrar Gastos →"}
        </button>
      </div>
    </div>
  );
}
