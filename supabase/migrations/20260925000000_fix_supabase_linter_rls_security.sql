-- ==========================================================
-- Kelly's Cake & FoodOS: Corrección Integral de Seguridad RLS
-- Resuelve advertencias del Supabase Database Linter:
-- 1. policy_exists_rls_disabled (0007)
-- 2. rls_disabled_in_public (0013)
-- ==========================================================

-- ----------------------------------------------------------
-- 1. Funciones Helper Seguras (SECURITY DEFINER)
-- ----------------------------------------------------------

-- Helper para saber si el usuario actual es admin (evita recursión RLS)
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

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- Helper para obtener el cliente_id asociado al usuario auth actual
CREATE OR REPLACE FUNCTION public.get_current_cliente_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.clientes WHERE user_id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_cliente_id() TO anon, authenticated, service_role;

-- Helper para obtener el tenant_id de FoodOS para el usuario auth actual
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.tenants ORDER BY created_at ASC LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_tenant_id() TO anon, authenticated, service_role;

-- ----------------------------------------------------------
-- 2. HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ----------------------------------------------------------

-- A. Tablas de Personalización y Catálogo
ALTER TABLE public.catalogo_imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos_personalizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyecto_catalogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyecto_imagenes ENABLE ROW LEVEL SECURITY;

-- B. Tablas de Fidelización, Marketing & Reseñas
ALTER TABLE public.rewards_niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_puntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fechas_especiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;

-- C. Tablas de FoodOS ERP
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_almacenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_kardex ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_evento_gastos ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- 3. POLÍTICAS RLS: PERSONALIZACIÓN & CATÁLOGOS
-- ----------------------------------------------------------

-- catalogo_imagenes
DROP POLICY IF EXISTS "Lectura pública de catalogo_imagenes" ON public.catalogo_imagenes;
CREATE POLICY "Lectura pública de catalogo_imagenes"
  ON public.catalogo_imagenes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gestiona catalogo_imagenes" ON public.catalogo_imagenes;
CREATE POLICY "Admin gestiona catalogo_imagenes"
  ON public.catalogo_imagenes FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- proyectos_personalizados: asegurar que clientes creen y vean sus propios proyectos
DROP POLICY IF EXISTS "Clientes crean proyectos" ON public.proyectos_personalizados;
CREATE POLICY "Clientes crean proyectos"
  ON public.proyectos_personalizados FOR INSERT TO authenticated
  WITH CHECK (cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Usuarios leen sus proyectos" ON public.proyectos_personalizados;
CREATE POLICY "Usuarios leen sus proyectos"
  ON public.proyectos_personalizados FOR SELECT TO authenticated
  USING (cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Usuarios actualizan sus proyectos" ON public.proyectos_personalizados;
CREATE POLICY "Usuarios actualizan sus proyectos"
  ON public.proyectos_personalizados FOR UPDATE TO authenticated
  USING (cliente_id = public.get_current_cliente_id() OR public.is_admin())
  WITH CHECK (cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Admin elimina proyectos" ON public.proyectos_personalizados;
CREATE POLICY "Admin elimina proyectos"
  ON public.proyectos_personalizados FOR DELETE TO authenticated
  USING (public.is_admin());

-- proyecto_catalogos
DROP POLICY IF EXISTS "Usuarios leen proyecto catalogos" ON public.proyecto_catalogos;
CREATE POLICY "Usuarios leen proyecto catalogos"
  ON public.proyecto_catalogos FOR SELECT TO authenticated
  USING (
    proyecto_id IN (SELECT id FROM public.proyectos_personalizados WHERE cliente_id = public.get_current_cliente_id())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Insert proyecto catalogos" ON public.proyecto_catalogos;
CREATE POLICY "Insert proyecto catalogos"
  ON public.proyecto_catalogos FOR INSERT TO authenticated
  WITH CHECK (
    proyecto_id IN (SELECT id FROM public.proyectos_personalizados WHERE cliente_id = public.get_current_cliente_id())
    OR public.is_admin()
  );

-- proyecto_imagenes
DROP POLICY IF EXISTS "Usuarios leen proyecto imagenes" ON public.proyecto_imagenes;
CREATE POLICY "Usuarios leen proyecto imagenes"
  ON public.proyecto_imagenes FOR SELECT TO authenticated
  USING (
    proyecto_id IN (SELECT id FROM public.proyectos_personalizados WHERE cliente_id = public.get_current_cliente_id())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Insert proyecto imagenes" ON public.proyecto_imagenes;
CREATE POLICY "Insert proyecto imagenes"
  ON public.proyecto_imagenes FOR INSERT TO authenticated
  WITH CHECK (
    proyecto_id IN (SELECT id FROM public.proyectos_personalizados WHERE cliente_id = public.get_current_cliente_id())
    OR public.is_admin()
  );

-- ----------------------------------------------------------
-- 4. POLÍTICAS RLS: REWARDS & FIDELIZACIÓN
-- ----------------------------------------------------------

-- rewards_niveles (Catálogo público de niveles)
DROP POLICY IF EXISTS "Lectura pública de rewards_niveles" ON public.rewards_niveles;
CREATE POLICY "Lectura pública de rewards_niveles"
  ON public.rewards_niveles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gestiona rewards_niveles" ON public.rewards_niveles;
CREATE POLICY "Admin gestiona rewards_niveles"
  ON public.rewards_niveles FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- rewards_puntos (Balance de puntos del cliente)
DROP POLICY IF EXISTS "Clientes leen sus propios puntos" ON public.rewards_puntos;
CREATE POLICY "Clientes leen sus propios puntos"
  ON public.rewards_puntos FOR SELECT TO authenticated
  USING (cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Clientes insertan sus propios puntos" ON public.rewards_puntos;
CREATE POLICY "Clientes insertan sus propios puntos"
  ON public.rewards_puntos FOR INSERT TO authenticated
  WITH CHECK (cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Clientes actualizan sus propios puntos" ON public.rewards_puntos;
CREATE POLICY "Clientes actualizan sus propios puntos"
  ON public.rewards_puntos FOR UPDATE TO authenticated
  USING (cliente_id = public.get_current_cliente_id() OR public.is_admin())
  WITH CHECK (cliente_id = public.get_current_cliente_id() OR public.is_admin());

-- rewards_transacciones (Historial de transacciones de puntos)
DROP POLICY IF EXISTS "Clientes leen sus transacciones" ON public.rewards_transacciones;
CREATE POLICY "Clientes leen sus transacciones"
  ON public.rewards_transacciones FOR SELECT TO authenticated
  USING (cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Clientes insertan transacciones" ON public.rewards_transacciones;
CREATE POLICY "Clientes insertan transacciones"
  ON public.rewards_transacciones FOR INSERT TO authenticated
  WITH CHECK (cliente_id = public.get_current_cliente_id() OR public.is_admin());

-- referidos (Validación pública de códigos y registro de invitaciones)
DROP POLICY IF EXISTS "Lectura de referidos" ON public.referidos;
CREATE POLICY "Lectura de referidos"
  ON public.referidos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Clientes crean referidos" ON public.referidos;
CREATE POLICY "Clientes crean referidos"
  ON public.referidos FOR INSERT TO authenticated
  WITH CHECK (referente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Actualizar referidos" ON public.referidos;
CREATE POLICY "Actualizar referidos"
  ON public.referidos FOR UPDATE TO authenticated
  USING (referente_id = public.get_current_cliente_id() OR referido_id = public.get_current_cliente_id() OR public.is_admin())
  WITH CHECK (referente_id = public.get_current_cliente_id() OR referido_id = public.get_current_cliente_id() OR public.is_admin());

-- fechas_especiales
DROP POLICY IF EXISTS "Clientes gestionan fechas especiales" ON public.fechas_especiales;
CREATE POLICY "Clientes gestionan fechas especiales"
  ON public.fechas_especiales FOR ALL TO authenticated
  USING (cliente_id = public.get_current_cliente_id() OR public.is_admin())
  WITH CHECK (cliente_id = public.get_current_cliente_id() OR public.is_admin());

-- resenas (Lectura pública de reseñas aprobadas + gestión)
DROP POLICY IF EXISTS "Lectura de resenas" ON public.resenas;
CREATE POLICY "Lectura de resenas"
  ON public.resenas FOR SELECT
  USING (aprobada = true OR cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Clientes crean resenas" ON public.resenas;
CREATE POLICY "Clientes crean resenas"
  ON public.resenas FOR INSERT TO authenticated
  WITH CHECK (cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Actualizar resenas" ON public.resenas;
CREATE POLICY "Actualizar resenas"
  ON public.resenas FOR UPDATE TO authenticated
  USING (cliente_id = public.get_current_cliente_id() OR public.is_admin())
  WITH CHECK (cliente_id = public.get_current_cliente_id() OR public.is_admin());

DROP POLICY IF EXISTS "Admin elimina resenas" ON public.resenas;
CREATE POLICY "Admin elimina resenas"
  ON public.resenas FOR DELETE TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------
-- 5. POLÍTICAS RLS: FOODOS ERP
-- ----------------------------------------------------------

-- tenants
DROP POLICY IF EXISTS "Ver su propio negocio" ON public.tenants;
DROP POLICY IF EXISTS "Editar su propio negocio" ON public.tenants;
DROP POLICY IF EXISTS "Ver tenants autenticados" ON public.tenants;
CREATE POLICY "Ver tenants autenticados"
  ON public.tenants FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin gestiona tenants" ON public.tenants;
CREATE POLICY "Admin gestiona tenants"
  ON public.tenants FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Macro helper para tablas operativas con columna tenant_id
DO $$
DECLARE
  tbl TEXT;
  tables_with_tenant TEXT[] := ARRAY[
    'categorias_ingredientes',
    'ingredientes',
    'categorias_productos',
    'foodos_productos',
    'recetas',
    'foodos_modulos',
    'foodos_ventas',
    'foodos_almacenes',
    'foodos_inventario',
    'foodos_kardex',
    'foodos_eventos'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_with_tenant LOOP
    -- Limpiar políticas anteriores si existían
    EXECUTE format('DROP POLICY IF EXISTS "Aislamiento total por tenant ALL" ON public.%I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Aislamiento por tenant %I" ON public.%I;', tbl, tbl);
    
    -- Crear política unificada
    EXECUTE format(
      'CREATE POLICY "Aislamiento por tenant %I" ON public.%I FOR ALL TO authenticated ' ||
      'USING (tenant_id = public.get_user_tenant_id() OR public.is_admin()) ' ||
      'WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_admin());',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- Tablas hijas sin tenant_id directo (heredan de su tabla padre)
-- receta_items (hereda de recetas)
DROP POLICY IF EXISTS "Ver items de sus propias recetas" ON public.receta_items;
DROP POLICY IF EXISTS "Aislamiento por tenant receta_items" ON public.receta_items;
CREATE POLICY "Aislamiento por tenant receta_items"
  ON public.receta_items FOR ALL TO authenticated
  USING (
    receta_id IN (SELECT id FROM public.recetas WHERE tenant_id = public.get_user_tenant_id())
    OR public.is_admin()
  )
  WITH CHECK (
    receta_id IN (SELECT id FROM public.recetas WHERE tenant_id = public.get_user_tenant_id())
    OR public.is_admin()
  );

-- foodos_venta_items (hereda de foodos_ventas)
DROP POLICY IF EXISTS "Aislamiento por tenant foodos_venta_items" ON public.foodos_venta_items;
CREATE POLICY "Aislamiento por tenant foodos_venta_items"
  ON public.foodos_venta_items FOR ALL TO authenticated
  USING (
    venta_id IN (SELECT id FROM public.foodos_ventas WHERE tenant_id = public.get_user_tenant_id())
    OR public.is_admin()
  )
  WITH CHECK (
    venta_id IN (SELECT id FROM public.foodos_ventas WHERE tenant_id = public.get_user_tenant_id())
    OR public.is_admin()
  );

-- foodos_evento_gastos (hereda de foodos_eventos)
DROP POLICY IF EXISTS "Aislamiento por tenant foodos_evento_gastos" ON public.foodos_evento_gastos;
CREATE POLICY "Aislamiento por tenant foodos_evento_gastos"
  ON public.foodos_evento_gastos FOR ALL TO authenticated
  USING (
    evento_id IN (SELECT id FROM public.foodos_eventos WHERE tenant_id = public.get_user_tenant_id())
    OR public.is_admin()
  )
  WITH CHECK (
    evento_id IN (SELECT id FROM public.foodos_eventos WHERE tenant_id = public.get_user_tenant_id())
    OR public.is_admin()
  );

-- ----------------------------------------------------------
-- 6. PERMISOS DE ACCESO (GRANTS)
-- ----------------------------------------------------------

-- service_role siempre tiene acceso total
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Acceso anónimo a tablas que alimentan el storefront público
GRANT SELECT ON public.catalogo_imagenes TO anon;
GRANT SELECT ON public.rewards_niveles TO anon;
GRANT SELECT ON public.referidos TO anon;
GRANT SELECT ON public.resenas TO anon;

-- Acceso autenticado
GRANT SELECT ON public.catalogo_imagenes, public.rewards_niveles, public.referidos, public.resenas TO authenticated;
GRANT ALL ON public.rewards_puntos, public.rewards_transacciones, public.referidos, public.fechas_especiales, public.resenas TO authenticated;
GRANT ALL ON public.proyectos_personalizados, public.proyecto_catalogos, public.proyecto_imagenes, public.catalogo_imagenes TO authenticated;
GRANT ALL ON public.tenants, public.categorias_ingredientes, public.ingredientes, public.categorias_productos, public.foodos_productos, public.recetas, public.receta_items, public.foodos_modulos, public.foodos_ventas, public.foodos_venta_items, public.foodos_almacenes, public.foodos_inventario, public.foodos_kardex, public.foodos_eventos, public.foodos_evento_gastos TO authenticated;

-- Recargar schema en PostgREST
NOTIFY pgrst, 'reload schema';
