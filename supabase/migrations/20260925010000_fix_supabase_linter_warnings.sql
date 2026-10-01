-- ==========================================================
-- Kelly's Cake: Corrección de Advertencias (WARN) del Linter
-- Resuelve:
-- 1. function_search_path_mutable (0011)
-- 2. rls_policy_always_true (0024)
-- 3. anon_security_definer_function_executable (0028)
-- 4. authenticated_security_definer_function_executable (0029)
-- 5. public_bucket_allows_listing (0025)
-- ==========================================================

-- ----------------------------------------------------------
-- 1. SEARCH PATH INMUTABLE EN FUNCIONES (0011)
-- ----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id UUID;
  v_nivel_semilla UUID;
BEGIN
  INSERT INTO public.clientes (user_id, nombre, apellidos, correo, celular, rol, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), 'Cliente'),
    COALESCE(NEW.raw_user_meta_data ->> 'apellidos', trim(both ' ' from replace(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), ''))),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'celular', ''),
    'cliente',
    true
  )
  RETURNING id INTO v_cliente_id;

  -- Nivel inicial (Semilla)
  SELECT id INTO v_nivel_semilla
  FROM public.rewards_niveles
  WHERE slug = 'semilla'
  LIMIT 1;

  -- Fila de recompensas con 20 puntos de bienvenida
  INSERT INTO public.rewards_puntos (cliente_id, puntos_totales, puntos_disponibles, nivel_id)
  VALUES (v_cliente_id, 20, 20, v_nivel_semilla);

  -- Registrar transacción de bienvenida
  INSERT INTO public.rewards_transacciones (cliente_id, tipo, cantidad, motivo, referencia_tipo)
  VALUES (v_cliente_id, 'ganancia', 20, 'Bienvenida a Kelly''s Cake 🎂', 'registro');

  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------
-- 2. RESTRINGIR PERMISOS RPC EN FUNCIONES SECURITY DEFINER (0028 y 0029)
-- ----------------------------------------------------------

-- Revocar acceso anónimo a funciones internas
REVOKE EXECUTE ON FUNCTION public.get_current_cliente_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Revocar en rls_auto_enable si existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable') THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
  END IF;
END $$;

-- award_points y redeem_points solo deben ejecutarse desde el backend con service_role
REVOKE EXECUTE ON FUNCTION public.award_points(UUID, INTEGER, TEXT, UUID, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_points(UUID, INTEGER, TEXT, UUID, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.redeem_points(UUID, INTEGER, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_points(UUID, INTEGER, TEXT) TO service_role;

-- ----------------------------------------------------------
-- 3. POLÍTICAS RLS SEGURAS (Reemplazar USING(true) por is_admin) (0024)
-- ----------------------------------------------------------

-- catalogo_imagenes: Limpiar políticas permisivas antiguas
DROP POLICY IF EXISTS "CatalogoImagenes Delete" ON public.catalogo_imagenes;
DROP POLICY IF EXISTS "CatalogoImagenes Insert" ON public.catalogo_imagenes;
DROP POLICY IF EXISTS "CatalogoImagenes Update" ON public.catalogo_imagenes;

-- catalogo_personalizacion
DROP POLICY IF EXISTS "Catalogo admin insert" ON public.catalogo_personalizacion;
DROP POLICY IF EXISTS "Catalogo admin update" ON public.catalogo_personalizacion;
DROP POLICY IF EXISTS "Catalogo admin delete" ON public.catalogo_personalizacion;
CREATE POLICY "Catalogo admin insert" ON public.catalogo_personalizacion FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Catalogo admin update" ON public.catalogo_personalizacion FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Catalogo admin delete" ON public.catalogo_personalizacion FOR DELETE TO authenticated USING (public.is_admin());

-- catalogo_productos
DROP POLICY IF EXISTS "CatalogoProductos Insert" ON public.catalogo_productos;
DROP POLICY IF EXISTS "CatalogoProductos Update" ON public.catalogo_productos;
DROP POLICY IF EXISTS "CatalogoProductos Delete" ON public.catalogo_productos;
CREATE POLICY "CatalogoProductos Insert" ON public.catalogo_productos FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "CatalogoProductos Update" ON public.catalogo_productos FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "CatalogoProductos Delete" ON public.catalogo_productos FOR DELETE TO authenticated USING (public.is_admin());

-- catalogos
DROP POLICY IF EXISTS "Catalogos Insert" ON public.catalogos;
DROP POLICY IF EXISTS "Catalogos Update" ON public.catalogos;
DROP POLICY IF EXISTS "Catalogos Delete" ON public.catalogos;
CREATE POLICY "Catalogos Insert" ON public.catalogos FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Catalogos Update" ON public.catalogos FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Catalogos Delete" ON public.catalogos FOR DELETE TO authenticated USING (public.is_admin());

-- categorias
DROP POLICY IF EXISTS "Categorias Insert" ON public.categorias;
DROP POLICY IF EXISTS "Categorias Update" ON public.categorias;
DROP POLICY IF EXISTS "Categorias Delete" ON public.categorias;
CREATE POLICY "Categorias Insert" ON public.categorias FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Categorias Update" ON public.categorias FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Categorias Delete" ON public.categorias FOR DELETE TO authenticated USING (public.is_admin());

-- media
DROP POLICY IF EXISTS "Media Insert" ON public.media;
DROP POLICY IF EXISTS "Media Update" ON public.media;
DROP POLICY IF EXISTS "Media Delete" ON public.media;
CREATE POLICY "Media Insert" ON public.media FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Media Update" ON public.media FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Media Delete" ON public.media FOR DELETE TO authenticated USING (public.is_admin());

-- producto_catalogo
DROP POLICY IF EXISTS "ProductoCatalogo Insert" ON public.producto_catalogo;
DROP POLICY IF EXISTS "ProductoCatalogo Update" ON public.producto_catalogo;
DROP POLICY IF EXISTS "ProductoCatalogo Delete" ON public.producto_catalogo;
CREATE POLICY "ProductoCatalogo Insert" ON public.producto_catalogo FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "ProductoCatalogo Update" ON public.producto_catalogo FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "ProductoCatalogo Delete" ON public.producto_catalogo FOR DELETE TO authenticated USING (public.is_admin());

-- producto_imagenes
DROP POLICY IF EXISTS "Authenticated full access producto_imagenes" ON public.producto_imagenes;
DROP POLICY IF EXISTS "Admin full access producto_imagenes" ON public.producto_imagenes;
CREATE POLICY "Admin full access producto_imagenes" ON public.producto_imagenes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- producto_presentaciones
DROP POLICY IF EXISTS "Authenticated full access producto_presentaciones" ON public.producto_presentaciones;
DROP POLICY IF EXISTS "Admin full access producto_presentaciones" ON public.producto_presentaciones;
CREATE POLICY "Admin full access producto_presentaciones" ON public.producto_presentaciones FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- productos
DROP POLICY IF EXISTS "Productos admin insert" ON public.productos;
DROP POLICY IF EXISTS "Productos admin update" ON public.productos;
DROP POLICY IF EXISTS "Productos admin delete" ON public.productos;
CREATE POLICY "Productos admin insert" ON public.productos FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Productos admin update" ON public.productos FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Productos admin delete" ON public.productos FOR DELETE TO authenticated USING (public.is_admin());

-- ----------------------------------------------------------
-- 4. STORAGE: EVITAR LISTADO PÚBLICO INDISCRIMINADO (0025)
-- ----------------------------------------------------------
-- Los buckets públicos ya permiten descargar imágenes directamente por su URL pública.
-- La política amplia de SELECT en storage.objects permitía listar todos los archivos vía API.
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Public read products" ON storage.objects;

-- Recargar schema en PostgREST
NOTIFY pgrst, 'reload schema';
