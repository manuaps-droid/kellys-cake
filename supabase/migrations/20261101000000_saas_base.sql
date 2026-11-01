-- ================================================================
-- MIGRACIÓN: Base SaaS multi-empresa (Fase 2/4 del plan de auditoría)
-- Defensiva: todo con IF NOT EXISTS / DO blocks — re-ejecutable.
-- ================================================================

-- 1. Columnas de organización/moneda/licencia en tenants (adaptador)
DO $$
BEGIN
  IF to_regclass('public.tenants') IS NOT NULL THEN
    ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug TEXT;
    ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS moneda CHAR(3) NOT NULL DEFAULT 'PEN';
    ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'es-PE';
    ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS fiscal_provider TEXT NOT NULL DEFAULT 'sunat';
    ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'pro';
  ELSE
    CREATE TABLE IF NOT EXISTS public.tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre VARCHAR(200) NOT NULL,
      slug TEXT,
      moneda CHAR(3) NOT NULL DEFAULT 'PEN',
      locale TEXT NOT NULL DEFAULT 'es-PE',
      fiscal_provider TEXT NOT NULL DEFAULT 'sunat',
      plan TEXT NOT NULL DEFAULT 'pro',
      activo BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END $$;

-- 2. Módulos/licencias por organización
CREATE TABLE IF NOT EXISTS public.org_modulos (
  tenant_id UUID NOT NULL,
  modulo VARCHAR(30) NOT NULL,   -- core | logistica | ventas | vending | prediccion
  activo BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (tenant_id, modulo)
);

-- 3. Miembros y roles (RBAC fino)
DO $$
BEGIN
  IF to_regclass('public.clientes') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.org_miembros (
      tenant_id UUID,
      user_id UUID NOT NULL,
      rol VARCHAR(30) NOT NULL,  -- dueno | cocinero | cajero | mesero | contador
      PRIMARY KEY (tenant_id, user_id)
    );
  ELSE
    CREATE TABLE IF NOT EXISTS public.org_miembros (
      user_id UUID PRIMARY KEY,
      rol VARCHAR(30) NOT NULL
    );
  END IF;
END $$;

-- 4. RLS defensiva para las tablas nuevas
DO $$
BEGIN
  IF to_regclass('public.org_modulos') IS NOT NULL THEN
    ALTER TABLE public.org_modulos ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Aislamiento por tenant org_modulos" ON public.org_modulos;
    EXECUTE 'CREATE POLICY "Aislamiento por tenant org_modulos" ON public.org_modulos FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;

  IF to_regclass('public.org_miembros') IS NOT NULL THEN
    ALTER TABLE public.org_miembros ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Lectura propia org_miembros" ON public.org_miembros;
    EXECUTE 'CREATE POLICY "Lectura propia org_miembros" ON public.org_miembros FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

GRANT ALL ON public.org_modulos TO authenticated, service_role;
GRANT SELECT ON public.org_miembros TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
