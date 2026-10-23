import { getProductos } from "@/features/productos/queries/get-productos";
import Link from "next/link";
import { TrendingUp, ArrowRight, AlertTriangle, Sparkles, ChefHat, CheckCircle2 } from "lucide-react";
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Resumen Operativo & Financiero</h1>
          <p className="text-gray-500 text-sm mt-1">Monitorea la rentabilidad real de tus recetas y la salud de tu negocio.</p>
        </div>
        <Link
          href="/foodos/rentabilidad"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-sm transition"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Simulador de Rentabilidad</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Banner Destacado del Simulador de Rentabilidad */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuevo Motor Financiero</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            Auditoría de Precios, Costos Fijos & Punto de Equilibrio
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Ingresa tus costos fijos y variables, elige entre márgenes sugeridos (70-75%) o escribe tu margen deseado. Audita Food Cost (≤30%), Labor Cost (≤25%), ROS, ROE y ROI en tiempo real.
          </p>
        </div>
        <Link
          href="/foodos/rentabilidad"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-3 rounded-xl transition shadow-lg text-xs md:text-sm whitespace-nowrap"
        >
          <span>Abrir Calculadora</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Métricas Principales */}
      <div className={`grid grid-cols-1 gap-6 ${nCosteo > 0 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Productos en Catálogo</h3>
          <p className="text-3xl font-black text-gray-900 mt-2">{productos?.length || 0}</p>
          <span className="text-xs text-gray-400 mt-1 block">Registrados en FoodOS</span>
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
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Recetas Completadas</h3>
          <p className="text-3xl font-black text-blue-600 mt-2">{productosConReceta.length}</p>
          <span className="text-xs text-blue-500 font-medium mt-1 block">Con costeo de ingredientes</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Productos Estrella (Margen &gt; 50%)</h3>
          <p className="text-3xl font-black text-emerald-600 mt-2">{rentables.length}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Margen bruto altamente rentable</span>
        </div>
      </div>

      {/* Alertas y Módulo AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Alertas de Rentabilidad en Catálogo</span>
          </h3>
          {alertaMargen.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200/60 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Todos tus productos costados tienen un margen saludable superior al 30%.</span>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {alertaMargen.map((p) => (
                <li key={p.id} className="py-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-800 text-sm">{p.nombre}</span>
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-extrabold">
                    {p.margen_porcentaje?.toFixed(1)}% Margen
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 flex flex-col justify-center items-center text-center">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-3">
            🤖
          </div>
          <h3 className="text-base font-bold text-gray-900">AI Copilot Gastronómico</h3>
          <p className="text-gray-500 text-xs md:text-sm mt-1.5 max-w-sm leading-relaxed">
            Te sugiere optimizaciones de insumos para reducir el Food Cost y calcular el impacto en tu Punto de Equilibrio.
          </p>
          <Link
            href="/foodos/copilot"
            className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>Consultar Copilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
