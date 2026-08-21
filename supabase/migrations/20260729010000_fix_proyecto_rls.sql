-- Fix RLS policies for proyectos_personalizados, proyecto_catalogos, proyecto_imagenes
-- The old policies used auth.uid() = cliente_id which is wrong because
-- cliente_id references clientes.id, but auth.uid() is auth.users.id.
-- The correct comparison is clientes.user_id = auth.uid().

-- =========================================================
-- Proyectos personalizados
-- =========================================================

DROP POLICY IF EXISTS "Clientes leen sus proyectos" ON public.proyectos_personalizados;
DROP POLICY IF EXISTS "Clientes actualizan sus proyectos" ON public.proyectos_personalizados;

CREATE POLICY "Usuarios leen sus proyectos"
  ON public.proyectos_personalizados
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = cliente_id
        AND clientes.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );

CREATE POLICY "Usuarios actualizan sus proyectos"
  ON public.proyectos_personalizados
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = cliente_id
        AND clientes.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );

CREATE POLICY "Admin elimina proyectos"
  ON public.proyectos_personalizados
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );

-- =========================================================
-- Proyecto - Catálogos
-- =========================================================

DROP POLICY IF EXISTS "Leer proyecto catalogos" ON public.proyecto_catalogos;

CREATE POLICY "Usuarios leen proyecto catalogos"
  ON public.proyecto_catalogos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proyectos_personalizados p
      JOIN clientes ON clientes.id = p.cliente_id
      WHERE p.id = proyecto_id
        AND clientes.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );

-- =========================================================
-- Proyecto - Imágenes
-- =========================================================

DROP POLICY IF EXISTS "Leer proyecto imagenes" ON public.proyecto_imagenes;

CREATE POLICY "Usuarios leen proyecto imagenes"
  ON public.proyecto_imagenes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proyectos_personalizados p
      JOIN clientes ON clientes.id = p.cliente_id
      WHERE p.id = proyecto_id
        AND clientes.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );
