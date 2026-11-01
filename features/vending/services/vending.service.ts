import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ItemVentaVending,
  ResumenMaquina,
  VendingMaquina,
} from "../types/vending.types";

export class VendingService {
  private supabase = createAdminClient();

  // ================================================================
  // MÁQUINAS
  // ================================================================

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

  async crearMaquina(
    maquina: Omit<VendingMaquina, "id" | "activo">
  ): Promise<VendingMaquina> {
    const { data, error } = await this.supabase
      .from("vending_maquinas")
      .insert({ ...maquina, activo: true })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      tipo_ubicacion: data.tipo_ubicacion ?? "otro",
      formato: data.formato ?? "pantalla_tactil",
      capacidad_slots: Number(data.capacidad_slots) || 0,
      activo: data.activo ?? true,
    };
  }

  async eliminarMaquina(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("vending_maquinas")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  async actualizarMaquina(
    id: string,
    datos: Partial<VendingMaquina>
  ): Promise<void> {
    const { error } = await this.supabase
      .from("vending_maquinas")
      .update(datos)
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  // ================================================================
  // INVENTARIO
  // ================================================================

  async listarInventario(maquinaId: string): Promise<ItemVentaVending[]> {
    const { data, error } = await this.supabase
      .from("vending_inventario")
      .select("*")
      .eq("maquina_id", maquinaId)
      .eq("activo", true);

    if (error) throw new Error(error.message);

    return (data ?? []).map((i) => ({
      id: i.id,
      maquina_id: i.maquina_id,
      producto_id: i.producto_id,
      producto_nombre: "Producto",
      cantidad: Number(i.cantidad_actual) || 0,
      precio_unitario: Number(i.precio_venta) || 0,
      total: (Number(i.cantidad_actual) || 0) * (Number(i.precio_venta) || 0),
      fecha_venta: i.created_at ?? "",
    }));
  }

  async agregarInventario(
    maquinaId: string,
    productoId: string,
    cantidad: number,
    precioVenta: number,
    costoUnitario: number
  ): Promise<void> {
    const { error } = await this.supabase.from("vending_inventario").insert({
      maquina_id: maquinaId,
      producto_id: productoId,
      cantidad_inicial: cantidad,
      cantidad_actual: cantidad,
      precio_venta: precioVenta,
      costo_unitario: costoUnitario,
      activo: true,
    });

    if (error) throw new Error(error.message);
  }

  async actualizarCantidadInventario(
    id: string,
    cantidad: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from("vending_inventario")
      .update({ cantidad_actual: cantidad })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  async eliminarInventario(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("vending_inventario")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  // ================================================================
  // VENTAS
  // ================================================================

  async registrarVenta(
    maquinaId: string,
    productoId: string,
    cantidad: number,
    precioUnitario: number
  ): Promise<void> {
    const total = cantidad * precioUnitario;

    const { error } = await this.supabase.from("vending_ventas").insert({
      maquina_id: maquinaId,
      producto_id: productoId,
      cantidad,
      precio_unitario: precioUnitario,
      total,
      fecha_venta: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);

    await this.reducirInventario(maquinaId, productoId, cantidad);
  }

  private async reducirInventario(
    maquinaId: string,
    productoId: string,
    cantidad: number
  ): Promise<void> {
    const { data: inventario } = await this.supabase
      .from("vending_inventario")
      .select("id, cantidad_actual")
      .eq("maquina_id", maquinaId)
      .eq("producto_id", productoId)
      .eq("activo", true)
      .maybeSingle();

    if (!inventario) return;

    const nuevaCantidad = Math.max(0, Number(inventario.cantidad_actual) - cantidad);
    await this.supabase
      .from("vending_inventario")
      .update({ cantidad_actual: nuevaCantidad })
      .eq("id", inventario.id);
  }

  async listarVentas(
    maquinaId?: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<ItemVentaVending[]> {
    let query = this.supabase
      .from("vending_ventas")
      .select("*")
      .order("fecha_venta", { ascending: false })
      .limit(200);

    if (maquinaId) query = query.eq("maquina_id", maquinaId);
    if (fechaInicio) query = query.gte("fecha_venta", fechaInicio);
    if (fechaFin) query = query.lte("fecha_venta", fechaFin);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data ?? []).map((v) => ({
      id: v.id,
      maquina_id: v.maquina_id,
      producto_id: v.producto_id,
      producto_nombre: "Producto",
      cantidad: Number(v.cantidad) || 0,
      precio_unitario: Number(v.precio_unitario) || 0,
      total: Number(v.total) || 0,
      fecha_venta: String(v.fecha_venta ?? ""),
    }));
  }

  // ================================================================
  // RESUMEN POR MÁQUINA
  // ================================================================

  async listarMaquinasConResumen(): Promise<ResumenMaquina[]> {
    const maquinas = await this.listarMaquinas();

    return Promise.all(
      maquinas.map(async (m) => {
        const { data: ventas } = await this.supabase
          .from("vending_ventas")
          .select("cantidad, total")
          .eq("maquina_id", m.id);

        const ventasArray = ventas ?? [];
        const productosVendidos = ventasArray.reduce(
          (t, v) => t + (Number(v.cantidad) || 0),
          0
        );
        const ingresosTotales = ventasArray.reduce(
          (t, v) => t + (Number(v.total) || 0),
          0
        );

        const { data: inventario } = await this.supabase
          .from("vending_inventario")
          .select("cantidad_inicial, cantidad_actual, costo_unitario")
          .eq("maquina_id", m.id)
          .eq("activo", true);

        const costoTotal = (inventario ?? []).reduce((t, c) => {
          const vendidas =
            (Number(c.cantidad_inicial) || 0) - (Number(c.cantidad_actual) || 0);
          return t + vendidas * (Number(c.costo_unitario) || 0);
        }, 0);

        const utilidadBruta = ingresosTotales - costoTotal;
        const margenPorcentaje =
          ingresosTotales > 0 ? (utilidadBruta / ingresosTotales) * 100 : 0;

        return {
          id: m.id,
          nombre: m.nombre,
          ubicacion: m.ubicacion,
          formato: m.formato,
          capacidad_slots: m.capacidad_slots,
          productos_vendidos: productosVendidos,
          ingresos_totales: Math.round(ingresosTotales * 100) / 100,
          costo_total: Math.round(costoTotal * 100) / 100,
          utilidad_bruta: Math.round(utilidadBruta * 100) / 100,
          margen_porcentaje: Math.round(margenPorcentaje * 10) / 10,
          estado:
            margenPorcentaje > 40
              ? ("saludable" as const)
              : margenPorcentaje > 20
                ? ("alerta" as const)
                : ("critico" as const),
        };
      })
    );
  }

  async obtenerResumenMaquina(maquinaId: string): Promise<ResumenMaquina> {
    const todas = await this.listarMaquinasConResumen();
    const resumen = todas.find((r) => r.id === maquinaId);
    if (!resumen) throw new Error("Máquina no encontrada");
    return resumen;
  }
}

export const vendingService = new VendingService();
