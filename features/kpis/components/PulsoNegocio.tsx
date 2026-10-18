"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  HeartPulse,
  Loader2,
} from "lucide-react";

import { guardarMermaMesAction } from "../actions/merma.action";
import type { DatosPulso } from "../types/pulso.types";

function soles(valor: number): string {
  return `S/ ${valor.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const CLASE_INSIGHT =
  "mt-4 rounded-lg border-l-4 bg-neutral-50 p-3 text-sm text-neutral-600";

export default function PulsoNegocio({
  datos,
}: {
  datos: DatosPulso;
}) {
  const [montoMerma, setMontoMerma] = useState(
    datos.merma.registrada ? String(datos.merma.monto) : ""
  );
  const [registrando, startTransition] = useTransition();

  async function guardarMerma() {
    const monto = Number(montoMerma);

    if (!Number.isFinite(monto) || monto < 0) {
      toast.error("Ingresa un monto válido en soles.");
      return;
    }

    startTransition(async () => {
      const res = await guardarMermaMesAction(monto);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Merma del mes registrada.");
    });
  }

  const { ticket, lealtad, merma, rotacion } = datos;

  const subioTicket =
    ticket.anterior != null && ticket.diferencia > 0;
  const bajoTicket =
    ticket.anterior != null && ticket.diferencia < 0;

  const insightTicket =
    !datos.tieneDatos || ticket.pedidosMes === 0
      ? "Este mes aún no hay pedidos. En cuanto entren, aquí verás cuánto deja cada uno."
      : ticket.anterior == null
        ? `Con ${ticket.pedidosMes} pedido(s) este mes, cada venta te deja ${soles(ticket.actual)} en promedio.`
        : subioTicket
          ? `Cada pedido te está dejando ${soles(Math.abs(ticket.diferencia))} más que el mes pasado. ¡Sigue ofreciendo toppers y boxes en el carrito!`
          : bajoTicket
            ? `Cada pedido deja ${soles(Math.abs(ticket.diferencia))} menos que el mes pasado. Prueba ofrecer un topper 3D antes de confirmar la venta.`
            : `Estable frente al mes pasado. Ofrece un extra (topper, box pet) para subirlo.`;

  const insightLealtad =
    lealtad.totalMes === 0
      ? "Sin pedidos de clientes registrados este mes todavía."
      : lealtad.pct >= 50
        ? `De cada 10 pedidos de este mes, ${Math.round(lealtad.pct / 10)} son de clientes que ya te conocían. Tu publicidad para ellos cuesta S/ 0.00.`
        : `De cada 10 pedidos, ${Math.round(lealtad.pct / 10)} son de clientes que vuelven. Cuida a los nuevos: escríbeles tras la entrega para que regresen.`;

  const insightMerma =
    merma.estado === "sin-registro"
      ? "Anota cuánto producto horneaste y no vendiste este mes. Con ese dato te aviso si superas el límite saludable del 5%."
      : merma.estado === "saludable"
        ? `Estás por debajo del límite saludable del 5%. Excelente control de producción.`
        : merma.estado === "alerta"
          ? `Superaste el 5%: revisa qué sabores sobran y produce menos de esos o envíalos a la máquina.`
          : `Merma crítica (${merma.pct}%). Reduce la producción de lo que no se vende y prioriza lo de alta rotación.`;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
          FoodOS · Gestión
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900">
          <HeartPulse className="h-6 w-6 text-rose-500" />
          Pulso del Negocio
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Tus indicadores en lenguaje natural: qué está pasando, si va bien
          y qué hacer al respecto. Calculado con los datos reales de tu
          tienda y producción.
        </p>
      </div>

      {!datos.tieneDatos && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Aún no hay pedidos registrados. En cuanto vendas, este panel se
          llena solo. Solo la merma se anota a mano.
        </div>
      )}

      {/* Fila 1: Ticket, Lealtad y Merma */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Ticket promedio */}
        <div className="flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-xl bg-blue-50 p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            {ticket.anterior != null && ticket.diferencia !== 0 && (
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${
                  subioTicket
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {subioTicket ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {soles(Math.abs(ticket.diferencia))}
              </span>
            )}
          </div>
          <div>
            <h3 className="mb-1 font-medium text-neutral-500">
              Ticket Promedio
            </h3>
            <p className="text-3xl font-bold text-neutral-800">
              {soles(ticket.actual)}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {ticket.pedidosMes} pedido(s) · {soles(ticket.totalMes)} en
              el mes
            </p>
          </div>
          <div className={`${CLASE_INSIGHT} border-blue-500`}>
            {insightTicket}
          </div>
        </div>

        {/* Termómetro de lealtad */}
        <div className="flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-xl bg-pink-50 p-3">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <span className="rounded-full bg-pink-50 px-2 py-1 text-sm font-medium text-pink-700">
              {lealtad.pct}% fieles
            </span>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-neutral-500">
              Termómetro de Lealtad
            </h3>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full bg-pink-500"
                style={{ width: `${lealtad.pct}%` }}
              />
              <div className="h-full bg-neutral-300" style={{ width: `${100 - lealtad.pct}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs font-medium text-neutral-500">
              <span className="text-pink-600">
                {lealtad.recurrentes} recurrentes
              </span>
              <span>{lealtad.nuevos} nuevos</span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              {lealtad.clientesNuevos} cliente(s) comprando por primera vez
            </p>
          </div>
          <div className={`${CLASE_INSIGHT} border-pink-500`}>
            {insightLealtad}
          </div>
        </div>

        {/* Índice de dinero en la basura (merma) */}
        <div className="flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div
              className={`rounded-xl p-3 ${
                merma.estado === "saludable"
                  ? "bg-emerald-50"
                  : merma.estado === "critico"
                    ? "bg-red-50"
                    : merma.estado === "alerta"
                      ? "bg-orange-50"
                      : "bg-neutral-50"
              }`}
            >
              <AlertTriangle
                className={`h-6 w-6 ${
                  merma.estado === "saludable"
                    ? "text-emerald-600"
                    : merma.estado === "critico"
                      ? "text-red-600"
                      : merma.estado === "alerta"
                        ? "text-orange-500"
                        : "text-neutral-400"
                }`}
              />
            </div>
            {merma.registrada && (
              <span
                className={`rounded-full px-2 py-1 text-sm font-medium ${
                  merma.estado === "saludable"
                    ? "bg-emerald-50 text-emerald-700"
                    : merma.estado === "critico"
                      ? "bg-red-50 text-red-700"
                      : "bg-orange-50 text-orange-700"
                }`}
              >
                {merma.pct}%
              </span>
            )}
          </div>
          <div>
            <h3 className="mb-1 font-medium text-neutral-500">
              Dinero en la Basura (Merma)
            </h3>
            <p className="text-3xl font-bold text-neutral-800">
              {merma.registrada ? soles(merma.monto) : "—"}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Producto horneado y no vendido este mes
            </p>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="number"
              step="0.1"
              value={montoMerma}
              onChange={(e) => setMontoMerma(e.target.value)}
              placeholder="Ej: 120"
              className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => void guardarMerma()}
              disabled={registrando}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {registrando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Registrar"
              )}
            </button>
          </div>

          <div className={`${CLASE_INSIGHT} border-emerald-500`}>
            {insightMerma}
          </div>
        </div>
      </div>

      {/* Fila 2: Velocidad de rotación */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b bg-neutral-50 px-6 py-4">
          <Zap className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-neutral-800">
              Velocidad de Rotación
            </h3>
            <p className="text-xs text-neutral-500">
              Qué tan rápido se vende cada producto (últimos 30 días). Cuando
              tengas las máquinas, este reloj definirá qué llena el 80% del
              espacio.
            </p>
          </div>
        </div>

        {rotacion.length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">
            Sin ventas de productos en los últimos 30 días todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-neutral-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Producto</th>
                  <th className="px-6 py-4 font-medium">
                    Ritmo de venta
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Diagnóstico FoodOS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rotacion.map((item) => (
                  <tr key={item.nombre} className="transition-colors hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium text-neutral-800">
                      {item.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-neutral-400" />
                        <span>
                          {item.unidadesSemana} und/semana
                          {item.horasPorUnidad != null &&
                            item.horasPorUnidad > 0 && (
                              <span className="text-neutral-400">
                                {" "}
                                · 1 cada{" "}
                                {item.horasPorUnidad < 48
                                  ? `${item.horasPorUnidad} h`
                                  : `${Math.round(item.horasPorUnidad / 24)} días`}
                              </span>
                            )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.estado === "alta" && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Alta — debe dominar tu vitrina/máquina
                        </span>
                      )}
                      {item.estado === "media" && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          Estable — mantén espacio moderado
                        </span>
                      )}
                      {item.estado === "baja" && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                          Lenta — solo espacio pequeño
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
