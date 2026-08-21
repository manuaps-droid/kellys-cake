-- ==========================================================
-- Kelly's Cake
-- Agenda de producción + anti-duplicación de solicitudes
-- ----------------------------------------------------------
-- 1) cotizaciones: soportar proyectos personalizados
--    (además de catering) para que el flujo "personalizar"
--    también emita cotización y llegue a pedidos.
-- 2) pedidos: fecha/hora/tipo de entrega para programar
--    la agenda de producción.
-- 3) Estados terminales 'finalizado' en cotizaciones_catering
--    y proyectos_personalizados: al confirmarse el pago la
--    solicitud origen se archiva y deja de listarse.
-- ==========================================================

-- 1) cotizaciones: enlace opcional a un proyecto personalizado
ALTER TABLE public.cotizaciones
  ADD COLUMN IF NOT EXISTS proyecto_id UUID REFERENCES public.proyectos_personalizados(id) ON DELETE SET NULL;

-- 2) pedidos: agenda de producción
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS fecha_entrega DATE,
  ADD COLUMN IF NOT EXISTS hora_entrega TIME,
  ADD COLUMN IF NOT EXISTS tipo_entrega TEXT;

-- Backfill de fecha_entrega desde la cotización vinculada
UPDATE public.pedidos p
SET fecha_entrega = c.fecha_evento,
    tipo_entrega = CASE
      WHEN c.proyecto_id IS NOT NULL THEN (
        SELECT pr.tipo_entrega FROM public.proyectos_personalizados pr WHERE pr.id = c.proyecto_id
      )
      ELSE NULL
    END
FROM public.cotizaciones c
WHERE p.cotizacion_id = c.id
  AND p.fecha_entrega IS NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_entrega
  ON public.pedidos (fecha_entrega);

-- 3) cotizaciones_catering: estado terminal 'finalizado'
ALTER TABLE public.cotizaciones_catering
  DROP CONSTRAINT IF EXISTS cotizaciones_catering_estado_check;

ALTER TABLE public.cotizaciones_catering
  ADD CONSTRAINT cotizaciones_catering_estado_check
  CHECK (estado IN ('pendiente', 'cotizado', 'aceptado', 'rechazado', 'finalizado'));

-- 4) proyectos_personalizados: estado terminal 'finalizado'
ALTER TABLE public.proyectos_personalizados
  DROP CONSTRAINT IF EXISTS proyectos_estado_check;

ALTER TABLE public.proyectos_personalizados
  ADD CONSTRAINT proyectos_estado_check
  CHECK (estado IN ('pendiente', 'cotizacion_enviada', 'aprobado', 'entregado', 'anulado', 'finalizado'));

NOTIFY pgrst, 'reload schema';
