-- RLS para la tabla clientes
-- Cada usuario puede leer y actualizar su propio registro
-- El service role / server actions bypass RLS automáticamente

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clientes leen su propio registro" ON public.clientes;
-- Usuarios leen su propio registro
CREATE POLICY "Clientes leen su propio registro"
ON public.clientes
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clientes actualizan su propio registro" ON public.clientes;
-- Usuarios actualizan su propio registro
CREATE POLICY "Clientes actualizan su propio registro"
ON public.clientes
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins leen todos los clientes" ON public.clientes;
-- Admins leen todos los registros (para panel admin)
CREATE POLICY "Admins leen todos los clientes"
ON public.clientes
FOR SELECT
USING (public.is_admin());
