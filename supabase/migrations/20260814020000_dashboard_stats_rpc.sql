-- ==========================================================
-- Kelly's Cake
-- Dashboard: función para obtener el total de ventas sin
-- transferir todas las filas `pedidos.total` al cliente.
-- ==========================================================

CREATE OR REPLACE FUNCTION public.dashboard_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'pedidos_total',          (SELECT COUNT(*) FROM public.pedidos),
    'productos_total',        (SELECT COUNT(*) FROM public.productos),
    'clientes_total',         (SELECT COUNT(*) FROM public.clientes),
    'proyectos_total',        (SELECT COUNT(*) FROM public.proyectos_personalizados),
    'ventas_total',           (SELECT COALESCE(SUM(total), 0) FROM public.pedidos WHERE estado_pago = 'pagado'),
    'pedidos_pendientes',    (SELECT COUNT(*) FROM public.pedidos WHERE estado = 'pendiente'),
    'productos_activos',     (SELECT COUNT(*) FROM public.productos WHERE estado = 'activo'),
    'clientes_activos',      (SELECT COUNT(*) FROM public.clientes WHERE activo = true),
    'proyectos_pendientes',  (SELECT COUNT(*) FROM public.proyectos_personalizados WHERE estado = 'pendiente')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_stats() TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
