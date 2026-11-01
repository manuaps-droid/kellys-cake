# FORMULARIO DE POSTULACIÓN INNGENIUS — PROINNÓVATE (SEGUNDA CONVOCATORIA 2026)
## Concurso Regional Innovación Empresarial — DER 3.0 Arequipa

---

## SECCIÓN 1: DATOS GENERALES DEL PROYECTO

### 1.1 Título del Proyecto
> **Desarrollo y validación a escala piloto de una red desatendida de Smart Vending para pastelería fresca de autor, gestionada por un sistema operativo predictivo (foodOS) con empaques 100% compostables en Arequipa.**

### 1.2 Resumen Ejecutivo (Máximo 3,000 caracteres)
El presente proyecto propone el desarrollo y validación a escala piloto de un modelo pionero de FoodTech y Retail Automatizado 4.0 en Arequipa: una red desatendida de máquinas expendedoras inteligentes (Smart Vending) refrigeradas 24/7 para la venta de porciones individuales de pastelería fresca de autor en empaques mono-materiales 100% compostables (bagazo de caña), gobernadas por una plataforma de inteligencia operativa denominada **foodOS Predictivo**.

La industria de pastelería artesanal enfrenta una severa ineficiencia operativa: productos de alta calidad y corta vida útil (3 a 5 días) son comercializados mediante esquemas tradicionales de tienda física con horarios restringidos, mientras que el vending tradicional se limita a golosinas ultraprocesadas en empaques plásticos no degradables. La venta de repostería fresca en máquinas expendedoras presenta una alta incertidumbre tecnológica: si la demanda diaria por máquina no se predice con exactitud, la merma por caducidad destruye la rentabilidad del negocio; asimismo, una falla en la trazabilidad térmica o temporal podría derivar en la venta de productos en mal estado.

Para resolver este desafío, el proyecto desarrolla e integra en un piloto funcional de 6 meses:
1. **Un terminal Smart Vending piloto refrigerado** con telemetría en tiempo real y protocolo de bloqueo automático que deshabilita la venta de cualquier lote que alcance su fecha/hora de caducidad.
2. **El motor predictivo foodOS**, que mediante algoritmos estadísticos (promedios móviles ponderados con enmascaramiento de quiebres de stock) proyecta la tasa de consumo de cada máquina y genera automáticamente las órdenes de horneado matutinas y planes de reposición para el taller central Kelly's Cake.
3. **Validación de empaques 100% compostables de bagazo de caña**, evaluando su comportamiento mecánico, aislamiento y preservación microbiológica bajo refrigeración continua sin ablandamiento estructural.

El proyecto permite a Kelly's Cake validar comercial y técnicamente el canal de vending inteligente, reducir la merma por debajo del 5%, eliminar el plástico de un solo uso y habilitar la escalabilidad del sistema a nivel regional.

### 1.3 Área de Especialización Priorizada (PDE Arequipa)
* **Área Prioritaria:** Manufactura Avanzada y Cadena Agroalimentaria.
* **Área Transversal:** Arequipa Verde, Resiliente y Sostenible.

### 1.4 Tipo de Innovación
* **Innovación de Proceso y Producto (Mixta)** según el Manual de Oslo. Proceso automatizado de planificación y reposición predictiva + nuevo formato de producto en porciones desatendidas con packaging ecológico.

### 1.5 Duración y Localización
* **Duración:** 6 meses calendario.
* **Departamento / Provincia / Distrito:** Arequipa / Arequipa / (Cercado - Yanahuara - Cayma).

---

## SECCIÓN 2: PLANTEAMIENTO DEL PROBLEMA, MERCADO Y OPORTUNIDAD

### 2.1 Definición del Problema Tecnológico y de Mercado
En la provincia de Arequipa existen más de 8,500 unidades productivas de repostería y panadería artesanal. No obstante, el sector padece tres cuellos de botella estructurales:
1. **Inaccesibilidad fuera de horario comercial y canal limitado:** El consumidor actual (universitarios, personal médico, trabajadores corporativos) demanda alimentación dulce artesanal las 24 horas, pero la oferta de calidad se restringe a vitrinas físicas abiertas 10 a 12 horas al día. El vending existente solo provee golosinas industriales con aditivos y conservantes artificiales.
2. **Elevada tasa de merma por caducidad (15% - 25%):** Los pasteles de autor sin conservantes industriales tienen una vida útil perecible de 72 a 120 horas. Planificar su elaboración sin analítica predictiva provoca saturación de inventario y pérdidas económicas irreversibles, o quiebres de stock que generan ventas perdidas.
3. **Residuos plásticos no biodegradables:** Casi la totalidad de las porciones individuales de torta se expenden en clamshells o domos plásticos derivados de polímeros fósiles (PET, poliestireno cristal), generando un severo pasivo ambiental en Arequipa.

### 2.2 Incertidumbre y Riesgo Técnico
El proyecto no es una simple compra de equipamiento, sino que aborda incertidumbres críticas que impiden hoy la existencia de este canal:
* **Incertidumbre Algorítmica (Predicción de Perecibles en Vending):** A diferencia de productos de larga duración, la demanda en vending varía drásticamente por ubicación (ej. clínica con consumo nocturno constante vs. sede universitaria con picos intermitentes y fines de semana nulos). El modelo matemático debe aprender a distinguir entre "demanda cero" y "quiebre de inventario", adaptando las recetas del taller sin generar sobrestock.
* **Incertidumbre de Seguridad Alimentaria y Telemetría:** El riesgo de corte de energía o variación térmica que afecte la cadena de frío (requerida entre 4 °C y 8 °C). Se requiere implementar un firmware/integración que inhabilite mecánicamente la entrega del producto ante anomalías térmicas o vencimiento de horas de lote.
* **Incertidumbre del Empaque Ecológico en Frío:** Los empaques de bagazo de caña estándar suelen absorber humedad en ambientes refrigerados con circulación de aire, debilitando su rigidez o afectando la textura del pastel. Se debe validar el calibre, recubrimiento biológico (PLA o base acuosa vegetal) y diseño de bandeja para resistir la caída o empuje del dispensador.

---

## SECCIÓN 3: OBJETIVOS Y RESULTADOS ESPERADOS

### 3.1 Objetivo General
Desarrollar y validar a escala piloto un sistema de Smart Vending refrigerado para pastelería fresca de autor en empaques 100% compostables, integrado a un sistema operativo de planificación predictiva de producción y reposición (foodOS), reduciendo las mermas a menos del 5% y garantizando la inocuidad y frescura del producto en Arequipa.

### 3.2 Objetivos Específicos y Metas
1. **OE1:** Desarrollar el módulo de telemetría y comunicación bidireccional entre el controlador de la máquina expendedora y la nube de foodOS, implementando el bloqueo preventivo por caducidad de lote y alerta de rango de temperatura (4 °C a 8 °C).  
   *Meta:* 100% de transacciones y estados de slot transmitidos en tiempo real con latencia menor a 5 segundos.
2. **OE2:** Desarrollar el motor predictivo de demanda por máquina (algoritmo estadístico con normalización de quiebres de stock) y el submódulo de generación automática de órdenes diarias de horneado en el taller central.  
   *Meta:* Lograr una precisión predictiva con WAPE (Weighted Absolute Percentage Error) menor a 35% al cabo del piloto.
3. **OE3:** Diseñar, adaptar y validar física y microbiológicamente el empaque mono-material compostable (bagazo de caña) para porciones individuales bajo condiciones operativas de vending.  
   *Meta:* Cero fallas estructurales por condensación durante 96 horas continuas en refrigeración y certificación de vida útil microbiológica en laboratorio acreditado.
4. **OE4:** Desplegar y operar el punto piloto de Smart Vending en una ubicación estratégica de Arequipa durante un mínimo de 60 días continuos.  
   *Meta:* Disminución de mermas totales del canal a menos del 5% del volumen horneado y satisfacción de usuario superior al 85%.

---

## SECCIÓN 4: METODOLOGÍA Y PLAN DE TRABAJO (6 MESES)

```
[MES 1] ────> [MES 2] ────> [MES 3] ────> [MES 4] ────> [MES 5] ────> [MES 6]
Diseño e      Desarrollo    Integración   Despliegue    Operación     Auditoría,
Ingeniería    Telemetría    Predictiva    Físico        Piloto        Transferencia
de Empaque    y Firmware    y Recetas     Terminal      60 días       y Cierre
```

### Detalle de Actividades por Hito:

#### HITO 1 (Meses 1 - 2): Arquitectura, Empaque y Desarrollo IoT
* **A1.1:** Homologación y selección de bandejas de bagazo de caña con recubrimiento biodegradable apto para pastelería húmeda y pruebas de compatibilidad con espirales/bandejas de máquina.
* **A1.2:** Ensayos de laboratorio microbiológico preliminares (recuento de mohos, levaduras y aerobios mesófilos) en pasteles refrigerados empacados en caña.
* **A1.3:** Adquisición de la unidad de vending refrigerada piloto y adecuación del hardware de telemetría / controlador inteligente.
* **A1.4:** Desarrollo de la API REST / WebSockets en foodOS para la ingesta de telemetría de máquina (temperatura, stock por slot, ventas, apertura de puerta).

#### HITO 2 (Meses 3 - 4): Algoritmo Predictivo e Integración con Taller
* **A2.1:** Implementación del motor predictivo en foodOS (modelado matemático por día de semana, factor clima y normalización de inventario agotado).
* **A2.2:** Conexión del motor predictivo con el módulo de recetas y explosión de insumos (BOM) en taller central Kelly's Cake.
* **A2.3:** Implementación del protocolo de seguridad alimentaria: comando remoto de bloqueo de slot cuando el lote supere el umbral de horas permitido.
* **A2.4:** Instalación y conexión física de la máquina Smart Vending en punto piloto seleccionado (ej. clínica o campus universitario en Arequipa).

#### HITO 3 (Meses 5 - 6): Operación Piloto, Validación de Métricas y Cierre
* **A3.1:** Operación comercial continua del punto de Smart Vending con reposición matutina diaria basada en recomendaciones de foodOS.
* **A3.2:** Monitoreo diario de precisión predictiva (cálculo de MAE y WAPE) y ajuste de coeficientes de estacionalidad.
* **A3.3:** Segundo ensayo microbiológico de control en producto extraído de la máquina piloto al final del ciclo de vida útil (día 4).
* **A3.4:** Evaluación de ciclo de vida del empaque y disposición compostable (cero residuo plástico).
* **A3.5:** Elaboración del Informe Técnico-Financiero Final y plan de escalamiento para Arequipa y regiones del sur.

---

## SECCIÓN 5: EQUIPO TÉCNICO Y DE GESTIÓN

1. **Coordinador General (Kelly's Cake):**  
   *Rol:* Representante técnico de la empresa ante ProInnóvate/UCSM. Gestión integral del proyecto, coordinación entre taller pastelero y equipo tecnológico.  
   *Dedicación:* 25% del tiempo. Vínculo acreditado con la empresa.
2. **Especialista en Alimentos y Calidad (Recurso Humano de la Empresa / Adicional):**  
   *Rol:* Supervisión de formulación de recetas para vending, control de cadena de frío, diseño de pruebas de vida útil sensorial y coordinación de ensayos microbiológicos.  
   *Dedicación:* 30% del tiempo.
3. **Ingeniero de Software e Integración IoT (Recurso Humano Adicional Especializado):**  
   *Rol:* Desarrollo de la integración de telemetría de la máquina con foodOS, lógica del motor predictivo y panel de control de slots.  
   *Dedicación:* 60% del tiempo (financiado con RNR).
4. **Coordinador Administrativo (Kelly's Cake):**  
   *Rol:* Administración de compras, rendición de cuentas en plataforma de ProInnóvate, gestión de cotizaciones y comprobantes.  
   *Dedicación:* 20% del tiempo (financiado por la empresa).

---

## SECCIÓN 6: PRESUPUESTO Y ESTRUCTURA FINANCIERA (S/)

| Categoría de Gasto | Aporte RNR (ProInnóvate) | Aporte Monetario (Empresa) | Aporte No Monetario (Empresa) | Total (S/) |
|---|---|---|---|---|
| **Equipos y Bienes (Máx 25%)** (Máquina expendedora inteligente refrigerada con telemetría) | S/ 48,000.00 | S/ 0.00 | S/ 0.00 | S/ 48,000.00 |
| **Recursos Humanos Adicionales** (Ing. Software IoT + Asistente Técnico Alimentos) | S/ 72,000.00 | S/ 0.00 | S/ 0.00 | S/ 72,000.00 |
| **Servicios de Terceros / Ensayos** (Ensayos de laboratorio microbiológico + hosting/cloud + soporte firmware) | S/ 35,000.00 | S/ 4,000.00 | S/ 0.00 | S/ 39,000.00 |
| **Materiales e Insumos** (Empaques compostables de caña + insumos de pastelería para lotes piloto) | S/ 28,000.00 | S/ 5,200.00 | S/ 0.00 | S/ 33,200.00 |
| **Consultoría / Formulación** (Asesoría especializada en gestión de innovación) | S/ 7,000.00 | S/ 0.00 | S/ 0.00 | S/ 7,000.00 |
| **Pasajes y Viáticos** (Visitas técnicas y calibración) | S/ 5,000.00 | S/ 1,000.00 | S/ 0.00 | S/ 6,000.00 |
| **Personal Propio Valorizado** (Horas Coordinador General, Maestro Pastelero, Administrador) | S/ 0.00 | S/ 0.00 | S/ 36,800.00 | S/ 36,800.00 |
| **Uso de Instalaciones / Equipamiento Propio** (Taller de pastelería, hornos, computadoras, cámaras de refrigeración) | S/ 0.00 | S/ 0.00 | S/ 10,000.00 | S/ 10,000.00 |
| **Aporte de Liquidez Operativa (IGV / imprevistos)** | S/ 0.00 | S/ 8,000.00 | S/ 0.00 | S/ 8,000.00 |
| **TOTALES** | **S/ 195,000.00 (75%)** | **S/ 18,200.00 (7%)** | **S/ 46,800.00 (18%)** | **S/ 260,000.00 (100%)** |

---

## SECCIÓN 7: IMPACTO EN SOSTENIBILIDAD AMBIENTAL Y REGIÓN AREQUIPA

1. **Economía Circular y Reducción de Plásticos:**  
   Sustitución del 100% de los envases plásticos de poliestireno/PET por empaques compostables de bagazo de caña, residuo agroindustrial renovable que se biodegrada en menos de 90 días en compostaje doméstico o industrial.
2. **Mitigación del Desperdicio Alimentario (Meta ODS 12.3):**  
   Al sincronizar la demanda horaria de los puntos de venta desatendidos con la planificación matutina de horneado en el taller, se reduce la merma del estándar de mercado (20%) a menos del 5%, disminuyendo la huella hídrica y de carbono asociada a la producción de lácteos, huevos y harinas.
3. **Escalabilidad y Empleo Técnico Local:**  
   El éxito del piloto sienta las bases para una red de 10 a 20 terminales en Arequipa Metropolitana en los siguientes 24 meses, dinamizando la cadena de proveedores locales de insumos agropecuarios y generando empleos de reposición técnica y manufactura calificada.
