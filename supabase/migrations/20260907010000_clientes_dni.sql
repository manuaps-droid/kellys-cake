-- Agrega columna dni a clientes para edición admin de datos del cliente.
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS dni TEXT;