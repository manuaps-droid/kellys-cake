-- ==========================================================
-- Kelly's Cake
-- Grants para el admin: eliminar clientes limpiando su
-- información (carrito, carrito_items, pedidos, pedido_items)
-- ----------------------------------------------------------
-- El panel usa el client con service_role, que no tenía
-- privilegios DELETE sobre carrito/pedidos/pedido_items
-- (tablas creadas manualmente, sin grants explícitos):
--   permission denied for table carrito
-- ==========================================================

GRANT ALL ON public.carrito TO service_role;
GRANT ALL ON public.carrito_items TO service_role;
GRANT ALL ON public.pedidos TO service_role;
GRANT ALL ON public.pedido_items TO service_role;

NOTIFY pgrst, 'reload schema';