-- Deshabilitar RLS en tablas de proyectos: la app maneja auth en código (server actions)
ALTER TABLE public.proyectos_personalizados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyecto_catalogos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyecto_imagenes DISABLE ROW LEVEL SECURITY;
