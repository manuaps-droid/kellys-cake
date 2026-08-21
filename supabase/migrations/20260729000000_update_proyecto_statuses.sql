ALTER TABLE public.proyectos_personalizados
DROP CONSTRAINT IF EXISTS proyectos_estado_check;

ALTER TABLE public.proyectos_personalizados
ADD CONSTRAINT proyectos_estado_check
CHECK (
    estado IN (
        'pendiente',
        'cotizacion_enviada',
        'aprobado',
        'entregado',
        'anulado'
    )
);
