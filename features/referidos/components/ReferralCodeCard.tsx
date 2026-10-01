"use client";

import { useEffect, useState } from "react";
import { Copy, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getMisReferidosAction } from "../actions/get-mis-referidos.action";
import { generateCodeAction } from "../actions/generate-code.action";
import { ReferralShareButtons } from "./ReferralShareButtons";

export function ReferralCodeCard() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const result = await getMisReferidosAction();
        if (result?.data?.stats?.codigo) {
          setCodigo(result.data.stats.codigo);
        }
      } catch (error) {
        console.error("Error fetching referral info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, []);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const result = await generateCodeAction();
      if (result?.data?.codigo) {
        setCodigo(result.data.codigo);
        toast.success("¡Código generado con éxito!");
      } else {
        toast.error(result?.error || "Error al generar código");
      }
    } catch (error) {
      toast.error("Error al generar tu código");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!codigo) return;
    navigator.clipboard.writeText(codigo);
    toast.success("¡Código copiado al portapapeles!");
  };

  if (loading) {
    return (
      <div className="w-full h-48 bg-kc-ivory rounded-2xl border border-kc-sand flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-kc-rose-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-kc-cream rounded-2xl border border-kc-sand shadow-sm p-6 sm:p-8 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-kc-blush/20 rounded-full blur-xl pointer-events-none" />
      
      <div className="w-12 h-12 bg-kc-rose-gold/10 text-kc-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
        <Gift className="w-6 h-6" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-[family-name:var(--font-playfair)] font-bold text-kc-charcoal mb-2">
        Tu Código de Invitación
      </h3>
      <p className="text-sm text-kc-mocha mb-6 max-w-md mx-auto">
        Comparte tu código con amigos. Ellos reciben un descuento y tú ganas puntos cuando realicen su primera compra.
      </p>

      {codigo ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="bg-white border-2 border-kc-sand rounded-xl px-6 py-3 font-mono text-2xl tracking-widest text-kc-charcoal font-bold w-full sm:w-auto">
              {codigo}
            </div>
            <button
              onClick={copyToClipboard}
              className="bg-kc-charcoal text-white rounded-xl px-6 py-3.5 sm:py-3 font-medium hover:bg-kc-deep transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar código</span>
            </button>
          </div>
          
          <div className="pt-4 border-t border-kc-sand/50">
            <p className="text-sm text-kc-mocha mb-3">O comparte tu enlace directamente:</p>
            <div className="flex justify-center">
              <ReferralShareButtons codigo={codigo} />
            </div>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={handleGenerateCode}
          disabled={generating}
          className="bg-kc-rose-gold text-white rounded-xl px-8 py-3 font-medium hover:bg-kc-gold transition-colors inline-flex items-center gap-2"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {generating ? "Generando..." : "Generar mi código"}
        </button>
      )}
    </div>
  );
}
