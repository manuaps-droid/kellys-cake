# ROLLBACK — FoodOS Predictivo

Procedimiento de reversión ante fallo catastrófico. Punto de retorno garantizado: **tag `respaldo/pre-foodos-predictivo`** (commit `bcc773a`, también en origin).

## 1. Reversión de código (git)

```bash
# Volver el working branch al estado del respaldo (descartando TODO lo posterior)
git reset --hard respaldo/pre-foodos-predictivo

# Sincronizar ambas ramas de trabajo al punto de retorno
git push --force origin refactor/clean-architecture
git push --force origin refactor/clean-architecture:main
```

Requisito previo: verificar `git status --short` vacío (o hacer stash). Tras el reset, `npm run build` debe compilar (estado conocido bueno).

## 2. Reversión de base de datos (Supabase)

- Cada migración del desarrollo predictivo tiene su script de reverso en `supabase/rollback/` con el mismo nombre datado.
- Aplicar los reversos en **orden inverso** al que se ejecutaron:

```bash
# Ejemplo: revertir la migración de predicción
# psql $DATABASE_URL -f supabase/rollback/20261026090000_prediccion_demanda.sql
```

Si un reverso falla por datos ya creados (FK), el script indica el orden de limpieza. Tablas nuevas caídas con `DROP TABLE IF EXISTS ... CASCADE` no pierden datos del negocio existente (las tablas de foodOS originales no se tocan).

## 3. Qué NO se toca (invariantes de reversión)

El desarrollo predictivo solo **agrega**: tablas nuevas con prefijo `foodos_pred*` / `vending_*`, archivos en `features/prediccion/`, `features/vending/`, rutas `/foodos/prediccion` y `/foodos/vending`, y una entrada de menú.

Nunca modifica: `pedidos`, `foodos_productos`, `recetas`, `foodos_costos_fijos`, `foodos_empaques`, `foodos_mano_obra`, el servicio `calcularCosteoReal`, el dashboard KPIs (incluido su modo demo/provisional) ni el OCR de facturas.

## 4. Estado esperado tras reversión completa

- Código: idéntico al commit `bcc773a` (build verde verificado en ese punto).
- BD: sin las tablas `vending_maquinas`, `foodos_supuestos_demanda`, `foodos_predicciones` ni ninguna tabla `foodos_pred*`/`vending_*` posterior.
- El negocio sigue operando exactamente como antes del desarrollo predictivo.

## 5. Verificación post-rollback

1. `npm run build` → verde.
2. `/foodos` dashboard → KPIs cargan con datos (o modo demo provisional activo).
3. `/foodos/rentabilidad` → costeo 4 capas funcional.
4. No deben existir rutas `/foodos/prediccion` (404 esperado).
