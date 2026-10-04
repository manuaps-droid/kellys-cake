-- ==========================================================
-- Migration: Actualización de escala de descuentos (5%, 8%, 12%),
-- umbrales de delivery gratis y control de vencimiento de puntos (365 días)
-- ==========================================================

-- 1. Actualizar escala de descuentos y umbrales de delivery gratis en rewards_niveles
UPDATE public.rewards_niveles
SET descuento_pct = 5.00,
    delivery_gratis_umbral = 150.00,
    beneficios = '["5% descuento permanente", "Degustación gratis en pedidos +S/150", "Acceso anticipado a nuevos diseños"]'::jsonb
WHERE slug = 'flor';

UPDATE public.rewards_niveles
SET descuento_pct = 8.00,
    delivery_gratis_umbral = 100.00,
    beneficios = '["8% descuento permanente", "Delivery gratis en pedidos +S/100", "Personalización premium sin cargo", "Atención prioritaria"]'::jsonb
WHERE slug = 'torta';

UPDATE public.rewards_niveles
SET descuento_pct = 12.00,
    delivery_gratis_umbral = 0.00,
    beneficios = '["12% descuento permanente", "Delivery gratis siempre", "Torta sorpresa en tu cumpleaños", "Invitación a eventos exclusivos"]'::jsonb
WHERE slug = 'corona';

-- 2. Permitir 'vencimiento' en rewards_transacciones
ALTER TABLE public.rewards_transacciones
DROP CONSTRAINT IF EXISTS rewards_transacciones_tipo_check;

ALTER TABLE public.rewards_transacciones
ADD CONSTRAINT rewards_transacciones_tipo_check
CHECK (tipo IN ('ganancia', 'canje', 'vencimiento'));

-- 3. Función RPC para procesar vencimiento de puntos por cliente
CREATE OR REPLACE FUNCTION public.procesar_vencimiento_cliente(p_cliente_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_puntos_ganados_vencidos INTEGER := 0;
  v_puntos_ya_descontados_vencimiento INTEGER := 0;
  v_puntos_a_descontar INTEGER := 0;
  v_disponibles_actual INTEGER := 0;
  v_nuevo_disponible INTEGER := 0;
BEGIN
  -- Total ganados con más de 365 días
  SELECT COALESCE(SUM(cantidad), 0) INTO v_puntos_ganados_vencidos
  FROM public.rewards_transacciones
  WHERE cliente_id = p_cliente_id
    AND tipo = 'ganancia'
    AND created_at < (now() - INTERVAL '365 days');

  -- Total ya descontado por vencimiento
  SELECT COALESCE(SUM(cantidad), 0) INTO v_puntos_ya_descontados_vencimiento
  FROM public.rewards_transacciones
  WHERE cliente_id = p_cliente_id
    AND (tipo = 'vencimiento' OR motivo ILIKE '%vencimiento%');

  v_puntos_a_descontar := v_puntos_ganados_vencidos - v_puntos_ya_descontados_vencimiento;

  IF v_puntos_a_descontar > 0 THEN
    SELECT puntos_disponibles INTO v_disponibles_actual
    FROM public.rewards_puntos
    WHERE cliente_id = p_cliente_id;

    IF v_disponibles_actual IS NOT NULL AND v_disponibles_actual > 0 THEN
      IF v_puntos_a_descontar > v_disponibles_actual THEN
        v_puntos_a_descontar := v_disponibles_actual;
      END IF;

      UPDATE public.rewards_puntos
      SET puntos_disponibles = puntos_disponibles - v_puntos_a_descontar,
          updated_at = now()
      WHERE cliente_id = p_cliente_id
      RETURNING puntos_disponibles INTO v_nuevo_disponible;

      INSERT INTO public.rewards_transacciones (
        cliente_id, tipo, cantidad, motivo, referencia_tipo
      ) VALUES (
        p_cliente_id, 'vencimiento', v_puntos_a_descontar, 'Vencimiento de puntos (+365 días)', 'vencimiento'
      );

      RETURN jsonb_build_object(
        'procesado', true,
        'descontados', v_puntos_a_descontar,
        'puntos_disponibles', v_nuevo_disponible
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('procesado', false, 'descontados', 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.procesar_vencimiento_cliente(UUID) TO service_role, authenticated;

NOTIFY pgrst, 'reload schema';
