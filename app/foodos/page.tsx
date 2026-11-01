import { getProductos } from "@/features/productos/queries/get-productos";
import Link from "next/link";
import { TrendingUp, ArrowRight, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";
import RentabilidadPromedioCard from "@/features/rentabilidad/components/RentabilidadPromedioCard";
import KpisFinancierosCard from "@/features/kpis/components/KpisFinancierosCard";
import { getKpisFinancieros } from "@/features/kpis/services/kpis-financieros.service";
import {
  getMetricasProductos,
  MARGEN_SALUDABLE_PCT,
  MARGEN_ALERTA_PCT,
  MARGEN_ESTRELLA_PCT,
} from "@/features/rentabilidad/services/metricas-producto.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const productos = await getProductos();

  // ── Fuente única de verdad: métricas con costeo real en batch ──
  const metricas = await getMetricasProductos(true);

  const conCosteo = metricas.metricas.map((m) => ({
    nombre: m.nombre,
    margen: m.margen_bruto_pct,
    costoCompleto: m.costo_completo,
    precio: m.precio_venta,
  }));

  const nCosteo = metricas.metricas.length;
  const margenPromedio = metricas.margenPromedio;

  const estrellas = metricas.estrellas;
  const enRiesgo = metricas.metricas.filter(
    (m) => m.margen_bruto_pct < MARGEN_SALUDABLE_PCT
  );

  // ── KPIs financieros: ROS, ROI, ROE y punto de equilibrio ──
  const kpis = await getKpisFinancieros(
    metricas.metricas.map((m) => ({
      precio: m.precio_venta,
      mcPct:
        m.precio_venta > 0
          ? ((m.precio_venta - m.costo_variable) / m.precio_venta) * 100
          : 0,
      mcUnit: m.margen_contribucion,
    }))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-kc-charcoal tracking-tight">Resumen Operativo & Financiero</h1>
          <p className="text-kc-mocha text-sm mt-1">Monitorea la rentabilidad real de tus recetas y la salud de tu negocio.</p>
        </div>
        <Link
          href="/foodos/rentabilidad"
          className="inline-flex items-center gap-2 bg-kc-charcoal hover:bg-kc-deep text-kc-cream font-bold px-4 py-2.5 rounded-xl shadow-md text-sm transition border border-kc-gold/30"
        >
          <TrendingUp className="w-4 h-4 text-kc-gold" />
          <span>Simulador de Rentabilidad</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Banner Destacado del Simulador de Rentabilidad */}
      <div className="bg-gradient-to-r from-kc-charcoal via-[#3B241A] to-kc-deep text-kc-cream rounded-2xl p-6 shadow-lg border border-kc-gold/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-kc-gold/15 text-kc-gold text-xs font-bold border border-kc-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuevo Motor Financiero</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold">
            Auditoría de Precios, Costos Fijos & Punto de Equilibrio
          </h2>
          <p className="text-kc-cream/70 text-xs md:text-sm leading-relaxed">
            Ingresa tus costos fijos y variables, elige entre márgenes sugeridos (70-75%) o escribe tu margen deseado. Audita Food Cost (≤30%), Labor Cost (≤25%), ROS, ROE y ROI en tiempo real.
          </p>
        </div>
        <Link
          href="/foodos/rentabilidad"
          className="inline-flex items-center gap-2 bg-kc-gold hover:bg-kc-rose-gold text-kc-deep font-extrabold px-5 py-3 rounded-xl transition shadow-lg text-xs md:text-sm whitespace-nowrap"
        >
          <span>Abrir Calculadora</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Métricas Principales */}
      <div className={`grid grid-cols-1 gap-6 ${nCosteo > 0 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-kc-blush/40">
          <h3 className="text-xs font-bold uppercase tracking-widest text-kc-mocha">Productos en Catálogo</h3>
          <p className="text-3xl font-bold text-kc-charcoal mt-2">{productos?.length || 0}</p>
          <span className="text-xs text-kc-mocha/70 mt-1 block">Registrados en FoodOS</span>
        </div>
        {nCosteo > 0 && margenPromedio != null && (
          <RentabilidadPromedioCard
            margenPromedio={margenPromedio}
            totalConReceta={nCosteo}
            saludables={metricas.saludables}
            alerta={metricas.alerta}
            criticos={metricas.criticos}
            productos={conCosteo}
          />
        )}
        <KpisFinancierosCard
          kpis={{
            ros: kpis.ros,
            roi: kpis.roi,
            roe: kpis.roe,
            peUnidades: kpis.peUnidades,
            peSoles: kpis.peSoles,
            ventasMes: kpis.ventasMes,
            utilidadMes: kpis.utilidadMes,
            costosFijosMes: kpis.totalCostosFijos,
            mesEtiqueta: kpis.mesEtiqueta,
            esProvisional: kpis.esProvisional,
          }}
          costosFijos={kpis.costosFijos}
          inversion={kpis.inversion}
          patrimonio={kpis.patrimonio}
          serieMensual={kpis.serieMensual}
        />
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-kc-blush/40">
          <h3 className="text-xs font-bold uppercase tracking-widest text-kc-mocha">Productos Estrella (Margen {'>'} {MARGEN_ESTRELLA_PCT}%)</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{estrellas}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Margen bruto altamente rentable</span>
        </div>
      </div>

      {/* Alertas y Módulo AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xs border border-kc-blush/40 p-6">
          <h3 className="text-base font-bold text-kc-charcoal mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Alertas de Rentabilidad en Catálogo</span>
          </h3>
          {enRiesgo.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200/60 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Todos tus productos costeados tienen un margen saludable superior al {MARGEN_SALUDABLE_PCT}%.</span>
            </div>
          ) : (
            <ul className="divide-y divide-kc-sand">
              {enRiesgo.map((m) => (
                <li key={m.producto_id} className="py-1">
                  <Link
                    href={`/foodos/productos/${m.producto_id}/receta`}
                    className="group py-2 px-2 -mx-2 flex justify-between items-center rounded-lg transition hover:bg-kc-sand/60"
                    title="Revisar y ajustar la receta"
                  >
                    <span className="font-semibold text-kc-charcoal text-sm group-hover:text-kc-rose-gold transition flex items-center gap-2">
                      {m.nombre}
                      <span className="text-[10px] font-bold text-kc-rose-gold opacity-0 group-hover:opacity-100 transition">
                        Revisar receta →
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-extrabold">
                        {m.margen_bruto_pct.toFixed(1)}% Margen
                      </span>
                      <ArrowRight className="w-4 h-4 text-kc-mocha/50 group-hover:text-kc-rose-gold transition" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[10px] text-kc-mocha/70">
            Alertas y semáforo usan la misma fuente: costeo real en 4 capas
            (saludable {'>'} {MARGEN_SALUDABLE_PCT}% · alerta {MARGEN_ALERTA_PCT}-{MARGEN_SALUDABLE_PCT}% · crítico {'<'}= {MARGEN_ALERTA_PCT}%).
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-kc-blush/40 p-6 flex flex-col justify-center items-center text-center">
          <div className="w-14 h-14 bg-kc-sand rounded-2xl flex items-center justify-center text-2xl mb-3">
            🤖
          </div>
          <h3 className="text-base font-bold text-kc-charcoal">AI Copilot Gastronómico</h3>
          <p className="text-kc-mocha text-xs md:text-sm mt-1.5 max-w-sm leading-relaxed">
            Te sugiere optimizaciones de insumos para reducir el Food Cost y calcular el impacto en tu Punto de Equilibrio.
          </p>
          <Link
            href="/foodos/copilot"
            className="mt-4 text-xs font-bold text-kc-rose-gold hover:text-kc-charcoal inline-flex items-center gap-1"
          >
            <span>Consultar Copilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
