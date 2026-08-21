-- RLS para la tabla clientes
-- Cada usuario puede leer y actualizar su propio registro
-- El service role / server actions bypass RLS automáticamente

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Usuarios leen su propio registro
CREATE POLICY "Clientes leen su propio registro"
ON public.clientes
FOR SELECT
USING (auth.uid() = user_id);

-- Usuarios actualizan su propio registro
CREATE POLICY "Clientes actualizan su propio registro"
ON public.clientes
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins leen todos los registros (para panel admin)
CREATE POLICY "Admins leen todos los clientes"
ON public.clientes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.user_id = auth.uid()
      AND c.rol = 'admin'
      AND c.activo = true
  )
);
