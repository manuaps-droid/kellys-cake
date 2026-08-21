-- Política INSERT: permite al usuario autenticado crear su propio registro en clientes
-- Necesario para usuarios que se registraron antes del trigger

CREATE POLICY "Clientes crean su propio registro"
ON public.clientes
FOR INSERT
WITH CHECK (auth.uid() = user_id);
