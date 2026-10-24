import { getProductos } from "@/features/productos/queries/get-productos";
import Link from "next/link";
import { TrendingUp, ArrowRight, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";
import { calcularCosteoReal } from "@/features/rentabilidad/services/costeo-real.service";
import RentabilidadPromedioCard from "@/features/rentabilidad/components/RentabilidadPromedioCard";

export default async function AdminDashboard() {
  const productos = await getProductos();

  const productosConReceta = productos?.filter((p) => p.precio_costo && p.precio_costo > 0) || [];
  const rentables = productosConReceta.filter((p) => (p.margen_porcentaje || 0) > 50);
  const alertaMargen = productosConReceta.filter((p) => (p.margen_porcentaje || 0) < 30);

  // ── Rentabilidad promedio real (productos con receta activa) ──
  const conCosteo: Array<{
    nombre: string;
    margen: number;
    costoCompleto: number;
    precio: number;
  }> = [];

  for (const p of productos ?? []) {
    const d = await calcularCosteoReal(p.id);
    if (!d) continue;
    conCosteo.push({
      nombre: String(p.nombre ?? ""),
      margen: d.margenBrutoPct,
      costoCompleto: d.costoCompletoUnitario,
      precio: Number(p.precio_venta) || 0,
    });
  }

  const nCosteo = conCosteo.length;
  const margenPromedio =
    nCosteo > 0 ? conCosteo.reduce((t, x) => t + x.margen, 0) / nCosteo : null;

  const saludables = conCosteo.filter((x) => x.margen > 40).length;
  const enAlerta = conCosteo.filter((x) => x.margen > 20 && x.margen <= 40).length;
  const criticos = conCosteo.filter((x) => x.margen <= 20).length;

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
        {margenPromedio != null && (
          <RentabilidadPromedioCard
            margenPromedio={margenPromedio}
            totalConReceta={nCosteo}
            saludables={saludables}
            alerta={enAlerta}
            criticos={criticos}
            productos={conCosteo}
          />
        )}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-kc-blush/40">
          <h3 className="text-xs font-bold uppercase tracking-widest text-kc-mocha">Recetas Completadas</h3>
          <p className="text-3xl font-bold text-kc-rose-gold mt-2">{productosConReceta.length}</p>
          <span className="text-xs text-kc-rose-gold/80 font-medium mt-1 block">Con costeo de ingredientes</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-kc-blush/40">
          <h3 className="text-xs font-bold uppercase tracking-widest text-kc-mocha">Productos Estrella (Margen &gt; 50%)</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{rentables.length}</p>
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
          {alertaMargen.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200/60 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Todos tus productos costados tienen un margen saludable superior al 30%.</span>
            </div>
          ) : (
            <ul className="divide-y divide-kc-sand">
              {alertaMargen.map((p) => (
                <li key={p.id} className="py-3 flex justify-between items-center">
                  <span className="font-semibold text-kc-charcoal text-sm">{p.nombre}</span>
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-extrabold">
                    {p.margen_porcentaje?.toFixed(1)}% Margen
                  </span>
                </li>
              ))}
            </ul>
          )}
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
