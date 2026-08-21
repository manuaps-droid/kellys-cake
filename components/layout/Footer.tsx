import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

import {
  getPublicTienda,
  getPublicContacto,
} from "@/features/admin/configuracion/queries/public-config.query";
import type { ContactoConfig } from "@/features/admin/configuracion/validations/config.schema";

function IgIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c2.7 0 3 .01 4.06.06 1.06.05 1.79.22 2.42.46.66.26 1.22.6 1.77 1.16.56.55.9 1.11 1.16 1.77.24.63.41 1.36.46 2.42C21.99 9 22 9.3 22 12s-.01 3-.06 4.06c-.05 1.06-.22 1.79-.46 2.42a4.9 4.9 0 0 1-1.16 1.77c-.55.56-1.11.9-1.77 1.16-.63.24-1.36.41-2.42.46C15 21.99 14.7 22 12 22s-3-.01-4.06-.06c-1.06-.05-1.79-.22-2.42-.46a4.9 4.9 0 0 1-1.77-1.16c-.56-.55-.9-1.11-1.16-1.77-.24-.63-.41-1.36-.46-2.42C2.01 15 2 14.7 2 12s.01-3 .06-4.06c.05-1.06.22-1.79.46-2.42a4.9 4.9 0 0 1 1.16-1.77C4.23 3.19 4.79 2.85 5.45 2.59c.63-.24 1.36-.41 2.42-.46C9 2.01 9.3 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.18a3.18 3.18 0 1 1 0-6.36 3.18 3.18 0 0 1 0 6.36zm5.18-8.55a1.18 1.18 0 1 0 0 2.36 1.18 1.18 0 0 0 0-2.36z" />
    </svg>
  );
}

function FbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function YtIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23 7.5s-.22-1.55-.9-2.23c-.86-.9-1.83-.9-2.27-.96C16.74 4.1 12 4.1 12 4.1h-.01s-4.74 0-7.83.21c-.44.06-1.4.06-2.27.96C1.22 5.95 1 7.5 1 7.5S.78 9.32.78 11.14v1.69c0 1.82.22 3.64.22 3.64s.22 1.55.9 2.23c.87.9 2.01.87 2.52.97 1.83.18 7.78.24 7.78.24s4.75-.01 7.84-.22c.44-.06 1.4-.06 2.27-.96.68-.68.9-2.23.9-2.23s.22-1.82.22-3.64v-1.69C23.22 9.32 23 7.5 23 7.5zM9.78 14.6V8.4l5.94 3.11-5.94 3.09z" />
    </svg>
  );
}

function TkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.38-3.43-3.43-5.79-.01-.39-.01-.78.02-1.17.25-2.16 1.62-4.15 3.55-5.12C7.49 9.85 8.97 9.91 10.34 10.27c.01 1.47-.01 2.94.01 4.41-.6-.2-1.27-.26-1.91-.08-1.27.31-2.29 1.49-2.31 2.79-.07 1.05.42 2.13 1.29 2.74.86.62 2.04.69 2.96.14.65-.36 1.11-1 1.32-1.71.16-.62.11-1.27.12-1.91 0-3.5-.01-7 .01-10.49.07-1.36.65-2.64 1.5-3.69 1.04-1.27 2.59-2.05 4.21-2.31z" />
    </svg>
  );
}

export default async function Footer() {
  const [tienda, contacto] = await Promise.all([
    getPublicTienda(),
    getPublicContacto(),
  ]);

  const c: Partial<ContactoConfig> = contacto ?? {};

  const nombreTienda = tienda?.nombre ?? "Kelly's Cake";
  const taglineTienda =
    tienda?.tagline ?? "Pasteles personalizados de alta calidad para cada ocasión especial.";
  const anio = new Date().getFullYear().toString().slice(2); // 2026 -> "26"

  const socials = [
    { url: c.instagram, Icon: IgIcon, label: "Instagram" },
    { url: c.facebook, Icon: FbIcon, label: "Facebook" },
    { url: c.tiktok, Icon: TkIcon, label: "TikTok" },
    { url: c.youtube, Icon: YtIcon, label: "YouTube" },
  ].filter((s) => Boolean(s.url));

  return (
    <footer className="border-t border-kc-sand/50 bg-kc-charcoal">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-white">
              {nombreTienda}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-kc-blush/70">
              {taglineTienda}
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socials.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-kc-mocha/30 text-kc-blush/60 transition-all hover:border-kc-rose-gold hover:text-kc-rose-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-kc-blush">
              Navegación
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Inicio", href: "/" },
                { label: "Productos", href: "/productos" },
                { label: "Personaliza", href: "/personalizar" },
                { label: "Galería", href: "/catalogos" },
                { label: "Nosotros", href: "/nosotros" },
                { label: "Contacto", href: "/contacto" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-kc-blush/60 transition-colors hover:text-kc-rose-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-kc-blush">
              Servicio al cliente
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                "Preguntas frecuentes",
                "Política de envío",
                "Términos y condiciones",
                "Política de privacidad",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-sm text-kc-blush/60 transition-colors hover:text-kc-rose-gold"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-kc-blush">
              Contacto
            </h4>
            <ul className="mt-4 space-y-4">
              {c.telefono && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-kc-rose-gold" />
                  <a
                    href={`tel:${c.telefono}`}
                    className="text-sm text-kc-blush/60 transition-colors hover:text-kc-rose-gold"
                  >
                    {c.telefono}
                  </a>
                </li>
              )}
              {c.email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-kc-rose-gold" />
                  <a
                    href={`mailto:${c.email}`}
                    className="text-sm text-kc-blush/60 transition-colors hover:text-kc-rose-gold"
                  >
                    {c.email}
                  </a>
                </li>
              )}
              {c.direccion && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-kc-rose-gold" />
                  <span className="text-sm text-kc-blush/60">
                    {c.direccion}
                  </span>
                </li>
              )}
            </ul>
            {(c.horario_lunes_viernes ||
              c.horario_sabado ||
              c.horario_domingo) && (
              <p className="mt-4 text-xs text-kc-blush/40">
                {c.horario_lunes_viernes && (
                  <span className="block">Lun-Vie: {c.horario_lunes_viernes}</span>
                )}
                {c.horario_sabado && (
                  <span className="block">Sáb: {c.horario_sabado}</span>
                )}
                {c.horario_domingo && (
                  <span className="block">Dom: {c.horario_domingo}</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-kc-mocha/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <p className="text-xs text-kc-blush/40">
            © 20{anio} {nombreTienda}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-kc-blush/40">Hecho con amor en Perú</p>
        </div>
      </div>
    </footer>
  );
}
