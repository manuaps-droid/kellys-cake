export interface DashboardStats {
  pedidos: number;
  productos: number;
  clientes: number;
  proyectos: number;
  ventas: number;
  pedidosPendientes: number;
  productosActivos: number;
  clientesActivos: number;
  proyectosPendientes: number;

  // KPIs de Negocio & Marketing
  ticketPromedio: number;
  tasaConversion: number; // Porcentaje de conversión visitas -> pedidos
  tasaRecompra: number; // Clientes con más de 1 pedido
  clientesRecurrentes: number;
  metaMensualVentas: number;
  cumplimientoMeta: number; // Porcentaje
}