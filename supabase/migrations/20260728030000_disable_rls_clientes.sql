-- Deshabilitar RLS en clientes: la app maneja auth en código (server actions)
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
