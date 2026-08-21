-- Tabla de relación muchos a muchos entre productos y catálogos de personalización
CREATE TABLE IF NOT EXISTS producto_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  catalogo_id uuid NOT NULL REFERENCES catalogo_personalizacion(id) ON DELETE CASCADE,
  precio_extra numeric(10,2) NOT NULL DEFAULT 0,
  obligatorio boolean NOT NULL DEFAULT false,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(producto_id, catalogo_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_producto_catalogo_producto ON producto_catalogo(producto_id);
CREATE INDEX IF NOT EXISTS idx_producto_catalogo_catalogo ON producto_catalogo(catalogo_id);

-- RLS
ALTER TABLE producto_catalogo ENABLE ROW LEVEL SECURITY;

-- Admin puede todo (idempotente: si ya existe, no hace nada)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access on producto_catalogo') THEN
    CREATE POLICY "Admin full access on producto_catalogo"
      ON producto_catalogo
      FOR ALL
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

-- Lectura pública para items activos (idempotente: si ya existe, no hace nada)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active producto_catalogo') THEN
    CREATE POLICY "Public read active producto_catalogo"
      ON producto_catalogo
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Admin catálogos (idempotente: si ya existe, no hace nada)
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
