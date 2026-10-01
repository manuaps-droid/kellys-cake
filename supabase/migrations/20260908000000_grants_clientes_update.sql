-- ==========================================================
-- Kelly's Cake
-- Otorga privilegios faltantes sobre public.clientes
-- ----------------------------------------------------------
-- El panel admin actualiza/elimina clientes con service_role
-- y el perfil del usuario se actualiza con la sesión
-- (authenticated). Solo existía GRANT SELECT, por lo que las
-- operaciones de UPDATE/DELETE fallaban con:
--   "permission denied for table clientes"
-- ==========================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.clientes TO authenticated;