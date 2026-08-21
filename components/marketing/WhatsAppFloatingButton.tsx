"use client";

import { useState } from "react";

import type { ContactoConfig } from "@/features/admin/configuracion/validations/config.schema";

type Props = {
  config: ContactoConfig | null;
};

/**
 * Botón flotante de WhatsApp con mensaje predeterminado y
 * burbuja animada. Visible en toda la tienda si
 * `contacto.whatsapp_activo = true` y hay número configurado.
 */
export default function WhatsAppFloatingButton({ config }: Props) {
  const [open, setOpen] = useState(false);

  if (!config?.whatsapp_activo || !config.whatsapp) return null;

  const phone = config.whatsapp.replace(/[^0-9]/g, "");
  if (!phone) return null;

  const message =
    config.whatsapp_mensaje ||
    "Hola, vengo de la web. ¿Me podrías ayudar con un pastel personalizado?";
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="mb-1 max-w-xs rounded-2xl border border-green-100 bg-white p-4 shadow-2xl">
          <p className="text-sm font-semibold text-gray-800">
            ¿Tienes una pregunta? Escríbenos.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Respuesta promedio en breve en horario de atención.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Iniciar chat
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Contactar por WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/40 transition hover:bg-green-600"
      >
        <WhatsAppIcon className="h-7 w-7" />
        <span className="absolute right-12 inline-flex h-3 w-3 animate-ping rounded-full bg-green-300" />
      </button>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.645-1.448l-6.348 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
