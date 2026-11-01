import PrediccionDemandaPanel from "@/features/prediccion/components/PrediccionDemandaPanel";
import { guardarPrediccionDemanda } from "@/features/prediccion/actions/prediccion-actions";
import {
  getMetricasProductos,
} from "@/features/rentabilidad/services/metricas-producto.service";

export const metadata = {
  title: "Predicción de Demanda | FoodOS",
  description:
    "Proyección de ventas por producto con estadística simple y explicable.",
};

export const dynamic = "force-dynamic";

export default async function PrediccionDemandaPage() {
  // ── Métricas en batch (config compartida + costeos paralelos) ──
  const metricas = await getMetricasProductos(true);

  const productosValidos = metricas.metricas.map((m) => ({
    id: m.producto_id,
    nombre: m.nombre,
    precio_costo: m.precio_costo,
    precio_venta: m.precio_venta,
    margen_porcentaje: m.margen_bruto_pct,
    seleccionado: false,
  }));

  const promedios = {
    margenBrutoPct: metricas.margenPromedio,
    costoIngredientes: 0,
    costoEmpaques: 0,
    costoManoObra: 0,
    costoIndirectos: 0,
    costoVariable: 0,
    costoCompleto: metricas.costoCompletoPromedio,
    precioVenta: metricas.precioVentaPromedio,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-kc-charcoal">
        Rentabilidad Promedio
      </h1>
      <p className="text-kc-mocha text-sm mt-1">
        Selecciona los productos para calcular su rentabilidad promedio.
      </p>

      <PrediccionDemandaPanel
        productos={productosValidos}
        maquinas={[]}
        onCalcular={guardarPrediccionDemanda}
        calculando={false}
        promedios={promedios}
        saludables={metricas.saludables}
        alerta={metricas.alerta}
        criticos={metricas.criticos}
      />
    </div>
  );
}
