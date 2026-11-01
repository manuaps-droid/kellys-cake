import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CalculoDemandaRequest,
  ResultadoPrediccion,
  SupuestoDemanda,
  VendingMaquina,
} from "../types/prediccion.types";

/**
 * Servicio de predicción de demanda (estadística simple y explicable).
 * La lógica pesada vive en calcularPrediccionAction; este servicio
 * expone lecturas reutilizables (máquinas, supuestos, resultados).
 */
export class PrediccionService {
  private supabase = createAdminClient();

  async listarMaquinas(): Promise<VendingMaquina[]> {
    const { data, error } = await this.supabase
      .from("vending_maquinas")
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((m) => ({
      id: m.id,
      nombre: m.nombre,
      ubicacion: m.ubicacion,
      tipo_ubicacion: m.tipo_ubicacion ?? "otro",
      formato: m.formato ?? "pantalla_tactil",
      capacidad_slots: Number(m.capacidad_slots) || 0,
      activo: m.activo ?? true,
    }));
  }

  async listarSupuestos(productoId?: string): Promise<SupuestoDemanda[]> {
    let query = this.supabase
      .from("foodos_supuestos_demanda")
      .select("*")
      .eq("activo", true);

    if (productoId) {
      query = query.eq("producto_id", productoId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data ?? []).map((s) => ({
      id: s.id,
      producto_id: s.producto_id,
      maquina_id: s.maquina_id ?? undefined,
      unidades_base: Number(s.unidades_base) || 0,
      dia_semana: s.dia_semana ?? undefined,
      activo: s.activo ?? true,
    }));
  }

  async listarPrediccionesRecientes(limite = 50) {
    const { data, error } = await this.supabase
      .from("foodos_predicciones")
      .select("*")
      .order("creado_en", { ascending: false })
      .limit(limite);

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async calcularPrediccionResumen(
    input: CalculoDemandaRequest
  ): Promise<ResultadoPrediccion | null> {
    if (!input.producto_ids || input.producto_ids.length === 0) return null;

    const { data: productosRows } = await this.supabase
      .from("foodos_productos")
      .select("id, nombre, precio_venta")
      .in("id", input.producto_ids);

    const productos = (productosRows ?? []).map((p) => {
      const precio = Number(p.precio_venta) || 0;
      return {
        producto_id: p.id,
        producto_nombre: String(p.nombre ?? "Producto"),
        maquina_id: undefined,
        maquina_nombre: undefined,
        fecha: new Date().toISOString().slice(0, 10),
        dias_proyectados: input.dias_proyectados || 30,
        unidades_base_por_dia: 0,
        demanda_total_estimada: 0,
        costo_unitario: 0,
        costo_variable_total: 0,
        precio_venta: precio,
        ingresos_estimados: 0,
        margen_bruto: 0,
        margen_porcentaje: 0,
        estado: "alerta" as const,
        origen: "supuesto" as const,
        es_provisional: true,
      };
    });

    if (productos.length === 0) return null;

    return {
      productos,
      costo_variable_total: 0,
      costo_fijo_total: 0,
      costo_total: 0,
      ingresos_totales: 0,
      utilidad_bruta: 0,
      margen_global_porcentaje: 0,
      punto_equilibrio_unidades: 0,
      punto_equilibrio_soles: 0,
      dias_para_equilibrio: 0,
      salud: "alerta",
      recomendacion:
        "Usa calcularPrediccionAction para obtener la proyección completa.",
      origen: "supuesto",
      es_provisional: true,
    };
  }
}

export const prediccionService = new PrediccionService();
