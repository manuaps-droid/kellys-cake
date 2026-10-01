-- ==========================================================
-- Kelly's Cake
-- Libro de Reclamaciones (Ley 29571 / D.S. 011-2011-PCM)
-- ----------------------------------------------------------
-- Escritura pública (formulario anónimo), lectura/gestión solo
-- desde el servidor con service_role (panel admin).
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.libro_reclamaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('reclamo', 'queja')),
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('dni', 'ce', 'pasaporte', 'ruc')),
  numero_documento TEXT NOT NULL,
  direccion TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  producto_servicio TEXT NOT NULL,
  monto_reclamado NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fecha_compra DATE,
  descripcion TEXT NOT NULL,
  peticion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto')),
  respuesta TEXT,
  respondido_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.libro_reclamaciones ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede registrar una solicitud...
CREATE POLICY "publico_puede_registrar"
  ON public.libro_reclamaciones
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ...pero nadie (salvo service_role) puede leerlas ni modificarlas.
GRANT INSERT ON public.libro_reclamaciones TO anon, authenticated;
