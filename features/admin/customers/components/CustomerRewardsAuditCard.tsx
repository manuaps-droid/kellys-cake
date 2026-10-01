import Link from "next/link";
import Card from "@/components/ui/Card";
import { Award, ArrowUpRight, ArrowDownLeft, Gift } from "lucide-react";

interface Props {
  rewards?: {
    puntos_totales: number;
    puntos_disponibles: number;
    nivel: string | null;
  } | null;
  transacciones?: {
    id: string;
    tipo: "ganancia" | "canje";
    cantidad: number;
    motivo: string;
    referencia_id: string | null;
    referencia_tipo: string | null;
    created_at: string;
  }[];
}

export default function CustomerRewardsAuditCard({ rewards, transacciones = [] }: Props) {
  const puntosTotales = rewards?.puntos_totales ?? 0;
  const puntosDisponibles = rewards?.puntos_disponibles ?? 0;
  const nivel = rewards?.nivel ?? "Bronce";

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-kc-gold/10 text-kc-gold rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-kc-charcoal">
              Auditoría y Origen de Puntos (Kelly's Rewards)
            </h2>
            <p className="text-xs text-gray-500">
              Trazabilidad completa de acumulación y canje de puntos de fidelización
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-medium">Saldo Actual</p>
            <p className="text-xl font-bold text-kc-charcoal">{puntosDisponibles} pts</p>
          </div>
          <div className="text-right border-l pl-4 border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium">Histórico Total</p>
            <p className="text-sm font-semibold text-gray-700">{puntosTotales} pts</p>
          </div>
          <div className="text-right border-l pl-4 border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-medium">Nivel</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              {nivel}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Historial de Movimientos ({transacciones.length})
        </h3>

        {transacciones.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Gift className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            Este cliente aún no registra movimientos de puntos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-gray-500 bg-gray-50/50">
                  <th className="py-2.5 px-3 font-medium">Tipo</th>
                  <th className="py-2.5 px-3 font-medium">Puntos</th>
                  <th className="py-2.5 px-3 font-medium">Origen / Motivo</th>
                  <th className="py-2.5 px-3 font-medium">Referencia</th>
                  <th className="py-2.5 px-3 text-right font-medium">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transacciones.map((t) => {
                  const isGanancia = t.tipo === "ganancia";
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                            isGanancia
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isGanancia ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" /> Ganancia
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5" /> Canje
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        <span className={isGanancia ? "text-emerald-600" : "text-red-600"}>
                          {isGanancia ? `+${t.cantidad}` : `-${t.cantidad}`} pts
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-800 font-medium">
                        {t.motivo}
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {t.referencia_tipo === "pedido" && t.referencia_id ? (
                          <Link
                            href={`/admin/pedidos/${t.referencia_id}`}
                            className="text-kc-rose-gold hover:underline inline-flex items-center gap-1 font-mono text-xs"
                          >
                            Pedido #{t.referencia_id.slice(0, 8)}
                          </Link>
                        ) : t.referencia_tipo ? (
                          <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {t.referencia_tipo}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-gray-500">
                        {new Date(t.created_at).toLocaleString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
