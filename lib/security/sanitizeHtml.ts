/**
 * Sanitizador de HTML básico en servidor para contenido enriquecido (posts de blog).
 * Elimina scripts, iframes, atributos on* (XSS) y protocolos maliciosos.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  return html
    // Eliminar etiquetas <script> y su contenido
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Eliminar etiquetas peligrosas (iframe, object, embed, form, link, meta, style)
    .replace(/<\/?(iframe|object|embed|form|link|meta|style|base|applet)\b[^>]*>/gi, "")
    // Eliminar atributos de eventos inline como onclick, onerror, onload, etc.
    .replace(/\s*on[a-zA-Z]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\s*on[a-zA-Z]+\s*=\s*[^>\s]+/gi, "")
    // Eliminar javascript: y data: (en href y src)
    .replace(/(href|src)\s*=\s*(['"])\s*(javascript|data):.*?\2/gi, '$1="#"');
}
