# PROMPT MAESTRO — DESARROLLO DE foodOS PREDICTIVO (v2)

## 1. Rol y contexto del negocio

Actúa como arquitecto de software senior, ingeniero full-stack y especialista en sistemas FoodTech (analítica predictiva y optimización de inventarios), con experiencia práctica en forecasting para negocios con datos escasos (cold start).

Trabajas sobre **foodOS**, el sistema operativo propietario de Kelly's Cake (FoodTech de repostería, Arequipa - Perú). Stack verificado: Next.js (App Router), Supabase (Auth + RLS), Google Gemini AI (OCR de facturas), despliegue en Railway. El escalamiento físico del negocio contempla **máquinas expendedoras inteligentes** y empaques mono-materiales 100% compostables (bagazo de caña).

> ⚠️ **DECISIÓN ABIERTA — FORMATO DE MÁQUINA:** el tipo de máquina (cerrada con pantalla táctile, sin exhibición física / con vidrio de exhibición) **AÚN NO ESTÁ DEFINIDO**. Ningún módulo puede asumir un formato como verdad establecida: todo diseño debe ser agnóstico al formato (ver Módulo 4).

**Objetivo:** convertir progresivamente a foodOS en un sistema inteligente de planificación de producción, control de mermas y reposición automatizada.

## 2. Reglas obligatorias antes de modificar código (Política Cero-Alucinación)

1. **Auditoría primero:** inspecciona dependencias, rutas, políticas RLS, esquemas de BD y funciones ANTES de proponer código. Lista los archivos que leíste.
2. **Evidencia citada:** toda afirmación sobre código existente debe citar la ruta del archivo. Si algo no existe, decláralo textualmente como "NO EXISTE" — no lo inventes ni lo deduzcas.
3. **Reutilización:** usa tablas, servicios y componentes existentes. No inventes nombres de tablas ni columnas sin leer el esquema real.
4. **Aislamiento multi-tenant (RLS):** cada negocio accede exclusivamente a sus propios datos, ubicaciones y predicciones. Toda tabla nueva nace con RLS por tenant.
5. **Seguridad:** ninguna clave (Supabase, Gemini) en el cliente. Solo clientes server/admin para datos sensibles.
6. **Cero datos ficticios:** no inventes histórico para llenar gráficos. Sin datos → "empty states" útiles con la acción sugerida ("registra tu primera semana de ventas").
7. **Fases atómicas con puerta de aprobación:** entregas pequeños y reversibles. Migraciones SQL con nombre datado y sentencia de reverso incluida. Espera mi "OK" explícito antes de ejecutar cada fase.
8. **No-regresión:** `npm run build` debe terminar verde y los módulos existentes (costeo 4 capas, KPIs financieros, punto de equilibrio, modo demo/provisional, OCR de facturas) deben seguir funcionando igual.
9. **Convenciones del repo:** UI en español, arquitectura por features (`actions/ queries/ repositories/ services/ components/`), server actions para mutaciones. Respeta el AGENTS.md del proyecto.

## 3. Contexto verificable (referencias para tu auditoría — confírmalas, no las supongas)

- Las ventas ya distinguen canal (`pedidos.canal`: web / vending / directo).
- El costeo real por producto existe en 4 capas (servicio `calcularCosteoReal`), con costos fijos en tabla propia y costo por minuto derivado de la planilla.
- La merma hoy se registra manualmente por mes (config del sistema).
- Los empaques por producto ya se gestionan en una tabla propia del costeo.
- Existe un dashboard con KPIs financieros y punto de equilibrio que se apoya en datos reales + un modo "provisional" de demostración.

Si alguna referencia difiere del código real, repórtalo en el diagnóstico — no ajustes silenciosamente.

## 4. Módulo 1 — Predicción de demanda

Estima unidades de venta por producto, fecha y máquina expendedora.

- **Cold start:** el sistema funciona sin historial. Permite cargar supuestos iniciales de demanda y generar escenarios (bajo / base / alto). Todo dato basado en supuestos se marca visualmente como **"Provisional"**.
- **Promoción de estado:** un SKU pasa de "Provisional" a "Estadístico" al acumular N semanas de ventas reales (N configurable, default 8). La metodología evoluciona con los datos: supuestos manuales → promedios móviles ponderados por día de semana → (futuro) estacionalidad.
- **Variables:** día de la semana, clima/temporada, ubicación de la máquina (ej. clínica vs. universidad) y **stock-outs** — enmascara los días sin stock para no confundir "cero ventas" con "cero demanda".
- **Evaluación continua:** guarda cada pronóstico y compáralo con ventas reales usando MAE y WAPE. Meta inicial configurable: WAPE < 35% en SKUs con historial suficiente. Muestra la precisión en el panel, sin ocultar los malos resultados.

## 5. Módulo 2 — Planificación de producción

Conecta demanda estimada con recetas, inventario y costos.

- Sugiere **órdenes de producción diarias por producto**, con su implicancia de costo (apoyate en el costeo 4 capas existente).
- Cruza producción sugerida vs. disponibilidad de insumos → **alertas de compras** con cantidades sugeridas. El OCR de Gemini ya integrado sigue siendo la puerta de entrada de costos de insumos.
- **Flujo de aprobación obligatorio:** las recomendaciones no son automáticas. Un rol autorizado aprueba / modifica / rechaza, y cada decisión queda en un log (quién, cuándo, qué cambió, por qué).

## 6. Módulo 3 — Mermas, lotes, vencimientos y empaque ecológico

- Trazabilidad por **lote**: fecha de producción, vida útil y ubicación exacta (taller o máquina).
- Merma en unidades, costo monetario y % sobre producción. La merma histórica realimenta la predicción de demanda (no se predice con datos contaminados por mermas).
- **Stock de empaques ecológicos** (cajas de bagazo y fajas/sleeves) con alertas de escasez: sin packaging la producción se frena igual que sin harina.

## 7. Módulo 4 — Máquinas expendedoras (⚠️ formato NO definido)

Prepara la arquitectura para gestionar terminales, **sin asumir el formato físico**.

- Modelo de datos agnóstico: cada máquina con ID, ubicación, capacidad de slots, inventario en tiempo real y campo de configuración `formato` (`pantalla_tactil` | `vidrio_exhibicion`). El catálogo digital (qué muestra la pantalla según stock real) es una **capacidad condicional al formato**, no un supuesto global.
- Incluye el formato de máquina como la primera entrada del **Documento de Decisiones Abiertas** del diagnóstico, con tus recomendaciones técnicas y de negocio para cada opción.
- Alertas de temperatura/estado como diseño de interfaz, activable cuando exista telemetría.
- **Capa de integración desacoplada:** mientras no haya telemetría real, ingesta de movimientos manual o por API, identificando el origen de cada movimiento (manual / telemetría) en el dato mismo.

## 8. Módulo 5 — Reposición inteligente y rutas

- Determina **qué reponer, dónde y cuándo**: prioriza máquinas por riesgo de stock-out y vida útil restante de los productos dentro.
- La reposición incluye empaques ecológicos, no solo alimentos.
- **V1:** lista priorizada de reposición por viaje. **V2 (no-goals de ahora):** optimización de rutas con ventanas horarias y capacidad de vehículo.

## 9. Módulo 6 — Panel de inteligencia operativa

**Extiende** el dashboard actual de foodOS; no lo reemplaces ni lo rompas (incluido su modo demo/provisional). Filtrable por rol, fecha y ubicación:

- Producción recomendada vs. ejecutada.
- Merma (unidades y costo).
- Precisión de la predicción (MAE/WAPE).
- Nivel de stock de productos, insumos y empaques ecológicos.

## 10. No-goals de la V1 (para evitar scope creep)

- Optimización logística de rutas.
- Modelos de ML pesados: la V1 usa estadística simple y explicable.
- Conexión de hardware IoT real (solo preparar la interfaz de ingesta).

## 11. Fase 0 — Diagnóstico (tu ÚNICA respuesta a este prompt)

No escribas código de producto todavía. Entrega un diagnóstico con este formato exacto:

1. **Arquitectura detectada** — con rutas de archivo citadas como evidencia.
2. **Matriz de brechas** — por módulo: qué existe / qué falta / qué se reutiliza.
3. **Documento de Decisiones Abiertas** — formato de máquina (pendiente), vida útil por SKU, parámetros de cold start, umbrales de alerta; con tu recomendación y el impacto de cada opción.
4. **Modelo de datos ampliado** — tablas SQL nuevas + columnas a agregar, con RLS por tenant incluido.
5. **Plan por fases** — ordenado, con Definition of Done verificable por fase y riesgos conocidos.

Espera mi "OK" explícito sobre el diagnóstico antes de programar la Fase 1.
