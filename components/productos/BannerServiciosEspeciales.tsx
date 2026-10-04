"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Printer,
  FileText,
  UploadCloud,
  Calendar,
  Clock,
  Sparkles,
  Shapes,
  CheckCircle2,
  FileUp,
  MessageCircle,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCart } from "@/features/cart/hooks/useCart";
import { uploadServicioFileAction } from "@/features/cart/actions/upload-servicio-file.action";
import { addImpresionToCartAction } from "@/features/cart/actions/add-impresion-to-cart.action";
import { addCortadorToCartAction } from "@/features/cart/actions/add-cortador-to-cart.action";
import type { ProductosConfig } from "@/features/admin/configuracion/validations/config.schema";

const PRECIO_HOJA_IMPRESION = 15;
const PRECIO_BASE_CORTADOR = 18;

// Función inteligente de detección de páginas en PDF o Word
async function detectarPaginasEnArchivo(file: File): Promise<number> {
  const nombre = file.name.toLowerCase();

  // Si es imagen (PNG/JPG): 1 hoja
  if (file.type.startsWith("image/")) {
    return 1;
  }

  // Si es PDF: buscar objetos de página /Type /Page
  if (file.type === "application/pdf" || nombre.endsWith(".pdf")) {
    try {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder("latin1").decode(buffer);
      const matches = text.match(/\/Type\s*\/Page\b/g);
      if (matches && matches.length > 0) {
        return matches.length;
      }
      const countMatch = text.match(/\/Count\s+(\d+)/);
      if (countMatch && countMatch[1]) {
        const count = parseInt(countMatch[1], 10);
        if (count > 0 && count < 500) return count;
      }
    } catch (e) {
      console.warn("No se pudo detectar páginas del PDF:", e);
    }
    return 1;
  }

  // Si es Word .docx (archivo zip con docProps/app.xml)
  if (nombre.endsWith(".docx")) {
    try {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
      const pagesMatch = text.match(/<Pages>(\d+)<\/Pages>/i);
      if (pagesMatch && pagesMatch[1]) {
        const count = parseInt(pagesMatch[1], 10);
        if (count > 0 && count < 300) return count;
      }
    } catch (e) {
      console.warn("No se pudo detectar páginas de Word:", e);
    }
    return 1;
  }

  return 1;
}

interface BannerServiciosEspecialesProps {
  children?: React.ReactNode;
  productosConfig?: Partial<ProductosConfig> | null;
}

export default function BannerServiciosEspeciales({
  children,
  productosConfig,
}: BannerServiciosEspecialesProps = {}) {
  const { refreshCart, openDrawer } = useCart();

  // Configuración de stock de papeles
  const papelAzucarActivo = productosConfig?.papel_azucar_activo ?? true;
  const papelArrozActivo = productosConfig?.papel_arroz_activo ?? true;
  const papelAzucarAviso = productosConfig?.papel_azucar_aviso || "Papel de Azúcar temporalmente sin stock.";
  const papelArrozAviso = productosConfig?.papel_arroz_aviso || "Papel de Arroz temporalmente sin stock.";
  const ambosSinStock = !papelAzucarActivo && !papelArrozActivo;

  // Modales
  const [modalImpresionOpen, setModalImpresionOpen] = useState(false);
  const [modalCortadoresOpen, setModalCortadoresOpen] = useState(false);

  // Estados Formulario Impresiones Comestibles
  const [impresionFile, setImpresionFile] = useState<File | null>(null);
  const [impresionHojas, setImpresionHojas] = useState(1);
  const [impresionTipoPapel, setImpresionTipoPapel] = useState<"azucar" | "arroz">(() => {
    if (!papelAzucarActivo && papelArrozActivo) return "arroz";
    return "azucar";
  });
  const [impresionFecha, setImpresionFecha] = useState("");
  const [impresionHora, setImpresionHora] = useState("tarde");
  const [impresionNotas, setImpresionNotas] = useState("");
  const [detectandoPaginas, setDetectandoPaginas] = useState(false);
  const [subiendoImpresion, setSubiendoImpresion] = useState(false);
  const fileInputImpresionRef = useRef<HTMLInputElement>(null);

  // Estados Formulario Cortadores
  const [cortadorTema, setCortadorTema] = useState("");
  const [cortadorTamano, setCortadorTamano] = useState("Estándar (7-8 cm)");
  const [cortadorTipo, setCortadorTipo] = useState("Cortador con marcador de relieve (2 piezas)");
  const [cortadorCantidad, setCortadorCantidad] = useState(1);
  const [cortadorFecha, setCortadorFecha] = useState("");
  const [cortadorNotas, setCortadorNotas] = useState("");
  const [cortadorFile, setCortadorFile] = useState<File | null>(null);
  const [subiendoCortador, setSubiendoCortador] = useState(false);
  const fileInputCortadorRef = useRef<HTMLInputElement>(null);

  const [, startTransition] = useTransition();

  // Fecha mínima: mañana
  const manana = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Manejo de archivo de impresión comestible
  async function handleImpresionFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImpresionFile(file);
    setDetectandoPaginas(true);

    try {
      const paginas = await detectarPaginasEnArchivo(file);
      setImpresionHojas(paginas);
      toast.success(
        paginas > 1
          ? `¡Detectamos ${paginas} páginas en tu archivo!`
          : "Archivo cargado. 1 hoja A4 detectada."
      );
    } catch {
      setImpresionHojas(1);
    } finally {
      setDetectandoPaginas(false);
    }
  }

  // Enviar Impresión al Carrito
  async function handleSubmitImpresion(e: React.FormEvent) {
    e.preventDefault();

    if (!impresionFile) {
      toast.error("Por favor sube tu archivo en PDF, Word o imagen.");
      return;
    }

    if (!impresionFecha) {
      toast.error("Por favor selecciona la fecha requerida de entrega.");
      return;
    }

    if (impresionTipoPapel === "azucar" && !papelAzucarActivo) {
      toast.error(`Insumo no disponible: ${papelAzucarAviso}`);
      return;
    }

    if (impresionTipoPapel === "arroz" && !papelArrozActivo) {
      toast.error(`Insumo no disponible: ${papelArrozAviso}`);
      return;
    }

    setSubiendoImpresion(true);

    try {
      // 1. Subir archivo al storage
      const formData = new FormData();
      formData.append("file", impresionFile);

      const uploadResult = await uploadServicioFileAction(formData);
      if (!uploadResult.success || !uploadResult.url) {
        toast.error(uploadResult.message || "Error al subir el archivo.");
        setSubiendoImpresion(false);
        return;
      }

      const archivoUrlFinal = uploadResult.url;
      const archivoNombreFinal = uploadResult.fileName || impresionFile.name;

      // 2. Agregar al carrito
      startTransition(async () => {
        const papelLabel =
          impresionTipoPapel === "azucar"
            ? "Papel de Azúcar A4"
            : "Papel de Arroz / Oblea A4";

        const horaLabel =
          impresionHora === "manana" ? "Turno Mañana (9am - 1pm)" : "Turno Tarde (2pm - 7pm)";

        const cartResult = await addImpresionToCartAction({
          hojas: impresionHojas,
          archivoUrl: archivoUrlFinal,
          archivoNombre: archivoNombreFinal,
          fechaEntrega: impresionFecha,
          horaEntrega: horaLabel,
          tipoPapel: papelLabel,
          notas: impresionNotas,
        });

        if (!cartResult.success) {
          toast.error(cartResult.message || "No se pudo agregar al carrito.");
          setSubiendoImpresion(false);
          return;
        }

        await refreshCart();
        setSubiendoImpresion(false);
        setModalImpresionOpen(false);
        openDrawer();
        toast.success(
          `¡${impresionHojas} hoja(s) de impresión comestible agregadas al carrito!`
        );

        // Reset
        setImpresionFile(null);
        setImpresionHojas(1);
        setImpresionNotas("");
      });
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al procesar tu solicitud.");
      setSubiendoImpresion(false);
    }
  }

  // Enviar Cortador al Carrito
  async function handleSubmitCortador(e: React.FormEvent) {
    e.preventDefault();

    const temaClean = cortadorTema.trim();
    if (!temaClean) {
      toast.error("Por favor ingresa el tema o personaje para tu cortador.");
      return;
    }

    setSubiendoCortador(true);

    try {
      let archivoUrl: string | undefined;
      let archivoNombre: string | undefined;

      if (cortadorFile) {
        const formData = new FormData();
        formData.append("file", cortadorFile);
        const uploadRes = await uploadServicioFileAction(formData);
        if (uploadRes.success && uploadRes.url) {
          archivoUrl = uploadRes.url;
          archivoNombre = uploadRes.fileName || cortadorFile.name;
        }
      }

      startTransition(async () => {
        const result = await addCortadorToCartAction({
          tema: temaClean,
          tamano: cortadorTamano,
          tipoCortador: cortadorTipo,
          cantidad: cortadorCantidad,
          archivoUrl,
          archivoNombre,
          fechaEntrega: cortadorFecha,
          notas: cortadorNotas,
        });

        if (!result.success) {
          toast.error(result.message || "No se pudo agregar al carrito.");
          setSubiendoCortador(false);
          return;
        }

        await refreshCart();
        setSubiendoCortador(false);
        setModalCortadoresOpen(false);
        openDrawer();
        toast.success("¡Tu cortador 3D personalizado fue agregado al carrito!");

        // Reset
        setCortadorTema("");
        setCortadorFile(null);
        setCortadorNotas("");
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el pedido de cortador.");
      setSubiendoCortador(false);
    }
  }

  // Consulta por WhatsApp de cortador
  function handleWhatsAppCortador() {
    const tema = cortadorTema.trim() || "No especificado";
    const mensaje = encodeURIComponent(
      `¡Hola Kelly's Cake! Deseo cotizar cortadores de galleta en impresión 3D:\n\n` +
      `🎨 Tema: ${tema}\n` +
      `📐 Tamaño: ${cortadorTamano}\n` +
      `⚙️ Tipo: ${cortadorTipo}\n` +
      `🔢 Cantidad: ${cortadorCantidad}\n` +
      `${cortadorFecha ? `📅 Fecha estimada: ${cortadorFecha}\n` : ""}` +
      `${cortadorNotas ? `📝 Notas: ${cortadorNotas}\n` : ""}\n` +
      `¿Me pueden brindar mayor información y confirmar disponibilidad?`
    );
    window.open(`https://wa.me/51958311234?text=${mensaje}`, "_blank");
  }

  return (
    <>
      {children ? (
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-8 w-full">
          {/* BOTÓN IZQUIERDO: IMPRESIONES COMESTIBLES */}
          <div className="order-2 lg:order-1 lg:col-span-3 xl:col-span-3 flex justify-center lg:justify-start w-full">
            <button
              type="button"
              onClick={() => setModalImpresionOpen(true)}
              className="group relative flex w-full max-w-sm lg:max-w-none items-center gap-4 overflow-hidden rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-[#442215] via-[#2f170d] to-[#1c0d06] p-4 lg:p-4.5 xl:p-5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.5),0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_16px_36px_rgba(245,158,11,0.45)] hover:border-amber-300 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer ring-2 ring-amber-400/20"
            >
              {/* Brillo de fondo */}
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/20 blur-2xl transition-transform group-hover:scale-150" />

              <div className="relative flex h-14 w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 text-stone-950 shadow-lg shadow-amber-500/30 ring-2 ring-white/30">
                <Printer className="h-7 w-7 lg:h-8 lg:w-8 transition-transform group-hover:rotate-6" />
              </div>

              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-black tracking-wider text-stone-950 uppercase shadow-xs">
                    S/ 15 · Hoja A4
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h3 className="mt-1.5 font-extrabold text-base lg:text-lg text-white leading-tight group-hover:text-amber-200 transition-colors">
                  Impresiones Comestibles
                </h3>
                <p className="mt-1 text-xs text-amber-100/90 font-medium leading-snug line-clamp-2">
                  Sube tu Word o PDF · Papel de azúcar y arroz
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-white transition-colors">
                  <span>Subir archivo aquí</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          </div>

          {/* CONTENIDO CENTRAL HERO */}
          <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6 w-full">
            {children}
          </div>

          {/* BOTÓN DERECHO: CORTADORES DE GALLETA Y OTROS */}
          <div className="order-3 lg:col-span-3 xl:col-span-3 flex justify-center lg:justify-end w-full">
            <button
              type="button"
              onClick={() => setModalCortadoresOpen(true)}
              className="group relative flex w-full max-w-sm lg:max-w-none items-center gap-4 overflow-hidden rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-[#442215] via-[#2f170d] to-[#1c0d06] p-4 lg:p-4.5 xl:p-5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.5),0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_16px_36px_rgba(245,158,11,0.45)] hover:border-amber-300 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer ring-2 ring-amber-400/20"
            >
              {/* Brillo de fondo */}
              <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-amber-400/20 blur-2xl transition-transform group-hover:scale-150" />

              <div className="relative flex h-14 w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-amber-200 text-stone-950 shadow-lg shadow-amber-500/30 ring-2 ring-white/30">
                <Shapes className="h-7 w-7 lg:h-8 lg:w-8 transition-transform group-hover:-rotate-6" />
              </div>

              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-gradient-to-r from-amber-400 to-rose-300 px-2.5 py-0.5 text-[11px] font-black tracking-wider text-stone-950 uppercase shadow-xs">
                    Impresión 3D
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <h3 className="mt-1.5 font-extrabold text-base lg:text-lg text-white leading-tight group-hover:text-amber-200 transition-colors">
                  Cortadores de Galleta y más
                </h3>
                <p className="mt-1 text-xs text-amber-100/90 font-medium leading-snug line-clamp-2">
                  Moldes a medida · Diseña o sube tu logo
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-white transition-colors">
                  <span>Personalizar molde aquí</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row w-full max-w-4xl mx-auto">
          {/* Fallback layout */}
          <div className="w-full sm:flex-1">
            <button
              type="button"
              onClick={() => setModalImpresionOpen(true)}
              className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-[#442215] via-[#2f170d] to-[#1c0d06] p-4 sm:p-5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.5),0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_16px_36px_rgba(245,158,11,0.45)] hover:border-amber-300 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer ring-2 ring-amber-400/20"
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 text-stone-950 shadow-lg shadow-amber-500/30 ring-2 ring-white/30">
                <Printer className="h-7 w-7 transition-transform group-hover:rotate-6" />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-black tracking-wider text-stone-950 uppercase shadow-xs">
                    S/ 15 · Hoja A4
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h3 className="mt-1.5 font-extrabold text-base text-white leading-tight group-hover:text-amber-200 transition-colors">
                  Impresiones Comestibles
                </h3>
                <p className="mt-1 text-xs text-amber-100/90 font-medium leading-snug line-clamp-2">
                  Sube tu Word o PDF · Papel de azúcar y arroz
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-white transition-colors">
                  <span>Subir archivo aquí</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          </div>
          <div className="w-full sm:flex-1">
            <button
              type="button"
              onClick={() => setModalCortadoresOpen(true)}
              className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-[#442215] via-[#2f170d] to-[#1c0d06] p-4 sm:p-5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.5),0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_16px_36px_rgba(245,158,11,0.45)] hover:border-amber-300 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer ring-2 ring-amber-400/20"
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-amber-200 text-stone-950 shadow-lg shadow-amber-500/30 ring-2 ring-white/30">
                <Shapes className="h-7 w-7 transition-transform group-hover:-rotate-6" />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-gradient-to-r from-amber-400 to-rose-300 px-2.5 py-0.5 text-[11px] font-black tracking-wider text-stone-950 uppercase shadow-xs">
                    Impresión 3D
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <h3 className="mt-1.5 font-extrabold text-base text-white leading-tight group-hover:text-amber-200 transition-colors">
                  Cortadores de Galleta y más
                </h3>
                <p className="mt-1 text-xs text-amber-100/90 font-medium leading-snug line-clamp-2">
                  Moldes a medida · Diseña o sube tu logo
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-white transition-colors">
                  <span>Personalizar molde aquí</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: FORMULARIO IMPRESIONES COMESTIBLES              */}
      {/* ======================================================== */}
      <Dialog open={modalImpresionOpen} onOpenChange={setModalImpresionOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white p-6 sm:rounded-2xl shadow-2xl border border-kc-rose-gold/30 text-kc-charcoal">
          <DialogHeader className="text-left border-b border-kc-sand pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-kc-rose-gold/15 text-kc-rose-gold">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                  Impresiones Comestibles
                </DialogTitle>
                <DialogDescription className="text-xs text-kc-mocha">
                  Papel de azúcar o arroz en formato A4 con tintas 100% vegetales certificadas.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitImpresion} className="mt-4 space-y-5">
            
            {/* SUBIR ARCHIVO (WORD, PDF, IMAGEN) */}
            <div>
              <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-2">
                1. Sube tu archivo (PDF, Word o Imagen) *
              </label>

              <input
                ref={fileInputImpresionRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                onChange={handleImpresionFileChange}
                className="hidden"
                id="file-impresion"
              />

              {!impresionFile ? (
                <div
                  onClick={() => fileInputImpresionRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-kc-rose-gold/50 bg-kc-cream/60 p-6 text-center transition-colors hover:border-kc-rose-gold hover:bg-kc-rose-gold/5 cursor-pointer"
                >
                  <UploadCloud className="h-10 w-10 text-kc-rose-gold animate-bounce" />
                  <p className="mt-2 text-sm font-semibold text-kc-charcoal">
                    Haz clic aquí para seleccionar tu archivo
                  </p>
                  <p className="mt-1 text-xs text-kc-mocha">
                    Acepta PDF, Word (.docx, .doc), PNG o JPG (Máx. 20 MB)
                  </p>
                  <span className="mt-3 rounded-full bg-kc-rose-gold px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                    Examinar archivo
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-kc-rose-gold/40 bg-kc-cream p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kc-rose-gold/20 text-kc-rose-gold font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-kc-charcoal truncate max-w-[200px] sm:max-w-xs">
                          {impresionFile.name}
                        </p>
                        <p className="text-xs text-kc-mocha">
                          {(impresionFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setImpresionFile(null);
                        setImpresionHojas(1);
                      }}
                      className="text-xs text-red-500 hover:underline font-medium"
                    >
                      Cambiar
                    </button>
                  </div>

                  {detectandoPaginas ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-kc-rose-gold">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Detectando número de hojas en tu archivo...</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        Hojas detectadas automáticamente: <strong>{impresionHojas} hoja(s) A4</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CANTIDAD DE HOJAS Y PRECIO */}
            <div className="rounded-xl bg-kc-sand/40 p-4 border border-kc-sand">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-kc-charcoal uppercase tracking-wider block">
                    Cantidad de hojas A4 a imprimir:
                  </span>
                  <span className="text-[11px] text-kc-mocha">
                    S/ {PRECIO_HOJA_IMPRESION}.00 por hoja
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImpresionHojas((prev) => Math.max(1, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-kc-rose-gold/40 bg-white font-bold text-kc-charcoal hover:bg-kc-rose-gold/10 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="w-10 text-center font-bold text-lg text-kc-charcoal">
                    {impresionHojas}
                  </span>

                  <button
                    type="button"
                    onClick={() => setImpresionHojas((prev) => prev + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-kc-rose-gold/40 bg-white font-bold text-kc-charcoal hover:bg-kc-rose-gold/10 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Total acumulado */}
              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-sm">
                <span className="font-medium text-kc-mocha">Total por hojas:</span>
                <span className="font-extrabold text-xl text-kc-rose-gold">
                  S/ {(impresionHojas * PRECIO_HOJA_IMPRESION).toFixed(2)}
                </span>
              </div>
            </div>

            {/* AVISO SI AMBOS PAPELES ESTÁN SIN STOCK */}
            {ambosSinStock && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-rose-900">
                    Insumos de papel temporalmente agotados
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Actualmente no disponemos de stock de papel de azúcar ni de arroz para entrega inmediata. Por favor contáctanos por WhatsApp para consultar la fecha de reposición.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = encodeURIComponent("¡Hola Kelly's Cake! Deseo consultar cuándo tendrán stock de papel para impresiones comestibles.");
                      window.open(`https://wa.me/51958311234?text=${msg}`, "_blank");
                    }}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Consultar reposición por WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* TIPO DE PAPEL */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider">
                  2. Tipo de papel comestible
                </label>
                {(!papelAzucarActivo || !papelArrozActivo) && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    ⚠️ Stock limitado de insumos
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Botón Papel de Azúcar */}
                <button
                  type="button"
                  onClick={() => {
                    if (!papelAzucarActivo) {
                      toast.warning(`⚠️ ${papelAzucarAviso}`);
                      return;
                    }
                    setImpresionTipoPapel("azucar");
                  }}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    !papelAzucarActivo
                      ? "border-rose-200 bg-rose-50/40 opacity-75 cursor-not-allowed"
                      : impresionTipoPapel === "azucar"
                      ? "border-kc-rose-gold bg-kc-rose-gold/10 shadow-sm"
                      : "border-gray-200 hover:border-kc-rose-gold/40 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-kc-charcoal">
                      Papel de Azúcar A4 ⭐
                    </span>
                    {!papelAzucarActivo && (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-rose-700">
                        Agotado
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-kc-mocha mt-0.5 leading-snug">
                    Colores más vivos, flexible, ideal para tortas húmedas.
                  </span>
                  {!papelAzucarActivo && (
                    <span className="mt-1.5 text-[10px] font-bold text-rose-600 leading-tight">
                      ⚠️ {papelAzucarAviso}
                    </span>
                  )}
                </button>

                {/* Botón Papel de Arroz */}
                <button
                  type="button"
                  onClick={() => {
                    if (!papelArrozActivo) {
                      toast.warning(`⚠️ ${papelArrozAviso}`);
                      return;
                    }
                    setImpresionTipoPapel("arroz");
                  }}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    !papelArrozActivo
                      ? "border-rose-200 bg-rose-50/40 opacity-75 cursor-not-allowed"
                      : impresionTipoPapel === "arroz"
                      ? "border-kc-rose-gold bg-kc-rose-gold/10 shadow-sm"
                      : "border-gray-200 hover:border-kc-rose-gold/40 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-kc-charcoal">
                      Papel de Arroz / Oblea A4
                    </span>
                    {!papelArrozActivo && (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-rose-700">
                        Agotado
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-kc-mocha mt-0.5 leading-snug">
                    Textura clásica y ligera, ideal para galletas y figuras.
                  </span>
                  {!papelArrozActivo && (
                    <span className="mt-1.5 text-[10px] font-bold text-rose-600 leading-tight">
                      ⚠️ {papelArrozAviso}
                    </span>
                  )}
                </button>
              </div>

              {/* Aviso si la opción seleccionada no tiene stock */}
              {((impresionTipoPapel === "azucar" && !papelAzucarActivo) ||
                (impresionTipoPapel === "arroz" && !papelArrozActivo)) && (
                <div className="mt-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    El insumo seleccionado está agotado:{" "}
                    <strong>{impresionTipoPapel === "azucar" ? papelAzucarAviso : papelArrozAviso}</strong>.
                    Por favor selecciona la opción disponible.
                  </span>
                </div>
              )}
            </div>

            {/* FECHA Y TURNO DE ENTREGA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                  3. Fecha de entrega *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={manana}
                    required
                    value={impresionFecha}
                    onChange={(e) => setImpresionFecha(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-kc-charcoal shadow-sm focus:border-kc-rose-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                  Horario preferido
                </label>
                <select
                  value={impresionHora}
                  onChange={(e) => setImpresionHora(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-kc-charcoal shadow-sm focus:border-kc-rose-gold focus:outline-none"
                >
                  <option value="manana">Turno Mañana (9:00 AM - 1:00 PM)</option>
                  <option value="tarde">Turno Tarde (2:00 PM - 7:00 PM)</option>
                </select>
              </div>
            </div>

            {/* NOTAS O INDICACIONES */}
            <div>
              <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                Indicaciones adicionales (Opcional)
              </label>
              <textarea
                rows={2}
                value={impresionNotas}
                onChange={(e) => setImpresionNotas(e.target.value)}
                placeholder="Ej. Dejar margen para recortar en círculos de 5 cm, o imprimir tamaño completo..."
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-kc-charcoal shadow-sm focus:border-kc-rose-gold focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={
                  subiendoImpresion ||
                  !impresionFile ||
                  ambosSinStock ||
                  (impresionTipoPapel === "azucar" && !papelAzucarActivo) ||
                  (impresionTipoPapel === "arroz" && !papelArrozActivo)
                }
                className="w-full rounded-full bg-gradient-to-r from-kc-rose-gold to-kc-gold py-4 text-sm font-bold text-white shadow-xl shadow-kc-rose-gold/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subiendoImpresion ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo archivo y agregando al carrito...
                  </span>
                ) : ambosSinStock ? (
                  <span>Insumos temporalmente sin stock</span>
                ) : (impresionTipoPapel === "azucar" && !papelAzucarActivo) ||
                  (impresionTipoPapel === "arroz" && !papelArrozActivo) ? (
                  <span>Selecciona un tipo de papel disponible</span>
                ) : (
                  <span>
                    Agregar al carrito · S/ {(impresionHojas * PRECIO_HOJA_IMPRESION).toFixed(2)}
                  </span>
                )}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: FORMULARIO CORTADORES DE GALLETA Y OTROS        */}
      {/* ======================================================== */}
      <Dialog open={modalCortadoresOpen} onOpenChange={setModalCortadoresOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white p-6 sm:rounded-2xl shadow-2xl border border-kc-rose-gold/30 text-kc-charcoal">
          <DialogHeader className="text-left border-b border-kc-sand pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-kc-gold/15 text-kc-gold">
                <Shapes className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                  Cortadores de Galleta en 3D
                </DialogTitle>
                <DialogDescription className="text-xs text-kc-mocha">
                  Diseñamos y fabricamos cortadores temáticos y sellos en material alimentario de alta precisión.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitCortador} className="mt-4 space-y-5">
            
            {/* TEMA DEL CORTADOR */}
            <div>
              <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                1. Tema o personaje del cortador *
              </label>
              <input
                type="text"
                required
                value={cortadorTema}
                onChange={(e) => setCortadorTema(e.target.value)}
                placeholder="Ej. Dinosaurio T-Rex, Huella de perrito, Logo empresa, Corona 15 años..."
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-kc-charcoal shadow-sm focus:border-kc-rose-gold focus:outline-none"
              />
            </div>

            {/* SUBIR IMAGEN O BOCETO DE REFERENCIA */}
            <div>
              <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                2. Imagen o boceto de referencia (Opcional)
              </label>
              <input
                ref={fileInputCortadorRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.stl,.svg"
                onChange={(e) => setCortadorFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-cortador"
              />

              {!cortadorFile ? (
                <div
                  onClick={() => fileInputCortadorRef.current?.click()}
                  className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-kc-rose-gold/50 bg-kc-cream/50 p-4 text-center cursor-pointer hover:bg-kc-rose-gold/5 transition-colors"
                >
                  <FileUp className="h-5 w-5 text-kc-rose-gold" />
                  <span className="text-xs text-kc-mocha font-medium">
                    Subir foto, dibujo o archivo STL / SVG
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-kc-rose-gold/40 bg-kc-cream p-3 text-xs">
                  <span className="font-semibold truncate max-w-[200px] text-kc-charcoal">
                    {cortadorFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCortadorFile(null)}
                    className="text-red-500 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>

            {/* MEDIDA / TAMAÑO */}
            <div>
              <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-2">
                3. Tamaño estimado
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  "Mini (4-5 cm)",
                  "Estándar (7-8 cm)",
                  "Grande (10-12 cm)",
                  "Medida a medida",
                ].map((tam) => (
                  <button
                    key={tam}
                    type="button"
                    onClick={() => setCortadorTamano(tam)}
                    className={`rounded-lg py-2 px-2 text-center text-xs font-medium border transition-all ${
                      cortadorTamano === tam
                        ? "border-kc-rose-gold bg-kc-rose-gold text-white font-bold"
                        : "border-gray-200 bg-white text-kc-charcoal hover:border-kc-rose-gold/40"
                    }`}
                  >
                    {tam}
                  </button>
                ))}
              </div>
            </div>

            {/* TIPO DE CORTADOR */}
            <div>
              <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                4. Tipo de pieza
              </label>
              <select
                value={cortadorTipo}
                onChange={(e) => setCortadorTipo(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-kc-charcoal shadow-sm focus:border-kc-rose-gold focus:outline-none"
              >
                <option value="Cortador con marcador de relieve (2 piezas)">
                  Cortador + Marcador de relieve / sello (2 piezas - Más popular)
                </option>
                <option value="Cortador de silueta exterior (1 pieza)">
                  Cortador solo silueta exterior (1 pieza)
                </option>
                <option value="Sello para estampar masa / fondant">
                  Sello para estampar masa o fondant
                </option>
              </select>
            </div>

            {/* CANTIDAD Y FECHA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                  Cantidad de cortadores
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCortadorCantidad((prev) => Math.max(1, prev - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white font-bold text-kc-charcoal hover:bg-kc-rose-gold/10"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-base text-kc-charcoal">
                    {cortadorCantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCortadorCantidad((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white font-bold text-kc-charcoal hover:bg-kc-rose-gold/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                  Fecha requerida (Opcional)
                </label>
                <input
                  type="date"
                  min={manana}
                  value={cortadorFecha}
                  onChange={(e) => setCortadorFecha(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-kc-charcoal shadow-sm focus:border-kc-rose-gold focus:outline-none"
                />
              </div>
            </div>

            {/* NOTAS */}
            <div>
              <label className="block text-xs font-bold text-kc-charcoal uppercase tracking-wider mb-1">
                Detalles del diseño o instrucciones
              </label>
              <textarea
                rows={2}
                value={cortadorNotas}
                onChange={(e) => setCortadorNotas(e.target.value)}
                placeholder="Indica cualquier detalle relevante: grosor de masa, texto adicional, etc."
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-kc-charcoal shadow-sm focus:border-kc-rose-gold focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                disabled={subiendoCortador || !cortadorTema.trim()}
                className="w-full sm:flex-1 rounded-full bg-gradient-to-r from-kc-gold to-kc-rose-gold py-4 text-xs font-bold text-white shadow-xl shadow-kc-gold/30 hover:brightness-110 active:scale-95 transition-all"
              >
                {subiendoCortador ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  <span>
                    Agregar al carrito · S/ {(cortadorCantidad * PRECIO_BASE_CORTADOR).toFixed(2)}
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={handleWhatsAppCortador}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Consultar por WhatsApp</span>
              </button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
