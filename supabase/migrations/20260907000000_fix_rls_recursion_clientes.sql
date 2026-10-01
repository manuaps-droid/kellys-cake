-- ==========================================================
-- Kelly's Cake
-- Corrige "infinite recursion" en policies de RLS sobre clientes
-- ----------------------------------------------------------
-- Las policies hacían una subconsulta a public.clientes dentro
-- de la propia tabla (SELECT 1 FROM public.clientes WHERE ...),
-- lo que re-evalúa RLS y causa recursión infinita.
--
-- Solución: crear una función SECURITY DEFINER que consulta
-- clientes SIN pasar por RLS, y usarla en todas las policies.
-- ==========================================================

-- Función que indica si el usuario actual es admin (bypasa RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.user_id = auth.uid()
      AND c.rol = 'admin'
      AND c.activo = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

NOTIFY pgrst, 'reload schema';
