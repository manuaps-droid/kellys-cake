"use client";

import { Share2, Link as LinkIcon, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface ReferralShareButtonsProps {
  codigo: string;
}

export function ReferralShareButtons({ codigo }: ReferralShareButtonsProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = `${origin}/auth/register?ref=${codigo}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("¡Enlace copiado al portapapeles!");
  };

  const handleWhatsApp = () => {
    const text = `¡Hola! 🎂 Usa mi código ${codigo} para obtener 10% de descuento en tu primera compra en Kelly's Cake. Regístrate aquí: ${shareUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kelly's Cake - Invitación",
          text: `¡Únete a Kelly's Cake con mi código ${codigo} y obtén beneficios!`,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Error sharing", error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleWhatsApp}
        className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#128C7E] transition-colors shadow-sm"
        title="Compartir en WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
      
      <button
        onClick={handleCopyLink}
        className="w-10 h-10 rounded-full bg-kc-sand text-kc-charcoal flex items-center justify-center hover:bg-kc-rose-gold hover:text-white transition-colors shadow-sm"
        title="Copiar enlace"
      >
        <LinkIcon className="w-5 h-5" />
      </button>

      {canShare && (
        <button
          onClick={handleNativeShare}
          className="w-10 h-10 rounded-full bg-kc-charcoal text-white flex items-center justify-center hover:bg-kc-deep transition-colors shadow-sm"
          title="Compartir"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
