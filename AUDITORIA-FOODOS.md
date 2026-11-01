# AUDITORÍA TÉCNICA — FoodOS
## Informe de código inútil/redundante + Arquitectura B2B SaaS
**Fecha:** 2026-11-01 · **Alcance:** todo el módulo FoodOS + accesos a datos

---

## PARTE 0 · Resumen ejecutivo

| Dimensión | Veredicto | Riesgo |
|---|---|---|
| Rendimiento del motor de costeo | 🔴 Crítico | N+1 real: 7 queries × N productos, secuenciales |
| Multi-tenancy | 🔴 Crítico | 100+ puntos de acceso con service_role sin org_id |
| Código muerto / duplicado | 🟡 Medio | 4 módulos enteros sin usar + lógica duplicada ×4 |
| Localización / moneda | 🟡 Medio | "S/", SUNAT y Contapro grabados en código |
| RBAC | 🟡 Medio | Solo rol `admin` (todo o nada) |
| Modularidad / licencias | 🟡 Mejorable | Menú cableado 2 veces en JSX |
| Observación "clases CSS huérfanas" | ✅ Refutada | Los tokens `kc-*` SÍ están declarados en `globals.css` |

---

## PARTE 1 · Hallazgos confirmados (con evidencia)

### 1.1 N+1 en el motor de costeo — CONFIRMADO y CUANTIFICADO (peor de lo estimado)

`calcularCosteoReal()` (`features/rentabilidad/services/costeo-real.service.ts`) ejecuta **7 consultas por invocación**:

| # | Query | Línea |
|---|---|---|
| 1 | `tienda_config` (config costeo) | L94 |
| 2 | `foodos_productos` (producto) | L113 |
| 3 | `recetas` (receta activa) | L121 |
| 4 | `receta_items` (+ join ingredientes) | L136 |
| 5 | `foodos_empaques` | L206 |
| 6 | `foodos_costos_fijos` | L231 |
| 7 | `foodos_mano_obra` | L264 |

**Puntos de llamada secuencial (N+1 real):**

| Archivo | Línea | Contexto |
|---|---|---|
| `app/foodos/page.tsx` | L29 | loop `for...of` con `await` |
| `app/foodos/rentabilidad/page.tsx` | L74 | loop `for...of` con `await` |
| `app/foodos/prediccion/page.tsx` | L10 | `Promise.all` (paralelo ✓ pero igual 7N queries) |
| `app/foodos/vending/page.tsx` | L28 | `Promise.all` |
| `features/prediccion/actions/prediccion-actions.ts` | L31, L235 | `Promise.all` |

**Matemática del problema:** 100 productos × 7 queries = **700 round-trips a Supabase** por carga del dashboard. A ~50 ms/round-trip desde Railway (us-east) hacia Supabase (us-east): ~35 s. Con 3 queries paralelizables de cabecera + caché de config se reduciría a ~N×4, pero el límite estructural persiste.

**Además:** la config (`tienda_config`) y los costos fijos (`foodos_costos_fijos`) son GLOBALES y se re-leen una vez por producto — 2 de las 7 queries son 100% redundantes dentro del loop.

### 1.2 Doble fuente de verdad para el margen — CONFIRMADO

`app/foodos/page.tsx`:
- **Fuente A (estática, desactualizada):** L14-16 — `productosConReceta` filtra por `p.precio_costo > 0`; `rentables` usa `p.margen_porcentaje > 50`; `alertaMargen` usa `p.margen_porcentaje < 30`.
- **Fuente B (real, costeo 4 capas):** `conCosteo` calculado con `calcularCosteoReal` y umbrales 40/20.

**Consecuencia visible:** la tarjeta "Productos Estrella (>50%)" puede decir 5 mientras el semáforo del KPI dice 2 saludables — con umbrales distintos encima (50/30 vs 40/20). `margen_porcentaje` en BD se actualiza solo al guardar receta, no al cambiar precios de insumos.

### 1.3 `await getCurrentAdmin()` huérfano — CONFIRMADO (matiz)

`app/foodos/layout.tsx` L7: `await getCurrentAdmin();` no asigna el resultado. **Matiz:** la llamada NO es inútil para seguridad (ejecuta redirects de rol/dispositivo que protegen toda la sección), pero: (a) se ejecuta de nuevo en cada página hija que también llama `getCurrentAdmin`/`getFoodOSSession` (doble verificación de dispositivo por navegación), y (b) el resultado (tenantId, cliente) se pierde y cada página lo vuelve a calcular.

### 1.4 Clases CSS `kc-*` — REFUTADO parcialmente

Las clases `bg-kc-ivory`, `text-kc-charcoal`, etc. **SÍ compilan**: están declaradas en `app/globals.css` dentro de `@theme inline` (`--color-kc-*`, líneas 66-84). No hay estilos rotos. **Lo que sí es válido:** los valores son constantes de marca de Kelly's Cake grabadas en CSS global. Para white-label B2B se deben mover a variables CSS por tenant (`--brand-primary`, `--brand-surface`...) inyectadas desde config.

---

## PARTE 2 · Hallazgos NUEVOS de esta auditoría

### 2.1 🔴 100+ puntos de acceso con `service_role` (bypass total de RLS)

`createAdminClient()` aparece en **100+ archivos**. Análisis por categoría:

| Categoría | Ejemplos | ¿Justificado? |
|---|---|---|
| Webhooks de pago (Culqi/MercadoPago) | `app/api/payments/*/webhook` | ✅ Sí — sin sesión de usuario |
| Cron jobs | `app/api/cron/resenas` | ✅ Sí |
| Lecturas públicas SEO (sitemap, productos, blog, cotización por token) | `app/sitemap.ts`, `app/productos/*` | ⚠️ Debería usar anon client + RLS de lectura pública |
| **Páginas admin completas** | `app/admin/*` (pedidos, clientes, catering, galería, agenda…) | ❌ NO — deberían usar sesión autenticada + RLS; hoy el único guard es `getCurrentAdmin()` en el layout |
| **Servicios FoodOS** | `costeo-real.service`, `pulso.service`, `kpis-financieros.service`, `vending.service` | ❌ Riesgo si alguna vez se invocan fuera de contexto admin |

**Riesgo B2B:** el aislamiento entre empresas NO está en la capa de datos en la práctica — está en el hecho de que solo hay un tenant. Al agregar el segundo cliente, cualquiera de estos 100+ puntos filtra o mezcla datos.

### 2.2 🔴 KPIs cargan TODO el historial de pedidos en memoria

- `features/kpis/services/kpis-financieros.service.ts` L47-52: `select("total, created_at").from("pedidos")` **sin límite de fecha** → con 3 años de operación son decenas de miles de filas transferidas al server en cada carga del dashboard, filtradas en JS.
- `features/kpis/services/pulso.service.ts` L79-83: idéntico patrón (`select(...).order("created_at")` sin límite) + segunda query de `pedido_items` con `.in("pedido_id", ids.slice(0, 2000))` (corte arbitrario que además **silenciosamente omite** pedidos >2000).

### 2.3 🟡 Lógica de costeo duplicada ×4

El bloque "fetch productos + loop de costeo + promedios + semáforo" está copiado (con variaciones) en:
1. `app/foodos/page.tsx` (dashboard)
2. `app/foodos/rentabilidad/page.tsx`
3. `app/foodos/prediccion/page.tsx`
4. `app/foodos/vending/page.tsx`

Cada copia tiene sus propios umbrales y forma de calcular promedios → los números ya difieren entre páginas. Un solo cambio de fórmula exige tocar 4 archivos.

### 2.4 🟡 Menú de navegación definido 2 veces

Los 13 ítems del menú FoodOS están cableados en `app/foodos/layout.tsx` (sidebar desktop) **y** otra vez en `components/foodos/FoodOSMobileNav.tsx` (drawer móvil), con badges duplicados (NUEVO/IA/PRO/CONTABLE/BETA/SUNAT). Agregar un módulo = editar 2 archivos sincronizados a mano.

### 2.5 🟡 Código muerto — módulos enteros sin usar (creados en esta iteración)

| Archivo | Estado | Evidencia |
|---|---|---|
| `features/vending/components/VentaVendingPanel.tsx` | **Muerto** | 0 imports en todo el repo (vending page renderiza `PrediccionDemandaPanel`) |
| `features/vending/actions/vending-actions.ts` | **Muerto** | 0 imports |
| `features/prediccion/actions/prediccion-actions.ts` | **Muerto** | 0 imports (las páginas usan handler `console.log`) |
| `features/prediccion/services/prediccion.service.ts` | **Muerto** | 0 imports (solo el propio archivo) |
| `app/test/route.ts` | Ruta de prueba en producción | aparece en el build |
| `scripts/create-test-user.cjs/.mjs` | Scripts de prueba sin tracking ni documentación | untracked |

### 2.6 🟡 Inconsistencias menores detectadas

- **Zona horaria Lima duplicada:** `Date.now() - 5*60*60*1000` copiado en `pulso.service.ts`, `kpis-financieros.service.ts` y `prediccion-actions.ts` (sin abstracción, y el offset fijo -5 ignora DST si Perú lo adopta).
- **`getProductos()`** usa session client con RLS; `getProductosTienda()` usa admin client — dos estrategias de acceso para datos equivalentes.
- **Semillas de margen** (`foodos_margenes_objetivo`) insertan por categoría con `NOT EXISTS` — sin índice único compuesto `(tenant_id, categoria)` la protección es por aplicación, no por BD.
- **`app/foodos/rentabilidad/page.tsx`** consulta precios pack de la tienda con un loop secuencial de queries (1 por producto de tienda) — segundo N+1 menor.
- **Duplicación `const poppins`** existió en `app/layout.tsx` (2 declaraciones) — corregido en commit reciente.

### 2.7 ✅ Lo que está BIEN (no tocar)

- Arquitectura feature-based (`actions/queries/repositories/services`) consistentemente aplicada.
- Server Actions con `getFoodOSSession()` que valida rol + dispositivo autorizado (3 equipos).
- RLS por tenant en las tablas foodos_* (aunque bypassed por service_role, el modelo existe).
- Autenticación de dispositivos (`authorized-devices`) como capa extra.
- `dynamic = "force-dynamic"` correcto en páginas de datos vivos.

---

## PARTE 3 · Arquitectura objetivo (B2B SaaS gastronómico)

### 3.1 Principios

1. **El costo se calcula al ESCRIBIR, no al LEER.** El dashboard solo lee.
2. **RLS es la única frontera de datos.** `service_role` solo en webhooks/cron.
3. **Todo lo por-tenant es configuración, nada es código.** Moneda, fiscal, módulos, roles, marca.
4. **Una sola fuente de verdad por concepto** (menú, umbrales, zona horaria).

### 3.2 Arquitectura en capas

```
┌─────────────────────────────────────────────────────┐
│ UI (Server Components) — lee tablas, cero lógica     │
├─────────────────────────────────────────────────────┤
│ Actions (mutaciones, requieren sesión+rol+dispositivo)│
├─────────────────────────────────────────────────────┤
│ Services (lógica de negocio pura, testeable)          │
│   · costeo.service → recalcula y PERSISTE métricas   │
│   · prediccion.service → lee métricas, no recalcula  │
├─────────────────────────────────────────────────────┤
│ Repositories (únicas clases con acceso a BD)          │
│   · SIEMPRE session-scoped (RLS) salvo webhooks/cron │
├─────────────────────────────────────────────────────┤
│ Supabase: RLS por (org_id) + triggers de recálculo    │
└─────────────────────────────────────────────────────┘
```

### 3.3 Modelo de datos nuevo (migraciones propuestas)

```sql
-- 1. Organizaciones (el tenant real) y suscripciones
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,            -- kellys-cake
  nombre TEXT NOT NULL,
  moneda CHAR(3) NOT NULL DEFAULT 'PEN',
  locale TEXT NOT NULL DEFAULT 'es-PE',
  fiscal_provider TEXT NOT NULL DEFAULT 'none', -- sunat|dian|sat|none
  plan TEXT NOT NULL DEFAULT 'starter',          -- starter|pro|enterprise
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tenants RENAME COLUMN ... -- migrar tenants existentes → orgs

-- 2. Métricas pre-calculadas (mata el N+1)
CREATE TABLE org_metricas_producto (
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES foodos_productos(id) ON DELETE CASCADE,
  costo_ingrediente NUMERIC(10,4),
  costo_empaque NUMERIC(10,4),
  costo_mano_obra NUMERIC(10,4),
  costo_indirecto NUMERIC(10,4),
  costo_variable NUMERIC(10,4),
  costo_completo NUMERIC(10,4),
  margen_bruto_pct NUMERIC(6,2),
  calculado_en TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (org_id, producto_id)
);
CREATE INDEX idx_metricas_org ON org_metricas_producto(org_id);

-- 3. Módulos/licencias por org (reemplaza tieneLogistica/tieneVentas)
CREATE TABLE org_modulos (
  org_id UUID REFERENCES orgs(id),
  modulo TEXT NOT NULL,           -- core|logistica|ventas|vending|prediccion
  activo BOOLEAN DEFAULT false,
  PRIMARY KEY (org_id, modulo)
);

-- 4. Roles (RBAC)
CREATE TABLE org_miembros (
  org_id UUID REFERENCES orgs(id),
  user_id UUID REFERENCES clientes(id),
  rol TEXT NOT NULL,              -- dueno|cocinero|cajero|mesero|contador
  PRIMARY KEY (org_id, user_id)
);

-- 5. Sucursales
CREATE TABLE org_sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'tienda',  -- tienda|cocina_central|vending
  maquina_vending_id UUID               -- enlace opcional
);

-- 6. Trigger: recálculo en background al cambiar insumos/recetas
CREATE OR REPLACE FUNCTION recalc_metricas_producto() ...
-- Se dispara en UPDATE de ingredientes.costo_por_unidad_uso,
-- receta_items, foodos_empaques, foodos_mano_obra, foodos_costos_fijos
```

### 3.4 Plan de refactor por fases (orden de ejecución)

**FASE 0 — Limpieza (1-2 días, cero riesgo)**
1. Eliminar código muerto: `VentaVendingPanel.tsx`, `vending-actions.ts`, `prediccion-actions.ts`, `prediccion.service.ts`, `app/test`, `scripts/create-test-user.*`.
2. Extraer `lib/time.ts` (zona Lima única) y `lib/format.ts` (`formatMoney(org.moneda)`).
3. Centralizar umbrales de margen en `features/rentabilidad/constants.ts` (40/20 una sola vez).

**FASE 1 — Matar el N+1 (3-5 días, mayor ROI)**
1. Paralelizar inmediato: `Promise.all(productos.map(calcularCosteoReal))` en las 4 páginas (×5-8 de mejora sin tocar BD).
2. Extraer config+costos fijos fuera del loop (1 lectura global, no N).
3. Implementar `org_metricas_producto`: el costeo se calcula ONCE al guardar receta/ingrediente/compra; el dashboard hace 1 query indexada.
4. Reemplazar las 4 copias del loop por `getMetricasProducto(orgId)` único.
5. `kpis-financieros.service` y `pulso.service`: agregar agregación SQL (`GROUP BY date_trunc('month')`) en lugar de traer todo a memoria.

**FASE 2 — Multi-tenancy real (1-2 semanas)**
1. `orgs` + `org_id` en todas las tablas foodos_*.
2. Repositories con session client (RLS activa); `createAdminClient` prohibido en `app/admin/*` y `features/*` salvo whitelist (webhooks/cron).
3. `getFoodOSSession()` retorna `orgId` y TODA query lo recibe como parámetro obligatorio.

**FASE 3 — Localización (1 semana)**
1. `formatMoney(amount, org.moneda)` con `Intl.NumberFormat` — elimina "S/" hardcodeado.
2. Contrato `BillingProvider` (`emitirComprobante()`): implementaciones `SunatProvider` (actual), `NullProvider` (internacional).
3. Contapro/SUNAT se vuelven plugins activables por `org.fiscal_provider`.

**FASE 4 — RBAC + Licencias (1-2 semanas)**
1. `modules.config.ts` único: ruta, icono, roles, plan requerido → sidebar desktop Y móvil se generan de ahí (mata la duplicación 2.4).
2. `org_miembros` + helper `requireRole(['dueno'])` en cada action.
3. `org_modulos` reemplaza `tieneLogistica`/`tieneVentas` del layout.

**FASE 5 — Multisucursal (2-3 semanas, post-venta)**
1. `org_sucursales` + selector en header + `branch_id` en inventario/vending/pedidos.

### 3.5 Esfuerzo total estimado

| Fase | Días | Riesgo | Bloqueante para vender |
|---|---|---|---|
| 0 Limpieza | 1-2 | Cero | — (hacer ya) |
| 1 Rendimiento | 3-5 | Bajo | **SÍ** |
| 2 Multi-tenancy | 5-10 | Medio | **SÍ** |
| 3 Localización | 5 | Bajo | Para Latam fuera de Perú |
| 4 RBAC/Licencias | 5-10 | Medio | **SÍ** (SaaS real) |
| 5 Multisucursal | 10-15 | Alto | Para cadenas (puede pos-venta) |

---

## PARTE 4 · Decisiones que necesito de ti

1. **¿Fase 0+1 ahora?** (limpieza + matar N+1) — son las de mayor impacto/riesgo mínimo y no rompen nada visual.
2. **Multi-tenancy:** ¿mantener `tenants` como tabla de orgs o migrar a `orgs` nueva con slug?
3. **Moneda:** ¿solo PEN por ahora con el adapter preparado, o ya multi-moneda?
4. Los módulos muertos de prediccion/vending: ¿los elimino o los conectamos primero a las páginas?
