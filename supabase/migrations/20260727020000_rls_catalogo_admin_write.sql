-- Políticas RLS para que el admin pueda gestionar catálogos (idempotentes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert catalogo') THEN
    CREATE POLICY "Admin insert catalogo"
      ON public.catalogo_personalizacion
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin update catalogo') THEN
    CREATE POLICY "Admin update catalogo"
      ON public.catalogo_personalizacion
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin delete catalogo') THEN
    CREATE POLICY "Admin delete catalogo"
      ON public.catalogo_personalizacion
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin read all catalogo') THEN
    CREATE POLICY "Admin read all catalogo"
      ON public.catalogo_personalizacion
      FOR SELECT
      USING (
        activo = true
        OR EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

-- También eliminar la política anterior de solo lectura pública (solo si existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Catalogo publico lectura') THEN
    DROP POLICY IF EXISTS "Catalogo publico lectura" ON public.catalogo_personalizacion;
  END IF;
END $$;
