"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Mensaje = {
  texto: string;
  href?: string;
};

type Props = {
  messages: Mensaje[];
  color: string;
};

/**
 * Barra de anuncios rotativa (estilo Ladurée).
 * Cicla entre varios mensajes promocionales con crossfade.
 * Si solo hay un mensaje, se muestra estático.
 */
export default function AnnouncementBar({ messages, color }: Props) {
  const [index, setIndex] = useState(0);
  const [pausado, setPausado] = useState(false);

  const bg = color || "#1A0F0A";
  const fg = contrastColor(bg);

  useEffect(() => {
    if (messages.length <= 1 || pausado) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [messages.length, pausado]);

  if (messages.length === 0) return null;

  return (
    <div
      style={{ backgroundColor: bg }}
      className="sticky top-0 z-40 w-full overflow-hidden"
      role="region"
      aria-label="Promociones"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="relative mx-auto max-w-7xl px-4">
        <div
          className="relative h-9 transition-all duration-500"
        >
          {messages.map((msg, i) => {
            const activo = i === index;
            const Msg = msg.href ? Link : "span";
            const content = (
              <span
                className="block py-2 text-center text-xs font-medium tracking-wide sm:text-sm"
                style={{ color: fg }}
              >
                {msg.texto}
              </span>
            );
            return (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-500 ${
                  activo
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
                aria-hidden={!activo}
              >
                {msg.href ? (
                  <Link href={msg.href} className="block w-full">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>

        {/* Indicadores (puntos) */}
        {messages.length > 1 && (
          <div
            className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-1"
            style={{ opacity: 0.5 }}
          >
            {messages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Mensaje ${i + 1}`}
                onClick={() => setIndex(i)}
                className="h-1 w-1 rounded-full transition-all"
                style={{
                  backgroundColor: fg,
                  opacity: i === index ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Calcula color de texto legible (negro o blanco) según la luminancia.
function contrastColor(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length < 6) return "#1A0F0A";
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1A0F0A" : "#FFFFFF";
}
