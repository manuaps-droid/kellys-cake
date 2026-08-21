-- Agregar columna mas_vendido a la tabla productos
ALTER TABLE public.productos
ADD COLUMN IF NOT EXISTS mas_vendido boolean DEFAULT false;

-- Dar permisos a service_role
GRANT ALL ON public.productos TO service_role;
