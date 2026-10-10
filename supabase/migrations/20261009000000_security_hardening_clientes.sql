-- ==========================================================
-- SECURITY HARDENING — tabla clientes
-- ----------------------------------------------------------
-- La migración 20260728030000 deshabilitó RLS en clientes.
-- Sumado a los GRANT posteriores, esto permitía:
--   1) Lectura anónima de TODA la tabla (fuga de datos
--      personales: correo, celular, rol, user_id).
--   2) Que cualquier usuario autenticado actualizara
--      cualquier fila, incluida su columna `rol` =>
--      escalada de privilegios a admin.
--
-- Esta migración vuelve a habilitar RLS, restringe las
-- políticas a la propia fila y limita las columnas que el
-- cliente puede editar. service_role conserva acceso total.
-- ==========================================================

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas
DROP POLICY IF EXISTS "Clientes leen su propio registro" ON public.clientes;
DROP POLICY IF EXISTS "Clientes actualizan su propio registro" ON public.clientes;
DROP POLICY IF EXISTS "Admins leen todos los clientes" ON public.clientes;
DROP POLICY IF EXISTS "Clientes crean su propio registro" ON public.clientes;

-- Solo puede ver su propia fila
CREATE POLICY "Clientes leen su propio registro"
  ON public.clientes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Los administradores ven todas las filas
CREATE POLICY "Admins leen todos los clientes"
  ON public.clientes FOR SELECT TO authenticated
  USING (public.is_admin());

-- Solo puede actualizar su propia fila
CREATE POLICY "Clientes actualizan su propio registro"
  ON public.clientes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------
-- GRANTS: cerrar lectura anónima y limitar columnas editables
-- ----------------------------------------------------------
REVOKE ALL ON public.clientes FROM anon;
REVOKE ALL ON public.clientes FROM authenticated;

-- El cliente autenticado puede leer su fila (limitada por RLS)
GRANT SELECT ON public.clientes TO authenticated;

-- Solo puede editar columnas de perfil; NO rol, activo ni user_id
GRANT UPDATE (nombre, apellidos, celular) ON public.clientes TO authenticated;

-- El backend (service_role) mantiene control total
GRANT ALL ON public.clientes TO service_role;

NOTIFY pgrst, 'reload schema';
