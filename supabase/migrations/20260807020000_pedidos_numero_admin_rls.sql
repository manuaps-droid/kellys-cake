-- ==========================================================
-- Kelly's Cake
-- Pedidos: número correlativo para identificar pedidos
-- + políticas admin para que el panel de administración
-- lea y actualice todos los pedidos usando la sesión del
-- usuario (createClient), no solo los propios.
-- ==========================================================

-- 1) Número correlativo de pedido (identificación legible)
CREATE SEQUENCE IF NOT EXISTS public.pedidos_numero_seq;

ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS numero INTEGER;

-- Backfill en orden cronológico
WITH numbered AS (
  SELECT id,
         row_number() OVER (ORDER BY created_at ASC, id ASC) AS n
  FROM public.pedidos
)
UPDATE public.pedidos p
SET numero = numbered.n
FROM numbered
WHERE p.id = numbered.id;

SELECT setval('public.pedidos_numero_seq',
              COALESCE((SELECT MAX(numero) FROM public.pedidos), 1));

ALTER TABLE public.pedidos
  ALTER COLUMN numero SET DEFAULT nextval('public.pedidos_numero_seq'),
  ALTER COLUMN numero SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pedidos_numero_key ON public.pedidos (numero);

GRANT USAGE, SELECT ON SEQUENCE public.pedidos_numero_seq TO service_role;
GRANT USAGE ON SEQUENCE public.pedidos_numero_seq TO authenticated;

-- 2) Políticas admin (mismo patrón que "Admins leen todos los clientes")

-- Admins ven todos los pedidos
DROP POLICY IF EXISTS "Admins ven todos los pedidos" ON public.pedidos;
CREATE POLICY "Admins ven todos los pedidos"
  ON public.pedidos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.user_id = auth.uid()
        AND c.rol = 'admin'
        AND c.activo = true
    )
  );

-- Admins actualizan el estado de cualquier pedido
DROP POLICY IF EXISTS "Admins actualizan pedidos" ON public.pedidos;
CREATE POLICY "Admins actualizan pedidos"
  ON public.pedidos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.user_id = auth.uid()
        AND c.rol = 'admin'
        AND c.activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.user_id = auth.uid()
        AND c.rol = 'admin'
        AND c.activo = true
    )
  );

-- Admins ven los items de todos los pedidos
DROP POLICY IF EXISTS "Admins ven los items de todos los pedidos" ON public.pedido_items;
CREATE POLICY "Admins ven los items de todos los pedidos"
  ON public.pedido_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.user_id = auth.uid()
        AND c.rol = 'admin'
        AND c.activo = true
    )
  );

NOTIFY pgrst, 'reload schema';
