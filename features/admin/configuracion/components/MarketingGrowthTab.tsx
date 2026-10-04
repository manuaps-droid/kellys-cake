"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Gift,
  Users,
  Sparkles,
  Zap,
  ShoppingBag,
  Mail,
  BookOpen,
  Search,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Megaphone,
  Percent,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  Clock,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { updateConfigAction } from "@/features/admin/configuracion/actions/config.action";
import type { MarketingConfig } from "@/features/admin/configuracion/validations/config.schema";

interface Props {
  initialConfig: Partial<MarketingConfig>;
}

interface OptionDef {
  key: keyof MarketingConfig;
  label: string;
  badge: string;
  description: string;
  impact: string;
}

interface CategoryDef {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Gift;
  color: string;
  options: OptionDef[];
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "fidelizacion",
    title: "1. Fidelización & Gamificación (Kelly's Rewards)",
    subtitle: "Incentivos y mecánicas lúdicas para generar hábito, retención y compras recurrentes.",
    icon: Gift,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    options: [
      {
        key: "rewards_activo",
        label: "Programa de Puntos Kelly's Rewards",
        badge: "Fidelización",
        description: "Permite a los clientes ganar y acumular puntos por registrarse (20 pts), primera compra (50 pts) y cada S/ 10 gastados (5 pts).",
        impact: "Aumenta la tasa de recompra hasta un 40%.",
      },
      {
        key: "niveles_activo",
        label: "Sistema de Niveles VIP (Semilla, Flor, Torta, Corona)",
        badge: "Retención",
        description: "Desbloquea beneficios automáticos según los puntos acumulados: 5%, 10% y 15% de descuento, delivery gratis y atención prioritaria.",
        impact: "Eleva el LTV (Customer Lifetime Value) promedio.",
      },
      {
        key: "ruleta_activo",
        label: "Ruleta Gamificada de Bienvenida",
        badge: "Gamificación",
        description: "Muestra la ruleta interactiva a los clientes recién registrados en su dashboard para ganar puntos y cupones al instante.",
        impact: "Activa a los nuevos usuarios en sus primeros 3 minutos.",
      },
      {
        key: "fechas_especiales_activo",
        label: "Programa 'Mi Fecha Especial' (Cumpleaños y Aniversarios)",
        badge: "Automatización",
        description: "Permite registrar fechas de cumpleaños de hijos, aniversarios y eventos para recibir ofertas personalizadas con 7-14 días de anticipación.",
        impact: "Captura ventas garantizadas en fechas de alta intención.",
      },
      {
        key: "streak_rewards_activo",
        label: "Rachas de Compra (Streak Rewards)",
        badge: "Growth Hack",
        description: "Multiplicadores de puntos (x3, x6, x10) para clientes que realizan pedidos en meses consecutivos sin romper la racha.",
        impact: "Crea el hábito mensual de compra en Kelly's Cake.",
      },
      {
        key: "rasca_gana_activo",
        label: "Rasca y Gana Digital de Reactivación",
        badge: "Reactivación",
        description: "Juego interactivo enviado por correo a clientes con más de 30 o 45 días inactivos con cupones sorpresa de duración limitada (48h).",
        impact: "Reactiva hasta un 15% de clientes dormidos.",
      },
    ],
  },
  {
    id: "viral_loops",
    title: "2. Viral Loops & Referidos",
    subtitle: "Mecánicas para convertir a cada cliente satisfecho en un canal de adquisición orgánico.",
    icon: Users,
    color: "text-rose-600 bg-rose-50 border-rose-200",
    options: [
      {
        key: "referidos_activo",
        label: "Programa de Referidos 'Regala Dulzura'",
        badge: "Viral Loop",
        description: "Genera enlaces y códigos únicos: S/ 15 de crédito + 30 pts para quien invita, y 10% de descuento para el nuevo amigo en su primera compra.",
        impact: "Meta: +120 nuevos clientes referidos al mes a costo cero de ads.",
      },
      {
        key: "cadena_regalos_activo",
        label: "Cadena de Regalos (Referidos Multinivel L2-L3)",
        badge: "Multiplicador",
        description: "Otorga puntos extra (10 pts y 5 pts) cuando los referidos de tus clientes refieren a otros amigos (máximo 3 niveles seguros).",
        impact: "Multiplica el alcance viral exponencialmente.",
      },
      {
        key: "quiz_torta_ideal_activo",
        label: "Quiz Viral 'Diseña tu Torta Ideal' (/mi-torta-ideal)",
        badge: "Lead Magnet",
        description: "Test interactivo de 5 preguntas que diagnostica el estilo de pastel ideal y genera una tarjeta visual lista para compartir en Instagram y WhatsApp.",
        impact: "Genera tráfico orgánico y captura de registros con alta conversión.",
      },
      {
        key: "ediciones_limitadas_activo",
        label: "Waitlist de Ediciones Limitadas (Escasez Artificial)",
        badge: "FOMO / Urgencia",
        description: "Lanzamientos de pasteles con cupos estrictos (ej. 20 unidades) con cuenta regresiva. Requiere registro previo para ingresar a la lista de espera.",
        impact: "Crea urgencia masiva y captura hasta 300 leads por lanzamiento.",
      },
      {
        key: "leaderboard_embajadoras_activo",
        label: "Ranking de Embajadoras (Tabla de Posiciones)",
        badge: "Gamificación",
        description: "Tabla de posiciones mensual visible en 'Mi Cuenta' premiando a las 10 clientas que más referidos trajeron con tortas gratis o descuentos especiales.",
        impact: "Incentiva a las micro-influencers y clientes leales a compartir más.",
      },
    ],
  },
  {
    id: "conversion",
    title: "3. Conversión & Social Proof (Growth Hacking)",
    subtitle: "Tácticas de psicología de ventas para convertir visitantes anónimos en compradores reales.",
    icon: Zap,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    options: [
      {
        key: "social_proof_activo",
        label: "Social Proof en Tiempo Real (Notificaciones)",
        badge: "Presión Social",
        description: "Toasts emergentes discretos que notifican pedidos recientes reales ('María de Surco acaba de pedir...') y visitas activas.",
        impact: "Eleva la tasa de conversión global entre un 15% y 25%.",
      },
      {
        key: "exit_intent_activo",
        label: "Modal de Rescate al Salir (Exit-Intent)",
        badge: "Recuperación",
        description: "Detecta cuando el usuario mueve el cursor para cerrar la pestaña y despliega una última oferta atractiva antes de marcharse.",
        impact: "Recupera hasta un 8% de visitantes que iban a abandonar la tienda.",
      },
      {
        key: "popup_registro_activo",
        label: "Popup Inteligente de Registro (10% OFF)",
        badge: "Captación",
        description: "Modal de bienvenida tras 30 segundos de navegación que ofrece 10% de descuento en la 1ra compra a cambio de crear su cuenta.",
        impact: "Canal principal para llegar a los 1,000 registros mensuales.",
      },
      {
        key: "precio_ancla_activo",
        label: "Precio Psicológico Ancla (Ahorro Visual)",
        badge: "Neuromarketing",
        description: "Muestra el valor estimado de referencia tachado ('Valorado en S/ 180 → Tu precio S/ 120 · Ahorras 33%') en los catálogos y fichas.",
        impact: "Aumenta el CTR y la percepción de valor del cliente.",
      },
      {
        key: "whatsapp_express_activo",
        label: "Checkout Exprés por WhatsApp",
        badge: "Cero Fricción",
        description: "Botón complementario para usuarios que prefieren pedir por chat. Transfiere el pedido con texto pre-redactado directo al WhatsApp comercial.",
        impact: "Captura clientes no bancarizados o que desean atención asistida.",
      },
    ],
  },
  {
    id: "monetizacion",
    title: "4. Monetización & Aumento de Ticket (Upsells & Bundles)",
    subtitle: "Estrategias para aumentar el valor promedio por pedido (AOV) de S/ 85 a más de S/ 120.",
    icon: ShoppingBag,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    options: [
      {
        key: "upsells_carrito_activo",
        label: "Upsells Sugeridos en Carrito y Checkout",
        badge: "Ticket Promedio",
        description: "Sugerencias inteligentes de complementos de alto margen (toppers personalizados, velas temáticas, cajas de mini cupcakes) antes de pagar.",
        impact: "Incrementa el ticket promedio en un 15-20%.",
      },
      {
        key: "bundles_activo",
        label: "Packs & Bundles Temáticos con Descuento",
        badge: "Paquetes",
        description: "Paquetes prediseñados (Pack Cumpleaños: Torta + 24 Cupcakes + Topper) con 20% de ahorro visual para evitar la parálisis de elección.",
        impact: "Facilita la decisión de compra para eventos completos.",
      },
      {
        key: "suscripciones_activo",
        label: "Módulo de Suscripción Dulce Mensual",
        badge: "Ingreso Recurrente",
        description: "Planes de suscripción periódica para recibir cajas de postres o mini pasteles cada mes con delivery prioritario incluido.",
        impact: "Genera ingresos recurrentes predecibles (MRR).",
      },
      {
        key: "calculadora_porciones_activo",
        label: "Calculadora Interactiva de Porciones (/calculadora-porciones)",
        badge: "Herramienta Imán",
        description: "Herramienta que calcula el tamaño ideal de torta, peso y postres complementarios según el número de invitados, con botón directo a cotizar.",
        impact: "Posicionamiento SEO orgánico y cotizaciones de mayor tamaño.",
      },
    ],
  },
  {
    id: "email",
    title: "5. Email Marketing & Automatización (Resend)",
    subtitle: "Comunicaciones transaccionales y automatizadas sin costo de pauta para nutrir la relación.",
    icon: Mail,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    options: [
      {
        key: "email_bienvenida_activo",
        label: "Email Automático de Bienvenida",
        badge: "Onboarding",
        description: "Envía inmediatamente tras el registro un correo HTML premium notificando los 20 puntos de regalo y catálogo destacado.",
        impact: "Primera impresión de marca de alta gama.",
      },
      {
        key: "email_carrito_abandonado_activo",
        label: "Secuencia de Carrito Abandonado",
        badge: "Recuperación",
        description: "Dispara recordatorios por correo a los 60 minutos y 24 horas a los clientes que dejaron productos en su carrito sin pagar.",
        impact: "Recupera entre el 10% y 18% de ventas perdidas.",
      },
      {
        key: "email_post_compra_activo",
        label: "Email Post-Compra y Solicitud de Reseña",
        badge: "Social Proof",
        description: "Envío programado al día +1 ('¿Llegó todo bien?') y al día +7 invitando a subir fotos del pastel a cambio de 15 puntos.",
        impact: "Genera flujo constante de reseñas auténticas con fotos.",
      },
      {
        key: "email_cumpleanos_activo",
        label: "Email de Celebración & Cumpleaños",
        badge: "Fidelización",
        description: "Saludo automatizado 7 días antes de la fecha especial registrada por el cliente con un cupón de regalo.",
        impact: "Asegura el pedido de cumpleaños con suficiente anticipación.",
      },
    ],
  },
  {
    id: "seo_contenido",
    title: "6. SEO & Contenido Orgánico",
    subtitle: "Activos digitales que atraen tráfico constante desde Google sin pagar publicidad.",
    icon: BookOpen,
    color: "text-teal-600 bg-teal-50 border-teal-200",
    options: [
      {
        key: "blog_activo",
        label: "Portal de Blog & Artículos (/blog)",
        badge: "SEO Tráfico",
        description: "Módulo de artículos con Schema Markup JSON-LD (BlogPosting) para posicionar guías de sabores, tendencias y precios en Google.",
        impact: "Construye autoridad de marca y tráfico orgánico continuo.",
      },
      {
        key: "seo_programatico_activo",
        label: "Páginas SEO Programáticas (Ocasiones & Distritos)",
        badge: "Long-Tail",
        description: "Generación automática de URLs dinámicas (/tortas-para-bodas, /tortas-en-surco) diseñadas para capturar búsquedas locales de alta intención.",
        impact: "Proyecta hasta 10,000 visitas orgánicas adicionales al mes.",
      },
      {
        key: "resenas_producto_activo",
        label: "Sistema de Reseñas y Calificaciones con Foto",
        badge: "Confianza",
        description: "Muestra valoraciones de 1 a 5 estrellas, testimonios y fotos de clientes al pie de cada producto en la tienda.",
        impact: "Aumenta la tasa de adición al carrito en un 28%.",
      },
    ],
  },
  {
    id: "promociones_base",
    title: "7. Banners, Delivery & Avisos Generales",
    subtitle: "Avisos globales, testimonios de portada y configuración de envío gratis.",
    icon: Megaphone,
    color: "text-rose-700 bg-rose-50 border-rose-200",
    options: [
      {
        key: "banner_activo",
        label: "Banner Promocional Superior",
        badge: "Anuncio Global",
        description: "Franja de aviso fija en la parte superior de toda la tienda para campañas de temporada, feriados o promociones express.",
        impact: "Máxima visibilidad inmediata para ofertas de tiempo limitado.",
      },
      {
        key: "mostrar_testimonios",
        label: "Mostrar Testimonios en la Portada (Home)",
        badge: "Home Page",
        description: "Activa el carrusel de opiniones de clientes destacados en la página principal para visitantes primerizos.",
        impact: "Genera confianza instantánea en la primera visita.",
      },
    ],
  },
];

export default function MarketingGrowthTab({ initialConfig }: Props) {
  const [config, setConfig] = useState<MarketingConfig>({
    banner_activo: initialConfig.banner_activo ?? false,
    banner_titulo: initialConfig.banner_titulo ?? "",
    banner_texto: initialConfig.banner_texto ?? "",
    banner_color: initialConfig.banner_color ?? "#C8956C",
    banner_link: initialConfig.banner_link ?? "",
    envio_gratis_umbral: initialConfig.envio_gratis_umbral ?? null,
    mostrar_testimonios: initialConfig.mostrar_testimonios ?? true,
    carrito_abandonado_minutos: initialConfig.carrito_abandonado_minutos ?? 60,
    carrito_abandonado_mensaje: initialConfig.carrito_abandonado_mensaje ?? "",

    soles_por_puntos: initialConfig.soles_por_puntos ?? 10,
    puntos_otorgados: initialConfig.puntos_otorgados ?? 5,
    dias_vencimiento_puntos: initialConfig.dias_vencimiento_puntos ?? 365,
    descuento_flor_pct: initialConfig.descuento_flor_pct ?? 5,
    descuento_torta_pct: initialConfig.descuento_torta_pct ?? 8,
    descuento_corona_pct: initialConfig.descuento_corona_pct ?? 12,
    delivery_gratis_flor_umbral: initialConfig.delivery_gratis_flor_umbral ?? 150,
    delivery_gratis_torta_umbral: initialConfig.delivery_gratis_torta_umbral ?? 100,
    delivery_gratis_corona_umbral: initialConfig.delivery_gratis_corona_umbral ?? 0,

    rewards_activo: initialConfig.rewards_activo ?? true,
    niveles_activo: initialConfig.niveles_activo ?? true,
    ruleta_activo: initialConfig.ruleta_activo ?? true,
    fechas_especiales_activo: initialConfig.fechas_especiales_activo ?? true,
    streak_rewards_activo: initialConfig.streak_rewards_activo ?? true,
    rasca_gana_activo: initialConfig.rasca_gana_activo ?? false,

    referidos_activo: initialConfig.referidos_activo ?? true,
    cadena_regalos_activo: initialConfig.cadena_regalos_activo ?? false,
    quiz_torta_ideal_activo: initialConfig.quiz_torta_ideal_activo ?? false,
    ediciones_limitadas_activo: initialConfig.ediciones_limitadas_activo ?? false,
    leaderboard_embajadoras_activo: initialConfig.leaderboard_embajadoras_activo ?? false,

    social_proof_activo: initialConfig.social_proof_activo ?? true,
    exit_intent_activo: initialConfig.exit_intent_activo ?? true,
    popup_registro_activo: initialConfig.popup_registro_activo ?? true,
    precio_ancla_activo: initialConfig.precio_ancla_activo ?? true,
    whatsapp_express_activo: initialConfig.whatsapp_express_activo ?? true,

    upsells_carrito_activo: initialConfig.upsells_carrito_activo ?? true,
    bundles_activo: initialConfig.bundles_activo ?? true,
    suscripciones_activo: initialConfig.suscripciones_activo ?? false,
    calculadora_porciones_activo: initialConfig.calculadora_porciones_activo ?? false,

    email_bienvenida_activo: initialConfig.email_bienvenida_activo ?? true,
    email_carrito_abandonado_activo: initialConfig.email_carrito_abandonado_activo ?? true,
    email_post_compra_activo: initialConfig.email_post_compra_activo ?? true,
    email_cumpleanos_activo: initialConfig.email_cumpleanos_activo ?? true,

    blog_activo: initialConfig.blog_activo ?? true,
    seo_programatico_activo: initialConfig.seo_programatico_activo ?? false,
    resenas_producto_activo: initialConfig.resenas_producto_activo ?? true,
  });

  const [pending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<"todos" | "activos" | "inactivos">("todos");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Calcular métricas rápidas
  const allBooleanKeys = useMemo(() => {
    const keys: (keyof MarketingConfig)[] = [];
    for (const cat of CATEGORIES) {
      for (const opt of cat.options) {
        keys.push(opt.key);
      }
    }
    return keys;
  }, []);

  const stats = useMemo(() => {
    let active = 0;
    for (const key of allBooleanKeys) {
      if (config[key] === true) active++;
    }
    return {
      total: allBooleanKeys.length,
      active,
      inactive: allBooleanKeys.length - active,
      percent: Math.round((active / allBooleanKeys.length) * 100),
    };
  }, [config, allBooleanKeys]);

  // Toggle individual
  const handleToggle = (key: keyof MarketingConfig) => {
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle por categoría
  const handleToggleCategory = (catId: string, setAllTo: boolean) => {
    const category = CATEGORIES.find((c) => c.id === catId);
    if (!category) return;
    setConfig((prev) => {
      const updated = { ...prev };
      for (const opt of category.options) {
        (updated as any)[opt.key] = setAllTo;
      }
      return updated;
    });
    toast.info(
      setAllTo
        ? `Todos los módulos de ${category.title} han sido activados.`
        : `Todos los módulos de ${category.title} han sido desactivados.`
    );
  };

  // Toggle global
  const handleToggleAll = (setAllTo: boolean) => {
    setConfig((prev) => {
      const updated = { ...prev };
      for (const key of allBooleanKeys) {
        (updated as any)[key] = setAllTo;
      }
      return updated;
    });
    toast.info(
      setAllTo
        ? "Todos los módulos del plan han sido activados."
        : "Todos los módulos del plan han sido desactivados."
    );
  };

  // Guardar configuración
  const handleSave = () => {
    startTransition(async () => {
      const result = await updateConfigAction("marketing", config);
      if (result.success) {
        toast.success("¡Configuración de Marketing & Growth Hacking guardada!");
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      } else {
        toast.error(result.message ?? "Error al guardar configuración.");
      }
    });
  };

  const toggleCollapse = (id: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrado
  const filteredCategories = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const filteredOptions = cat.options.filter((opt) => {
        const matchesSearch =
          opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opt.badge.toLowerCase().includes(searchTerm.toLowerCase());

        const isCurrentlyActive = Boolean(config[opt.key]);
        const matchesFilter =
          filterState === "todos" ||
          (filterState === "activos" && isCurrentlyActive) ||
          (filterState === "inactivos" && !isCurrentlyActive);

        return matchesSearch && matchesFilter;
      });

      return {
        ...cat,
        options: filteredOptions,
        totalCategoryOptions: cat.options.length,
        activeInCategory: cat.options.filter((o) => Boolean(config[o.key])).length,
      };
    }).filter((cat) => cat.options.length > 0);
  }, [searchTerm, filterState, config]);

  return (
    <div className="space-y-6">
      {/* Top Banner Control Panel */}
      <div className="rounded-2xl border border-kc-sand/60 bg-gradient-to-r from-kc-cream via-white to-kc-sand/20 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-kc-charcoal text-kc-gold">
                <Sliders className="h-4 w-4" />
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                Panel de Control de Marketing & Growth Hacking
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
              Control absoluto y granular sobre cada táctica de adquisición, conversión, fidelización y monetización. Activa o desactiva con un solo clic.
            </p>
          </div>

          {/* Quick summary counters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-center">
              <span className="block text-xl font-bold text-emerald-700">
                {stats.active}
              </span>
              <span className="text-xs font-medium text-emerald-800">
                Módulos Activos ({stats.percent}%)
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center">
              <span className="block text-xl font-bold text-slate-700">
                {stats.inactive}
              </span>
              <span className="text-xs font-medium text-slate-600">
                Inactivos
              </span>
            </div>
            <Button
              onClick={handleSave}
              disabled={pending}
              className="bg-kc-charcoal hover:bg-kc-deep text-white px-6 py-2.5 font-medium shadow-sm transition-all"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : justSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-emerald-400" />
                  ¡Guardado con éxito!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search, Filter & Quick Toggle All Bar */}
        <div className="mt-6 flex flex-col gap-3 pt-5 border-t border-kc-sand/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar opción (ej: ruleta, referidos, social proof, email)..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm outline-none transition focus:border-kc-gold focus:ring-2 focus:ring-kc-gold/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilterState("todos")}
                className={`px-3 py-1.5 rounded-md transition ${
                  filterState === "todos"
                    ? "bg-kc-charcoal text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setFilterState("activos")}
                className={`px-3 py-1.5 rounded-md transition ${
                  filterState === "activos"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-emerald-700"
                }`}
              >
                Activos ({stats.active})
              </button>
              <button
                type="button"
                onClick={() => setFilterState("inactivos")}
                className={`px-3 py-1.5 rounded-md transition ${
                  filterState === "inactivos"
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-gray-600 hover:text-slate-900"
                }`}
              >
                Inactivos ({stats.inactive})
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
            >
              Activar Todos
            </button>
            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Desactivar Todos
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN ESPECIAL: Reglas de Puntos, Fidelización y Delivery Gratuito */}
      <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-200/60">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900">
                  Reglas de Puntos, Fidelización y Delivery Gratuito
                </h3>
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Transversal a Tienda y Campañas
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Configura la equivalencia de soles a puntos, el vencimiento anual y la escala de beneficios VIP por niveles.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* 1. Equivalencia de Puntos y Vencimiento */}
          <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Coins className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold text-sm text-gray-900">
                  Equivalencia de Puntos por Compra
                </h4>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Establece cuántos puntos recibe el cliente por cada monto gastado. Aplica a todas las compras y campañas activas.
              </p>

              <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5">
                <div className="flex-1">
                  <span className="text-[11px] font-semibold text-amber-900 block mb-1">Monto en Soles</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">S/.</span>
                    <Input
                      type="number"
                      min={1}
                      value={config.soles_por_puntos ?? 10}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          soles_por_puntos: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className="pl-9 text-base font-bold text-gray-800 bg-white"
                    />
                  </div>
                </div>

                <div className="text-lg font-bold text-amber-600 pt-4">=</div>

                <div className="flex-1">
                  <span className="text-[11px] font-semibold text-amber-900 block mb-1">Puntos Otorgados</span>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={config.puntos_otorgados ?? 5}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          puntos_otorgados: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className="pr-12 text-base font-bold text-amber-700 bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-500" /> Vencimiento de Puntos (Días)
                </label>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  value={config.dias_vencimiento_puntos ?? 365}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      dias_vencimiento_puntos: Math.max(1, Number(e.target.value) || 365),
                    }))
                  }
                  className="bg-white font-medium pr-28"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">días (vigencia)</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Al cumplir {config.dias_vencimiento_puntos ?? 365} días de antigüedad, los puntos no utilizados se descuentan automáticamente del saldo del cliente.
              </p>
            </div>
          </div>

          {/* 2. Escala de Descuento Permanente por Nivel */}
          <div className="rounded-xl border border-rose-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Percent className="h-5 w-5 text-rose-600" />
                <h4 className="font-semibold text-sm text-gray-900">
                  Descuento Permanente por Nivel
                </h4>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Beneficio directo y automático en el checkout para clientes recurrentes según el nivel alcanzado.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-rose-100 bg-rose-50/40">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Nivel Flor (200 pts)</span>
                    <span className="text-[11px] text-gray-500">Cliente activo en crecimiento</span>
                  </div>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={config.descuento_flor_pct ?? 5}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          descuento_flor_pct: Number(e.target.value) || 0,
                        }))
                      }
                      className="pr-7 text-right font-bold text-rose-700 bg-white"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-purple-100 bg-purple-50/40">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Nivel Torta (600 pts)</span>
                    <span className="text-[11px] text-gray-500">Cliente fidelizado de repetición</span>
                  </div>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={config.descuento_torta_pct ?? 8}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          descuento_torta_pct: Number(e.target.value) || 0,
                        }))
                      }
                      className="pr-7 text-right font-bold text-purple-700 bg-white"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/60">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Nivel Corona (1,500 pts)</span>
                    <span className="text-[11px] text-gray-500">Membresía VIP exclusiva</span>
                  </div>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={config.descuento_corona_pct ?? 12}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          descuento_corona_pct: Number(e.target.value) || 0,
                        }))
                      }
                      className="pr-7 text-right font-bold text-amber-700 bg-white"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
              Escala oficial: Flor (5%), Torta (8%), Corona (12%).
            </p>
          </div>

          {/* 3. Límites de Delivery Gratuito */}
          <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-sm text-gray-900">
                  Límites de Delivery Gratuito
                </h4>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Umbral mínimo de pedido requerido en cada nivel para acceder a delivery gratis en el checkout.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50/60">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Tienda General</span>
                    <span className="text-[11px] text-gray-500">Clientes sin nivel</span>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">S/.</span>
                    <Input
                      type="number"
                      min={0}
                      value={config.envio_gratis_umbral ?? ""}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          envio_gratis_umbral: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      placeholder="150"
                      className="pl-8 text-right font-medium text-gray-800 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Nivel Flor (200 pts)</span>
                    <span className="text-[11px] text-gray-500">Mínimo para envío gratis</span>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">S/.</span>
                    <Input
                      type="number"
                      min={0}
                      value={config.delivery_gratis_flor_umbral ?? ""}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          delivery_gratis_flor_umbral: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      placeholder="150"
                      className="pl-8 text-right font-medium text-gray-800 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-purple-100 bg-purple-50/30">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Nivel Torta (600 pts)</span>
                    <span className="text-[11px] text-gray-500">Beneficio preferencial</span>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">S/.</span>
                    <Input
                      type="number"
                      min={0}
                      value={config.delivery_gratis_torta_umbral ?? ""}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          delivery_gratis_torta_umbral: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      placeholder="100"
                      className="pl-8 text-right font-medium text-gray-800 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-amber-200 bg-amber-50/50">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Nivel Corona (1,500 pts)</span>
                    <span className="text-[11px] text-amber-700 font-medium">0 = Siempre Gratis</span>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">S/.</span>
                    <Input
                      type="number"
                      min={0}
                      value={config.delivery_gratis_corona_umbral ?? 0}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          delivery_gratis_corona_umbral: Number(e.target.value) || 0,
                        }))
                      }
                      className="pl-8 text-right font-bold text-amber-800 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
              El cliente VIP Corona recibe delivery 100% gratis en cualquier compra (umbral S/ 0).
            </p>
          </div>
        </div>
      </div>

      {/* Categories & Options List */}
      <div className="space-y-6">
        {filteredCategories.map((category) => {
          const isCollapsed = collapsedCategories[category.id] ?? false;
          const Icon = category.icon;

          return (
            <div
              key={category.id}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs transition hover:border-gray-300"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-gray-50/80 to-white border-b border-gray-100">
                <div
                  className="flex items-center gap-3.5 cursor-pointer select-none"
                  onClick={() => toggleCollapse(category.id)}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${category.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-gray-900">
                        {category.title}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {category.activeInCategory} / {category.totalCategoryOptions} activos
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {category.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(category.id, true)}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline px-2 py-1"
                  >
                    Activar todos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(category.id, false)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800 hover:underline px-2 py-1"
                  >
                    Desactivar todos
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCollapse(category.id)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronUp className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options Items */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-100">
                  {category.options.map((opt) => {
                    const isChecked = Boolean(config[opt.key]);

                    return (
                      <div
                        key={String(opt.key)}
                        className={`p-5 transition-colors ${
                          isChecked ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 pr-4">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <label
                                htmlFor={String(opt.key)}
                                className="font-medium text-sm text-gray-900 cursor-pointer select-none"
                              >
                                {opt.label}
                              </label>
                              <span className="rounded-md bg-kc-sand/40 border border-kc-sand/80 px-2 py-0.5 text-[11px] font-semibold text-kc-mocha">
                                {opt.badge}
                              </span>
                              {isChecked ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                  <CheckCircle2 className="h-3 w-3" /> Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                                  <XCircle className="h-3 w-3" /> Inactivo
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed">
                              {opt.description}
                            </p>

                            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-kc-charcoal/80 bg-kc-sand/20 rounded px-2 py-0.5">
                              <span className="text-kc-gold">🎯 Impacto:</span> {opt.impact}
                            </div>
                          </div>

                          <div className="flex items-center pt-1">
                            <Switch
                              id={String(opt.key)}
                              checked={isChecked}
                              onCheckedChange={() => handleToggle(opt.key)}
                            />
                          </div>
                        </div>

                        {/* Campos contextuales adicionales cuando el módulo está activo */}
                        {opt.key === "banner_activo" && isChecked && (
                          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-xl">
                            <div>
                              <label className="text-xs font-medium text-gray-700">Título del Banner</label>
                              <Input
                                value={config.banner_titulo}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, banner_titulo: e.target.value }))
                                }
                                placeholder="Ej: Temporada Especial Kelly's"
                                className="mt-1 bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700">Color de Fondo</label>
                              <div className="mt-1 flex items-center gap-2">
                                <input
                                  type="color"
                                  value={config.banner_color || "#C8956C"}
                                  onChange={(e) =>
                                    setConfig((p) => ({ ...p, banner_color: e.target.value }))
                                  }
                                  className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200"
                                />
                                <Input
                                  value={config.banner_color}
                                  onChange={(e) =>
                                    setConfig((p) => ({ ...p, banner_color: e.target.value }))
                                  }
                                  placeholder="#C8956C"
                                  className="bg-white"
                                />
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs font-medium text-gray-700">Texto / Mensaje del Banner</label>
                              <Input
                                value={config.banner_texto}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, banner_texto: e.target.value }))
                                }
                                placeholder="Ej: 15% de descuento en pedidos anticipados con el código DULZURA15"
                                className="mt-1 bg-white"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs font-medium text-gray-700">Enlace de Destino (Link)</label>
                              <Input
                                value={config.banner_link}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, banner_link: e.target.value }))
                                }
                                placeholder="/productos o https://..."
                                className="mt-1 bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Bloque especial: Umbral de envío gratis y Carrito Abandonado */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
              <Sliders className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-base text-gray-900">
                Parámetros Globales de Conversión
              </h3>
              <p className="text-xs text-gray-500">
                Ajuste fino de montos y tiempos para activar ofertas de envío y carritos abandonados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Umbral para Envío Gratis (S/)
              </label>
              <p className="text-xs text-gray-400 mb-1.5">
                Si el pedido supera este total, el delivery se marcará como gratuito. Dejar vacío para desactivar.
              </p>
              <Input
                type="number"
                value={config.envio_gratis_umbral ?? ""}
                onChange={(e) =>
                  setConfig((p) => ({
                    ...p,
                    envio_gratis_umbral: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="150"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Tiempo de Carrito Abandonado (Minutos)
              </label>
              <p className="text-xs text-gray-400 mb-1.5">
                Minutos de inactividad tras los cuales se considera el carrito como abandonado.
              </p>
              <Input
                type="number"
                value={config.carrito_abandonado_minutos ?? ""}
                onChange={(e) =>
                  setConfig((p) => ({
                    ...p,
                    carrito_abandonado_minutos: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder="60"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Mensaje Predeterminado de Recuperación de Carrito
              </label>
              <p className="text-xs text-gray-400 mb-1.5">
                Mensaje enviado en el recordatorio para animar a completar el pedido.
              </p>
              <Textarea
                rows={2}
                value={config.carrito_abandonado_mensaje}
                onChange={(e) =>
                  setConfig((p) => ({
                    ...p,
                    carrito_abandonado_mensaje: e.target.value,
                  }))
                }
                placeholder="¡Hola! Notamos que dejaste tu dulce pedido a medias en Kelly's Cake. Completa tu compra hoy y recibe puntos extra."
              />
            </div>
          </div>
        </div>

        {filteredCategories.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-300" />
            <h4 className="mt-3 font-semibold text-gray-700">
              No se encontraron opciones
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              Prueba cambiando el término de búsqueda o el filtro seleccionado.
            </p>
          </div>
        )}
      </div>

      {/* Floating Save Footer Bar */}
      <div className="sticky bottom-6 rounded-2xl border border-kc-sand/80 bg-white/95 backdrop-blur-md p-4 shadow-lg flex items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-gray-600 hidden sm:inline">
            Modificaciones listas. Guarda para que los cambios se reflejen inmediatamente en la tienda.
          </span>
          <span className="text-xs text-gray-600 sm:hidden">
            {stats.active} módulos activos
          </span>
        </div>

        <Button
          onClick={handleSave}
          disabled={pending}
          className="bg-kc-charcoal hover:bg-kc-deep text-white px-6 font-medium shadow-md transition-all shrink-0"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : justSaved ? (
            <>
              <Check className="mr-2 h-4 w-4 text-emerald-400" />
              ¡Guardado!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
