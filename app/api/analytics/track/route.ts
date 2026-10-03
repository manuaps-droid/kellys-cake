import { NextResponse } from "next/server";
import { registrarVisitaService } from "@/features/admin/visitas/services/visitas.service";

const BOT_PATTERNS = [
  /bot/i,
  /spider/i,
  /crawler/i,
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /ia_archiver/i,
  /bytespider/i,
];

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get("user-agent") || "";

    // Evitar contar rastreadores y bots
    if (BOT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
      return NextResponse.json({ ok: true, ignored: "bot" });
    }

    let body: any = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const { path = "/", visitorId = "", isMobile = false } = body;

    // Ignorar rutas internas o de administración
    if (
      typeof path !== "string" ||
      path.startsWith("/admin") ||
      path.startsWith("/api") ||
      path.startsWith("/_next") ||
      path.includes(".ico") ||
      path.includes(".png")
    ) {
      return NextResponse.json({ ok: true, ignored: "path" });
    }

    // Registrar visita de forma asíncrona
    await registrarVisitaService({
      path,
      visitorId: typeof visitorId === "string" ? visitorId.slice(0, 50) : "",
      isMobile: Boolean(isMobile),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/analytics/track:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
